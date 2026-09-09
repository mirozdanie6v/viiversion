import {
  KNOWN_PROJECTS,
  allowedViiversionHost,
  clampDays,
  clean,
  constantTimeEqual,
  optionalNumber,
  projectName,
  safeOccurredAt,
  safePageUrl,
  safePath,
  safeRawReferrer,
  sanitizeQuery,
  sha256Hex,
} from './analytics';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  DASHBOARD_ACCESS_SHA256: string;
}

const RETENTION_DAYS = 30;
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function collectorOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return { origin: '', hostname: '' };
  try {
    const url = new URL(origin);
    return allowedViiversionHost(url.hostname) ? { origin: url.origin, hostname: url.hostname.toLowerCase() } : null;
  } catch {
    return null;
  }
}

function corsHeaders(origin: string): HeadersInit {
  return origin ? {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  } : {};
}

async function isAuthorized(request: Request, env: Env) {
  const expected = clean(env.DASHBOARD_ACCESS_SHA256, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) return false;
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (token.length < 16 || token.length > 256) return false;
  const actual = await sha256Hex(token);
  return constantTimeEqual(actual, expected);
}

function boolInt(value: unknown) {
  return typeof value === 'boolean' ? (value ? 1 : 0) : null;
}

function requestCf(request: Request): Record<string, unknown> {
  return ((request as Request & { cf?: Record<string, unknown> }).cf ?? {});
}

async function collect(request: Request, env: Env) {
  const source = collectorOrigin(request);
  if (source === null) return json({ ok: false, error: 'origin_not_allowed' }, 403);
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > 32768) return json({ ok: false, error: 'payload_too_large' }, 413, corsHeaders(source.origin));
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 32768) return json({ ok: false, error: 'payload_too_large' }, 413, corsHeaders(source.origin));

  let input: any;
  try { input = JSON.parse(raw); } catch { return json({ ok: false, error: 'invalid_json' }, 400, corsHeaders(source.origin)); }

  const payloadHost = clean(input?.hostname, 160).toLowerCase();
  const hostname = source.hostname || payloadHost;
  if (!allowedViiversionHost(hostname)) return json({ ok: false, error: 'hostname_not_allowed' }, 403, corsHeaders(source.origin));

  const eventType = input?.eventType === 'engagement' ? 'engagement' : input?.eventType === 'pageview' ? 'pageview' : '';
  if (!eventType) return json({ ok: false, error: 'invalid_event_type' }, 400, corsHeaders(source.origin));

  const visitorId = clean(input?.visitorId, 80);
  const sessionId = clean(input?.sessionId, 80);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(visitorId) || !/^[A-Za-z0-9_-]{8,80}$/.test(sessionId)) {
    return json({ ok: false, error: 'invalid_identity' }, 400, corsHeaders(source.origin));
  }

  const cf = requestCf(request);
  const ipAddress = clean(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || '', 64);
  const userAgent = clean(request.headers.get('user-agent') || input?.clientUserAgent, 2048);
  const durationMs = Math.max(0, Math.min(3600000, Math.round(Number(input?.durationMs ?? 0) || 0)));
  const pageUrl = safePageUrl(input?.pageUrl, hostname);
  const queryString = sanitizeQuery(input?.queryString, 2000);

  await env.DB.prepare(`INSERT INTO analytics_events(
    id,event_type,project,hostname,path,title,visitor_id,session_id,referrer,referrer_host,
    utm_source,utm_medium,utm_campaign,utm_content,vv_campaign,device,language,timezone,screen,duration_ms,occurred_at,
    ip_address,user_agent,accept_language,sec_ch_ua,sec_ch_ua_mobile,sec_ch_ua_platform,cf_ray,
    country,continent,region,region_code,city,postal_code,latitude,longitude,cf_timezone,asn,as_organization,colo,
    http_protocol,tls_version,tls_cipher,client_tcp_rtt,browser_platform,browser_vendor,browser_languages,cookie_enabled,
    do_not_track,hardware_concurrency,device_memory,max_touch_points,color_depth,pixel_ratio,viewport,orientation,
    connection_type,effective_type,downlink,rtt,save_data,webdriver,ua_data,page_url,query_string,url_hash,raw_referrer,request_referer
  ) VALUES (${Array.from({ length: 68 }, () => '?').join(',')})`).bind(
    crypto.randomUUID(),
    eventType,
    projectName(hostname, input?.project),
    hostname,
    safePath(input?.path),
    clean(input?.title, 200),
    visitorId,
    sessionId,
    clean(input?.referrer, 500),
    clean(input?.referrerHost, 160).toLowerCase(),
    clean(input?.utmSource, 120),
    clean(input?.utmMedium, 120),
    clean(input?.utmCampaign, 120),
    clean(input?.utmContent, 120),
    clean(input?.vvCampaign, 120),
    clean(input?.device, 24),
    clean(input?.language, 32),
    clean(input?.timezone, 80),
    clean(input?.screen, 32),
    durationMs,
    safeOccurredAt(input?.occurredAt),
    ipAddress,
    userAgent,
    clean(request.headers.get('accept-language'), 500),
    clean(request.headers.get('sec-ch-ua'), 800),
    clean(request.headers.get('sec-ch-ua-mobile'), 40),
    clean(request.headers.get('sec-ch-ua-platform'), 120),
    clean(request.headers.get('cf-ray'), 100),
    clean(cf.country || request.headers.get('cf-ipcountry'), 12),
    clean(cf.continent, 12),
    clean(cf.region, 160),
    clean(cf.regionCode, 32),
    clean(cf.city, 160),
    clean(cf.postalCode, 40),
    optionalNumber(cf.latitude, -90, 90),
    optionalNumber(cf.longitude, -180, 180),
    clean(cf.timezone, 100),
    optionalNumber(cf.asn, 0, 4294967295),
    clean(cf.asOrganization, 300),
    clean(cf.colo, 20),
    clean(cf.httpProtocol, 40),
    clean(cf.tlsVersion, 80),
    clean(cf.tlsCipher, 160),
    optionalNumber(cf.clientTcpRtt, 0, 600000),
    clean(input?.browserPlatform, 120),
    clean(input?.browserVendor, 120),
    clean(input?.browserLanguages, 500),
    boolInt(input?.cookieEnabled),
    clean(input?.doNotTrack, 20),
    optionalNumber(input?.hardwareConcurrency, 0, 1024),
    optionalNumber(input?.deviceMemory, 0, 1024),
    optionalNumber(input?.maxTouchPoints, 0, 1000),
    optionalNumber(input?.colorDepth, 0, 256),
    optionalNumber(input?.pixelRatio, 0, 100),
    clean(input?.viewport, 40),
    clean(input?.orientation, 80),
    clean(input?.connectionType, 32),
    clean(input?.effectiveType, 32),
    optionalNumber(input?.downlink, 0, 100000),
    optionalNumber(input?.rtt, 0, 600000),
    boolInt(input?.saveData),
    boolInt(input?.webdriver),
    clean(input?.uaData, 1200),
    pageUrl,
    queryString,
    clean(input?.urlHash, 800),
    safeRawReferrer(input?.rawReferrer),
    safeRawReferrer(request.headers.get('referer')),
  ).run();

  return json({ ok: true }, 202, corsHeaders(source.origin));
}

