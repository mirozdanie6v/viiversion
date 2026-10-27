-- M0B: durable receipts for the context ACTUALLY passed to Mark at invocation.
-- This does not attest that the entire ChatGPT conversation was provided.
-- Protected by the existing BRAIN_API_TOKEN; never write chat text to GitHub.
CREATE TABLE IF NOT EXISTS invocation_context_receipts (
  invocation_id TEXT PRIMARY KEY,
  project_key TEXT NOT NULL,
  source_chat_ref TEXT,
  capture_kind TEXT NOT NULL CHECK (capture_kind IN ('verbatim','structured_excerpt','model_summary','unknown')),
  coverage_status TEXT NOT NULL DEFAULT 'unknown' CHECK (coverage_status IN ('unknown','partial','verified_complete_for_declared_scope')),
  context_text TEXT NOT NULL,
  declared_window TEXT,
  payload_sha256 TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS invocation_context_project_time
  ON invocation_context_receipts(project_key,received_at DESC,invocation_id);
CREATE INDEX IF NOT EXISTS invocation_context_time
  ON invocation_context_receipts(received_at DESC,invocation_id);
