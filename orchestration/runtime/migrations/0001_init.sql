CREATE TABLE IF NOT EXISTS orchestration_runs (
  run_id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_step TEXT NOT NULL,
  source_entity_id TEXT,
  projection_id TEXT,
  lead_id TEXT,
  decision_id TEXT,
  input_json TEXT NOT NULL,
  state_json TEXT NOT NULL DEFAULT '{}',
  outputs_json TEXT NOT NULL DEFAULT '{}',
  errors_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orchestration_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES orchestration_runs(run_id)
);

CREATE INDEX IF NOT EXISTS idx_runs_workflow_status
  ON orchestration_runs(workflow_id, status);

CREATE INDEX IF NOT EXISTS idx_events_run
  ON orchestration_events(run_id, event_id);
