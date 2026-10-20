-- Approved client commitments live only in the protected Brain D1, never in public GitHub.
-- Append-only versions; supersession and revision uniqueness prevent silent rewrites.
CREATE TABLE IF NOT EXISTS approved_commitments(
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL,
  decision_key TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK(revision >= 1),
  supersedes TEXT UNIQUE,
  record_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(project,decision_key,revision)
);
CREATE INDEX IF NOT EXISTS approved_commitments_lookup
  ON approved_commitments(project,decision_key,revision DESC);
CREATE TABLE IF NOT EXISTS execution_plans(
  id TEXT PRIMARY KEY,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
