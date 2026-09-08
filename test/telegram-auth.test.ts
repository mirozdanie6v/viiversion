import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import {
  TelegramInitDataValidationError,
  validateTelegramInitData,
} from '../src/auth/telegram'

const BOT_TOKEN = '123456789:TEST_BOT_TOKEN'
const NOW = 1_800_000_000

function createSignedInitData(options?: {
  authDate?: number
  user?: Record<string, unknown>
  queryId?: string
}): string {
  const params = new URLSearchParams()
  params.set('auth_date', String(options?.authDate ?? NOW))
  params.set('query_id', options?.queryId ?? 'AAExampleQuery')
  params.set(
    'user',
    JSON.stringify(
      options?.user ?? {
        id: 1234567890123,
        first_name: 'Test',
        last_name: 'User',
        username: 'test_user',
        language_code: 'en',
      },
    ),
  )

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  params.set('hash', hash)

  return params.toString()
}

describe('Telegram Mini App initData validation', () => {
  it('accepts correctly signed fresh initData', async () => {
    const result = await validateTelegramInitData({
      initData: createSignedInitData(),
      botToken: BOT_TOKEN,
      maxAgeSeconds: 300,
      nowSeconds: NOW,
    })

    expect(result.authDate).toBe(NOW)
    expect(result.user).toMatchObject({
      id: 1234567890123,
      first_name: 'Test',
      username: 'test_user',
    })
    expect(result.queryId).toBe('AAExampleQuery')
  })

  it('rejects initData after a signed field is tampered with', async () => {
    const signed = createSignedInitData()
    const params = new URLSearchParams(signed)
    const user = JSON.parse(params.get('user')!) as Record<string, unknown>
    user.first_name = 'Attacker'
    params.set('user', JSON.stringify(user))

    await expect(
      validateTelegramInitData({
        initData: params.toString(),
        botToken: BOT_TOKEN,
        maxAgeSeconds: 300,
        nowSeconds: NOW,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_HASH' })
  })

  it('rejects expired initData', async () => {
    await expect(
      validateTelegramInitData({
        initData: createSignedInitData({ authDate: NOW - 301 }),
        botToken: BOT_TOKEN,
        maxAgeSeconds: 300,
        nowSeconds: NOW,
      }),
    ).rejects.toMatchObject({ code: 'EXPIRED_INIT_DATA' })
  })

  it('rejects auth_date too far in the future', async () => {
    await expect(
      validateTelegramInitData({
        initData: createSignedInitData({ authDate: NOW + 31 }),
        botToken: BOT_TOKEN,
        maxAgeSeconds: 300,
        nowSeconds: NOW,
      }),
    ).rejects.toMatchObject({ code: 'FUTURE_AUTH_DATE' })
  })

  it('rejects malformed user JSON with a typed validation error', async () => {
    const params = new URLSearchParams(createSignedInitData())
    params.set('user', '{broken-json')

    const dataCheckString = Array.from(params.entries())
      .filter(([key]) => key !== 'hash')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
    params.set('hash', createHmac('sha256', secretKey).update(dataCheckString).digest('hex'))

    try {
      await validateTelegramInitData({
        initData: params.toString(),
        botToken: BOT_TOKEN,
        maxAgeSeconds: 300,
        nowSeconds: NOW,
      })
      throw new Error('Expected validation to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(TelegramInitDataValidationError)
      expect(error).toMatchObject({ code: 'INVALID_USER' })
    }
  })
})
