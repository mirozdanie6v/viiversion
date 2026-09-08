CREATE TABLE `demo_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `mode` text NOT NULL CHECK (`mode` IN ('browser', 'telegram')),
  `created_at` integer NOT NULL,
  `last_seen_at` integer NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `demo_sessions_user_id_idx` ON `demo_sessions` (`user_id`);
CREATE INDEX `demo_sessions_expires_at_idx` ON `demo_sessions` (`expires_at`);

CREATE TABLE `destinations` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `source_url` text NOT NULL,
  `data_status` text DEFAULT 'verified_site' NOT NULL CHECK (`data_status` IN ('verified_site', 'demo_input', 'demo_availability', 'demo_order', 'demo_promo')),
  `is_published` integer DEFAULT 1 NOT NULL CHECK (`is_published` IN (0, 1)),
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `destinations_slug_unique` ON `destinations` (`slug`);
CREATE INDEX `destinations_published_sort_idx` ON `destinations` (`is_published`, `sort_order`);

CREATE TABLE `demo_destinations` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `is_published` integer DEFAULT 1 NOT NULL CHECK (`is_published` IN (0, 1)),
  `data_status` text DEFAULT 'demo_input' NOT NULL CHECK (`data_status` = 'demo_input'),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `demo_destinations_session_slug_unique` ON `demo_destinations` (`session_id`, `slug`);
CREATE INDEX `demo_destinations_session_idx` ON `demo_destinations` (`session_id`);

CREATE TABLE `tours` (
  `id` text PRIMARY KEY NOT NULL,
  `destination_id` text NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `category` text,
  `pricing_mode` text NOT NULL CHECK (`pricing_mode` IN ('fixed', 'private', 'from_price', 'dynamic_request')),
  `currency` text DEFAULT 'USD' NOT NULL,
  `adult_price_minor` integer,
  `child_price_minor` integer,
  `pricing_rules_json` text NOT NULL,
  `schedule_json` text,
  `program_json` text,
  `included_json` text,
  `extra_costs_json` text,
  `what_to_take_json` text,
  `booking_rules_json` text,
  `transfer_rules_json` text,
  `source_url` text NOT NULL,
  `data_status` text DEFAULT 'verified_site' NOT NULL CHECK (`data_status` = 'verified_site'),
  `is_published` integer DEFAULT 1 NOT NULL CHECK (`is_published` IN (0, 1)),
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  CHECK (`adult_price_minor` IS NULL OR `adult_price_minor` >= 0),
  CHECK (`child_price_minor` IS NULL OR `child_price_minor` >= 0),
  FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON UPDATE no action ON DELETE restrict
);

CREATE UNIQUE INDEX `tours_slug_unique` ON `tours` (`slug`);
CREATE INDEX `tours_destination_idx` ON `tours` (`destination_id`);
CREATE INDEX `tours_published_sort_idx` ON `tours` (`is_published`, `sort_order`);

CREATE TABLE `tour_images` (
  `id` text PRIMARY KEY NOT NULL,
  `tour_id` text NOT NULL,
  `asset_path` text NOT NULL,
  `alt_text` text NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `tour_images_tour_sort_idx` ON `tour_images` (`tour_id`, `sort_order`);

CREATE TABLE `demo_tour_overrides` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `tour_id` text NOT NULL,
  `title` text,
  `adult_price_minor` integer,
  `child_price_minor` integer,
  `pricing_rules_json` text,
  `schedule_json` text,
  `is_published` integer CHECK (`is_published` IS NULL OR `is_published` IN (0, 1)),
  `patch_json` text,
  `updated_at` integer NOT NULL,
  CHECK (`adult_price_minor` IS NULL OR `adult_price_minor` >= 0),
  CHECK (`child_price_minor` IS NULL OR `child_price_minor` >= 0),
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `demo_tour_overrides_session_tour_unique` ON `demo_tour_overrides` (`session_id`, `tour_id`);
CREATE INDEX `demo_tour_overrides_session_idx` ON `demo_tour_overrides` (`session_id`);

CREATE TABLE `demo_user_created_tours` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `destination_slug` text NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `category` text,
  `pricing_mode` text NOT NULL CHECK (`pricing_mode` IN ('fixed', 'private', 'from_price', 'dynamic_request')),
  `currency` text DEFAULT 'USD' NOT NULL,
  `adult_price_minor` integer,
  `child_price_minor` integer,
  `pricing_rules_json` text NOT NULL,
  `schedule_json` text,
  `content_json` text,
  `is_published` integer DEFAULT 0 NOT NULL CHECK (`is_published` IN (0, 1)),
  `data_status` text DEFAULT 'demo_input' NOT NULL CHECK (`data_status` = 'demo_input'),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  CHECK (`adult_price_minor` IS NULL OR `adult_price_minor` >= 0),
  CHECK (`child_price_minor` IS NULL OR `child_price_minor` >= 0),
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `demo_user_created_tours_session_slug_unique` ON `demo_user_created_tours` (`session_id`, `slug`);
CREATE INDEX `demo_user_created_tours_session_destination_idx` ON `demo_user_created_tours` (`session_id`, `destination_slug`);

CREATE TABLE `demo_availability` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `tour_id` text NOT NULL,
  `date` text NOT NULL,
  `status` text NOT NULL CHECK (`status` IN ('available', 'few_places', 'on_request')),
  `capacity` integer,
  `remaining` integer,
  `data_status` text DEFAULT 'demo_availability' NOT NULL CHECK (`data_status` = 'demo_availability'),
  `updated_at` integer NOT NULL,
  CHECK (`capacity` IS NULL OR `capacity` >= 0),
  CHECK (`remaining` IS NULL OR `remaining` >= 0),
  CHECK (`capacity` IS NULL OR `remaining` IS NULL OR `remaining` <= `capacity`),
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `demo_availability_session_tour_date_unique` ON `demo_availability` (`session_id`, `tour_id`, `date`);
CREATE INDEX `demo_availability_session_date_idx` ON `demo_availability` (`session_id`, `date`);

CREATE TABLE `demo_promotions` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `tour_id` text,
  `code` text NOT NULL,
  `title` text NOT NULL,
  `discount_type` text NOT NULL CHECK (`discount_type` IN ('percent_bps', 'fixed_minor')),
  `discount_value` integer NOT NULL CHECK (`discount_value` >= 0),
  `starts_at` integer,
  `ends_at` integer,
  `is_active` integer DEFAULT 1 NOT NULL CHECK (`is_active` IN (0, 1)),
  `data_status` text DEFAULT 'demo_promo' NOT NULL CHECK (`data_status` = 'demo_promo'),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `demo_promotions_session_code_unique` ON `demo_promotions` (`session_id`, `code`);
CREATE INDEX `demo_promotions_session_tour_idx` ON `demo_promotions` (`session_id`, `tour_id`);

CREATE TABLE `orders` (
  `id` text PRIMARY KEY NOT NULL,
  `display_code` text NOT NULL,
  `session_id` text NOT NULL,
  `user_id` text,
  `source` text NOT NULL CHECK (`source` IN ('telegram', 'website', 'advertising', 'other')),
  `tour_id` text NOT NULL,
  `tour_title_snapshot` text NOT NULL,
  `tour_date` text NOT NULL,
  `booking_format` text NOT NULL CHECK (`booking_format` IN ('group', 'private')),
  `hotel_name` text,
  `transfer_zone` text,
  `currency` text DEFAULT 'USD' NOT NULL,
  `tour_subtotal_minor` integer NOT NULL CHECK (`tour_subtotal_minor` >= 0),
  `transfer_surcharge_minor` integer DEFAULT 0 NOT NULL CHECK (`transfer_surcharge_minor` >= 0),
  `discount_minor` integer DEFAULT 0 NOT NULL CHECK (`discount_minor` >= 0),
  `total_minor` integer NOT NULL CHECK (`total_minor` >= 0),
  `payment_plan` text NOT NULL CHECK (`payment_plan` IN ('prepayment', 'full')),
  `deposit_percent_bps` integer,
  `requested_payment_minor` integer NOT NULL CHECK (`requested_payment_minor` >= 0),
  `paid_minor` integer DEFAULT 0 NOT NULL CHECK (`paid_minor` >= 0),
  `remaining_minor` integer NOT NULL CHECK (`remaining_minor` >= 0),
  `status` text DEFAULT 'new' NOT NULL CHECK (`status` IN ('new', 'paid', 'confirmed', 'cancelled', 'completed', 'refunded')),
  `payment_status` text DEFAULT 'pending' NOT NULL CHECK (`payment_status` IN ('pending', 'paid_demo', 'cancelled', 'refunded_demo')),
  `primary_contact_name` text NOT NULL,
  `primary_contact_phone` text,
  `primary_contact_telegram` text,
  `quote_snapshot_json` text NOT NULL,
  `idempotency_key` text NOT NULL,
  `data_status` text DEFAULT 'demo_order' NOT NULL CHECK (`data_status` = 'demo_order'),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  CHECK (`deposit_percent_bps` IS NULL OR (`deposit_percent_bps` >= 0 AND `deposit_percent_bps` <= 10000)),
  CHECK (`discount_minor` <= (`tour_subtotal_minor` + `transfer_surcharge_minor`)),
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE UNIQUE INDEX `orders_session_idempotency_unique` ON `orders` (`session_id`, `idempotency_key`);
CREATE UNIQUE INDEX `orders_session_display_code_unique` ON `orders` (`session_id`, `display_code`);
CREATE INDEX `orders_session_created_idx` ON `orders` (`session_id`, `created_at`);
CREATE INDEX `orders_source_tour_idx` ON `orders` (`source`, `tour_id`);
CREATE INDEX `orders_status_idx` ON `orders` (`status`);

CREATE TABLE `order_participants` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `participant_type` text NOT NULL CHECK (`participant_type` IN ('adult', 'child')),
  `full_name` text NOT NULL,
  `birth_date` text NOT NULL,
  `height_cm` integer,
  `pricing_category` text NOT NULL,
  `price_minor` integer NOT NULL CHECK (`price_minor` >= 0),
  `created_at` integer NOT NULL,
  CHECK (`height_cm` IS NULL OR (`height_cm` > 0 AND `height_cm` < 300)),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `order_participants_order_idx` ON `order_participants` (`order_id`);

CREATE TABLE `payments` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `order_id` text NOT NULL,
  `method` text NOT NULL,
  `amount_minor` integer NOT NULL CHECK (`amount_minor` >= 0),
  `currency` text DEFAULT 'USD' NOT NULL,
  `status` text NOT NULL CHECK (`status` IN ('pending', 'paid_demo', 'cancelled', 'refunded_demo')),
  `idempotency_key` text NOT NULL,
  `provider_reference` text,
  `is_simulated` integer DEFAULT 1 NOT NULL CHECK (`is_simulated` IN (0, 1)),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `payments_session_idempotency_unique` ON `payments` (`session_id`, `idempotency_key`);
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);
CREATE INDEX `payments_session_status_idx` ON `payments` (`session_id`, `status`);

CREATE TABLE `analytics_events` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `user_id` text,
  `event_name` text NOT NULL,
  `source` text CHECK (`source` IS NULL OR `source` IN ('telegram', 'website', 'advertising', 'other')),
  `tour_id` text,
  `order_id` text,
  `metadata_json` text,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `analytics_events_session_created_idx` ON `analytics_events` (`session_id`, `created_at`);
CREATE INDEX `analytics_events_source_tour_idx` ON `analytics_events` (`source`, `tour_id`);
CREATE INDEX `analytics_events_name_idx` ON `analytics_events` (`event_name`);

CREATE TABLE `manager_status_history` (
  `id` text PRIMARY KEY NOT NULL,
  `session_id` text NOT NULL,
  `order_id` text NOT NULL,
  `actor_user_id` text,
  `from_status` text CHECK (`from_status` IS NULL OR `from_status` IN ('new', 'paid', 'confirmed', 'cancelled', 'completed', 'refunded')),
  `to_status` text NOT NULL CHECK (`to_status` IN ('new', 'paid', 'confirmed', 'cancelled', 'completed', 'refunded')),
  `created_at` integer NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `demo_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `manager_status_history_order_idx` ON `manager_status_history` (`order_id`, `created_at`);
CREATE INDEX `manager_status_history_session_idx` ON `manager_status_history` (`session_id`);
