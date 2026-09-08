import { Hono } from 'hono'

import { requireAdminRole, requireAuth } from '../auth/middleware'
import type { AdminRole, AppEnv } from '../types'

const ALL_ADMIN_ROLES: readonly AdminRole[] = ['owner', 'admin', 'manager']

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.use('*', requireAuth)
adminRoutes.use('*', requireAdminRole(ALL_ADMIN_ROLES))

adminRoutes.get('/me', (c) => {
  return c.json({
    ok: true,
    user: c.get('authUser'),
    role: c.get('adminRole'),
    requestId: c.get('requestId'),
  })
})
