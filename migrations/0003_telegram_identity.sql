-- Telegram Mini App visitor identity fields.
-- Raw Telegram initData is intentionally NOT persisted. It is accepted only for
-- server-side validation/extraction and discarded after the event is stored.

ALTER TABLE analytics_events ADD COLUMN telegram_user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_username TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_last_name TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_language_code TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_is_premium INTEGER;
ALTER TABLE analytics_events ADD COLUMN telegram_photo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_start_param TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_auth_date INTEGER;
ALTER TABLE analytics_events ADD COLUMN telegram_added_to_attachment_menu INTEGER;
ALTER TABLE analytics_events ADD COLUMN telegram_allows_write_to_pm INTEGER;
ALTER TABLE analytics_events ADD COLUMN telegram_chat_type TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_chat_instance TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN telegram_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE analytics_events ADD COLUMN telegram_verification TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_analytics_events_telegram_user
  ON analytics_events(telegram_user_id, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_telegram_username
  ON analytics_events(telegram_username, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_telegram_verified
  ON analytics_events(telegram_verified, received_at);

-- Trusted per-project configuration. telegram_bot_id is not secret; it is used
-- for Telegram's third-party Ed25519 validation of initData signatures.
CREATE TABLE IF NOT EXISTS analytics_project_config (
  hostname TEXT PRIMARY KEY,
  telegram_bot_id TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
