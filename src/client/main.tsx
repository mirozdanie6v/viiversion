import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Visit = {
  id: string;
  project: string;
  hostname: string;
  path: string;
  page_url: string;
  query_string: string;
  url_hash: string;
  title: string;
  visitor_id: string;
  session_id: string;
  referrer: string;
  raw_referrer: string;
  request_referer: string;
  referrer_host: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  vv_campaign: string;
  device: string;
  language: string;
  timezone: string;
  screen: string;
  viewport: string;
  orientation: string;
  ip_address: string;
  user_agent: string;
  accept_language: string;
  sec_ch_ua: string;
  sec_ch_ua_mobile: string;
  sec_ch_ua_platform: string;
  cf_ray: string;
  country: string;
  continent: string;
  region: string;
  region_code: string;
  city: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  cf_timezone: string;
  asn: number | null;
  as_organization: string;
  colo: string;
  http_protocol: string;
  tls_version: string;
  tls_cipher: string;
  client_tcp_rtt: number | null;
  browser_platform: string;
  browser_vendor: string;
  browser_languages: string;
  cookie_enabled: number | null;
  do_not_track: string;
  hardware_concurrency: number | null;
  device_memory: number | null;
  max_touch_points: number | null;
  color_depth: number | null;
  pixel_ratio: number | null;
  connection_type: string;
  effective_type: string;
  downlink: number | null;
  rtt: number | null;
  save_data: number | null;
  webdriver: number | null;
  ua_data: string;
  telegram_user_id: string;
  telegram_username: string;
  telegram_first_name: string;
  telegram_last_name: string;
  telegram_language_code: string;
  telegram_is_premium: number | null;
  telegram_photo_url: string;
  telegram_start_param: string;
  telegram_auth_date: number | null;
  telegram_added_to_attachment_menu: number | null;
  telegram_allows_write_to_pm: number | null;
  telegram_chat_type: string;
  telegram_chat_instance: string;
  telegram_verified: number;
  telegram_verification: string;
  occurred_at: string;
  received_at: string;
};

type Summary = {
  ok: boolean;
  generatedAt: string;
  days: number;
  project: string;
  retentionDays: number;
  metrics: { pageviews: number; visitors: number; sessions: number; uniqueIps: number; avgSessionMs: number; telegramUsers: number; telegramPageviews: number; verifiedTelegramUsers: number };
  projects: Array<{ project: string; hostname: string; pageviews: number; visitors: number; sessions: number; unique_ips: number; last_visit: string }>;
  daily: Array<{ day: string; pageviews: number; visitors: number }>;
  campaigns: Array<{ campaign: string; pageviews: number; visitors: number; sessions: number; last_visit: string }>;
  sources: Array<{ source: string; pageviews: number; visitors: number }>;
  pages: Array<{ project: string; path: string; pageviews: number; visitors: number }>;
  recent: Visit[];
  geography: Array<{ country: string; region: string; city: string; pageviews: number; visitors: number; unique_ips: number }>;
  networks: Array<{ asn: number | null; as_organization: string; colo: string; pageviews: number; visitors: number }>;
  ipStats: Array<{ ip_address: string; country: string; region: string; city: string; as_organization: string; pageviews: number; sessions: number; last_visit: string }>;
  telegramUsers: Array<{ telegram_user_id: string; telegram_username: string; telegram_first_name: string; telegram_last_name: string; telegram_language_code: string; telegram_is_premium: number | null; telegram_photo_url: string; telegram_start_param: string; telegram_verified: number; pageviews: number; sessions: number; projects: number; first_visit: string; last_visit: string }>;
  storage: {
    totalEvents: number;
    totalSessions: number;
    totalVisitors: number;
    oldestEvent: string;
    newestEvent: string;
    lastCleanup: null | { action: string; triggered_by: string; retention_days: number | null; cutoff_at: string | null; deleted_rows: number; occurred_at: string };
  };
  knownProjects: Array<{ hostname: string; name: string; url: string }>;
};

const ranges = [1, 7, 30, 90];

