(() => {
  if (window.__VIIVERSION_ANALYTICS__) return;
  window.__VIIVERSION_ANALYTICS__ = true;

  const script = document.currentScript;
  const endpoint = (script && script.dataset.endpoint) || 'https://dashboard.viiversion.com/api/collect';
  const project = (script && script.dataset.project) || document.documentElement.dataset.vvProject || location.hostname;

  const storageHandle = (name) => {
    try { return window[name]; } catch { return null; }
  };
  const persistentStorage = storageHandle('localStorage');
  const transientStorage = storageHandle('sessionStorage');

  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`);
  const getOrCreate = (store, key) => {
    try {
      if (!store) return uuid();
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

  const visitorId = getOrCreate(persistentStorage, 'vv_analytics_visitor');
  const sessionId = getOrCreate(transientStorage, 'vv_analytics_session');
  const firstParams = new URLSearchParams(location.search);
  const sensitiveKey = /(token|access[_-]?token|authorization|auth|password|passwd|pass|secret|session|jwt|code|initdata|tgwebappdata)/i;

  const sanitizeParams = (raw, prefix, max) => {
    const source = String(raw || '').replace(/^[?#]/, '').slice(0, max * 2);
    if (!source) return '';
    try {
      const params = new URLSearchParams(source);
      for (const key of Array.from(params.keys())) {
        if (sensitiveKey.test(key)) params.set(key, '[REDACTED]');
      }
      const result = params.toString();
      return result ? `${prefix}${result}`.slice(0, max) : '';
    } catch {
      return '';
    }
  };

  const safeQuery = () => sanitizeParams(location.search, '?', 2000);
  const safeHash = () => {
    const raw = String(location.hash || '');
    if (!raw) return '';
    const body = raw.replace(/^#/, '');
    if (body.startsWith('/') || !body.includes('=')) return raw.slice(0, 800);
    return sanitizeParams(raw, '#', 800);
  };
  const safePageUrl = () => `${location.origin}${location.pathname}${safeQuery()}${safeHash()}`.slice(0, 4000);

  const persist = (key, value) => {
    if (!value) return;
    try { transientStorage?.setItem(key, value); } catch {}
  };
  ['utm_source','utm_medium','utm_campaign','utm_content','vv_campaign'].forEach((key) => persist(`vv_${key}`, firstParams.get(key) || ''));

  const remembered = (key) => {
    try { return transientStorage?.getItem(`vv_${key}`) || ''; } catch { return ''; }
  };

  const safeReferrer = () => {
    try {
      if (!document.referrer) return { value: '', host: '', raw: '' };
      const url = new URL(document.referrer);
      return {
        value: `${url.origin}${url.pathname}`.slice(0, 500),
        host: url.hostname.slice(0, 160),
        raw: document.referrer.slice(0, 3000),
      };
    } catch {
      return { value: '', host: '', raw: String(document.referrer || '').slice(0, 3000) };
    }
  };

  const launchParam = (key) => {
    try {
      const search = new URLSearchParams(location.search);
      if (search.has(key)) return search.get(key) || '';
      const rawHash = String(location.hash || '').replace(/^#/, '');
      if (rawHash.includes('=')) return new URLSearchParams(rawHash).get(key) || '';
    } catch {}
    return '';
  };

  const telegramInfo = () => {
    let webApp;
    try { webApp = window.Telegram?.WebApp; } catch { webApp = undefined; }
    let unsafe = {};
    try { unsafe = webApp?.initDataUnsafe || {}; } catch {}
    const user = unsafe?.user || {};
    const platform = String(webApp?.platform || launchParam('tgWebAppPlatform') || '').slice(0, 80);
    const version = String(webApp?.version || launchParam('tgWebAppVersion') || '').slice(0, 40);
    const startParam = String(unsafe?.start_param || launchParam('tgWebAppStartParam') || firstParams.get('startapp') || '').slice(0, 160);
    const launchData = launchParam('tgWebAppData');
    const launchPlatform = launchParam('tgWebAppPlatform');
    const launchVersion = launchParam('tgWebAppVersion');
    const sdkPlatformIsReal = Boolean(platform && platform !== 'unknown');
    const detected = Boolean(webApp?.initData || launchData || (sdkPlatformIsReal && (launchPlatform || launchVersion)));
    return {
      detected,
      platform,
      version,
      startParam,
      colorScheme: String(webApp?.colorScheme || '').slice(0, 20),
      user: detected ? {
        id: user?.id ? String(user.id).slice(0, 32) : '',
        username: String(user?.username || '').slice(0, 64),
        languageCode: String(user?.language_code || '').slice(0, 24),
        isPremium: typeof user?.is_premium === 'boolean' ? user.is_premium : null,
      } : null,
    };
  };

  const device = () => {
    const width = Math.max(screen.width || 0, innerWidth || 0);
    if (width <= 767) return 'mobile';
    if (width <= 1180) return 'tablet';
    return 'desktop';
  };

  const connectionInfo = () => {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    return {
      connectionType: String(c.type || '').slice(0, 32),
      effectiveType: String(c.effectiveType || '').slice(0, 32),
      downlink: Number.isFinite(Number(c.downlink)) ? Number(c.downlink) : null,
      rtt: Number.isFinite(Number(c.rtt)) ? Number(c.rtt) : null,
      saveData: typeof c.saveData === 'boolean' ? c.saveData : null,
    };
  };

  const uaData = (telegram) => {
    try {
      const value = navigator.userAgentData;
      const browser = value ? {
        brands: Array.isArray(value.brands) ? value.brands.slice(0, 8) : [],
        mobile: Boolean(value.mobile),
        platform: String(value.platform || '').slice(0, 80),
      } : null;
      if (!browser && !telegram.detected) return '';
      return JSON.stringify({ browser, telegram: telegram.detected ? telegram : null }).slice(0, 1200);
    } catch {
      return '';
    }
  };

  const orientation = () => {
    try {
      if (screen.orientation) return `${screen.orientation.type || ''}:${screen.orientation.angle ?? ''}`.slice(0, 80);
    } catch {}
    return `${innerWidth >= innerHeight ? 'landscape' : 'portrait'}`;
  };

  let pageStartedAt = Date.now();
  let lastPath = `${location.pathname}${location.search}${location.hash}`;

  const payload = (eventType, durationMs = 0) => {
    const ref = safeReferrer();
    const network = connectionInfo();
    const telegram = telegramInfo();
    const platform = String(navigator.platform || '').slice(0, 80);
    const telegramPlatform = telegram.detected ? `Telegram ${telegram.platform || 'unknown'}${telegram.version ? ` ${telegram.version}` : ''}` : '';
    return {
      eventType,
      project: String(project).slice(0, 80),
      hostname: location.hostname,
      path: location.pathname.slice(0, 500),
      pageUrl: safePageUrl(),
      queryString: safeQuery(),
      urlHash: safeHash(),
      title: document.title.slice(0, 200),
      visitorId,
      sessionId,
      referrer: ref.value,
      referrerHost: ref.host,
      rawReferrer: ref.raw,
      utmSource: remembered('utm_source') || (telegram.detected ? 'telegram' : ''),
      utmMedium: remembered('utm_medium') || (telegram.detected ? 'miniapp' : ''),
      utmCampaign: remembered('utm_campaign'),
      utmContent: remembered('utm_content'),
      vvCampaign: remembered('vv_campaign'),
      device: device(),
      language: (navigator.language || '').slice(0, 32),
      browserLanguages: (() => { try { return JSON.stringify((navigator.languages || []).slice(0, 12)).slice(0, 500); } catch { return ''; } })(),
      timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })(),
      screen: `${screen.width || 0}x${screen.height || 0}`,
      viewport: `${innerWidth || 0}x${innerHeight || 0}`,
      orientation: orientation(),
      browserPlatform: [platform, telegramPlatform].filter(Boolean).join(' · ').slice(0, 120),
      browserVendor: String(navigator.vendor || '').slice(0, 120),
      clientUserAgent: String(navigator.userAgent || '').slice(0, 2000),
      cookieEnabled: typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null,
      doNotTrack: String(navigator.doNotTrack || window.doNotTrack || '').slice(0, 20),
      hardwareConcurrency: Number.isFinite(Number(navigator.hardwareConcurrency)) ? Number(navigator.hardwareConcurrency) : null,
      deviceMemory: Number.isFinite(Number(navigator.deviceMemory)) ? Number(navigator.deviceMemory) : null,
      maxTouchPoints: Number.isFinite(Number(navigator.maxTouchPoints)) ? Number(navigator.maxTouchPoints) : null,
      colorDepth: Number.isFinite(Number(screen.colorDepth)) ? Number(screen.colorDepth) : null,
      pixelRatio: Number.isFinite(Number(devicePixelRatio)) ? Number(devicePixelRatio) : null,
      webdriver: typeof navigator.webdriver === 'boolean' ? navigator.webdriver : null,
      uaData: uaData(telegram),
      ...network,
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
        mode: 'no-cors',
        credentials: 'omit',
        keepalive: true,
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body,
      }).catch(() => {});
    } catch {}
  };

  const pageview = () => {
    const path = `${location.pathname}${location.search}${location.hash}`;
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
  addEventListener('hashchange', () => queueMicrotask(pageview));
  addEventListener('pagehide', () => send(payload('engagement', Date.now() - pageStartedAt)));
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && Date.now() - pageStartedAt > 30000) {
      send(payload('engagement', Date.now() - pageStartedAt));
      pageStartedAt = Date.now();
    }
  });
})();
