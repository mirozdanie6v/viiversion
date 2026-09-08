CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `telegram_id` text,
  `username` text,
  `first_name` text NOT NULL,
  `last_name` text,
  `language_code` text,
  `phone` text,
  `email` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);

CREATE TABLE `admins` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `role` text NOT NULL CHECK (`role` IN ('owner', 'admin', 'manager')),
  `is_active` integer DEFAULT 1 NOT NULL CHECK (`is_active` IN (0, 1)),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `admins_user_id_unique` ON `admins` (`user_id`);
CREATE INDEX `admins_role_idx` ON `admins` (`role`);

CREATE TABLE `auth_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `revoked_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `auth_sessions_token_hash_unique` ON `auth_sessions` (`token_hash`);
CREATE INDEX `auth_sessions_user_id_idx` ON `auth_sessions` (`user_id`);
CREATE INDEX `auth_sessions_expires_at_idx` ON `auth_sessions` (`expires_at`);

CREATE TABLE `audit_log` (
  `id` text PRIMARY KEY NOT NULL,
  `actor_user_id` text,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text,
  `metadata_json` text,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `audit_log_actor_user_id_idx` ON `audit_log` (`actor_user_id`);
CREATE INDEX `audit_log_entity_idx` ON `audit_log` (`entity_type`, `entity_id`);
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);

CREATE TABLE `app_settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value_json` text NOT NULL,
  `updated_at` integer NOT NULL,
  `updated_by` text,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
