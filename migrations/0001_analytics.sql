CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK(event_type IN ('pageview','engagement')),
  project TEXT NOT NULL,
  hostname TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',
  referrer_host TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  vv_campaign TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT '',
  screen TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_received_at ON analytics_events(received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_project_received ON analytics_events(project, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_received ON analytics_events(session_id, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_received ON analytics_events(visitor_id, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_received ON analytics_events(vv_campaign, received_at);
