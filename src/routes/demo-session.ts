import { Hono } from 'hono'
import { z } from 'zod'

import { resolveDemoSession } from '../demo/http'
import { resetDemoSessionData } from '../demo/session'
import type { AppEnv } from '../types'

const createSessionBodySchema = z.object({
  mode: z.enum(['browser', 'telegram']).default('browser'),
})

export const demoSessionRoutes = new Hono<AppEnv>()

demoSessionRoutes.get('/session', async (c) => {
  const session = await resolveDemoSession(c, 'browser')

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

  const session = await resolveDemoSession(c, parsed.data.mode)

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
  const session = await resolveDemoSession(c, 'browser')
  await resetDemoSessionData(c.env.DB, session.id)

  return c.json({
    ok: true,
    reset: true,
    scope: 'current_demo_session',
    verifiedBasePreserved: true,
    requestId: c.get('requestId'),
  })
})
