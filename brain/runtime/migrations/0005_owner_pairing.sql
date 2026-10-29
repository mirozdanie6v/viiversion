-- Only the already connected Cloudflare administrator may approve a particular
-- PKCE authorization request. The visitor never enters a technical secret.
CREATE TABLE IF NOT EXISTS mark_oauth_pairing (
  pairing_id TEXT PRIMARY KEY,
  request_hash TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  approved_at INTEGER,
  consumed_at INTEGER
);
CREATE INDEX IF NOT EXISTS mark_oauth_pairing_expiry ON mark_oauth_pairing(expires_at);
