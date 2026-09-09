ALTER TABLE analytics_events ADD COLUMN ip_address TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN user_agent TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN accept_language TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN sec_ch_ua TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN sec_ch_ua_mobile TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN sec_ch_ua_platform TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN cf_ray TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN country TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN continent TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN region TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN region_code TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN postal_code TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN latitude REAL;
ALTER TABLE analytics_events ADD COLUMN longitude REAL;
ALTER TABLE analytics_events ADD COLUMN cf_timezone TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN asn INTEGER;
ALTER TABLE analytics_events ADD COLUMN as_organization TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN colo TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN http_protocol TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN tls_version TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN tls_cipher TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN client_tcp_rtt INTEGER;
ALTER TABLE analytics_events ADD COLUMN browser_platform TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN browser_vendor TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN browser_languages TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN cookie_enabled INTEGER;
ALTER TABLE analytics_events ADD COLUMN do_not_track TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN hardware_concurrency INTEGER;
ALTER TABLE analytics_events ADD COLUMN device_memory REAL;
ALTER TABLE analytics_events ADD COLUMN max_touch_points INTEGER;
ALTER TABLE analytics_events ADD COLUMN color_depth INTEGER;
ALTER TABLE analytics_events ADD COLUMN pixel_ratio REAL;
ALTER TABLE analytics_events ADD COLUMN viewport TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN orientation TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN connection_type TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN effective_type TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN downlink REAL;
ALTER TABLE analytics_events ADD COLUMN rtt INTEGER;
ALTER TABLE analytics_events ADD COLUMN save_data INTEGER;
ALTER TABLE analytics_events ADD COLUMN webdriver INTEGER;
ALTER TABLE analytics_events ADD COLUMN ua_data TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN page_url TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN query_string TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN url_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN raw_referrer TEXT NOT NULL DEFAULT '';
ALTER TABLE analytics_events ADD COLUMN request_referer TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_analytics_ip_received ON analytics_events(ip_address, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_country_received ON analytics_events(country, received_at);
CREATE INDEX IF NOT EXISTS idx_analytics_city_received ON analytics_events(city, received_at);

CREATE TABLE IF NOT EXISTS analytics_maintenance_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  triggered_by TEXT NOT NULL,
  retention_days INTEGER,
  cutoff_at TEXT,
  deleted_rows INTEGER NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_maintenance_occurred ON analytics_maintenance_log(occurred_at);
