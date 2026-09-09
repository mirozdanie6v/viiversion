import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Summary = {
  ok: boolean;
  generatedAt: string;
  days: number;
  project: string;
  metrics: { pageviews: number; visitors: number; sessions: number; avgSessionMs: number };
  projects: Array<{ project: string; hostname: string; pageviews: number; visitors: number; sessions: number; last_visit: string }>;
  daily: Array<{ day: string; pageviews: number; visitors: number }>;
  campaigns: Array<{ campaign: string; pageviews: number; visitors: number; sessions: number; last_visit: string }>;
  sources: Array<{ source: string; pageviews: number; visitors: number }>;
  pages: Array<{ project: string; path: string; pageviews: number; visitors: number }>;
  recent: Array<{ project: string; hostname: string; path: string; title: string; referrer_host: string; utm_source: string; utm_campaign: string; vv_campaign: string; device: string; visitor_id: string; session_id: string; received_at: string }>;
  knownProjects: Array<{ hostname: string; name: string; url: string }>;
};

const ranges = [1, 7, 30, 90];

function fmtTime(value: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(`${value.replace(' ', 'T')}Z`));
}

function fmtDuration(ms: number) {
  const seconds = Math.round((ms || 0) / 1000);
  if (seconds < 60) return `${seconds} сек`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} мин ${rest} сек`;
}

async function loadSummary(token: string, days: number, project: string) {
  const qs = new URLSearchParams({ days: String(days), project });
  const response = await fetch(`/api/summary?${qs}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (response.status === 401) throw new Error('Неверный пароль');
  if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
  return response.json() as Promise<Summary>;
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('vv_dashboard_token') || '');
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(7);
  const [project, setProject] = useState('all');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        <p>Посещения прототипов, источники и отклики после отправки коммерческих предложений.</p>
        <label><span>Пароль доступа</span><input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" /></label>
        <button disabled={loading}>{loading ? 'Проверяем…' : 'Войти'}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </main>;
  }

  return <div className="app-shell">
    <header className="topbar">
      <div><div className="brand">VIIVERSION <span>ANALYTICS</span></div><p>Время отчёта: {new Date(data.generatedAt).toLocaleTimeString('ru-RU')}</p></div>
      <div className="top-actions"><button onClick={() => void refresh()} disabled={loading}>{loading ? 'Обновляем…' : 'Обновить'}</button><button className="ghost" onClick={logout}>Выйти</button></div>
    </header>

    <section className="filters">
      <div className="range-switch">{ranges.map((value) => <button key={value} className={days === value ? 'active' : ''} onClick={() => changeDays(value)}>{value === 1 ? 'Сегодня' : `${value} дней`}</button>)}</div>
      <select value={project} onChange={(e) => changeProject(e.target.value)}><option value="all">Все проекты</option>{Array.from(new Set(data.projects.map((x) => x.project))).map((name) => <option key={name}>{name}</option>)}</select>
    </section>

    <section className="metrics">
      <Metric label="Просмотры" value={data.metrics.pageviews.toLocaleString('ru-RU')} note={`за ${days} дн.`} />
      <Metric label="Посетители" value={data.metrics.visitors.toLocaleString('ru-RU')} note="уникальные браузеры" />
      <Metric label="Сессии" value={data.metrics.sessions.toLocaleString('ru-RU')} note="уникальные визиты" />
      <Metric label="Вовлечение" value={fmtDuration(data.metrics.avgSessionMs)} note="среднее на сессию" />
    </section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="ДИНАМИКА" title="Посещения по дням" /><div className="daily-chart">{data.daily.length ? data.daily.map((row) => <div className="day" key={row.day}><div className="bars"><i style={{ height: `${Math.max(4, (Number(row.pageviews) / maxDaily) * 100)}%` }} /></div><b>{row.pageviews}</b><span>{row.day.slice(5)}</span></div>) : <Empty />}</div></article>
      <article className="panel"><PanelTitle kicker="ИСТОЧНИКИ" title="Откуда пришли" /><div className="source-list">{data.sources.length ? data.sources.map((row) => <div key={row.source}><div><b>{row.source}</b><span>{row.visitors} посет.</span></div><em><i style={{ width: `${(Number(row.pageviews) / maxSource) * 100}%` }} /></em><strong>{row.pageviews}</strong></div>) : <Empty />}</div></article>
    </section>

    <section className="panel"><PanelTitle kicker="ПРОЕКТЫ" title="Какие прототипы открывают" /><div className="table-wrap"><table><thead><tr><th>Проект</th><th>Домен</th><th>Просмотры</th><th>Посетители</th><th>Сессии</th><th>Последний визит</th></tr></thead><tbody>{data.projects.map((row) => <tr key={`${row.project}-${row.hostname}`}><td><b>{row.project}</b></td><td>{row.hostname}</td><td>{row.pageviews}</td><td>{row.visitors}</td><td>{row.sessions}</td><td>{fmtTime(row.last_visit)}</td></tr>)}</tbody></table>{!data.projects.length && <Empty />}</div></section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="КП / OUTREACH" title="Кампании" /><div className="campaign-list">{data.campaigns.length ? data.campaigns.map((row) => <div key={row.campaign}><div><b>{row.campaign}</b><span>последний: {fmtTime(row.last_visit)}</span></div><div><strong>{row.visitors}</strong><span>посет.</span></div><div><strong>{row.pageviews}</strong><span>просм.</span></div></div>) : <Empty text="Помеченные ссылки ещё не открывали" />}</div></article>
      <article className="panel"><PanelTitle kicker="ГЕНЕРАТОР" title="Ссылка для конкретного предложения" /><div className="link-generator"><label><span>Прототип</span><select value={campaignProject} onChange={(e) => setCampaignProject(e.target.value)}>{data.knownProjects.map((x) => <option key={x.hostname} value={x.url}>{x.name} · {x.hostname}</option>)}</select></label><label><span>Метка клиента / КП</span><input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="eco-voyage-sep09" /></label><div className="generated-link">{campaignUrl || 'Введите метку — ссылка появится здесь'}</div><button disabled={!campaignUrl} onClick={() => campaignUrl && navigator.clipboard.writeText(campaignUrl)}>Скопировать ссылку</button></div></article>
    </section>

    <section className="grid two">
      <article className="panel"><PanelTitle kicker="СТРАНИЦЫ" title="Что смотрят внутри" /><div className="page-list">{data.pages.length ? data.pages.slice(0, 20).map((row) => <div key={`${row.project}-${row.path}`}><div><b>{row.project}</b><span>{row.path}</span></div><strong>{row.pageviews}</strong></div>) : <Empty />}</div></article>
      <article className="panel"><PanelTitle kicker="ПОСЛЕДНИЕ ВИЗИТЫ" title="Живая лента" /><div className="visit-list">{data.recent.length ? data.recent.slice(0, 30).map((row, i) => <div key={`${row.session_id}-${row.received_at}-${i}`}><div><b>{row.project}</b><span>{row.path}</span><small>{row.vv_campaign ? `КП: ${row.vv_campaign}` : row.utm_source || row.referrer_host || 'direct'} · {row.device}</small></div><time>{fmtTime(row.received_at)}</time></div>) : <Empty />}</div></article>
    </section>

    {error && <div className="floating-error">{error}</div>}
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <article className="metric"><span>{label}</span><b>{value}</b><small>{note}</small></article>; }
function PanelTitle({ kicker, title }: { kicker: string; title: string }) { return <div className="panel-title"><span>{kicker}</span><h2>{title}</h2></div>; }
function Empty({ text = 'Данных пока нет' }: { text?: string }) { return <div className="empty">{text}</div>; }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
