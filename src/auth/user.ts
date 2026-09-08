import { eq } from 'drizzle-orm'

import type { AppDatabase } from '../db/client'
import { users } from '../db/schema'
import type { TelegramUser } from './telegram'

export async function upsertTelegramUser(options: {
  db: AppDatabase
  telegramUser: TelegramUser
  now?: Date
}) {
  const { db, telegramUser } = options
  const now = options.now ?? new Date()
  const telegramId = String(telegramUser.id)

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1)

  const values = {
    telegramId,
    username: telegramUser.username ?? null,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name ?? null,
    languageCode: telegramUser.language_code ?? null,
    updatedAt: now,
  }

  if (existing[0]) {
    await db.update(users).set(values).where(eq(users.id, existing[0].id))
    return existing[0].id
  }

  const id = crypto.randomUUID()
  await db.insert(users).values({
    id,
    ...values,
    createdAt: now,
  })

  return id
}
