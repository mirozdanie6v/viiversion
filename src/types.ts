export type EnvironmentName = 'development' | 'preview' | 'production' | 'test'

export interface Bindings {
  ENVIRONMENT?: string
  ALLOWED_ORIGINS?: string
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS?: string
  AUTH_SESSION_TTL_SECONDS?: string
  TELEGRAM_BOT_TOKEN?: string
  DB: D1Database
}

export interface Variables {
  requestId: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
