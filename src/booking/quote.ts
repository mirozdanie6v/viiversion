import { z } from 'zod'

export type BookingFormat = 'group' | 'private'
export type PaymentPlan = 'prepayment' | 'full'
export type ParticipantKind = 'adult' | 'child'

export interface QuoteParticipantInput {
  kind: ParticipantKind
  birthDate: string
  heightCm?: number
}

export interface QuoteInput {
  tourId: string
  tourDate: string
  bookingFormat: BookingFormat
  participants: QuoteParticipantInput[]
  priceVariant?: string
  roomOccupancy?: 'single' | 'double'
  transferZone?: string
  promoCode?: string
  paymentPlan: PaymentPlan
  depositPercent?: number
}

export interface QuoteParticipantPrice {
  index: number
  kind: ParticipantKind
  pricingCategory: string
  priceMinor: number
}

export interface QuoteResult {
  tourId: string
  tourTitle: string
  tourDate: string
  bookingFormat: BookingFormat
  currency: string
  tourSubtotalMinor: number
  transferSurchargeMinor: number
  discountMinor: number
  totalMinor: number
  paymentPlan: PaymentPlan
  depositPercentBps: number | null
  requestedPaymentMinor: number
  remainingAfterRequestedPaymentMinor: number
  participantPrices: QuoteParticipantPrice[]
  promo: { code: string; title: string; dataStatus: 'demo_promo' } | null
  availability: {
    status: string
    capacity: number | null
    remaining: number | null
    dataStatus: 'demo_availability'
  } | null
  pricingProvenance: 'verified_site' | 'demo_input'
  sourceUrl: string | null
}

export class QuoteError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message)
  }
}

type EffectiveTour = {
  id: string
  title: string
  pricingMode: string
  currency: string
  adultPriceMinor: number | null
  childPriceMinor: number | null
  pricingRules: unknown
  sourceUrl: string | null
  pricingProvenance: 'verified_site' | 'demo_input'
}

const groupRuleSchema = z.object({
  adultMinor: z.number().int().min(0),
  child: z
    .object({
      maxHeightCm: z.number().int().positive().optional(),
      freeMaxHeightCm: z.number().int().positive().optional(),
      paidMaxHeightCm: z.number().int().positive().optional(),
      priceMinor: z.number().int().min(0).optional(),
      paidMinor: z.number().int().min(0).optional(),
      freeUnderAgeYears: z.number().int().min(0).optional(),
    })
    .optional(),
})

const privatePriceSchema = z.union([
  z.number().int().min(0),
  z.object({ perPersonMinor: z.number().int().min(0) }),
])

const variantSchema = z.object({
  adultSingleMinor: z.number().int().min(0),
  adultDoubleMinor: z.number().int().min(0),
  childMaxHeightCm: z.number().int().positive(),
  childMinor: z.number().int().min(0),
  freeMaxHeightCm: z.number().int().positive().optional(),
})

const pricingRulesSchema = z.object({
  group: groupRuleSchema.optional(),
  private: z.record(z.string(), privatePriceSchema).optional(),
  variants: z.record(z.string(), variantSchema).optional(),
}).passthrough()

type TransferSettings = {
  zones?: Array<{
    key?: string
    tiers?: Array<{ minPeople?: number; maxPeople?: number; priceMinor?: number }>
  }>
}

