import { z } from 'zod'

import type { Bindings, EnvironmentName } from './types'

const runtimeConfigSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'preview', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS: z.coerce.number().int().min(60).max(3600).default(300),
  AUTH_SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(2_592_000).default(86_400),
  DEMO_SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(2_592_000).default(86_400),
})

export interface RuntimeConfig {
  environment: EnvironmentName
  allowedOrigins: string[]
  telegramInitDataMaxAgeSeconds: number
  authSessionTtlSeconds: number
  demoSessionTtlSeconds: number
}

export function getRuntimeConfig(bindings?: Bindings): RuntimeConfig {
  const parsed = runtimeConfigSchema.parse(bindings ?? {})

  return {
    environment: parsed.ENVIRONMENT,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    telegramInitDataMaxAgeSeconds: parsed.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS,
    authSessionTtlSeconds: parsed.AUTH_SESSION_TTL_SECONDS,
    demoSessionTtlSeconds: parsed.DEMO_SESSION_TTL_SECONDS,
  }
}
