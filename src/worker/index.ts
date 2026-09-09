import { KNOWN_PROJECTS, allowedViiversionHost, clampDays, clean, constantTimeEqual, projectName, safeOccurredAt, safePath, sha256Hex } from './analytics';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  DASHBOARD_ACCESS_SHA256: string;
}

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

  const durationMs = Math.max(0, Math.min(3600000, Math.round(Number(input?.durationMs ?? 0) || 0)));
  await env.DB.prepare(`INSERT INTO analytics_events(
    id,event_type,project,hostname,path,title,visitor_id,session_id,referrer,referrer_host,
    utm_source,utm_medium,utm_campaign,utm_content,vv_campaign,device,language,timezone,screen,duration_ms,occurred_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
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

async function summary(request: Request, env: Env) {
  if (!(await isAuthorized(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get('days'));
  const project = clean(url.searchParams.get('project'), 80) || 'all';
  const filter = filterSql(project);
  const args = queryArgs(days, project);
  const where = `received_at >= datetime('now', ?) ${filter}`;

  const [metrics, engagement, projects, daily, campaigns, sources, pages, recent] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT session_id) AS sessions FROM analytics_events WHERE ${where} AND event_type='pageview'`).bind(...args).first<any>(),
    env.DB.prepare(`SELECT COALESCE(AVG(total_ms),0) AS avg_session_ms FROM (SELECT session_id, SUM(duration_ms) AS total_ms FROM analytics_events WHERE ${where} AND event_type='engagement' GROUP BY session_id)`).bind(...args).first<any>(),
    env.DB.prepare(`SELECT project,hostname,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors,COUNT(DISTINCT session_id) AS sessions,MAX(received_at) AS last_visit FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY project,hostname ORDER BY pageviews DESC`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT date(received_at,'+7 hours') AS day,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY day ORDER BY day ASC`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT vv_campaign AS campaign,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors,COUNT(DISTINCT session_id) AS sessions,MAX(received_at) AS last_visit FROM analytics_events WHERE ${where} AND event_type='pageview' AND vv_campaign<>'' GROUP BY vv_campaign ORDER BY pageviews DESC LIMIT 30`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT CASE WHEN utm_source<>'' THEN utm_source WHEN referrer_host<>'' THEN referrer_host ELSE 'direct' END AS source,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY source ORDER BY pageviews DESC LIMIT 20`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT project,path,COUNT(*) AS pageviews,COUNT(DISTINCT visitor_id) AS visitors FROM analytics_events WHERE ${where} AND event_type='pageview' GROUP BY project,path ORDER BY pageviews DESC LIMIT 30`).bind(...args).all<any>(),
    env.DB.prepare(`SELECT project,hostname,path,title,referrer_host,utm_source,utm_campaign,vv_campaign,device,visitor_id,session_id,received_at FROM analytics_events WHERE ${where} AND event_type='pageview' ORDER BY received_at DESC LIMIT 100`).bind(...args).all<any>(),
  ]);

  const knownProjects = Object.entries(KNOWN_PROJECTS)
    .filter(([host]) => host !== 'www.viiversion.com')
    .map(([hostname, value]) => ({ hostname, name: value.name, url: value.url }));

  return json({
    ok: true,
    generatedAt: new Date().toISOString(),
    days,
    project,
    metrics: {
      pageviews: Number(metrics?.pageviews ?? 0),
      visitors: Number(metrics?.visitors ?? 0),
      sessions: Number(metrics?.sessions ?? 0),
      avgSessionMs: Math.round(Number(engagement?.avg_session_ms ?? 0)),
    },
    projects: projects.results ?? [],
    daily: daily.results ?? [],
    campaigns: campaigns.results ?? [],
    sources: sources.results ?? [],
    pages: pages.results ?? [],
    recent: recent.results ?? [],
    knownProjects,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/health' && request.method === 'GET') {
      const probe = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
      return json({ ok: probe?.ok === 1, service: 'viiversion-dashboard', database: 'D1', time: new Date().toISOString() });
    }

    if (path === '/api/collect' && request.method === 'OPTIONS') {
      const source = collectorOrigin(request);
      if (source === null) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(source.origin) });
    }
    if (path === '/api/collect' && request.method === 'POST') return collect(request, env);
    if (path === '/api/summary' && request.method === 'GET') return summary(request, env);

    if (path.startsWith('/api/')) return json({ ok: false, error: 'not_found' }, 404);

    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  },
} satisfies ExportedHandler<Env>;
