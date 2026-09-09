(() => {
  if (window.__VIIVERSION_ANALYTICS__) return;
  window.__VIIVERSION_ANALYTICS__ = true;

  const script = document.currentScript;
  const endpoint = (script && script.dataset.endpoint) || 'https://dashboard.viiversion.com/api/collect';
  const project = (script && script.dataset.project) || document.documentElement.dataset.vvProject || location.hostname;
  const storage = window.localStorage;
  const sessionStorage = window.sessionStorage;

  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);
  const getOrCreate = (store, key) => {
    try {
      let value = store.getItem(key);
      if (!value) {
        value = uuid();
        store.setItem(key, value);
      }
      return value;
    } catch {
      return uuid();
    }
  };

  const visitorId = getOrCreate(storage, 'vv_analytics_visitor');
  const sessionId = getOrCreate(sessionStorage, 'vv_analytics_session');
  const firstParams = new URLSearchParams(location.search);

  const persist = (key, value) => {
    if (!value) return;
    try { sessionStorage.setItem(key, value); } catch {}
  };
  ['utm_source','utm_medium','utm_campaign','utm_content','vv_campaign'].forEach((key) => persist(`vv_${key}`, firstParams.get(key) || ''));

  const remembered = (key) => {
    try { return sessionStorage.getItem(`vv_${key}`) || ''; } catch { return ''; }
  };

  const safeReferrer = () => {
    try {
      if (!document.referrer) return { value: '', host: '' };
      const url = new URL(document.referrer);
      return { value: `${url.origin}${url.pathname}`.slice(0, 500), host: url.hostname.slice(0, 160) };
    } catch {
      return { value: '', host: '' };
    }
  };

  const device = () => {
    const width = Math.max(screen.width || 0, innerWidth || 0);
    if (width <= 767) return 'mobile';
    if (width <= 1180) return 'tablet';
    return 'desktop';
  };

  let pageStartedAt = Date.now();
  let lastPath = `${location.pathname}`;

  const payload = (eventType, durationMs = 0) => {
    const ref = safeReferrer();
    return {
      eventType,
      project: String(project).slice(0, 80),
      hostname: location.hostname,
      path: location.pathname.slice(0, 500),
      title: document.title.slice(0, 200),
      visitorId,
      sessionId,
      referrer: ref.value,
      referrerHost: ref.host,
      utmSource: remembered('utm_source'),
      utmMedium: remembered('utm_medium'),
      utmCampaign: remembered('utm_campaign'),
      utmContent: remembered('utm_content'),
      vvCampaign: remembered('vv_campaign'),
      device: device(),
      language: (navigator.language || '').slice(0, 32),
      timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })(),
      screen: `${screen.width || 0}x${screen.height || 0}`,
      durationMs: Math.max(0, Math.min(3600000, Math.round(durationMs))),
      occurredAt: new Date().toISOString(),
    };
  };

  const send = (data) => {
    const body = JSON.stringify(data);
    if (navigator.sendBeacon && data.eventType === 'engagement') {
      try {
        const ok = navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        if (ok) return;
      } catch {}
    }
    try {
      fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body,
      }).catch(() => {});
    } catch {}
  };

  const pageview = () => {
    const path = `${location.pathname}`;
    if (path === lastPath && Date.now() - pageStartedAt < 250) return;
    if (pageStartedAt) send(payload('engagement', Date.now() - pageStartedAt));
    lastPath = path;
    pageStartedAt = Date.now();
    send(payload('pageview'));
  };

  send(payload('pageview'));

  const wrapHistory = (name) => {
    const original = history[name];
    history[name] = function (...args) {
      const result = original.apply(this, args);
      queueMicrotask(pageview);
      return result;
    };
  };
  wrapHistory('pushState');
  wrapHistory('replaceState');
  addEventListener('popstate', () => queueMicrotask(pageview));
  addEventListener('pagehide', () => send(payload('engagement', Date.now() - pageStartedAt)));
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && Date.now() - pageStartedAt > 30000) {
      send(payload('engagement', Date.now() - pageStartedAt));
      pageStartedAt = Date.now();
    }
  });
})();
