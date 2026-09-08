export type EnvironmentName = 'development' | 'preview' | 'production' | 'test'
export type AdminRole = 'owner' | 'admin' | 'manager'

export interface AuthenticatedUser {
  id: string
  telegramId: string | null
  username: string | null
  firstName: string
  lastName: string | null
  languageCode: string | null
  phone: string | null
  email: string | null
}

export interface Bindings {
  ENVIRONMENT?: string
  ALLOWED_ORIGINS?: string
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS?: string
  AUTH_SESSION_TTL_SECONDS?: string
  DEMO_SESSION_TTL_SECONDS?: string
  TELEGRAM_BOT_TOKEN?: string
  DB: D1Database
}

export interface Variables {
  requestId: string
  authUser: AuthenticatedUser
  adminRole: AdminRole
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
