import { z } from 'zod'

import type { Bindings, EnvironmentName } from './types'

const runtimeConfigSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'preview', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
})

export interface RuntimeConfig {
  environment: EnvironmentName
  allowedOrigins: string[]
}

export function getRuntimeConfig(bindings?: Bindings): RuntimeConfig {
  const parsed = runtimeConfigSchema.parse(bindings ?? {})

  return {
    environment: parsed.ENVIRONMENT,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }
}
