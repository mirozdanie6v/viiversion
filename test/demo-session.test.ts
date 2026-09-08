import { describe, expect, it } from 'vitest'

import {
  createDemoSessionCookie,
  DEMO_SESSION_COOKIE,
  readCookie,
} from '../src/demo/session'

describe('MAX TOUR demo session cookies', () => {
  it('reads only the requested cookie value', () => {
    const value = readCookie(
      `theme=dark; ${DEMO_SESSION_COOKIE}=123e4567-e89b-42d3-a456-426614174000; other=value`,
      DEMO_SESSION_COOKIE,
    )

    expect(value).toBe('123e4567-e89b-42d3-a456-426614174000')
  })

  it('returns null when the demo session cookie is absent', () => {
    expect(readCookie('theme=dark; other=value', DEMO_SESSION_COOKIE)).toBeNull()
  })

  it('creates an HttpOnly SameSite cookie for local development', () => {
    const cookie = createDemoSessionCookie('session-id', 86_400, false)

    expect(cookie).toContain(`${DEMO_SESSION_COOKIE}=session-id`)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('Max-Age=86400')
    expect(cookie).not.toContain('Secure')
  })

  it('adds Secure in preview/production environments', () => {
    const cookie = createDemoSessionCookie('session-id', 86_400, true)

    expect(cookie).toContain('Secure')
  })
})
