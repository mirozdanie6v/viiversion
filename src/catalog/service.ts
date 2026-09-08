export interface DestinationDto {
  id: string
  slug: string
  name: string
  sourceUrl: string | null
  dataStatus: 'verified_site' | 'demo_input'
}

export interface TourListItemDto {
  id: string
  slug: string
  title: string
  destinationSlug: string
  category: string | null
  pricingMode: string
  currency: string
  adultPriceMinor: number | null
  childPriceMinor: number | null
  sourceUrl: string | null
  dataStatus: 'verified_site' | 'demo_input'
  hasDemoOverride: boolean
}

export interface TourDetailDto extends TourListItemDto {
  pricingRules: unknown
  schedule: unknown
  program: unknown
  included: unknown
  extraCosts: unknown
  whatToTake: unknown
  bookingRules: unknown
  transferRules: unknown
  images: Array<{ assetPath: string; altText: string; sortOrder: number }>
}

function parseJson(value: string | null): unknown {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function listDestinations(
  db: D1Database,
  sessionId: string,
): Promise<DestinationDto[]> {
  const [verified, demo] = await Promise.all([
    db
      .prepare(
        `SELECT id, slug, name, source_url AS sourceUrl
         FROM destinations
         WHERE is_published = 1
         ORDER BY sort_order ASC, name ASC`,
      )
      .all<{ id: string; slug: string; name: string; sourceUrl: string }>(),
    db
      .prepare(
        `SELECT id, slug, name
         FROM demo_destinations
         WHERE session_id = ?1 AND is_published = 1
         ORDER BY created_at ASC, name ASC`,
      )
      .bind(sessionId)
      .all<{ id: string; slug: string; name: string }>(),
  ])

  return [
    ...(verified.results ?? []).map((row) => ({
      ...row,
      sourceUrl: row.sourceUrl,
      dataStatus: 'verified_site' as const,
    })),
    ...(demo.results ?? []).map((row) => ({
      ...row,
      sourceUrl: null,
      dataStatus: 'demo_input' as const,
    })),
  ]
}

type VerifiedTourRow = {
  id: string
  slug: string
  baseTitle: string
  overrideTitle: string | null
  destinationSlug: string
  category: string | null
  pricingMode: string
  currency: string
  baseAdultPriceMinor: number | null
  overrideAdultPriceMinor: number | null
  baseChildPriceMinor: number | null
  overrideChildPriceMinor: number | null
  sourceUrl: string
  overrideId: string | null
}

export async function listTours(
  db: D1Database,
  sessionId: string,
  filters: { destination?: string; category?: string },
): Promise<TourListItemDto[]> {
  const clauses = ['COALESCE(o.is_published, t.is_published) = 1']
  const bindings: unknown[] = [sessionId]

  if (filters.destination) {
    clauses.push(`d.slug = ?${bindings.length + 1}`)
    bindings.push(filters.destination)
  }

  if (filters.category) {
    clauses.push(`t.category = ?${bindings.length + 1}`)
    bindings.push(filters.category)
  }

  const verifiedStatement = db.prepare(
    `SELECT
       t.id,
       t.slug,
       t.title AS baseTitle,
       o.title AS overrideTitle,
       d.slug AS destinationSlug,
       t.category,
       t.pricing_mode AS pricingMode,
       t.currency,
       t.adult_price_minor AS baseAdultPriceMinor,
       o.adult_price_minor AS overrideAdultPriceMinor,
       t.child_price_minor AS baseChildPriceMinor,
       o.child_price_minor AS overrideChildPriceMinor,
       t.source_url AS sourceUrl,
       o.id AS overrideId
     FROM tours t
     JOIN destinations d ON d.id = t.destination_id
     LEFT JOIN demo_tour_overrides o
       ON o.tour_id = t.id AND o.session_id = ?1
     WHERE ${clauses.join(' AND ')}
     ORDER BY t.sort_order ASC, t.title ASC`,
  )

  const verified = await verifiedStatement.bind(...bindings).all<VerifiedTourRow>()

  const demoClauses = ['session_id = ?1', 'is_published = 1']
  const demoBindings: unknown[] = [sessionId]

  if (filters.destination) {
    demoClauses.push(`destination_slug = ?${demoBindings.length + 1}`)
    demoBindings.push(filters.destination)
  }

  if (filters.category) {
    demoClauses.push(`category = ?${demoBindings.length + 1}`)
    demoBindings.push(filters.category)
  }

  const demo = await db
    .prepare(
      `SELECT
         id, slug, title, destination_slug AS destinationSlug, category,
         pricing_mode AS pricingMode, currency,
         adult_price_minor AS adultPriceMinor,
         child_price_minor AS childPriceMinor
       FROM demo_user_created_tours
       WHERE ${demoClauses.join(' AND ')}
       ORDER BY created_at ASC, title ASC`,
    )
    .bind(...demoBindings)
    .all<{
      id: string
      slug: string
      title: string
      destinationSlug: string
      category: string | null
      pricingMode: string
      currency: string
      adultPriceMinor: number | null
      childPriceMinor: number | null
    }>()

  return [
    ...(verified.results ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.overrideTitle ?? row.baseTitle,
      destinationSlug: row.destinationSlug,
      category: row.category,
      pricingMode: row.pricingMode,
      currency: row.currency,
      adultPriceMinor: row.overrideAdultPriceMinor ?? row.baseAdultPriceMinor,
      childPriceMinor: row.overrideChildPriceMinor ?? row.baseChildPriceMinor,
      sourceUrl: row.sourceUrl,
      dataStatus: 'verified_site' as const,
      hasDemoOverride: Boolean(row.overrideId),
    })),
    ...(demo.results ?? []).map((row) => ({
      ...row,
      sourceUrl: null,
      dataStatus: 'demo_input' as const,
      hasDemoOverride: false,
    })),
  ]
}

