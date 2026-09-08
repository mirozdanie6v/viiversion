export const DEMO_SESSION_COOKIE = 'max_tour_demo_session'

export type DemoSessionMode = 'browser' | 'telegram'

export interface DemoSessionRecord {
  id: string
  mode: DemoSessionMode
  expiresAt: number
  isNew: boolean
}

export function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null

  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex < 0) continue

    const key = part.slice(0, separatorIndex).trim()
    if (key !== name) continue

    const value = part.slice(separatorIndex + 1).trim()
    return value ? decodeURIComponent(value) : null
  }

  return null
}

export function createDemoSessionCookie(
  sessionId: string,
  ttlSeconds: number,
  secure: boolean,
): string {
  const attributes = [
    `${DEMO_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${ttlSeconds}`,
  ]

  if (secure) attributes.push('Secure')

  return attributes.join('; ')
}

function looksLikeSessionId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function ensureDemoSession(
  db: D1Database,
  cookieHeader: string | undefined,
  requestedMode: DemoSessionMode,
  ttlSeconds: number,
): Promise<DemoSessionRecord> {
  const now = Date.now()
  const cookieSessionId = readCookie(cookieHeader, DEMO_SESSION_COOKIE)

  if (cookieSessionId && looksLikeSessionId(cookieSessionId)) {
    const existing = await db
      .prepare(
        `SELECT id, mode, expires_at AS expiresAt
         FROM demo_sessions
         WHERE id = ?1 AND expires_at > ?2
         LIMIT 1`,
      )
      .bind(cookieSessionId, now)
      .first<{ id: string; mode: DemoSessionMode; expiresAt: number }>()

    if (existing) {
      const expiresAt = now + ttlSeconds * 1000
      await db
        .prepare('UPDATE demo_sessions SET last_seen_at = ?1, expires_at = ?2 WHERE id = ?3')
        .bind(now, expiresAt, existing.id)
        .run()

      return {
        id: existing.id,
        mode: existing.mode,
        expiresAt,
        isNew: false,
      }
    }
  }

  const id = crypto.randomUUID()
  const expiresAt = now + ttlSeconds * 1000

  await db
    .prepare(
      `INSERT INTO demo_sessions (id, user_id, mode, created_at, last_seen_at, expires_at)
       VALUES (?1, NULL, ?2, ?3, ?3, ?4)`,
    )
    .bind(id, requestedMode, now, expiresAt)
    .run()

  return {
    id,
    mode: requestedMode,
    expiresAt,
    isNew: true,
  }
}

export async function resetDemoSessionData(db: D1Database, sessionId: string): Promise<void> {
  const statements = [
    db.prepare('DELETE FROM manager_status_history WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM analytics_events WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM payments WHERE session_id = ?1').bind(sessionId),
    db
      .prepare(
        'DELETE FROM order_participants WHERE order_id IN (SELECT id FROM orders WHERE session_id = ?1)',
      )
      .bind(sessionId),
    db.prepare('DELETE FROM orders WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM demo_promotions WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM demo_availability WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM demo_user_created_tours WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM demo_tour_overrides WHERE session_id = ?1').bind(sessionId),
    db.prepare('DELETE FROM demo_destinations WHERE session_id = ?1').bind(sessionId),
  ]

  await db.batch(statements)
}