function parseJson(value: string | null): unknown {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function ageOnDate(birthDate: string, tourDate: string): number {
  const birth = new Date(`${birthDate}T00:00:00Z`)
  const date = new Date(`${tourDate}T00:00:00Z`)
  if (Number.isNaN(birth.getTime()) || Number.isNaN(date.getTime()) || birth > date) {
    throw new QuoteError('INVALID_BIRTH_DATE', 'Participant birth date is invalid')
  }

  let age = date.getUTCFullYear() - birth.getUTCFullYear()
  const monthDelta = date.getUTCMonth() - birth.getUTCMonth()
  if (monthDelta < 0 || (monthDelta === 0 && date.getUTCDate() < birth.getUTCDate())) age -= 1
  return age
}

async function loadEffectiveTour(
  db: D1Database,
  sessionId: string,
  tourId: string,
): Promise<EffectiveTour> {
  const verified = await db
    .prepare(
      `SELECT
         t.id,
         COALESCE(o.title, t.title) AS title,
         t.pricing_mode AS pricingMode,
         t.currency,
         COALESCE(o.adult_price_minor, t.adult_price_minor) AS adultPriceMinor,
         COALESCE(o.child_price_minor, t.child_price_minor) AS childPriceMinor,
         COALESCE(o.pricing_rules_json, t.pricing_rules_json) AS pricingRulesJson,
         t.source_url AS sourceUrl
       FROM tours t
       LEFT JOIN demo_tour_overrides o
         ON o.tour_id = t.id AND o.session_id = ?1
       WHERE t.id = ?2 AND COALESCE(o.is_published, t.is_published) = 1
       LIMIT 1`,
    )
    .bind(sessionId, tourId)
    .first<{
      id: string
      title: string
      pricingMode: string
      currency: string
      adultPriceMinor: number | null
      childPriceMinor: number | null
      pricingRulesJson: string
      sourceUrl: string
    }>()

  if (verified) {
    return {
      id: verified.id,
      title: verified.title,
      pricingMode: verified.pricingMode,
      currency: verified.currency,
      adultPriceMinor: verified.adultPriceMinor,
      childPriceMinor: verified.childPriceMinor,
      pricingRules: parseJson(verified.pricingRulesJson),
      sourceUrl: verified.sourceUrl,
      pricingProvenance: 'verified_site',
    }
  }

  const demo = await db
    .prepare(
      `SELECT id, title, pricing_mode AS pricingMode, currency,
              adult_price_minor AS adultPriceMinor, child_price_minor AS childPriceMinor,
              pricing_rules_json AS pricingRulesJson
       FROM demo_user_created_tours
       WHERE session_id = ?1 AND id = ?2 AND is_published = 1
       LIMIT 1`,
    )
    .bind(sessionId, tourId)
    .first<{
      id: string
      title: string
      pricingMode: string
      currency: string
      adultPriceMinor: number | null
      childPriceMinor: number | null
      pricingRulesJson: string
    }>()

  if (!demo) throw new QuoteError('TOUR_NOT_FOUND', 'Tour not found', 404)

  return {
    id: demo.id,
    title: demo.title,
    pricingMode: demo.pricingMode,
    currency: demo.currency,
    adultPriceMinor: demo.adultPriceMinor,
    childPriceMinor: demo.childPriceMinor,
    pricingRules: parseJson(demo.pricingRulesJson),
    sourceUrl: null,
    pricingProvenance: 'demo_input',
  }
}

function priceGroupParticipants(
  participants: QuoteParticipantInput[],
  tourDate: string,
  group: z.infer<typeof groupRuleSchema>,
): QuoteParticipantPrice[] {
  return participants.map((participant, index) => {
    if (participant.kind === 'adult') {
      return { index, kind: participant.kind, pricingCategory: 'adult', priceMinor: group.adultMinor }
    }

    const childRule = group.child
    if (!childRule) {
      return { index, kind: participant.kind, pricingCategory: 'adult_fallback', priceMinor: group.adultMinor }
    }

    const age = ageOnDate(participant.birthDate, tourDate)
    if (childRule.freeUnderAgeYears !== undefined && age < childRule.freeUnderAgeYears) {
      return { index, kind: participant.kind, pricingCategory: 'child_free_by_age', priceMinor: 0 }
    }

    if (participant.heightCm === undefined) {
      throw new QuoteError('CHILD_HEIGHT_REQUIRED', 'Height is required to calculate a child price')
    }

    if (childRule.freeMaxHeightCm !== undefined && participant.heightCm <= childRule.freeMaxHeightCm) {
      return { index, kind: participant.kind, pricingCategory: 'child_free_by_height', priceMinor: 0 }
    }

    const paidHeightLimit = childRule.paidMaxHeightCm ?? childRule.maxHeightCm
    const paidPrice = childRule.paidMinor ?? childRule.priceMinor
    if (paidHeightLimit !== undefined && paidPrice !== undefined && participant.heightCm <= paidHeightLimit) {
      return { index, kind: participant.kind, pricingCategory: 'child', priceMinor: paidPrice }
    }

    return { index, kind: participant.kind, pricingCategory: 'adult_by_rule', priceMinor: group.adultMinor }
  })
}

function parsePrivateRange(key: string): { min: number; max: number } | null {
  if (/^\d+$/.test(key)) {
    const value = Number(key)
    return { min: value, max: value }
  }

  const match = key.match(/^(\d+)-(\d+)$/)
  if (!match) return null
  const min = Number(match[1])
  const max = Number(match[2])
  return min <= max ? { min, max } : null
}

function pricePrivateParty(
  participantCount: number,
  privateRules: Record<string, z.infer<typeof privatePriceSchema>>,
): number {
  const matches = Object.entries(privateRules)
    .map(([key, price]) => ({ range: parsePrivateRange(key), price }))
    .filter((item): item is { range: { min: number; max: number }; price: z.infer<typeof privatePriceSchema> } =>
      Boolean(item.range && participantCount >= item.range.min && participantCount <= item.range.max),
    )

  if (matches.length === 0) {
    throw new QuoteError('PRIVATE_PRICE_NOT_PUBLISHED', 'No verified private price is published for this party size', 409)
  }

  const totals = matches.map(({ price }) =>
    typeof price === 'number' ? price : price.perPersonMinor * participantCount,
  )
  const uniqueTotals = [...new Set(totals)]

  if (uniqueTotals.length !== 1) {
    throw new QuoteError(
      'AMBIGUOUS_VERIFIED_PRICING_RULE',
      'The published MAX TOUR private pricing rules conflict for this party size',
      409,
    )
  }

  return uniqueTotals[0]!
}

function priceVariantParticipants(
  participants: QuoteParticipantInput[],
  tourDate: string,
  variant: z.infer<typeof variantSchema>,
  roomOccupancy: 'single' | 'double' | undefined,
): QuoteParticipantPrice[] {
  if (!roomOccupancy) {
    throw new QuoteError('ROOM_OCCUPANCY_REQUIRED', 'Room occupancy is required for this tour price')
  }

  const adultPrice = roomOccupancy === 'single' ? variant.adultSingleMinor : variant.adultDoubleMinor

  return participants.map((participant, index) => {
    if (participant.kind === 'adult') {
      return { index, kind: participant.kind, pricingCategory: `adult_${roomOccupancy}`, priceMinor: adultPrice }
    }

    ageOnDate(participant.birthDate, tourDate)
    if (participant.heightCm === undefined) {
      throw new QuoteError('CHILD_HEIGHT_REQUIRED', 'Height is required to calculate a child price')
    }

    if (variant.freeMaxHeightCm !== undefined && participant.heightCm <= variant.freeMaxHeightCm) {
      return { index, kind: participant.kind, pricingCategory: 'child_free_by_height', priceMinor: 0 }
    }

    if (participant.heightCm <= variant.childMaxHeightCm) {
      return { index, kind: participant.kind, pricingCategory: 'child', priceMinor: variant.childMinor }
    }

    return { index, kind: participant.kind, pricingCategory: `adult_${roomOccupancy}_by_rule`, priceMinor: adultPrice }
  })
}

async function getTransferSurcharge(
  db: D1Database,
  transferZone: string | undefined,
  participantCount: number,
): Promise<number> {
  if (!transferZone) return 0

  const setting = await db
    .prepare("SELECT value_json AS valueJson FROM app_settings WHERE key = 'max_tour.transfer_rules' LIMIT 1")
    .first<{ valueJson: string }>()
  const parsed = (parseJson(setting?.valueJson ?? null) ?? {}) as TransferSettings
  const zone = parsed.zones?.find((item) => item.key === transferZone)
  if (!zone) throw new QuoteError('TRANSFER_ZONE_NOT_FOUND', 'Transfer zone is not supported')

  const tier = zone.tiers?.find(
    (item) =>
      typeof item.minPeople === 'number' &&
      typeof item.maxPeople === 'number' &&
      participantCount >= item.minPeople &&
      participantCount <= item.maxPeople,
  )

  if (!tier || typeof tier.priceMinor !== 'number') {
    throw new QuoteError('TRANSFER_PRICE_NOT_PUBLISHED', 'No verified transfer price is published for this party size', 409)
  }

  return tier.priceMinor
}

async function getPromoDiscount(
  db: D1Database,
  sessionId: string,
  tourId: string,
  promoCode: string | undefined,
  tourSubtotalMinor: number,
): Promise<{ discountMinor: number; promo: QuoteResult['promo'] }> {
  if (!promoCode) return { discountMinor: 0, promo: null }

  const now = Date.now()
  const promo = await db
    .prepare(
      `SELECT code, title, discount_type AS discountType, discount_value AS discountValue
       FROM demo_promotions
       WHERE session_id = ?1
         AND code = ?2
         AND is_active = 1
         AND (tour_id IS NULL OR tour_id = ?3)
         AND (starts_at IS NULL OR starts_at <= ?4)
         AND (ends_at IS NULL OR ends_at >= ?4)
       LIMIT 1`,
    )
    .bind(sessionId, promoCode.trim().toUpperCase(), tourId, now)
    .first<{ code: string; title: string; discountType: string; discountValue: number }>()

  if (!promo) throw new QuoteError('PROMO_NOT_FOUND', 'Demo promo code is not active for this tour', 404)

  let discountMinor = 0
  if (promo.discountType === 'fixed_minor') {
    discountMinor = promo.discountValue
  } else if (promo.discountType === 'percent_bps') {
    if (promo.discountValue > 10_000) {
      throw new QuoteError('INVALID_PROMO_CONFIGURATION', 'Demo promo percentage exceeds 100%', 500)
    }
    discountMinor = Math.floor((tourSubtotalMinor * promo.discountValue) / 10_000)
  } else {
    throw new QuoteError('INVALID_PROMO_CONFIGURATION', 'Unsupported demo promo type', 500)
  }

  discountMinor = Math.min(discountMinor, tourSubtotalMinor)

  return {
    discountMinor,
    promo: { code: promo.code, title: promo.title, dataStatus: 'demo_promo' },
  }
}

async function getAvailability(
  db: D1Database,
  sessionId: string,
  tourId: string,
  tourDate: string,
  participantCount: number,
): Promise<QuoteResult['availability']> {
  const availability = await db
    .prepare(
      `SELECT status, capacity, remaining
       FROM demo_availability
       WHERE session_id = ?1 AND tour_id = ?2 AND date = ?3
       LIMIT 1`,
    )
    .bind(sessionId, tourId, tourDate)
    .first<{ status: string; capacity: number | null; remaining: number | null }>()

  if (!availability) return null
  if (availability.remaining !== null && participantCount > availability.remaining) {
    throw new QuoteError('NOT_ENOUGH_DEMO_AVAILABILITY', 'Not enough DEMO AVAILABILITY for this party size', 409)
  }

  return { ...availability, dataStatus: 'demo_availability' }
}

export async function calculateQuote(
  db: D1Database,
  sessionId: string,
  input: QuoteInput,
): Promise<QuoteResult> {
  if (input.participants.length === 0) {
    throw new QuoteError('PARTICIPANTS_REQUIRED', 'At least one participant is required')
  }

  const tour = await loadEffectiveTour(db, sessionId, input.tourId)
  if (tour.pricingMode === 'dynamic_request') {
    throw new QuoteError('MANUAL_QUOTE_REQUIRED', 'This tour requires a current manual quote from MAX TOUR', 409)
  }

  const parsedRules = pricingRulesSchema.safeParse(tour.pricingRules)
  if (!parsedRules.success) {
    throw new QuoteError('INVALID_PRICING_CONFIGURATION', 'Tour pricing configuration cannot be calculated', 500)
  }

  let participantPrices: QuoteParticipantPrice[] = []
  let tourSubtotalMinor = 0

  if (input.bookingFormat === 'private') {
    const privateRules = parsedRules.data.private
    if (!privateRules) {
      throw new QuoteError('PRIVATE_PRICE_NOT_PUBLISHED', 'Private pricing is not published for this tour', 409)
    }
    tourSubtotalMinor = pricePrivateParty(input.participants.length, privateRules)
    participantPrices = input.participants.map((participant, index) => ({
      index,
      kind: participant.kind,
      pricingCategory: 'private_party_included',
      priceMinor: 0,
    }))
  } else if (parsedRules.data.variants) {
    if (!input.priceVariant) {
      throw new QuoteError('PRICE_VARIANT_REQUIRED', 'A price variant is required for this tour')
    }
    const variant = parsedRules.data.variants[input.priceVariant]
    if (!variant) throw new QuoteError('PRICE_VARIANT_NOT_FOUND', 'Selected price variant is not published')
    participantPrices = priceVariantParticipants(
      input.participants,
      input.tourDate,
      variant,
      input.roomOccupancy,
    )
    tourSubtotalMinor = participantPrices.reduce((sum, item) => sum + item.priceMinor, 0)
  } else if (parsedRules.data.group) {
    participantPrices = priceGroupParticipants(input.participants, input.tourDate, parsedRules.data.group)
    tourSubtotalMinor = participantPrices.reduce((sum, item) => sum + item.priceMinor, 0)
  } else {
    throw new QuoteError('PRICE_RULE_NOT_SUPPORTED', 'This published price requires a manual quote', 409)
  }

  const transferSurchargeMinor = await getTransferSurcharge(
    db,
    input.transferZone,
    input.participants.length,
  )
  const { discountMinor, promo } = await getPromoDiscount(
    db,
    sessionId,
    tour.id,
    input.promoCode,
    tourSubtotalMinor,
  )
  const totalMinor = Math.max(0, tourSubtotalMinor + transferSurchargeMinor - discountMinor)

  let depositPercentBps: number | null = null
  let requestedPaymentMinor = totalMinor

  if (input.paymentPlan === 'prepayment') {
    if (input.depositPercent === undefined || input.depositPercent < 30 || input.depositPercent > 100) {
      throw new QuoteError(
        'INVALID_DEPOSIT_PERCENT',
        'Prepayment percentage must be between 30 and 100 according to the verified MAX TOUR policy',
      )
    }
    depositPercentBps = input.depositPercent * 100
    requestedPaymentMinor = Math.ceil((totalMinor * input.depositPercent) / 100)
  }

  const availability = await getAvailability(
    db,
    sessionId,
    tour.id,
    input.tourDate,
    input.participants.length,
  )

  return {
    tourId: tour.id,
    tourTitle: tour.title,
    tourDate: input.tourDate,
    bookingFormat: input.bookingFormat,
    currency: tour.currency,
    tourSubtotalMinor,
    transferSurchargeMinor,
    discountMinor,
    totalMinor,
    paymentPlan: input.paymentPlan,
    depositPercentBps,
    requestedPaymentMinor,
    remainingAfterRequestedPaymentMinor: totalMinor - requestedPaymentMinor,
    participantPrices,
    promo,
    availability,
    pricingProvenance: tour.pricingProvenance,
    sourceUrl: tour.sourceUrl,
  }
}
