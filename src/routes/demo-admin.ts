import { Hono } from 'hono'
import { z } from 'zod'

import { listDestinations, listTours } from '../catalog/service'
import { resolveDemoSession } from '../demo/http'
import type { AppEnv } from '../types'

const moneySchema = z.number().int().min(0)
const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const pricingModeSchema = z.enum(['fixed', 'private', 'from_price', 'dynamic_request'])

const patchTourSchema = z
  .object({
    title: z.string().trim().min(2).max(180).optional(),
    adultPriceMinor: moneySchema.nullable().optional(),
    childPriceMinor: moneySchema.nullable().optional(),
    pricingRules: z.unknown().optional(),
    schedule: z.unknown().optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')

const createTourSchema = z.object({
  destinationSlug: slugSchema,
  slug: slugSchema,
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(1).max(80).nullable().optional(),
  pricingMode: pricingModeSchema,
  currency: z.string().trim().length(3).default('USD'),
  adultPriceMinor: moneySchema.nullable().optional(),
  childPriceMinor: moneySchema.nullable().optional(),
  pricingRules: z.unknown(),
  schedule: z.unknown().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().default(false),
})

const availabilityItemSchema = z
  .object({
    date: z.iso.date(),
    status: z.enum(['available', 'few_places', 'on_request']),
    capacity: z.number().int().min(0).nullable().optional(),
    remaining: z.number().int().min(0).nullable().optional(),
  })
  .refine(
    (value) => value.capacity == null || value.remaining == null || value.remaining <= value.capacity,
    'remaining cannot exceed capacity',
  )

const scheduleSchema = z.object({
  dates: z.array(availabilityItemSchema).min(1).max(120),
})

const promoSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  title: z.string().trim().min(2).max(120),
  discountType: z.enum(['percent_bps', 'fixed_minor']),
  discountValue: z.number().int().min(0),
  startsAt: z.iso.datetime().nullable().optional(),
  endsAt: z.iso.datetime().nullable().optional(),
  isActive: z.boolean().default(true),
})

const directionSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(100),
  isPublished: z.boolean().default(true),
})

export const demoAdminRoutes = new Hono<AppEnv>()

function validationError(c: Parameters<typeof demoAdminRoutes.post>[1] extends never ? never : any, error: z.ZodError) {
  return c.json(
    {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: error.flatten(),
      },
      requestId: c.get('requestId'),
    },
    400,
  )
}

async function verifiedTourExists(db: D1Database, id: string): Promise<boolean> {
  const row = await db.prepare('SELECT id FROM tours WHERE id = ?1 LIMIT 1').bind(id).first<{ id: string }>()
  return Boolean(row)
}

async function sessionCreatedTourExists(db: D1Database, sessionId: string, id: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT id FROM demo_user_created_tours WHERE session_id = ?1 AND id = ?2 LIMIT 1')
    .bind(sessionId, id)
    .first<{ id: string }>()
  return Boolean(row)
}

demoAdminRoutes.get('/tours', async (c) => {
  const session = await resolveDemoSession(c)
  const tours = await listTours(c.env.DB, session.id, {})

  return c.json({
    ok: true,
    mode: 'demo_admin',
    tours,
    requestId: c.get('requestId'),
  })
})