type VerifiedTourDetailRow = VerifiedTourRow & {
  basePricingRulesJson: string
  overridePricingRulesJson: string | null
  baseScheduleJson: string | null
  overrideScheduleJson: string | null
  programJson: string | null
  includedJson: string | null
  extraCostsJson: string | null
  whatToTakeJson: string | null
  bookingRulesJson: string | null
  transferRulesJson: string | null
  patchJson: string | null
}

export async function getTourBySlug(
  db: D1Database,
  sessionId: string,
  slug: string,
): Promise<TourDetailDto | null> {
  const verified = await db
    .prepare(
      `SELECT
         t.id,
         t.slug,
         t.title AS baseTitle,
         o.title AS overrideTitle,
         d.slug AS destinationSlug,
         t.category,
         t.pricing_mode AS pricingMode,
         t.currency,
         t.adult_price_minor AS baseAdultPriceMinor,
         o.adult_price_minor AS overrideAdultPriceMinor,
         t.child_price_minor AS baseChildPriceMinor,
         o.child_price_minor AS overrideChildPriceMinor,
         t.pricing_rules_json AS basePricingRulesJson,
         o.pricing_rules_json AS overridePricingRulesJson,
         t.schedule_json AS baseScheduleJson,
         o.schedule_json AS overrideScheduleJson,
         t.program_json AS programJson,
         t.included_json AS includedJson,
         t.extra_costs_json AS extraCostsJson,
         t.what_to_take_json AS whatToTakeJson,
         t.booking_rules_json AS bookingRulesJson,
         t.transfer_rules_json AS transferRulesJson,
         t.source_url AS sourceUrl,
         o.id AS overrideId,
         o.patch_json AS patchJson
       FROM tours t
       JOIN destinations d ON d.id = t.destination_id
       LEFT JOIN demo_tour_overrides o
         ON o.tour_id = t.id AND o.session_id = ?1
       WHERE t.slug = ?2 AND COALESCE(o.is_published, t.is_published) = 1
       LIMIT 1`,
    )
    .bind(sessionId, slug)
    .first<VerifiedTourDetailRow>()

  if (verified) {
    const images = await db
      .prepare(
        `SELECT asset_path AS assetPath, alt_text AS altText, sort_order AS sortOrder
         FROM tour_images
         WHERE tour_id = ?1
         ORDER BY sort_order ASC`,
      )
      .bind(verified.id)
      .all<{ assetPath: string; altText: string; sortOrder: number }>()

    const patch = parseJson(verified.patchJson)
    const base: TourDetailDto = {
      id: verified.id,
      slug: verified.slug,
      title: verified.overrideTitle ?? verified.baseTitle,
      destinationSlug: verified.destinationSlug,
      category: verified.category,
      pricingMode: verified.pricingMode,
      currency: verified.currency,
      adultPriceMinor: verified.overrideAdultPriceMinor ?? verified.baseAdultPriceMinor,
      childPriceMinor: verified.overrideChildPriceMinor ?? verified.baseChildPriceMinor,
      pricingRules: parseJson(verified.overridePricingRulesJson ?? verified.basePricingRulesJson),
      schedule: parseJson(verified.overrideScheduleJson ?? verified.baseScheduleJson),
      program: parseJson(verified.programJson),
      included: parseJson(verified.includedJson),
      extraCosts: parseJson(verified.extraCostsJson),
      whatToTake: parseJson(verified.whatToTakeJson),
      bookingRules: parseJson(verified.bookingRulesJson),
      transferRules: parseJson(verified.transferRulesJson),
      sourceUrl: verified.sourceUrl,
      dataStatus: 'verified_site',
      hasDemoOverride: Boolean(verified.overrideId),
      images: images.results ?? [],
    }

    if (patch && typeof patch === 'object' && !Array.isArray(patch)) {
      return { ...base, ...(patch as Partial<TourDetailDto>), id: base.id, slug: base.slug, sourceUrl: base.sourceUrl }
    }

    return base
  }

  const demo = await db
    .prepare(
      `SELECT
         id, slug, title, destination_slug AS destinationSlug, category,
         pricing_mode AS pricingMode, currency,
         adult_price_minor AS adultPriceMinor,
         child_price_minor AS childPriceMinor,
         pricing_rules_json AS pricingRulesJson,
         schedule_json AS scheduleJson,
         content_json AS contentJson
       FROM demo_user_created_tours
       WHERE session_id = ?1 AND slug = ?2 AND is_published = 1
       LIMIT 1`,
    )
    .bind(sessionId, slug)
    .first<{
      id: string
      slug: string
      title: string
      destinationSlug: string
      category: string | null
      pricingMode: string
      currency: string
      adultPriceMinor: number | null
      childPriceMinor: number | null
      pricingRulesJson: string
      scheduleJson: string | null
      contentJson: string | null
    }>()

  if (!demo) return null

  const content = parseJson(demo.contentJson)
  const contentObject = content && typeof content === 'object' && !Array.isArray(content) ? content as Record<string, unknown> : {}

  return {
    id: demo.id,
    slug: demo.slug,
    title: demo.title,
    destinationSlug: demo.destinationSlug,
    category: demo.category,
    pricingMode: demo.pricingMode,
    currency: demo.currency,
    adultPriceMinor: demo.adultPriceMinor,
    childPriceMinor: demo.childPriceMinor,
    pricingRules: parseJson(demo.pricingRulesJson),
    schedule: parseJson(demo.scheduleJson),
    program: contentObject.program ?? null,
    included: contentObject.included ?? null,
    extraCosts: contentObject.extraCosts ?? null,
    whatToTake: contentObject.whatToTake ?? null,
    bookingRules: contentObject.bookingRules ?? null,
    transferRules: contentObject.transferRules ?? null,
    sourceUrl: null,
    dataStatus: 'demo_input',
    hasDemoOverride: false,
    images: [],
  }
}

export async function getDemoAvailability(
  db: D1Database,
  sessionId: string,
  tourId: string,
) {
  const result = await db
    .prepare(
      `SELECT date, status, capacity, remaining, data_status AS dataStatus
       FROM demo_availability
       WHERE session_id = ?1 AND tour_id = ?2
       ORDER BY date ASC`,
    )
    .bind(sessionId, tourId)
    .all<{
      date: string
      status: string
      capacity: number | null
      remaining: number | null
      dataStatus: 'demo_availability'
    }>()

  return result.results ?? []
}
