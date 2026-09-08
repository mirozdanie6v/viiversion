import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export type AdminRole = 'owner' | 'admin' | 'manager'
export type DataStatus = 'verified_site' | 'demo_input' | 'demo_availability' | 'demo_order' | 'demo_promo'
export type PricingMode = 'fixed' | 'private' | 'from_price' | 'dynamic_request'
export type DemoSessionMode = 'browser' | 'telegram'
export type OrderSource = 'telegram' | 'website' | 'advertising' | 'other'
export type OrderStatus = 'new' | 'paid' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'
export type PaymentStatus = 'pending' | 'paid_demo' | 'cancelled' | 'refunded_demo'

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    telegramId: text('telegram_id'),
    username: text('username'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    languageCode: text('language_code'),
    phone: text('phone'),
    email: text('email'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('users_telegram_id_unique').on(table.telegramId),
    index('users_created_at_idx').on(table.createdAt),
  ],
)

export const admins = sqliteTable(
  'admins',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').$type<AdminRole>().notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('admins_user_id_unique').on(table.userId),
    index('admins_role_idx').on(table.role),
  ],
)

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    uniqueIndex('auth_sessions_token_hash_unique').on(table.tokenHash),
    index('auth_sessions_user_id_idx').on(table.userId),
    index('auth_sessions_expires_at_idx').on(table.expiresAt),
  ],
)

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    metadataJson: text('metadata_json'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('audit_log_actor_user_id_idx').on(table.actorUserId),
    index('audit_log_entity_idx').on(table.entityType, table.entityId),
    index('audit_log_created_at_idx').on(table.createdAt),
  ],
)

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
})

export const demoSessions = sqliteTable(
  'demo_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    mode: text('mode').$type<DemoSessionMode>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    lastSeenAt: integer('last_seen_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('demo_sessions_user_id_idx').on(table.userId),
    index('demo_sessions_expires_at_idx').on(table.expiresAt),
  ],
)

export const destinations = sqliteTable(
  'destinations',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    sourceUrl: text('source_url').notNull(),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('verified_site'),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('destinations_slug_unique').on(table.slug),
    index('destinations_published_sort_idx').on(table.isPublished, table.sortOrder),
  ],
)

export const demoDestinations = sqliteTable(
  'demo_destinations',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('demo_input'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('demo_destinations_session_slug_unique').on(table.sessionId, table.slug),
    index('demo_destinations_session_idx').on(table.sessionId),
  ],
)

