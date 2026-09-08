import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getRuntimeConfig } from './config'
import type { AppEnv } from './types'

export const app = new Hono<AppEnv>()

app.use('*', async (c, next) => {
  const requestId = c.req.header('x-request-id')?.trim().slice(0, 128) || crypto.randomUUID()
  const startedAt = Date.now()

  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)

  try {
    await next()
  } finally {
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'http_request',
        requestId,
        method: c.req.method,
        path: new URL(c.req.url).pathname,
        status: c.res.status,
        durationMs: Date.now() - startedAt,
      }),
    )
  }
})

app.use('*', async (c, next) => {
  const config = getRuntimeConfig(c.env)
  const origin = c.req.header('origin')
  const isAllowedOrigin = !origin || config.allowedOrigins.includes(origin)

  if (origin && isAllowedOrigin) {
    c.header('Access-Control-Allow-Origin', origin)
    c.header('Vary', 'Origin')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    c.header('Access-Control-Max-Age', '86400')
  }

  if (c.req.method === 'OPTIONS') {
    if (!isAllowedOrigin) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'ORIGIN_NOT_ALLOWED',
            message: 'Origin is not allowed',
          },
          requestId: c.get('requestId'),
        },
        403,
      )
    }

    return c.body(null, 204)
  }

  await next()
})

app.get('/health', (c) => {
  return c.json({
    ok: true,
    service: 'viiversion-backend',
    version: '0.1.0',
    requestId: c.get('requestId'),
  })
})

app.get('/api/v1/status', (c) => {
  const config = getRuntimeConfig(c.env)

  return c.json({
    ok: true,
    service: 'viiversion-backend',
    environment: config.environment,
    apiVersion: 'v1',
    requestId: c.get('requestId'),
  })
})

app.notFound((c) => {
  return c.json(
    {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
      requestId: c.get('requestId'),
    },
    404,
  )
})

app.onError((error, c) => {
  const requestId = c.get('requestId') || crypto.randomUUID()

  if (error instanceof HTTPException) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'http_exception',
        requestId,
        status: error.status,
        message: error.message,
      }),
    )

    return c.json(
      {
        ok: false,
        error: {
          code: 'HTTP_ERROR',
          message: error.message,
        },
        requestId,
      },
      error.status,
    )
  }

  console.error(
    JSON.stringify({
      level: 'error',
      event: 'unhandled_error',
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
    }),
  )

  return c.json(
    {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
      requestId,
    },
    500,
  )
})
