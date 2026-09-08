import type { Context } from 'hono'

import { getRuntimeConfig } from '../config'
import type { AppEnv } from '../types'
import {
  createDemoSessionCookie,
  ensureDemoSession,
  type DemoSessionMode,
  type DemoSessionRecord,
} from './session'

function isSecureEnvironment(environment: string): boolean {
  return environment === 'production' || environment === 'preview'
}

export async function resolveDemoSession(
  c: Context<AppEnv>,
  requestedMode: DemoSessionMode = 'browser',
): Promise<DemoSessionRecord> {
  const config = getRuntimeConfig(c.env)
  const session = await ensureDemoSession(
    c.env.DB,
    c.req.header('cookie'),
    requestedMode,
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