demoAdminRoutes.patch('/tours/:id', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = patchTourSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const id = c.req.param('id')
  const now = Date.now()

  if (await verifiedTourExists(c.env.DB, id)) {
    const current = await c.env.DB
      .prepare(
        `SELECT title, adult_price_minor AS adultPriceMinor, child_price_minor AS childPriceMinor,
                pricing_rules_json AS pricingRulesJson, schedule_json AS scheduleJson, is_published AS isPublished
         FROM demo_tour_overrides
         WHERE session_id = ?1 AND tour_id = ?2
         LIMIT 1`,
      )
      .bind(session.id, id)
      .first<{
        title: string | null
        adultPriceMinor: number | null
        childPriceMinor: number | null
        pricingRulesJson: string | null
        scheduleJson: string | null
        isPublished: number | null
      }>()

    await c.env.DB
      .prepare(
        `INSERT INTO demo_tour_overrides
          (id, session_id, tour_id, title, adult_price_minor, child_price_minor,
           pricing_rules_json, schedule_json, is_published, patch_json, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, NULL, ?10)
         ON CONFLICT(session_id, tour_id) DO UPDATE SET
           title = excluded.title,
           adult_price_minor = excluded.adult_price_minor,
           child_price_minor = excluded.child_price_minor,
           pricing_rules_json = excluded.pricing_rules_json,
           schedule_json = excluded.schedule_json,
           is_published = excluded.is_published,
           updated_at = excluded.updated_at`,
      )
      .bind(
        crypto.randomUUID(),
        session.id,
        id,
        parsed.data.title ?? current?.title ?? null,
        parsed.data.adultPriceMinor !== undefined ? parsed.data.adultPriceMinor : current?.adultPriceMinor ?? null,
        parsed.data.childPriceMinor !== undefined ? parsed.data.childPriceMinor : current?.childPriceMinor ?? null,
        parsed.data.pricingRules !== undefined
          ? JSON.stringify(parsed.data.pricingRules)
          : current?.pricingRulesJson ?? null,
        parsed.data.schedule !== undefined ? JSON.stringify(parsed.data.schedule) : current?.scheduleJson ?? null,
        parsed.data.isPublished !== undefined
          ? Number(parsed.data.isPublished)
          : current?.isPublished ?? null,
        now,
      )
      .run()

    return c.json({
      ok: true,
      scope: 'current_demo_session',
      target: 'verified_tour_override',
      tourId: id,
      requestId: c.get('requestId'),
    })
  }

  if (await sessionCreatedTourExists(c.env.DB, session.id, id)) {
    const current = await c.env.DB
      .prepare(
        `SELECT title, adult_price_minor AS adultPriceMinor, child_price_minor AS childPriceMinor,
                pricing_rules_json AS pricingRulesJson, schedule_json AS scheduleJson, is_published AS isPublished
         FROM demo_user_created_tours
         WHERE session_id = ?1 AND id = ?2
         LIMIT 1`,
      )
      .bind(session.id, id)
      .first<{
        title: string
        adultPriceMinor: number | null
        childPriceMinor: number | null
        pricingRulesJson: string
        scheduleJson: string | null
        isPublished: number
      }>()

    if (!current) {
      return c.json({ ok: false, error: { code: 'TOUR_NOT_FOUND', message: 'Tour not found' }, requestId: c.get('requestId') }, 404)
    }

    await c.env.DB
      .prepare(
        `UPDATE demo_user_created_tours
         SET title = ?1, adult_price_minor = ?2, child_price_minor = ?3,
             pricing_rules_json = ?4, schedule_json = ?5, is_published = ?6, updated_at = ?7
         WHERE session_id = ?8 AND id = ?9`,
      )
      .bind(
        parsed.data.title ?? current.title,
        parsed.data.adultPriceMinor !== undefined ? parsed.data.adultPriceMinor : current.adultPriceMinor,
        parsed.data.childPriceMinor !== undefined ? parsed.data.childPriceMinor : current.childPriceMinor,
        parsed.data.pricingRules !== undefined ? JSON.stringify(parsed.data.pricingRules) : current.pricingRulesJson,
        parsed.data.schedule !== undefined ? JSON.stringify(parsed.data.schedule) : current.scheduleJson,
        parsed.data.isPublished !== undefined ? Number(parsed.data.isPublished) : current.isPublished,
        now,
        session.id,
        id,
      )
      .run()

    return c.json({
      ok: true,
      scope: 'current_demo_session',
      target: 'demo_created_tour',
      tourId: id,
      requestId: c.get('requestId'),
    })
  }

  return c.json(
    {
      ok: false,
      error: { code: 'TOUR_NOT_FOUND', message: 'Tour not found in verified base or current demo session' },
      requestId: c.get('requestId'),
    },
    404,
  )
})

demoAdminRoutes.post('/tours', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = createTourSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const destinationExists = await c.env.DB
    .prepare(
      `SELECT slug FROM destinations WHERE slug = ?1 AND is_published = 1
       UNION ALL
       SELECT slug FROM demo_destinations WHERE session_id = ?2 AND slug = ?1 AND is_published = 1
       LIMIT 1`,
    )
    .bind(parsed.data.destinationSlug, session.id)
    .first<{ slug: string }>()

  if (!destinationExists) {
    return c.json(
      {
        ok: false,
        error: { code: 'DESTINATION_NOT_FOUND', message: 'Destination is not available in this demo session' },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  const id = `demo-tour-${crypto.randomUUID()}`
  const now = Date.now()

  try {
    await c.env.DB
      .prepare(
        `INSERT INTO demo_user_created_tours
          (id, session_id, destination_slug, slug, title, category, pricing_mode, currency,
           adult_price_minor, child_price_minor, pricing_rules_json, schedule_json, content_json,
           is_published, data_status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 'demo_input', ?15, ?15)`,
      )
      .bind(
        id,
        session.id,
        parsed.data.destinationSlug,
        parsed.data.slug,
        parsed.data.title,
        parsed.data.category ?? null,
        parsed.data.pricingMode,
        parsed.data.currency.toUpperCase(),
        parsed.data.adultPriceMinor ?? null,
        parsed.data.childPriceMinor ?? null,
        JSON.stringify(parsed.data.pricingRules),
        parsed.data.schedule === undefined ? null : JSON.stringify(parsed.data.schedule),
        parsed.data.content === undefined ? null : JSON.stringify(parsed.data.content),
        Number(parsed.data.isPublished),
        now,
      )
      .run()
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique')) {
      return c.json(
        {
          ok: false,
          error: { code: 'SLUG_CONFLICT', message: 'A demo tour with this slug already exists in this session' },
          requestId: c.get('requestId'),
        },
        409,
      )
    }
    throw error
  }

  return c.json(
    {
      ok: true,
      scope: 'current_demo_session',
      dataStatus: 'demo_input',
      tourId: id,
      requestId: c.get('requestId'),
    },
    201,
  )
})

demoAdminRoutes.post('/tours/:id/schedule', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = scheduleSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const tourId = c.req.param('id')
  const exists =
    (await verifiedTourExists(c.env.DB, tourId)) ||
    (await sessionCreatedTourExists(c.env.DB, session.id, tourId))

  if (!exists) {
    return c.json({ ok: false, error: { code: 'TOUR_NOT_FOUND', message: 'Tour not found' }, requestId: c.get('requestId') }, 404)
  }

  const now = Date.now()
  const statements = parsed.data.dates.map((item) =>
    c.env.DB
      .prepare(
        `INSERT INTO demo_availability
          (id, session_id, tour_id, date, status, capacity, remaining, data_status, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'demo_availability', ?8)
         ON CONFLICT(session_id, tour_id, date) DO UPDATE SET
           status = excluded.status,
           capacity = excluded.capacity,
           remaining = excluded.remaining,
           data_status = 'demo_availability',
           updated_at = excluded.updated_at`,
      )
      .bind(
        crypto.randomUUID(),
        session.id,
        tourId,
        item.date,
        item.status,
        item.capacity ?? null,
        item.remaining ?? null,
        now,
      ),
  )

  await c.env.DB.batch(statements)

  return c.json({
    ok: true,
    scope: 'current_demo_session',
    dataStatus: 'demo_availability',
    updatedDates: statements.length,
    requestId: c.get('requestId'),
  })
})

