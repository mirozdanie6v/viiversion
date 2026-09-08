import type { AppDatabase } from '../db/client'
import { auditLog } from '../db/schema'

export async function writeAuditLog(options: {
  db: AppDatabase
  actorUserId: string | null
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  now?: Date
}): Promise<void> {
  await options.db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorUserId: options.actorUserId,
    action: options.action,
    entityType: options.entityType,
    entityId: options.entityId ?? null,
    metadataJson: options.metadata ? JSON.stringify(options.metadata) : null,
    createdAt: options.now ?? new Date(),
  })
}
