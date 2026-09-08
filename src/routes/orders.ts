import { Hono, type Context } from 'hono'
import { z } from 'zod'

import {
  calculateQuote,
  QuoteError,
  type QuoteInput,
  type QuoteParticipantInput,
} from '../booking/quote'
import { resolveDemoSession } from '../demo/http'
import type { AppEnv } from '../types'

const participantSchema = z.object({
  kind: z.enum(['adult', 'child']),
  birthDate: z.iso.date(),
  heightCm: z.number().int().min(40).max(250).optional(),
})

const quoteBodySchema = z.object({
  tourId: z.string().trim().min(1).max(160),
  tourDate: z.iso.date(),
  bookingFormat: z.enum(['group', 'private']),
  participants: z.array(participantSchema).min(1).max(50),
  priceVariant: z.string().trim().min(1).max(80).optional(),
  roomOccupancy: z.enum(['single', 'double']).optional(),
  transferZone: z.string().trim().min(1).max(80).optional(),
  promoCode: z.string().trim().min(2).max(40).optional(),
  paymentPlan: z.enum(['prepayment', 'full']),
  depositPercent: z.number().int().min(30).max(100).optional(),
})

const orderParticipantSchema = participantSchema.extend({
  fullName: z.string().trim().min(2).max(160),
})

const orderBodySchema = quoteBodySchema.omit({ participants: true }).extend({
  participants: z.array(orderParticipantSchema).min(1).max(50),
  source: z.enum(['telegram', 'website', 'advertising', 'other']),
  hotelName: z.string().trim().max(180).nullable().optional(),
  primaryContact: z
    .object({
      name: z.string().trim().min(2).max(160),
      phone: z.string().trim().min(5).max(40).optional(),
      telegram: z.string().trim().min(2).max(80).optional(),
    })
    .refine((value) => Boolean(value.phone || value.telegram), 'Phone or Telegram contact is required'),
})

export const orderRoutes = new Hono<AppEnv>()

function validationError(c: Context<AppEnv>, error: z.ZodError) {
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

function quoteErrorResponse(c: Context<AppEnv>, error: QuoteError) {
  return c.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
      requestId: c.get('requestId'),
    },
    error.status as 400 | 404 | 409 | 500,
  )
}

function buildQuoteInput(data: z.infer<typeof quoteBodySchema>): QuoteInput {
  const participants: QuoteParticipantInput[] = data.participants.map((participant) => {
    const result: QuoteParticipantInput = {
      kind: participant.kind,
      birthDate: participant.birthDate,
    }
    if (participant.heightCm !== undefined) result.heightCm = participant.heightCm
    return result
  })

  const input: QuoteInput = {
    tourId: data.tourId,
    tourDate: data.tourDate,
    bookingFormat: data.bookingFormat,
    participants,
    paymentPlan: data.paymentPlan,
  }

  if (data.priceVariant !== undefined) input.priceVariant = data.priceVariant
  if (data.roomOccupancy !== undefined) input.roomOccupancy = data.roomOccupancy
  if (data.transferZone !== undefined) input.transferZone = data.transferZone
  if (data.promoCode !== undefined) input.promoCode = data.promoCode
  if (data.depositPercent !== undefined) input.depositPercent = data.depositPercent

  return input
}

async function findExistingOrderByIdempotency(
  db: D1Database,
  sessionId: string,
  idempotencyKey: string,
) {
  return db
    .prepare(
      `SELECT id, display_code AS displayCode, status, payment_status AS paymentStatus,
              total_minor AS totalMinor, requested_payment_minor AS requestedPaymentMinor,
              paid_minor AS paidMinor, remaining_minor AS remainingMinor, currency, created_at AS createdAt
       FROM orders
       WHERE session_id = ?1 AND idempotency_key = ?2
       LIMIT 1`,
    )
    .bind(sessionId, idempotencyKey)
    .first<{
      id: string
      displayCode: string
      status: string
      paymentStatus: string
      totalMinor: number
      requestedPaymentMinor: number
      paidMinor: number
      remainingMinor: number
      currency: string
      createdAt: number
    }>()
}

orderRoutes.post('/booking/quote', async (c) => {
  const session = await resolveDemoSession(c)
  const parsed = quoteBodySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  try {
    const quote = await calculateQuote(c.env.DB, session.id, buildQuoteInput(parsed.data))
    return c.json({
      ok: true,
      quote,
      authority: 'server_calculated',
      availabilityType: quote.availability ? 'demo_only' : 'not_published',
      requestId: c.get('requestId'),
    })
  } catch (error) {
    if (error instanceof QuoteError) return quoteErrorResponse(c, error)
    throw error
  }
})