function dateValue(value: string) {
  if (!value) return null;
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fmtTime(value: string) {
  const date = dateValue(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

function fmtDuration(ms: number) {
  const seconds = Math.round((ms || 0) / 1000);
  if (seconds < 60) return `${seconds} сек`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} мин ${rest} сек`;
}

function boolLabel(value: number | null) {
  if (value === null || value === undefined) return '—';
  return value ? 'да' : 'нет';
}

function valueOrDash(value: unknown) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

async function loadSummary(token: string, days: number, project: string) {
  const qs = new URLSearchParams({ days: String(days), project });
  const response = await fetch(`/api/summary?${qs}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (response.status === 401) throw new Error('Неверный пароль');
  if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
  return response.json() as Promise<Summary>;
}

async function runCleanup(token: string, mode: 'retention' | 'all') {
  const response = await fetch('/api/admin/cleanup', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(mode === 'all' ? { mode, confirm: 'DELETE_ALL_ANALYTICS' } : { mode }),
  });
  if (response.status === 401) throw new Error('Неверный пароль');
  const body = await response.json() as { ok?: boolean; deletedRows?: number; error?: string };
  if (!response.ok) throw new Error(body.error || `Ошибка очистки: ${response.status}`);
  return body;
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('vv_dashboard_token') || '');
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(7);
  const [project, setProject] = useState('all');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [campaignProject, setCampaignProject] = useState('');
  const [campaign, setCampaign] = useState('');

  const refresh = async (auth = token, nextDays = days, nextProject = project) => {
    if (!auth) return;
    setLoading(true); setError('');
    try {
      const result = await loadSummary(auth, nextDays, nextProject);
      setData(result);
      sessionStorage.setItem('vv_dashboard_token', auth);
      setToken(auth);
      if (!campaignProject && result.knownProjects[0]) setCampaignProject(result.knownProjects[0].url);
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить данные');
      if (String(e.message).includes('пароль')) {
        sessionStorage.removeItem('vv_dashboard_token');
        setToken(''); setData(null);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (token) void refresh(token, days, project); }, []);
  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, [token, days, project]);

  const login = (e: React.FormEvent) => { e.preventDefault(); if (password.trim()) void refresh(password.trim(), days, project); };
  const logout = () => { sessionStorage.removeItem('vv_dashboard_token'); setToken(''); setData(null); setPassword(''); };
  const changeDays = (value: number) => { setDays(value); if (token) void refresh(token, value, project); };
  const changeProject = (value: string) => { setProject(value); if (token) void refresh(token, days, value); };

  const cleanup = async (mode: 'retention' | 'all') => {
    if (mode === 'all' && !window.confirm('Удалить ВСЮ историю посещений без возможности восстановления?')) return;
    if (mode === 'all' && !window.confirm('Последнее подтверждение: действительно очистить всю analytics_events?')) return;
    setLoading(true); setError(''); setNotice('');
    try {
      const result = await runCleanup(token, mode);
      setNotice(`Очистка выполнена. Удалено событий: ${Number(result.deletedRows || 0).toLocaleString('ru-RU')}.`);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Не удалось очистить базу');
    } finally { setLoading(false); }
  };

  const maxDaily = useMemo(() => Math.max(1, ...(data?.daily ?? []).map((x) => Number(x.pageviews))), [data]);
  const maxSource = useMemo(() => Math.max(1, ...(data?.sources ?? []).map((x) => Number(x.pageviews))), [data]);
  const campaignUrl = useMemo(() => {
    if (!campaignProject || !campaign.trim()) return '';
    const url = new URL(campaignProject);
    url.searchParams.set('vv_campaign', campaign.trim());
    url.searchParams.set('utm_source', 'proposal');
    url.searchParams.set('utm_medium', 'outreach');
    url.searchParams.set('utm_campaign', campaign.trim());
    return url.toString();
  }, [campaignProject, campaign]);

  if (!token || !data) {
    return <main className="login-shell">
      <form className="login-card" onSubmit={login}>
        <div className="brand">VIIVERSION <span>ANALYTICS</span></div>
        <h1>Внутренний дашборд</h1>
        <p>Посещения прототипов, источники, IP, устройства и отклики после отправки коммерческих предложений.</p>
        <label><span>Пароль доступа</span><input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" /></label>
        <button disabled={loading}>{loading ? 'Проверяем…' : 'Войти'}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </main>;
  }

  return <div className="app-shell">
    <header className="topbar">
      <div><div className="brand">VIIVERSION <span>ANALYTICS</span></div><p>Время отчёта: {new Date(data.generatedAt).toLocaleTimeString('ru-RU')} · хранение {data.retentionDays} дней</p></div>
      <div className="top-actions"><button onClick={() => void refresh()} disabled={loading}>{loading ? 'Обновляем…' : 'Обновить'}</button><button className="ghost" onClick={logout}>Выйти</button></div>
    </header>

    <section className="filters">
      <div className="range-switch">{ranges.map((value) => <button key={value} className={days === value ? 'active' : ''} onClick={() => changeDays(value)}>{value === 1 ? 'Сегодня' : `${value} дней`}</button>)}</div>
      <select value={project} onChange={(e) => changeProject(e.target.value)}><option value="all">Все проекты</option>{Array.from(new Set(data.knownProjects.map((x) => x.name))).map((name) => <option key={name}>{name}</option>)}</select>
    </section>

    <section className="metrics six">
      <Metric label="Просмотры" value={data.metrics.pageviews.toLocaleString('ru-RU')} note={`за ${days} дн.`} />
      <Metric label="Посетители" value={data.metrics.visitors.toLocaleString('ru-RU')} note="уникальные браузеры" />
      <Metric label="Сессии" value={data.metrics.sessions.toLocaleString('ru-RU')} note="уникальные визиты" />
      <Metric label="IP-адреса" value={data.metrics.uniqueIps.toLocaleString('ru-RU')} note="уникальные IP" />
      <Metric label="Telegram" value={data.metrics.telegramUsers.toLocaleString('ru-RU')} note={`Mini App · ${data.metrics.telegramPageviews} открытий`} />
      <Metric label="Вовлечение" value={fmtDuration(data.metrics.avgSessionMs)} note="среднее на сессию" />
    </section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="ДИНАМИКА" title="Посещения по дням" /><div className="daily-chart">{data.daily.length ? data.daily.map((row) => <div className="day" key={row.day}><div className="bars"><i style={{ height: `${Math.max(4, (Number(row.pageviews) / maxDaily) * 100)}%` }} /></div><b>{row.pageviews}</b><span>{row.day.slice(5)}</span></div>) : <Empty />}</div></article>
      <article className="panel"><PanelTitle kicker="ИСТОЧНИКИ" title="Откуда пришли" /><div className="source-list">{data.sources.length ? data.sources.map((row) => <div key={row.source}><div><b>{row.source}</b><span>{row.visitors} посет.</span></div><em><i style={{ width: `${(Number(row.pageviews) / maxSource) * 100}%` }} /></em><strong>{row.pageviews}</strong></div>) : <Empty />}</div></article>
    </section>

    <section className="panel"><PanelTitle kicker="ПРОЕКТЫ" title="Какие прототипы открывают" /><div className="table-wrap"><table><thead><tr><th>Проект</th><th>Домен</th><th>Просмотры</th><th>Посетители</th><th>Сессии</th><th>IP</th><th>Последний визит</th></tr></thead><tbody>{data.projects.map((row) => <tr key={`${row.project}-${row.hostname}`}><td><b>{row.project}</b></td><td>{row.hostname}</td><td>{row.pageviews}</td><td>{row.visitors}</td><td>{row.sessions}</td><td>{row.unique_ips}</td><td>{fmtTime(row.last_visit)}</td></tr>)}</tbody></table>{!data.projects.length && <Empty />}</div></section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="ГЕОГРАФИЯ" title="Страны, регионы и города" /><div className="table-wrap compact"><table><thead><tr><th>Место</th><th>Просм.</th><th>Посет.</th><th>IP</th></tr></thead><tbody>{data.geography.map((row, i) => <tr key={`${row.country}-${row.region}-${row.city}-${i}`}><td><b>{[row.country, row.region, row.city].filter(Boolean).join(' · ') || 'Не определено'}</b></td><td>{row.pageviews}</td><td>{row.visitors}</td><td>{row.unique_ips}</td></tr>)}</tbody></table>{!data.geography.length && <Empty />}</div></article>
      <article className="panel"><PanelTitle kicker="СЕТЬ" title="ASN и Cloudflare PoP" /><div className="table-wrap compact"><table><thead><tr><th>Провайдер / ASN</th><th>PoP</th><th>Просм.</th><th>Посет.</th></tr></thead><tbody>{data.networks.map((row, i) => <tr key={`${row.asn}-${row.colo}-${i}`}><td><b>{row.as_organization || (row.asn ? `AS${row.asn}` : 'Не определено')}</b>{row.asn ? <small className="subcell">AS{row.asn}</small> : null}</td><td>{row.colo || '—'}</td><td>{row.pageviews}</td><td>{row.visitors}</td></tr>)}</tbody></table>{!data.networks.length && <Empty />}</div></article>
    </section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="КП / OUTREACH" title="Кампании" /><div className="campaign-list">{data.campaigns.length ? data.campaigns.map((row) => <div key={row.campaign}><div><b>{row.campaign}</b><span>последний: {fmtTime(row.last_visit)}</span></div><div><strong>{row.visitors}</strong><span>посет.</span></div><div><strong>{row.pageviews}</strong><span>просм.</span></div></div>) : <Empty text="Помеченные ссылки ещё не открывали" />}</div></article>
      <article className="panel"><PanelTitle kicker="ГЕНЕРАТОР" title="Ссылка для конкретного предложения" /><div className="link-generator"><label><span>Прототип</span><select value={campaignProject} onChange={(e) => setCampaignProject(e.target.value)}>{data.knownProjects.map((x) => <option key={x.hostname} value={x.url}>{x.name} · {x.hostname}</option>)}</select></label><label><span>Метка клиента / КП</span><input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="eco-voyage-sep09" /></label><div className="generated-link">{campaignUrl || 'Введите метку — ссылка появится здесь'}</div><button disabled={!campaignUrl} onClick={() => campaignUrl && navigator.clipboard.writeText(campaignUrl)}>Скопировать ссылку</button></div></article>
    </section>

    <section className="panel telegram-panel"><PanelTitle kicker="TELEGRAM MINI APP" title="Telegram-пользователи" />
      <div className="table-wrap"><table><thead><tr><th>Пользователь</th><th>Telegram</th><th>Статус</th><th>Открытия</th><th>Сессии</th><th>Проекты</th><th>Последний визит</th></tr></thead><tbody>{data.telegramUsers.map((row) => {
        const username = row.telegram_username ? row.telegram_username.replace(/^@/, '') : '';
        const displayName = [row.telegram_first_name, row.telegram_last_name].filter(Boolean).join(' ') || `Telegram #${row.telegram_user_id}`;
        return <tr key={row.telegram_user_id}>
          <td><div className="telegram-user">{row.telegram_photo_url ? <img className="telegram-avatar" src={row.telegram_photo_url} alt="" referrerPolicy="no-referrer" /> : <span className="telegram-avatar placeholder">TG</span>}<div><b>{displayName}</b><small className="subcell">ID {row.telegram_user_id} · {row.telegram_language_code || '—'}{row.telegram_is_premium ? ' · Premium' : ''}</small></div></div></td>
          <td>{username ? <a className="tg-link" href={`https://t.me/${username}`} target="_blank" rel="noreferrer">@{username}</a> : <span>username не задан</span>}{row.telegram_start_param ? <small className="subcell">start: {row.telegram_start_param}</small> : null}</td>
          <td><span className={`tg-badge ${row.telegram_verified ? 'verified' : 'unverified'}`}>{row.telegram_verified ? 'verified' : 'unverified'}</span></td>
          <td>{row.pageviews}</td><td>{row.sessions}</td><td>{row.projects}</td><td>{fmtTime(row.last_visit)}</td>
        </tr>;
      })}</tbody></table>{!data.telegramUsers.length && <Empty text="Telegram Mini App пользователи ещё не зафиксированы" />}</div>
    </section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="IP-АДРЕСА" title="Последние уникальные адреса" /><div className="table-wrap compact"><table><thead><tr><th>IP</th><th>Гео / сеть</th><th>Сессии</th><th>Последний</th></tr></thead><tbody>{data.ipStats.slice(0, 50).map((row) => <tr key={row.ip_address}><td><code>{row.ip_address}</code></td><td>{[row.country, row.region, row.city].filter(Boolean).join(' · ') || '—'}<small className="subcell">{row.as_organization || '—'}</small></td><td>{row.sessions}</td><td>{fmtTime(row.last_visit)}</td></tr>)}</tbody></table>{!data.ipStats.length && <Empty />}</div></article>
      <article className="panel"><PanelTitle kicker="СТРАНИЦЫ" title="Что смотрят внутри" /><div className="page-list">{data.pages.length ? data.pages.slice(0, 30).map((row) => <div key={`${row.project}-${row.path}`}><div><b>{row.project}</b><span>{row.path}</span></div><strong>{row.pageviews}</strong></div>) : <Empty />}</div></article>
    </section>

    <section className="panel"><PanelTitle kicker="ПОСЛЕДНИЕ ВИЗИТЫ" title="Максимально подробная живая лента" />
      <div className="visit-details-list">{data.recent.length ? data.recent.map((row, i) => <VisitDetails key={`${row.id}-${i}`} row={row} />) : <Empty />}</div>
    </section>

    <section className="panel maintenance-panel"><PanelTitle kicker="ХРАНЕНИЕ" title="D1 и очистка аналитики" />
      <div className="storage-grid">
        <Info label="Всего событий" value={data.storage.totalEvents.toLocaleString('ru-RU')} />
        <Info label="Всего сессий" value={data.storage.totalSessions.toLocaleString('ru-RU')} />
        <Info label="Всего посетителей" value={data.storage.totalVisitors.toLocaleString('ru-RU')} />
        <Info label="Самое старое событие" value={fmtTime(data.storage.oldestEvent)} />
        <Info label="Самое новое событие" value={fmtTime(data.storage.newestEvent)} />
        <Info label="Последняя очистка" value={data.storage.lastCleanup ? `${fmtTime(data.storage.lastCleanup.occurred_at)} · удалено ${data.storage.lastCleanup.deleted_rows}` : 'ещё не выполнялась'} />
      </div>
      <p className="retention-note">Автоматический cron ежедневно удаляет события старше {data.retentionDays} дней. Полная очистка выполняется только вручную и требует двойного подтверждения.</p>
      <div className="maintenance-actions"><button onClick={() => void cleanup('retention')} disabled={loading}>Удалить старше 30 дней</button><button className="danger" onClick={() => void cleanup('all')} disabled={loading}>Очистить всю историю</button></div>
      {notice && <div className="success">{notice}</div>}
    </section>

    {error && <div className="floating-error">{error}</div>}
  </div>;
}

