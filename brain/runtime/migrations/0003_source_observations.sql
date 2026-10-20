-- Append-only observations of external repository facts, NOT founder-approved decisions.
-- Public GitHub metadata covers only PUBLIC repositories. Corporate canon stays authoritative.
CREATE TABLE IF NOT EXISTS source_observations (
  id TEXT PRIMARY KEY,
  source_kind TEXT NOT NULL,
  scope TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  completeness TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  record_count INTEGER NOT NULL CHECK(record_count >= 0),
  snapshot_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS source_observations_latest
  ON source_observations(source_kind, scope, observed_at DESC);
