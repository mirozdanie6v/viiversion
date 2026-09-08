import { Hono } from 'hono'
import { z } from 'zod'

import { createSession, getAuthenticatedUser, readBearerToken } from '../auth/session'
import {
  TelegramInitDataValidationError,
  validateTelegramInitData,
} from '../auth/telegram'
import { upsertTelegramUser } from '../auth/user'
import { getRuntimeConfig } from '../config'
import { createDb } from '../db/client'
import type { AppEnv } from '../types'

const telegramLoginBodySchema = z.object({
  initData: z.string().min(1).max(16_384),
})

export const identityRoutes = new Hono<AppEnv>()

identityRoutes.post('/auth/telegram', async (c) => {
  const botToken = c.env?.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'telegram_auth_misconfigured',
        requestId: c.get('requestId'),
      }),
    )

    return c.json(
      {
        ok: false,
        error: {
          code: 'AUTH_NOT_CONFIGURED',
          message: 'Telegram authentication is not configured',
        },
        requestId: c.get('requestId'),
      },
      503,
    )
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json(
      {
        ok: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request body must be valid JSON',
        },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  const parsedBody = telegramLoginBodySchema.safeParse(body)
  if (!parsedBody.success) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'initData is required',
        },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  const config = getRuntimeConfig(c.env)

  try {
    const telegram = await validateTelegramInitData({
      initData: parsedBody.data.initData,
      botToken,
      maxAgeSeconds: config.telegramInitDataMaxAgeSeconds,
    })

    const db = createDb(c.env.DB)
    const userId = await upsertTelegramUser({
      db,
      telegramUser: telegram.user,
    })
    const session = await createSession({
      db,
      userId,
      ttlSeconds: config.authSessionTtlSeconds,
    })

    return c.json({
      ok: true,
      accessToken: session.token,
      tokenType: 'Bearer',
      expiresAt: session.expiresAt.toISOString(),
      user: {
        id: userId,
        telegramId: String(telegram.user.id),
        username: telegram.user.username ?? null,
        firstName: telegram.user.first_name,
        lastName: telegram.user.last_name ?? null,
        languageCode: telegram.user.language_code ?? null,
      },
      requestId: c.get('requestId'),
    })
  } catch (error) {
    if (error instanceof TelegramInitDataValidationError) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'telegram_auth_rejected',
          requestId: c.get('requestId'),
          reason: error.code,
        }),
      )

      return c.json(
        {
          ok: false,
          error: {
            code: 'INVALID_TELEGRAM_AUTH',
            message: 'Telegram authentication data is invalid or expired',
          },
          requestId: c.get('requestId'),
        },
        401,
      )
    }

    throw error
  }
})

identityRoutes.get('/me', async (c) => {
  const token = readBearerToken(c.req.header('authorization'))
  if (!token) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required',
        },
        requestId: c.get('requestId'),
      },
      401,
    )
  }

  const db = createDb(c.env.DB)
  const user = await getAuthenticatedUser({ db, token })

  if (!user) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session is invalid or expired',
        },
        requestId: c.get('requestId'),
      },
      401,
    )
  }

  return c.json({
    ok: true,
    user,
    requestId: c.get('requestId'),
  })
})
