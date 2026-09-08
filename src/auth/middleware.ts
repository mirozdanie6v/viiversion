import { and, eq } from 'drizzle-orm'
import type { MiddlewareHandler } from 'hono'

import { createDb } from '../db/client'
import { admins } from '../db/schema'
import type { AdminRole, AppEnv } from '../types'
import { getAuthenticatedUser, readBearerToken } from './session'

function unauthorized(c: Parameters<MiddlewareHandler<AppEnv>>[0], message: string) {
  return c.json(
    {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      requestId: c.get('requestId'),
    },
    401,
  )
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = readBearerToken(c.req.header('authorization'))
  if (!token) {
    return unauthorized(c, 'Authentication is required')
  }

  const db = createDb(c.env.DB)
  const user = await getAuthenticatedUser({ db, token })
  if (!user) {
    return unauthorized(c, 'Session is invalid or expired')
  }

  c.set('authUser', user)
  await next()
}

export function isAdminRoleAllowed(role: AdminRole, allowedRoles: readonly AdminRole[]): boolean {
  return allowedRoles.includes(role)
}

export function requireAdminRole(allowedRoles: readonly AdminRole[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('authUser')
    const db = createDb(c.env.DB)

    const rows = await db
      .select({ role: admins.role })
      .from(admins)
      .where(and(eq(admins.userId, user.id), eq(admins.isActive, true)))
      .limit(1)

    const role = rows[0]?.role
    if (!role || !isAdminRoleAllowed(role, allowedRoles)) {
      return c.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
          requestId: c.get('requestId'),
        },
        403,
      )
    }

    c.set('adminRole', role)
    await next()
  }
}
