import { Hono, type Context } from 'hono'
import { z } from 'zod'

import { getRuntimeConfig } from '../config'
import {
  createDemoSessionCookie,
  ensureDemoSession,
  resetDemoSessionData,
  type DemoSessionMode,
} from '../demo/session'
import type { AppEnv } from '../types'

const createSessionBodySchema = z.object({
  mode: z.enum(['browser', 'telegram']).default('browser'),
})

export const demoSessionRoutes = new Hono<AppEnv>()

function isSecureEnvironment(environment: string): boolean {
  return environment === 'production' || environment === 'preview'
}

async function getOrCreateSession(c: Context<AppEnv>, mode: DemoSessionMode) {
  const config = getRuntimeConfig(c.env)
  const session = await ensureDemoSession(
    c.env.DB,
    c.req.header('cookie'),
    mode,
    config.demoSessionTtlSeconds,
  )

  c.header(
    'Set-Cookie',
    createDemoSessionCookie(
      session.id,
      config.demoSessionTtlSeconds,
      isSecureEnvironment(config.environment),
    ),
  )
  c.header('Cache-Control', 'no-store')

  return session
}

demoSessionRoutes.get('/session', async (c) => {
  const session = await getOrCreateSession(c, 'browser')

  return c.json({
    ok: true,
    session: {
      mode: session.mode,
      expiresAt: new Date(session.expiresAt).toISOString(),
      isNew: session.isNew,
    },
    requestId: c.get('requestId'),
  })
})

demoSessionRoutes.post('/session', async (c) => {
  const rawBody = await c.req.json().catch(() => ({}))
  const parsed = createSessionBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid demo session request',
          details: parsed.error.flatten(),
        },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  const session = await getOrCreateSession(c, parsed.data.mode)

  return c.json({
    ok: true,
    session: {
      mode: session.mode,
      expiresAt: new Date(session.expiresAt).toISOString(),
      isNew: session.isNew,
    },
    requestId: c.get('requestId'),
  })
})

demoSessionRoutes.post('/demo/reset', async (c) => {
  const session = await getOrCreateSession(c, 'browser')
  await resetDemoSessionData(c.env.DB, session.id)

  return c.json({
    ok: true,
    reset: true,
    scope: 'current_demo_session',
    verifiedBasePreserved: true,
    requestId: c.get('requestId'),
  })
})