function filterSql(project: string) {
  return project && project !== 'all' ? ' AND project=? ' : ' ';
}

function queryArgs(days: number, project: string) {
  const args: (string | number)[] = [`-${days} days`];
  if (project && project !== 'all') args.push(project);
  return args;
}

async function cleanupAnalytics(env: Env, triggeredBy: 'scheduled' | 'manual', mode: 'retention' | 'all') {
  const cutoff = mode === 'retention' ? new Date(Date.now() - RETENTION_DAYS * 86400000).toISOString() : null;
  const count = mode === 'all'
    ? await env.DB.prepare('SELECT COUNT(*) AS count FROM analytics_events').first<{ count: number }>()
    : await env.DB.prepare('SELECT COUNT(*) AS count FROM analytics_events WHERE datetime(received_at) < datetime(?)').bind(cutoff).first<{ count: number }>();
  const deletedRows = Number(count?.count ?? 0);

  if (mode === 'all') await env.DB.prepare('DELETE FROM analytics_events').run();
  else await env.DB.prepare('DELETE FROM analytics_events WHERE datetime(received_at) < datetime(?)').bind(cutoff).run();

  await env.DB.prepare(`INSERT INTO analytics_maintenance_log(id,action,triggered_by,retention_days,cutoff_at,deleted_rows)
    VALUES (?,?,?,?,?,?)`).bind(
    crypto.randomUUID(),
    mode === 'all' ? 'delete_all_events' : 'retention_cleanup',
    triggeredBy,
    mode === 'retention' ? RETENTION_DAYS : null,
    cutoff,
    deletedRows,
  ).run();

  return { ok: true, mode, retentionDays: RETENTION_DAYS, cutoff, deletedRows };
}

