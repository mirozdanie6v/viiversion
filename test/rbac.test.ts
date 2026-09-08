import { describe, expect, it } from 'vitest'

import { isAdminRoleAllowed } from '../src/auth/middleware'

describe('admin RBAC', () => {
  it('allows configured roles', () => {
    expect(isAdminRoleAllowed('owner', ['owner'])).toBe(true)
    expect(isAdminRoleAllowed('admin', ['owner', 'admin'])).toBe(true)
    expect(isAdminRoleAllowed('manager', ['owner', 'admin', 'manager'])).toBe(true)
  })

  it('rejects roles outside the allowlist', () => {
    expect(isAdminRoleAllowed('manager', ['owner', 'admin'])).toBe(false)
    expect(isAdminRoleAllowed('admin', ['owner'])).toBe(false)
  })
})
