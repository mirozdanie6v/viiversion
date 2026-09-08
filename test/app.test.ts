import { describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('VIIVERSION backend foundation', () => {
  it('returns a healthy response', async () => {
    const response = await app.request('/health')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      ok: true,
      service: 'viiversion-backend',
      version: '0.2.0',
    })
    expect(response.headers.get('x-request-id')).toBeTruthy()
  })

  it('returns API version status', async () => {
    const response = await app.request('/api/v1/status')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      ok: true,
      service: 'viiversion-backend',
      environment: 'development',
      apiVersion: 'v1',
    })
  })

  it('allows the configured local origin', async () => {
    const response = await app.request('/health', {
      headers: {
        Origin: 'http://localhost:5173',
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
  })

  it('rejects a preflight request from an unknown origin', async () => {
    const response = await app.request('/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.invalid',
      },
    })

    expect(response.status).toBe(403)
  })

  it('requires Telegram auth configuration for login', async () => {
    const response = await app.request('/api/v1/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData: 'auth_date=1&hash=00' }),
    })

    expect(response.status).toBe(503)
  })

  it('rejects unauthenticated access to /api/v1/me', async () => {
    const response = await app.request('/api/v1/me')
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toMatchObject({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
      },
    })
  })

  it('returns a structured 404 response', async () => {
    const response = await app.request('/missing-route')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      ok: false,
      error: {
        code: 'NOT_FOUND',
      },
    })
  })
})
