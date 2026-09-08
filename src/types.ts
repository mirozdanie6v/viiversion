export type EnvironmentName = 'development' | 'preview' | 'production' | 'test'

export interface Bindings {
  ENVIRONMENT?: string
  ALLOWED_ORIGINS?: string
  DB: D1Database
}

export interface Variables {
  requestId: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