orderRoutes.post('/orders', async (c) => {
  const session = await resolveDemoSession(c)
  const idempotencyKey = c.req.header('idempotency-key')?.trim()

  if (!idempotencyKey || idempotencyKey.length > 128) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'A valid Idempotency-Key header is required',
        },
        requestId: c.get('requestId'),
      },
      400,
    )
  }

  const existing = await findExistingOrderByIdempotency(c.env.DB, session.id, idempotencyKey)
  if (existing) {
    return c.json({
      ok: true,
      idempotentReplay: true,
      order: existing,
      requestId: c.get('requestId'),
    })
  }

  const parsed = orderBodySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return validationError(c, parsed.error)

  const quoteInputData: z.infer<typeof quoteBodySchema> = {
    tourId: parsed.data.tourId,
    tourDate: parsed.data.tourDate,
    bookingFormat: parsed.data.bookingFormat,
    participants: parsed.data.participants.map((participant) => {
      const result: z.infer<typeof participantSchema> = {
        kind: participant.kind,
        birthDate: participant.birthDate,
      }
      if (participant.heightCm !== undefined) result.heightCm = participant.heightCm
      return result
    }),
    paymentPlan: parsed.data.paymentPlan,
  }
  if (parsed.data.priceVariant !== undefined) quoteInputData.priceVariant = parsed.data.priceVariant
  if (parsed.data.roomOccupancy !== undefined) quoteInputData.roomOccupancy = parsed.data.roomOccupancy
  if (parsed.data.transferZone !== undefined) quoteInputData.transferZone = parsed.data.transferZone
  if (parsed.data.promoCode !== undefined) quoteInputData.promoCode = parsed.data.promoCode
  if (parsed.data.depositPercent !== undefined) quoteInputData.depositPercent = parsed.data.depositPercent

  let quote
  try {
    quote = await calculateQuote(c.env.DB, session.id, buildQuoteInput(quoteInputData))
  } catch (error) {
    if (error instanceof QuoteError) return quoteErrorResponse(c, error)
    throw error
  }

  const orderId = `ord-${crypto.randomUUID()}`
  const displayCode = `MT-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`
  const now = Date.now()
  const quoteSnapshotJson = JSON.stringify({
    quote,
    selected: {
      priceVariant: parsed.data.priceVariant ?? null,
      roomOccupancy: parsed.data.roomOccupancy ?? null,
      transferZone: parsed.data.transferZone ?? null,
      promoCode: parsed.data.promoCode?.toUpperCase() ?? null,
    },
  })

  const orderInsert = c.env.DB
    .prepare(
      `INSERT INTO orders
        (id, display_code, session_id, user_id, source, tour_id, tour_title_snapshot,
         tour_date, booking_format, hotel_name, transfer_zone, currency,
         tour_subtotal_minor, transfer_surcharge_minor, discount_minor, total_minor,
         payment_plan, deposit_percent_bps, requested_payment_minor, paid_minor,
         remaining_minor, status, payment_status, primary_contact_name,
         primary_contact_phone, primary_contact_telegram, quote_snapshot_json,
         idempotency_key, data_status, created_at, updated_at)
       VALUES
        (?1, ?2, ?3, NULL, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11,
         ?12, ?13, ?14, ?15, ?16, ?17, ?18, 0, ?15, 'new', 'pending',
         ?19, ?20, ?21, ?22, ?23, 'demo_order', ?24, ?24)`,
    )
    .bind(
      orderId,
      displayCode,
      session.id,
      parsed.data.source,
      quote.tourId,
      quote.tourTitle,
      quote.tourDate,
      quote.bookingFormat,
      parsed.data.hotelName ?? null,
      parsed.data.transferZone ?? null,
      quote.currency,
      quote.tourSubtotalMinor,
      quote.transferSurchargeMinor,
      quote.discountMinor,
      quote.totalMinor,
      quote.paymentPlan,
      quote.depositPercentBps,
      quote.requestedPaymentMinor,
      parsed.data.primaryContact.name,
      parsed.data.primaryContact.phone ?? null,
      parsed.data.primaryContact.telegram ?? null,
      quoteSnapshotJson,
      idempotencyKey,
      now,
    )

  const participantInserts = parsed.data.participants.map((participant, index) => {
    const price = quote.participantPrices[index]
    if (!price) throw new QuoteError('QUOTE_PARTICIPANT_MISMATCH', 'Participant quote mismatch', 500)

    return c.env.DB
      .prepare(
        `INSERT INTO order_participants
          (id, order_id, participant_type, full_name, birth_date, height_cm,
           pricing_category, price_minor, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
      )
      .bind(
        `participant-${crypto.randomUUID()}`,
        orderId,
        participant.kind,
        participant.fullName,
        participant.birthDate,
        participant.heightCm ?? null,
        price.pricingCategory,
        price.priceMinor,
        now,
      )
  })

  try {
    await c.env.DB.batch([orderInsert, ...participantInserts])
  } catch (error) {
    const replay = await findExistingOrderByIdempotency(c.env.DB, session.id, idempotencyKey)
    if (replay) {
      return c.json({ ok: true, idempotentReplay: true, order: replay, requestId: c.get('requestId') })
    }
    throw error
  }

  return c.json(
    {
      ok: true,
      idempotentReplay: false,
      order: {
        id: orderId,
        displayCode,
        status: 'new',
        paymentStatus: 'pending',
        totalMinor: quote.totalMinor,
        requestedPaymentMinor: quote.requestedPaymentMinor,
        paidMinor: 0,
        remainingMinor: quote.totalMinor,
        currency: quote.currency,
        dataStatus: 'demo_order',
        createdAt: now,
      },
      quote,
      requestId: c.get('requestId'),
    },
    201,
  )
})

orderRoutes.get('/orders/:id', async (c) => {
  const session = await resolveDemoSession(c)
  const order = await c.env.DB
    .prepare(
      `SELECT id, display_code AS displayCode, source, tour_id AS tourId,
              tour_title_snapshot AS tourTitle, tour_date AS tourDate,
              booking_format AS bookingFormat, hotel_name AS hotelName,
              transfer_zone AS transferZone, currency,
              tour_subtotal_minor AS tourSubtotalMinor,
              transfer_surcharge_minor AS transferSurchargeMinor,
              discount_minor AS discountMinor, total_minor AS totalMinor,
              payment_plan AS paymentPlan, deposit_percent_bps AS depositPercentBps,
              requested_payment_minor AS requestedPaymentMinor,
              paid_minor AS paidMinor, remaining_minor AS remainingMinor,
              status, payment_status AS paymentStatus,
              primary_contact_name AS primaryContactName,
              primary_contact_phone AS primaryContactPhone,
              primary_contact_telegram AS primaryContactTelegram,
              data_status AS dataStatus, created_at AS createdAt, updated_at AS updatedAt
       FROM orders
       WHERE session_id = ?1 AND id = ?2
       LIMIT 1`,
    )
    .bind(session.id, c.req.param('id'))
    .first<Record<string, unknown>>()

  if (!order) {
    return c.json(
      { ok: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }, requestId: c.get('requestId') },
      404,
    )
  }

  const participants = await c.env.DB
    .prepare(
      `SELECT id, participant_type AS kind, full_name AS fullName,
              birth_date AS birthDate, height_cm AS heightCm,
              pricing_category AS pricingCategory, price_minor AS priceMinor
       FROM order_participants
       WHERE order_id = ?1
       ORDER BY created_at ASC, id ASC`,
    )
    .bind(c.req.param('id'))
    .all<Record<string, unknown>>()

  return c.json({ ok: true, order: { ...order, participants: participants.results ?? [] }, requestId: c.get('requestId') })
})

orderRoutes.get('/my-trips', async (c) => {
  const session = await resolveDemoSession(c)
  const orders = await c.env.DB
    .prepare(
      `SELECT id, display_code AS displayCode, tour_title_snapshot AS tourTitle,
              tour_date AS tourDate, total_minor AS totalMinor, currency,
              status, payment_status AS paymentStatus,
              paid_minor AS paidMinor, remaining_minor AS remainingMinor,
              data_status AS dataStatus, created_at AS createdAt
       FROM orders
       WHERE session_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(session.id)
    .all<Record<string, unknown>>()

  return c.json({
    ok: true,
    trips: orders.results ?? [],
    scope: 'current_demo_session',
    requestId: c.get('requestId'),
  })
})