function VisitDetails({ row }: { row: Visit }) {
  const geo = [row.country, row.region, row.city, row.postal_code].filter(Boolean).join(' · ') || '—';
  const coordinates = row.latitude !== null && row.longitude !== null ? `${row.latitude}, ${row.longitude}` : '—';
  const source = row.vv_campaign ? `КП: ${row.vv_campaign}` : row.utm_source || row.referrer_host || 'direct';
  return <details className="visit-detail">
    <summary>
      <div><b>{row.project}</b><span>{row.path}</span><small>{row.ip_address || 'IP —'} · {geo} · {source}</small></div>
      <div className="visit-summary-right"><strong>{row.device || '—'}</strong><time>{fmtTime(row.received_at)}</time></div>
    </summary>
    <div className="visit-body">
      {row.telegram_user_id ? <DetailGroup title="Telegram Mini App">
        <Info label="Telegram ID" value={row.telegram_user_id} mono />
        <Info label="Username" value={row.telegram_username ? `@${row.telegram_username} · https://t.me/${row.telegram_username}` : 'username не задан'} mono wide />
        <Info label="Имя" value={[row.telegram_first_name, row.telegram_last_name].filter(Boolean).join(' ')} />
        <Info label="Язык / Premium" value={`${valueOrDash(row.telegram_language_code)} / ${boolLabel(row.telegram_is_premium)}`} />
        <Info label="Start parameter" value={row.telegram_start_param} mono />
        <Info label="Telegram auth_date" value={row.telegram_auth_date ? new Date(row.telegram_auth_date * 1000).toISOString() : '—'} mono />
        <Info label="Attachment menu / write PM" value={`${boolLabel(row.telegram_added_to_attachment_menu)} / ${boolLabel(row.telegram_allows_write_to_pm)}`} />
        <Info label="Chat type / instance" value={`${valueOrDash(row.telegram_chat_type)} / ${valueOrDash(row.telegram_chat_instance)}`} mono />
        <Info label="Проверка Telegram" value={row.telegram_verified ? 'verified · Ed25519' : `unverified · ${row.telegram_verification || 'нет Bot ID'}`} />
        <Info label="Photo URL" value={row.telegram_photo_url} mono wide />
      </DetailGroup> : null}
      <DetailGroup title="Запрос / Cloudflare">
        <Info label="IP-адрес" value={row.ip_address} mono />
        <Info label="CF-Ray" value={row.cf_ray} mono />
        <Info label="Cloudflare PoP" value={row.colo} />
        <Info label="HTTP" value={row.http_protocol} />
        <Info label="TLS" value={[row.tls_version, row.tls_cipher].filter(Boolean).join(' · ')} />
        <Info label="TCP RTT" value={row.client_tcp_rtt === null ? '—' : `${row.client_tcp_rtt} ms`} />
        <Info label="Request Referer" value={row.request_referer} mono />
      </DetailGroup>

      <DetailGroup title="География и сеть">
        <Info label="Страна / регион / город" value={geo} />
        <Info label="Континент" value={row.continent} />
        <Info label="Координаты" value={coordinates} mono />
        <Info label="Timezone CF" value={row.cf_timezone} />
        <Info label="ASN" value={row.asn ? `AS${row.asn}` : '—'} />
        <Info label="Организация / ISP" value={row.as_organization} />
      </DetailGroup>

      <DetailGroup title="Браузер и устройство">
        <Info label="Raw User-Agent" value={row.user_agent} mono wide />
        <Info label="Sec-CH-UA" value={row.sec_ch_ua} mono wide />
        <Info label="CH platform / mobile" value={`${valueOrDash(row.sec_ch_ua_platform)} / ${valueOrDash(row.sec_ch_ua_mobile)}`} />
        <Info label="Platform / Vendor" value={`${valueOrDash(row.browser_platform)} / ${valueOrDash(row.browser_vendor)}`} />
        <Info label="UA Data" value={row.ua_data} mono wide />
        <Info label="Устройство" value={row.device} />
        <Info label="Экран / viewport" value={`${valueOrDash(row.screen)} / ${valueOrDash(row.viewport)}`} />
        <Info label="Ориентация" value={row.orientation} />
        <Info label="Pixel ratio / color depth" value={`${valueOrDash(row.pixel_ratio)} / ${valueOrDash(row.color_depth)}`} />
        <Info label="CPU threads / RAM hint" value={`${valueOrDash(row.hardware_concurrency)} / ${row.device_memory === null ? '—' : `${row.device_memory} GB`}`} />
        <Info label="Touch points" value={row.max_touch_points} />
        <Info label="Cookies / DNT / WebDriver" value={`${boolLabel(row.cookie_enabled)} / ${valueOrDash(row.do_not_track)} / ${boolLabel(row.webdriver)}`} />
      </DetailGroup>

      <DetailGroup title="Язык и соединение">
        <Info label="Язык" value={row.language} />
        <Info label="Accept-Language" value={row.accept_language} mono wide />
        <Info label="Все browser languages" value={row.browser_languages} mono />
        <Info label="Timezone browser" value={row.timezone} />
        <Info label="Тип соединения" value={row.connection_type} />
        <Info label="Effective type" value={row.effective_type} />
        <Info label="Downlink / RTT" value={`${row.downlink === null ? '—' : `${row.downlink} Mbps`} / ${row.rtt === null ? '—' : `${row.rtt} ms`}`} />
        <Info label="Save Data" value={boolLabel(row.save_data)} />
      </DetailGroup>

      <DetailGroup title="Страница и источник">
        <Info label="Page URL" value={row.page_url} mono wide />
        <Info label="Query" value={row.query_string} mono />
        <Info label="Hash" value={row.url_hash} mono />
        <Info label="Title" value={row.title} />
        <Info label="Raw Referrer" value={row.raw_referrer} mono wide />
        <Info label="Referrer host" value={row.referrer_host} />
        <Info label="UTM source / medium" value={`${valueOrDash(row.utm_source)} / ${valueOrDash(row.utm_medium)}`} />
        <Info label="UTM campaign / content" value={`${valueOrDash(row.utm_campaign)} / ${valueOrDash(row.utm_content)}`} />
        <Info label="VIIVERSION campaign" value={row.vv_campaign} />
      </DetailGroup>

      <DetailGroup title="Идентификаторы и время">
        <Info label="Visitor ID" value={row.visitor_id} mono />
        <Info label="Session ID" value={row.session_id} mono />
        <Info label="Event ID" value={row.id} mono />
        <Info label="Browser time" value={fmtTime(row.occurred_at)} />
        <Info label="Server received" value={fmtTime(row.received_at)} />
      </DetailGroup>
    </div>
  </details>;
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) { return <section className="detail-group"><h3>{title}</h3><div className="detail-grid">{children}</div></section>; }
function Info({ label, value, mono = false, wide = false }: { label: string; value: unknown; mono?: boolean; wide?: boolean }) { return <div className={`info ${wide ? 'wide' : ''}`}><span>{label}</span><b className={mono ? 'mono' : ''}>{valueOrDash(value)}</b></div>; }
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <article className="metric"><span>{label}</span><b>{value}</b><small>{note}</small></article>; }
function PanelTitle({ kicker, title }: { kicker: string; title: string }) { return <div className="panel-title"><span>{kicker}</span><h2>{title}</h2></div>; }
function Empty({ text = 'Данных пока нет' }: { text?: string }) { return <div className="empty">{text}</div>; }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