demoAdminRoutes.post('/tours/:id/promo', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = promoSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const tourId = c.req.param('id')
  const exists =
    (await verifiedTourExists(c.env.DB, tourId)) ||
    (await sessionCreatedTourExists(c.env.DB, session.id, tourId))

  if (!exists) {
    return c.json({ ok: false, error: { code: 'TOUR_NOT_FOUND', message: 'Tour not found' }, requestId: c.get('requestId') }, 404)
  }

  const now = Date.now()
  const startsAt = parsed.data.startsAt ? Date.parse(parsed.data.startsAt) : null
  const endsAt = parsed.data.endsAt ? Date.parse(parsed.data.endsAt) : null

  if (startsAt !== null && endsAt !== null && endsAt < startsAt) {
    return c.json(
      {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Promotion end date cannot be before start date' },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  await c.env.DB
    .prepare(
      `INSERT INTO demo_promotions
        (id, session_id, tour_id, code, title, discount_type, discount_value,
         starts_at, ends_at, is_active, data_status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'demo_promo', ?11, ?11)
       ON CONFLICT(session_id, code) DO UPDATE SET
         tour_id = excluded.tour_id,
         title = excluded.title,
         discount_type = excluded.discount_type,
         discount_value = excluded.discount_value,
         starts_at = excluded.starts_at,
         ends_at = excluded.ends_at,
         is_active = excluded.is_active,
         data_status = 'demo_promo',
         updated_at = excluded.updated_at`,
    )
    .bind(
      crypto.randomUUID(),
      session.id,
      tourId,
      parsed.data.code,
      parsed.data.title,
      parsed.data.discountType,
      parsed.data.discountValue,
      startsAt,
      endsAt,
      Number(parsed.data.isActive),
      now,
    )
    .run()

  return c.json({
    ok: true,
    scope: 'current_demo_session',
    dataStatus: 'demo_promo',
    code: parsed.data.code,
    requestId: c.get('requestId'),
  })
})

demoAdminRoutes.get('/directions', async (c) => {
  const session = await resolveDemoSession(c)
  const destinations = await listDestinations(c.env.DB, session.id)

  return c.json({ ok: true, mode: 'demo_admin', destinations, requestId: c.get('requestId') })
})

demoAdminRoutes.post('/directions', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = directionSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const verifiedConflict = await c.env.DB
    .prepare('SELECT slug FROM destinations WHERE slug = ?1 LIMIT 1')
    .bind(parsed.data.slug)
    .first<{ slug: string }>()

  if (verifiedConflict) {
    return c.json(
      {
        ok: false,
        error: { code: 'SLUG_CONFLICT', message: 'This slug belongs to a verified MAX TOUR direction' },
        requestId: c.get('requestId'),
      },
      409,
    )
  }

  const now = Date.now()

  try {
    await c.env.DB
      .prepare(
        `INSERT INTO demo_destinations
          (id, session_id, slug, name, is_published, data_status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 'demo_input', ?6, ?6)`,
      )
      .bind(
        `demo-destination-${crypto.randomUUID()}`,
        session.id,
        parsed.data.slug,
        parsed.data.name,
        Number(parsed.data.isPublished),
        now,
      )
      .run()
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('unique')) {
      return c.json(
        {
          ok: false,
          error: { code: 'SLUG_CONFLICT', message: 'Direction already exists in this demo session' },
          requestId: c.get('requestId'),
        },
        409,
      )
    }
    throw error
  }

  return c.json(
    {
      ok: true,
      scope: 'current_demo_session',
      dataStatus: 'demo_input',
      slug: parsed.data.slug,
      requestId: c.get('requestId'),
    },
    201,
  )
})
