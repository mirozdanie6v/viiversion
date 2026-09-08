export type EnvironmentName = 'development' | 'preview' | 'production' | 'test'

export interface Bindings {
  ENVIRONMENT?: string
  ALLOWED_ORIGINS?: string
}

export interface Variables {
  requestId: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