async function manualCleanup(request: Request, env: Env) {
  if (!(await isAuthorized(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 4096) return json({ ok: false, error: 'payload_too_large' }, 413);
  let input: any = {};
  if (raw) {
    try { input = JSON.parse(raw); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  }
  const mode = input?.mode === 'all' ? 'all' : 'retention';
  if (mode === 'all' && input?.confirm !== 'DELETE_ALL_ANALYTICS') {
    return json({ ok: false, error: 'confirmation_required' }, 400);
  }
  return json(await cleanupAnalytics(env, 'manual', mode));
}

async function summary(request: Request, env: Env) {
  if (!(await isAuthorized(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get('days'));
  const project = clean(url.searchParams.get('project'), 80) || 'all';
  const filter = filterSql(project);
  const args = queryArgs(days, project);
  const where = `received_at >= datetime('now', ?) ${filter}`;

  const [metrics, engagement, projects, daily, campaigns, sources, pages, recent, geography, networks, ipStats, retention, lastCleanup] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT session_id) AS sessions, COUNT(DISTINCT CASE WHEN ip_address<>'' THEN ip_address END) AS unique_ips FROM analytics_events WHERE ${where} AND event_type='pageview'`).bind(...args).first<any>(),
    env.DB.prepare(`SELECT COALESCE(AVG(total_ms),0) AS avg_session_ms FROM (SELECT session_id, SUM(duration_ms) AS total_ms FROM analytics_events WHERE ${where} AND event_type='engagement' GROUP BY session_id)`).bind(...args).first<any>(),
    env.DB.prepare(`SELECT project,hostname,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors,COUNT(DISTINCT session_id) AS sessions,COUNT(DISTINCT CASE WHEN ip_address<>'' THEN ip_address END) AS unique_ips,MAX(received_at) AS last_visit FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY project,hostname ORDER BY pageviews DESC`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT date(received_at,'+7 hours') AS day,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY day ORDER BY day ASC`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT vv_campaign AS campaign,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors,COUNT(DISTINCT session_id) AS sessions,MAX(received_at) AS last_visit FROM analytics_events WHERE ${where} AND event_type='pageview' AND vv_campaign<>'' GROUP BY vv_campaign ORDER BY pageviews DESC LIMIT 50`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT CASE WHEN utm_source<>'' THEN utm_source WHEN referrer_host<>'' THEN referrer_host ELSE 'direct' END AS source,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY source ORDER BY pageviews DESC LIMIT 30`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT project,path,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY project,path ORDER BY pageviews DESC LIMIT 50`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT * FROM analytics_events WHERE ${where} AND event_type='pageview' ORDER BY received_at DESC LIMIT 150`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT country,region,city,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors,COUNT(DISTINCT CASE WHEN ip_address<>'' THEN ip_address END) AS unique_ips FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY country,region,city ORDER BY pageviews DESC LIMIT 50`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT asn,as_organization,colo,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY asn,as_organization,colo ORDER BY pageviews DESC LIMIT 40`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT ip_address,country,region,city,as_organization,COUNT(*) AS pageviews,COUNT(DISTINCT session_id) AS sessions,MAX(received_at) AS last_visit FROM analytics_events WHERE ${where} AND event_type='pageview' AND ip_address<>'' GROUP BY ip_address,country,region,city,as_organization ORDER BY last_visit DESC LIMIT 100`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT COUNT(*) AS total_events,COUNT(DISTINCT session_id) AS total_sessions,COUNT(DISTINCT visitor_id) AS total_visitors,MIN(received_at) AS oldest_event,MAX(received_at) AS newest_event FROM analytics_events`).first<any>(),
    env.DB.prepare(`SELECT action,triggered_by,retention_days,cutoff_at,deleted_rows,occurred_at FROM analytics_maintenance_log ORDER BY occurred_at DESC LIMIT 1`).first<any>(),
  ]);

  const knownProjects = Object.entries(KNOWN_PROJECTS)
    .filter(([host]) => host !== 'www.viiversion.com')
    .map(([hostname, value]) => ({ hostname, name: value.name, url: value.url }));

  return json({
    ok: true,
    generatedAt: new Date().toISOString(),
    days,
    project,
    retentionDays: RETENTION_DAYS,
    metrics: {
      pageviews: Number(metrics?.pageviews ?? 0),
      visitors: Number(metrics?.visitors ?? 0),
      sessions: Number(metrics?.sessions ?? 0),
      uniqueIps: Number(metrics?.unique_ips ?? 0),
      avgSessionMs: Math.round(Number(engagement?.avg_session_ms ?? 0)),
    },
    projects: projects.results ?? [],
    daily: daily.results ?? [],
    campaigns: campaigns.results ?? [],
    sources: sources.results ?? [],
    pages: pages.results ?? [],
    recent: recent.results ?? [],
    geography: geography.results ?? [],
    networks: networks.results ?? [],
    ipStats: ipStats.results ?? [],
    storage: {
      totalEvents: Number(retention?.total_events ?? 0),
      totalSessions: Number(retention?.total_sessions ?? 0),
      totalVisitors: Number(retention?.total_visitors ?? 0),
      oldestEvent: retention?.oldest_event ?? '',
      newestEvent: retention?.newest_event ?? '',
      lastCleanup: lastCleanup ?? null,
    },
    knownProjects,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/health' && request.method === 'GET') {
      const probe = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
      return json({ ok: probe?.ok === 1, service: 'viiversion-dashboard', database: 'D1', retentionDays: RETENTION_DAYS, time: new Date().toISOString() });
    }

    if (path === '/api/collect' && request.method === 'OPTIONS') {
      const source = collectorOrigin(request);
      if (source === null) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(source.origin) });
    }
    if (path === '/api/collect' && request.method === 'POST') return collect(request, env);
    if (path === '/api/summary' && request.method === 'GET') return summary(request, env);
    if (path === '/api/admin/cleanup' && request.method === 'POST') return manualCleanup(request, env);

    if (path.startsWith('/api/')) return json({ ok: false, error: 'not_found' }, 404);

    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    if (path === '/tracker.js') headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(cleanupAnalytics(env, 'scheduled', 'retention'));
  },
} satisfies ExportedHandler<Env>;
