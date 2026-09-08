import { and, eq, gt, isNull } from 'drizzle-orm'

import type { AppDatabase } from '../db/client'
import { authSessions, users } from '../db/schema'

const TOKEN_BYTES = 32

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function hashSessionToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return bytesToHex(new Uint8Array(digest))
}

export async function createSession(options: {
  db: AppDatabase
  userId: string
  ttlSeconds: number
  now?: Date
}): Promise<{ token: string; expiresAt: Date }> {
  const now = options.now ?? new Date()
  const expiresAt = new Date(now.getTime() + options.ttlSeconds * 1000)
  const tokenBytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES))
  const token = bytesToBase64Url(tokenBytes)
  const tokenHash = await hashSessionToken(token)

  await options.db.insert(authSessions).values({
    id: crypto.randomUUID(),
    userId: options.userId,
    tokenHash,
    expiresAt,
    createdAt: now,
  })

  return { token, expiresAt }
}

export async function getAuthenticatedUser(options: {
  db: AppDatabase
  token: string
  now?: Date
}) {
  const tokenHash = await hashSessionToken(options.token)
  const now = options.now ?? new Date()

  const rows = await options.db
    .select({
      id: users.id,
      telegramId: users.telegramId,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      languageCode: users.languageCode,
      phone: users.phone,
      email: users.email,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        gt(authSessions.expiresAt, now),
        isNull(authSessions.revokedAt),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null
  }

  const match = /^Bearer\s+([^\s]+)$/i.exec(authorizationHeader.trim())
  return match?.[1] ?? null
}
