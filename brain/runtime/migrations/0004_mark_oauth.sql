-- Owner-scoped OAuth 2.1 code/PKCE, hashed, expiring tokens.
-- No commercial approval token or raw Brain API token is saved here.
CREATE TABLE IF NOT EXISTS mark_oauth_clients(
 client_id TEXT PRIMARY KEY, redirect_uri TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS mark_oauth_codes(
 code_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, redirect_uri TEXT NOT NULL,
 pkce_challenge TEXT NOT NULL, resource TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS mark_oauth_tokens(
 token_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, token_kind TEXT NOT NULL
 CHECK(token_kind IN('access','refresh')), resource TEXT NOT NULL, scope TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS mark_oauth_tokens_expiry ON mark_oauth_tokens(expires_at);