export const tours = sqliteTable(
  'tours',
  {
    id: text('id').primaryKey(),
    destinationId: text('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    category: text('category'),
    pricingMode: text('pricing_mode').$type<PricingMode>().notNull(),
    currency: text('currency').notNull().default('USD'),
    adultPriceMinor: integer('adult_price_minor'),
    childPriceMinor: integer('child_price_minor'),
    pricingRulesJson: text('pricing_rules_json').notNull(),
    scheduleJson: text('schedule_json'),
    programJson: text('program_json'),
    includedJson: text('included_json'),
    extraCostsJson: text('extra_costs_json'),
    whatToTakeJson: text('what_to_take_json'),
    bookingRulesJson: text('booking_rules_json'),
    transferRulesJson: text('transfer_rules_json'),
    sourceUrl: text('source_url').notNull(),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('verified_site'),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('tours_slug_unique').on(table.slug),
    index('tours_destination_idx').on(table.destinationId),
    index('tours_published_sort_idx').on(table.isPublished, table.sortOrder),
  ],
)

export const tourImages = sqliteTable(
  'tour_images',
  {
    id: text('id').primaryKey(),
    tourId: text('tour_id')
      .notNull()
      .references(() => tours.id, { onDelete: 'cascade' }),
    assetPath: text('asset_path').notNull(),
    altText: text('alt_text').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('tour_images_tour_sort_idx').on(table.tourId, table.sortOrder)],
)

export const demoTourOverrides = sqliteTable(
  'demo_tour_overrides',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    tourId: text('tour_id')
      .notNull()
      .references(() => tours.id, { onDelete: 'cascade' }),
    title: text('title'),
    adultPriceMinor: integer('adult_price_minor'),
    childPriceMinor: integer('child_price_minor'),
    pricingRulesJson: text('pricing_rules_json'),
    scheduleJson: text('schedule_json'),
    isPublished: integer('is_published', { mode: 'boolean' }),
    patchJson: text('patch_json'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('demo_tour_overrides_session_tour_unique').on(table.sessionId, table.tourId),
    index('demo_tour_overrides_session_idx').on(table.sessionId),
  ],
)

export const demoUserCreatedTours = sqliteTable(
  'demo_user_created_tours',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    destinationSlug: text('destination_slug').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    category: text('category'),
    pricingMode: text('pricing_mode').$type<PricingMode>().notNull(),
    currency: text('currency').notNull().default('USD'),
    adultPriceMinor: integer('adult_price_minor'),
    childPriceMinor: integer('child_price_minor'),
    pricingRulesJson: text('pricing_rules_json').notNull(),
    scheduleJson: text('schedule_json'),
    contentJson: text('content_json'),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('demo_input'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('demo_user_created_tours_session_slug_unique').on(table.sessionId, table.slug),
    index('demo_user_created_tours_session_destination_idx').on(table.sessionId, table.destinationSlug),
  ],
)

export const demoAvailability = sqliteTable(
  'demo_availability',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    tourId: text('tour_id').notNull(),
    date: text('date').notNull(),
    status: text('status').notNull(),
    capacity: integer('capacity'),
    remaining: integer('remaining'),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('demo_availability'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('demo_availability_session_tour_date_unique').on(table.sessionId, table.tourId, table.date),
    index('demo_availability_session_date_idx').on(table.sessionId, table.date),
  ],
)

export const demoPromotions = sqliteTable(
  'demo_promotions',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    tourId: text('tour_id'),
    code: text('code').notNull(),
    title: text('title').notNull(),
    discountType: text('discount_type').notNull(),
    discountValue: integer('discount_value').notNull(),
    startsAt: integer('starts_at', { mode: 'timestamp_ms' }),
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('demo_promo'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('demo_promotions_session_code_unique').on(table.sessionId, table.code),
    index('demo_promotions_session_tour_idx').on(table.sessionId, table.tourId),
  ],
)

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    displayCode: text('display_code').notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    source: text('source').$type<OrderSource>().notNull(),
    tourId: text('tour_id').notNull(),
    tourTitleSnapshot: text('tour_title_snapshot').notNull(),
    tourDate: text('tour_date').notNull(),
    bookingFormat: text('booking_format').notNull(),
    hotelName: text('hotel_name'),
    transferZone: text('transfer_zone'),
    currency: text('currency').notNull().default('USD'),
    tourSubtotalMinor: integer('tour_subtotal_minor').notNull(),
    transferSurchargeMinor: integer('transfer_surcharge_minor').notNull().default(0),
    discountMinor: integer('discount_minor').notNull().default(0),
    totalMinor: integer('total_minor').notNull(),
    paymentPlan: text('payment_plan').notNull(),
    depositPercentBps: integer('deposit_percent_bps'),
    requestedPaymentMinor: integer('requested_payment_minor').notNull(),
    paidMinor: integer('paid_minor').notNull().default(0),
    remainingMinor: integer('remaining_minor').notNull(),
    status: text('status').$type<OrderStatus>().notNull().default('new'),
    paymentStatus: text('payment_status').$type<PaymentStatus>().notNull().default('pending'),
    primaryContactName: text('primary_contact_name').notNull(),
    primaryContactPhone: text('primary_contact_phone'),
    primaryContactTelegram: text('primary_contact_telegram'),
    quoteSnapshotJson: text('quote_snapshot_json').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    dataStatus: text('data_status').$type<DataStatus>().notNull().default('demo_order'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('orders_session_idempotency_unique').on(table.sessionId, table.idempotencyKey),
    uniqueIndex('orders_session_display_code_unique').on(table.sessionId, table.displayCode),
    index('orders_session_created_idx').on(table.sessionId, table.createdAt),
    index('orders_source_tour_idx').on(table.source, table.tourId),
    index('orders_status_idx').on(table.status),
  ],
)

export const orderParticipants = sqliteTable(
  'order_participants',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    participantType: text('participant_type').notNull(),
    fullName: text('full_name').notNull(),
    birthDate: text('birth_date').notNull(),
    heightCm: integer('height_cm'),
    pricingCategory: text('pricing_category').notNull(),
    priceMinor: integer('price_minor').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('order_participants_order_idx').on(table.orderId)],
)

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    method: text('method').notNull(),
    amountMinor: integer('amount_minor').notNull(),
    currency: text('currency').notNull().default('USD'),
    status: text('status').$type<PaymentStatus>().notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    providerReference: text('provider_reference'),
    isSimulated: integer('is_simulated', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('payments_session_idempotency_unique').on(table.sessionId, table.idempotencyKey),
    index('payments_order_idx').on(table.orderId),
    index('payments_session_status_idx').on(table.sessionId, table.status),
  ],
)

export const analyticsEvents = sqliteTable(
  'analytics_events',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    eventName: text('event_name').notNull(),
    source: text('source').$type<OrderSource>(),
    tourId: text('tour_id'),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    metadataJson: text('metadata_json'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('analytics_events_session_created_idx').on(table.sessionId, table.createdAt),
    index('analytics_events_source_tour_idx').on(table.source, table.tourId),
    index('analytics_events_name_idx').on(table.eventName),
  ],
)

export const managerStatusHistory = sqliteTable(
  'manager_status_history',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => demoSessions.id, { onDelete: 'cascade' }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    fromStatus: text('from_status'),
    toStatus: text('to_status').$type<OrderStatus>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('manager_status_history_order_idx').on(table.orderId, table.createdAt),
    index('manager_status_history_session_idx').on(table.sessionId),
  ],
)
