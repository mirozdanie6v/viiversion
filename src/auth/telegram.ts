import { z } from 'zod'

const telegramUserSchema = z.object({
  id: z.number().int().positive().safe(),
  is_bot: z.boolean().optional(),
  first_name: z.string().min(1).max(256),
  last_name: z.string().max(256).optional(),
  username: z.string().max(64).optional(),
  language_code: z.string().max(35).optional(),
  is_premium: z.literal(true).optional(),
  added_to_attachment_menu: z.literal(true).optional(),
  allows_write_to_pm: z.literal(true).optional(),
  photo_url: z.string().url().max(2048).optional(),
})

export type TelegramUser = z.infer<typeof telegramUserSchema>

export interface ValidatedTelegramInitData {
  user: TelegramUser
  authDate: number
  queryId?: string
  startParam?: string
}

export type TelegramInitDataValidationErrorCode =
  | 'MALFORMED_INIT_DATA'
  | 'MISSING_HASH'
  | 'INVALID_HASH'
  | 'MISSING_AUTH_DATE'
  | 'EXPIRED_INIT_DATA'
  | 'FUTURE_AUTH_DATE'
  | 'MISSING_USER'
  | 'INVALID_USER'

export class TelegramInitDataValidationError extends Error {
  constructor(
    public readonly code: TelegramInitDataValidationErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'TelegramInitDataValidationError'
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    return null
  }

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16)
  }

  return bytes
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index]! ^ right[index]!
  }

  return difference === 0
}

async function hmacSha256(key: BufferSource, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
  return new Uint8Array(signature)
}

export async function createTelegramInitDataHash(
  params: URLSearchParams,
  botToken: string,
): Promise<string> {
  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken)
  const signature = await hmacSha256(secretKey, dataCheckString)
  return bytesToHex(signature)
}

export async function validateTelegramInitData(options: {
  initData: string
  botToken: string
  maxAgeSeconds: number
  nowSeconds?: number
  allowedFutureSkewSeconds?: number
}): Promise<ValidatedTelegramInitData> {
  const {
    initData,
    botToken,
    maxAgeSeconds,
    nowSeconds = Math.floor(Date.now() / 1000),
    allowedFutureSkewSeconds = 30,
  } = options

  if (!initData || initData.length > 16_384) {
    throw new TelegramInitDataValidationError('MALFORMED_INIT_DATA', 'Invalid Telegram initData')
  }

  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')
  if (!receivedHash) {
    throw new TelegramInitDataValidationError('MISSING_HASH', 'Telegram initData hash is missing')
  }

  const receivedHashBytes = hexToBytes(receivedHash)
  if (!receivedHashBytes) {
    throw new TelegramInitDataValidationError('INVALID_HASH', 'Telegram initData hash is invalid')
  }

  const expectedHash = await createTelegramInitDataHash(params, botToken)
  const expectedHashBytes = hexToBytes(expectedHash)!
  if (!constantTimeEqual(receivedHashBytes, expectedHashBytes)) {
    throw new TelegramInitDataValidationError('INVALID_HASH', 'Telegram initData signature is invalid')
  }

  const authDateRaw = params.get('auth_date')
  if (!authDateRaw || !/^\d+$/.test(authDateRaw)) {
    throw new TelegramInitDataValidationError('MISSING_AUTH_DATE', 'Telegram auth_date is missing')
  }

  const authDate = Number(authDateRaw)
  if (!Number.isSafeInteger(authDate)) {
    throw new TelegramInitDataValidationError('MISSING_AUTH_DATE', 'Telegram auth_date is invalid')
  }

  if (authDate > nowSeconds + allowedFutureSkewSeconds) {
    throw new TelegramInitDataValidationError('FUTURE_AUTH_DATE', 'Telegram initData auth_date is in the future')
  }

  if (nowSeconds - authDate > maxAgeSeconds) {
    throw new TelegramInitDataValidationError('EXPIRED_INIT_DATA', 'Telegram initData has expired')
  }

  const userRaw = params.get('user')
  if (!userRaw) {
    throw new TelegramInitDataValidationError('MISSING_USER', 'Telegram user data is missing')
  }

  let userJson: unknown
  try {
    userJson = JSON.parse(userRaw)
  } catch {
    throw new TelegramInitDataValidationError('INVALID_USER', 'Telegram user data is invalid JSON')
  }

  const parsedUser = telegramUserSchema.safeParse(userJson)
  if (!parsedUser.success) {
    throw new TelegramInitDataValidationError('INVALID_USER', 'Telegram user data is invalid')
  }

  const result: ValidatedTelegramInitData = {
    user: parsedUser.data,
    authDate,
  }

  const queryId = params.get('query_id')
  if (queryId) {
    result.queryId = queryId
  }

  const startParam = params.get('start_param')
  if (startParam) {
    result.startParam = startParam
  }

  return result
}
