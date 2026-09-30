import { acquire, connect } from '@cloudflare/playwright';
import type { Env } from './bokun';
import {
  clearWhatsAppBrowserAuthState,
  clearWhatsAppBrowserRuntime,
  getWhatsAppBrowserAuthState,
  getWhatsAppBrowserRuntime,
  getWhatsAppBrowserSendResult,
  saveWhatsAppBrowserAuthState,
  saveWhatsAppBrowserRuntime,
  saveWhatsAppBrowserSendResult,
} from './store';

const WA_URL = 'https://web.whatsapp.com/';
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

type BrowserClient = {
  id?: string;
  name?: string;
  phone?: string;
  aliases?: string[];
  [key: string]: unknown;
};

type LiveMessage = {
  direction: 'inbound' | 'outbound' | 'unknown';
  meta: string;
  text: string;
  time?: string;
  date?: string;
  sender?: string;
};

function required(value: string | undefined, name: string) {
  const clean = value?.trim();
  if (!clean) throw new Response('Missing ' + name, { status: 503 });
  return clean;
}

function assertAdmin(request: Request, env: Env) {
  const expected = required(env.INTEGRATION_ADMIN_TOKEN, 'INTEGRATION_ADMIN_TOKEN');
  const authorization = request.headers.get('authorization') ?? '';
  const gatewayKey = request.headers.get('x-viiversion-integration-key') ?? '';
  if (authorization !== 'Bearer ' + expected && gatewayKey !== expected) {
    throw new Response('Unauthorized', { status: 401 });
  }
}

function assertBrowserBindings(env: Env) {
  if (!env.BROWSER) throw new Response('Cloudflare Browser Run binding is not configured', { status: 503 });
}

function setupAuthorized(request: Request, env: Env) {
  const url = new URL(request.url);
  const supplied = url.searchParams.get('token')?.trim() ?? '';
  const expected = env.WHATSAPP_BROWSER_SETUP_TOKEN?.trim() ?? '';
  const expiresAt = Number(env.WHATSAPP_BROWSER_SETUP_EXPIRES_AT ?? '0');
  return Boolean(
    supplied &&
    expected &&
    supplied === expected &&
    Number.isFinite(expiresAt) &&
    Math.floor(Date.now() / 1000) <= expiresAt
  );
}

function onlyDigits(value: string | undefined) {
  return (value ?? '').replace(/[^0-9]/g, '');
}

export function normalizeBrowserRecipient(value: string) {
  const digits = onlyDigits(value);
  if (!/^\d{7,15}$/.test(digits)) throw new Response('Invalid WhatsApp recipient', { status: 400 });
  return digits;
}

function normalizeName(value: string | undefined) {
  return (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function matchBrowserClient(title: string, clients: BrowserClient[]) {
  const normalizedTitle = normalizeName(title);
  const titleDigits = onlyDigits(title);

  for (const client of clients) {
    const names = [client.name, ...(Array.isArray(client.aliases) ? client.aliases : [])]
      .map(value => normalizeName(typeof value === 'string' ? value : ''))
      .filter(Boolean);
    const phone = onlyDigits(typeof client.phone === 'string' ? client.phone : '');

    const nameMatch = names.some(name =>
      normalizedTitle === name ||
      (normalizedTitle.length >= 4 && name.length >= 4 && (normalizedTitle.includes(name) || name.includes(normalizedTitle)))
    );
    const phoneMatch = Boolean(phone && titleDigits && (
      phone === titleDigits ||
      phone.endsWith(titleDigits.slice(-8)) ||
      titleDigits.endsWith(phone.slice(-8))
    ));

    if (nameMatch || phoneMatch) return client;
  }
  return null;
}

export function parseWhatsAppPrePlainText(meta: string) {
  const match = meta.match(/^\[(\d{1,2}):(\d{2})(?:\s*([AP]M))?,\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]\s*(.*?):\s*$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = (match[3] ?? '').toUpperCase();
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const day = String(Number(match[4])).padStart(2, '0');
  const month = String(Number(match[5])).padStart(2, '0');
  let year = Number(match[6]);
  if (year < 100) year += 2000;

  return {
    time: String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0'),
    date: day + '/' + month + '/' + year,
    sender: match[7].trim(),
  };
}

function todayToken(timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? '';
  return part('day') + '/' + part('month') + '/' + part('year');
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function disconnect(browser: any) {
  try {
    await browser.close();
  } catch {
    // The remote session may already be gone.
  }
}

async function closeRemoteSession(env: Env, sessionId: string) {
  try {
    const binding = env.BROWSER as any;
    if (typeof binding?.closeSession === 'function') await binding.closeSession(sessionId);
  } catch {
    // Browser Run will reap an idle session even when explicit close is unavailable.
  }
}

async function acquireRemoteBrowser(env: Env) {
  assertBrowserBindings(env);
  const result = await acquire(env.BROWSER as any);
  const sessionId = result.sessionId;
  const browser = await connect(env.BROWSER as any, sessionId);
  return { sessionId, browser };
}

async function connectRuntimeBrowser(env: Env) {
  assertBrowserBindings(env);
  const runtime = await getWhatsAppBrowserRuntime(env);
  if (!runtime?.sessionId) return null;
  try {
    const browser = await connect(env.BROWSER as any, runtime.sessionId);
    return { sessionId: runtime.sessionId, browser };
  } catch {
    await clearWhatsAppBrowserRuntime(env);
    return null;
  }
}

async function isLoggedIn(page: any) {
  return (await page.locator('#pane-side').count()) > 0;
}

async function waitForLoggedIn(page: any, timeout = 30000) {
  try {
    await page.locator('#pane-side').waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function persistContext(env: Env, context: any) {
  const state = await context.storageState({ indexedDB: true });
  await saveWhatsAppBrowserAuthState(env, {
    storageState: JSON.stringify(state),
    updatedAt: new Date().toISOString(),
  });
}

async function contextFromStoredState(env: Env, browser: any) {
  const stored = await getWhatsAppBrowserAuthState(env);
  if (!stored?.storageState) {
    throw new Response(JSON.stringify({
      error: { code: 'WHATSAPP_NOT_PAIRED', message: 'WhatsApp Web has not been paired yet' },
    }), {
      status: 409,
      headers: { 'content-type': 'application/json' },
    });
  }

  let storageState: unknown;
  try {
    storageState = JSON.parse(stored.storageState);
  } catch {
    throw new Response('Stored WhatsApp browser state is invalid', { status: 503 });
  }

  return browser.newContext({
    storageState,
    locale: 'en-GB',
    timezoneId: DEFAULT_TIME_ZONE,
    viewport: { width: 1365, height: 900 },
  });
}

async function withLivePage<T>(
  env: Env,
  operation: (page: any, context: any) => Promise<T>,
): Promise<T> {
  const { sessionId, browser } = await acquireRemoteBrowser(env);
  let context: any = null;

  try {
    context = await contextFromStoredState(env, browser);
    const page = await context.newPage();
    await page.goto(WA_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const ready = await waitForLoggedIn(page, 30000);
    if (!ready) {
      throw new Response(JSON.stringify({
        error: {
          code: 'WHATSAPP_REAUTH_REQUIRED',
          message: 'WhatsApp Web session is no longer authenticated; pair it again',
        },
      }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    const result = await operation(page, context);
    await persistContext(env, context);
    return result;
  } finally {
    if (context) {
      try {
        await context.close();
      } catch {
        // no-op
      }
    }
    await disconnect(browser);
    await closeRemoteSession(env, sessionId);
  }
}

async function pairPage(env: Env) {
  let live = await connectRuntimeBrowser(env);
  if (!live) {
    live = await acquireRemoteBrowser(env);
    await saveWhatsAppBrowserRuntime(env, {
      sessionId: live.sessionId,
      phase: 'pairing',
      updatedAt: new Date().toISOString(),
    });
  }

  const browser = live.browser;
  try {
    let contexts = browser.contexts();
    let context = contexts[0];
    if (!context) {
      context = await browser.newContext({
        locale: 'en-GB',
        timezoneId: DEFAULT_TIME_ZONE,
        viewport: { width: 1365, height: 900 },
      });
    }
    let pages = context.pages();
    let page = pages[0];
    if (!page) page = await context.newPage();
    if (!page.url().startsWith(WA_URL)) {
      await page.goto(WA_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    }
    await page.waitForTimeout(1500);
    return { sessionId: live.sessionId, browser, context, page };
  } catch (error) {
    await disconnect(browser);
    throw error;
  }
}

export function whatsappBrowserSetupPage(request: Request, env: Env) {
  if (!setupAuthorized(request, env)) return new Response('Setup link is invalid or expired', { status: 401 });
  const token = new URL(request.url).searchParams.get('token') ?? '';

  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VIIVERSION WhatsApp Browser Setup</title>
  <style>
    :root { color-scheme: dark; font-family: Inter,system-ui,sans-serif; }
    body { margin:0; background:#060a13; color:#eef4ff; }
    main { width:min(860px,calc(100% - 28px)); margin:0 auto; padding:48px 0 72px; }
    .brand { font-weight:800; letter-spacing:.08em; color:#73d6ff; font-size:13px; }
    h1 { font-size:clamp(30px,6vw,52px); margin:12px 0 10px; line-height:1.02; }
    p { color:#b8c6df; line-height:1.6; }
    .card { margin-top:28px; background:#0d1626; border:1px solid #243650; border-radius:18px; padding:20px; }
    img { display:block; width:100%; max-width:760px; margin:16px auto 0; border-radius:12px; background:white; }
    .status { font-weight:700; }
    .ok { color:#70e6a5; }
    .err { color:#ff8b8b; }
  </style>
</head>
<body>
<main>
  <div class="brand">VIIVERSION</div>
  <h1>Connect WhatsApp Web</h1>
  <p>Open WhatsApp on your phone → Linked devices → Link a device, then scan the QR code shown below. This is the only pairing step.</p>
  <div class="card">
    <div id="status" class="status">Starting secure browser session…</div>
    <img id="shot" alt="WhatsApp Web pairing screen" hidden>
  </div>
</main>
<script>
  const token = ${JSON.stringify(token)};
  history.replaceState(null, '', '/whatsapp/browser/connect');
  const status = document.getElementById('status');
  const shot = document.getElementById('shot');

  async function poll() {
    try {
      const res = await fetch('/whatsapp/browser/connect/state?token=' + encodeURIComponent(token), { cache:'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Setup failed');
      if (data.paired) {
        status.textContent = 'Connected. WhatsApp Web is ready for VIIVERSION.';
        status.className = 'status ok';
        shot.hidden = true;
        return;
      }
      status.textContent = 'Scan the QR code with WhatsApp.';
      if (data.screenshotDataUrl) {
        shot.src = data.screenshotDataUrl;
        shot.hidden = false;
      }
      setTimeout(poll, 2200);
    } catch (error) {
      status.textContent = error.message || String(error);
      status.className = 'status err';
      setTimeout(poll, 4000);
    }
  }

  fetch('/whatsapp/browser/connect/start?token=' + encodeURIComponent(token), { method:'POST' })
    .then(() => poll())
    .catch(error => {
      status.textContent = error.message || String(error);
      status.className = 'status err';
    });
</script>
</body>
</html>`;

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'DENY',
    },
  });
}

export async function whatsappBrowserPairStart(request: Request, env: Env) {
  if (!setupAuthorized(request, env)) throw new Response('Setup link is invalid or expired', { status: 401 });
  assertBrowserBindings(env);

  const existing = await getWhatsAppBrowserAuthState(env);
  if (existing?.storageState) return { ok: true, paired: true, alreadyConnected: true };

  const live = await pairPage(env);
  const paired = await isLoggedIn(live.page);
  if (paired) {
    await persistContext(env, live.context);
    await saveWhatsAppBrowserRuntime(env, {
      sessionId: live.sessionId,
      phase: 'ready',
      updatedAt: new Date().toISOString(),
    });
  }
  await disconnect(live.browser);
  return { ok: true, paired, sessionId: live.sessionId };
}

export async function whatsappBrowserPairReset(request: Request, env: Env) {
  if (!setupAuthorized(request, env)) throw new Response('Setup link is invalid or expired', { status: 401 });
  const runtime = await getWhatsAppBrowserRuntime(env);
  if (runtime?.sessionId) await closeRemoteSession(env, runtime.sessionId);
  await clearWhatsAppBrowserRuntime(env);
  await clearWhatsAppBrowserAuthState(env);
  return { ok: true, reset: true };
}

export async function whatsappBrowserPairState(request: Request, env: Env) {
  if (!setupAuthorized(request, env)) throw new Response('Setup link is invalid or expired', { status: 401 });
  assertBrowserBindings(env);

  const stored = await getWhatsAppBrowserAuthState(env);
  if (stored?.storageState) {
    return { ok: true, paired: true, updatedAt: stored.updatedAt };
  }

  const live = await pairPage(env);
  try {
    if (await isLoggedIn(live.page)) {
      await persistContext(env, live.context);
      await saveWhatsAppBrowserRuntime(env, {
        sessionId: live.sessionId,
        phase: 'ready',
        updatedAt: new Date().toISOString(),
      });
      await closeRemoteSession(env, live.sessionId);
      await clearWhatsAppBrowserRuntime(env);
      return { ok: true, paired: true, updatedAt: new Date().toISOString() };
    }

    const screenshot = await live.page.screenshot({ type: 'png', fullPage: true });
    return {
      ok: true,
      paired: false,
      screenshotDataUrl: 'data:image/png;base64,' + bytesToBase64(new Uint8Array(screenshot)),
    };
  } finally {
    await disconnect(live.browser);
  }
}

async function chatRows(page: any, limit = 50) {
  const selectors = ['#pane-side [role="row"]', '#pane-side [role="listitem"]'];
  let locator: any = null;
  for (const selector of selectors) {
    const candidate = page.locator(selector);
    if (await candidate.count()) {
      locator = candidate;
      break;
    }
  }
  if (!locator) return [];

  const values = await locator.evaluateAll((nodes: Element[], max: number) => nodes.slice(0, max).map(node => {
    const root = node as HTMLElement;
    const lines = (root.innerText || '').split('\n').map(value => value.trim()).filter(Boolean);
    const titled = Array.from(root.querySelectorAll('span[title]')) as HTMLElement[];
    const title = titled.map(value => value.getAttribute('title') || value.innerText || '').find(Boolean) || lines[0] || '';
    const timeText = lines.find(value => /^\d{1,2}:\d{2}(?:\s?[AP]M)?$/i.test(value)) || '';
    const preview = lines.filter(value => value !== title && value !== timeText).slice(-1)[0] || '';
    const outgoingPreview = Boolean(root.querySelector('[data-icon="msg-check"],[data-icon="msg-dblcheck"],[data-icon="msg-time"]'));
    return { title, timeText, preview, outgoingPreview };
  }), Math.min(Math.max(limit, 1), 100));

  const seen = new Set<string>();
  return values.filter((value: any) => {
    const key = value.title + '|' + value.timeText;
    if (!value.title || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function openChatByPeer(page: any, peer: string) {
  const digits = onlyDigits(peer);
  if (/^\d{7,15}$/.test(digits)) {
    await page.goto(WA_URL + 'send?phone=' + encodeURIComponent(digits), {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    try {
      await page.locator('#main').waitFor({ state: 'visible', timeout: 20000 });
      return;
    } catch {
      const text = await page.locator('body').innerText().catch(() => '');
      if (/invalid|not on whatsapp|phone number/i.test(text)) {
        throw new Response('WhatsApp recipient is invalid or unavailable', { status: 400 });
      }
      throw new Response('Unable to open WhatsApp chat', { status: 502 });
    }
  }

  const direct = page.locator('#pane-side span[title]').filter({ hasText: peer }).first();
  if (await direct.count()) {
    await direct.click();
    await page.locator('#main').waitFor({ state: 'visible', timeout: 15000 });
    return;
  }

  const search = page.locator('#side [contenteditable="true"][role="textbox"]').first();
  if (!(await search.count())) throw new Response('WhatsApp chat search is unavailable', { status: 502 });
  await search.click();
  await search.fill(peer);
  await page.waitForTimeout(900);

  const result = page.locator('#pane-side span[title]').filter({ hasText: peer }).first();
  if (!(await result.count())) {
    await search.fill('');
    throw new Response('WhatsApp chat not found', { status: 404 });
  }
  await result.click();
  await page.locator('#main').waitFor({ state: 'visible', timeout: 15000 });
}

async function extractMessages(page: any, limit = 100): Promise<LiveMessage[]> {
  const nodes = page.locator('#main [data-pre-plain-text]');
  const count = await nodes.count();
  if (!count) return [];

  const raw = await nodes.evaluateAll((items: Element[], max: number) => {
    const selected = items.slice(Math.max(0, items.length - max));
    return selected.map(node => {
      let parent: Element | null = node;
      let direction = 'unknown';
      for (let i = 0; i < 8 && parent; i += 1, parent = parent.parentElement) {
        const className = String((parent as HTMLElement).className || '');
        if (className.includes('message-in')) {
          direction = 'inbound';
          break;
        }
        if (className.includes('message-out')) {
          direction = 'outbound';
          break;
        }
      }
      return {
        direction,
        meta: node.getAttribute('data-pre-plain-text') || '',
        text: ((node as HTMLElement).innerText || '').trim(),
      };
    });
  }, Math.min(Math.max(limit, 1), 300));

  return raw.map((value: any) => {
    const parsed = parseWhatsAppPrePlainText(value.meta);
    return {
      direction: value.direction,
      meta: value.meta,
      text: value.text,
      time: parsed?.time,
      date: parsed?.date,
      sender: parsed?.sender,
    } satisfies LiveMessage;
  });
}

async function currentChatTitle(page: any) {
  const headers = [
    '#main header span[title]',
    '#main header [dir="auto"]',
  ];
  for (const selector of headers) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      const title = (await locator.getAttribute('title').catch(() => null)) || (await locator.innerText().catch(() => ''));
      if (title?.trim()) return title.trim();
    }
  }
  return '';
}

async function liveToday(page: any, maxChats = 20) {
  const date = todayToken(DEFAULT_TIME_ZONE);
  const rows = (await chatRows(page, 100))
    .filter((row: any) => /^\d{1,2}:\d{2}(?:\s?[AP]M)?$/i.test(row.timeText))
    .slice(0, Math.min(Math.max(maxChats, 1), 40));

  const chats: Array<{
    title: string;
    lastActivity: string;
    preview: string;
    inboundMessages: LiveMessage[];
  }> = [];

  for (const row of rows) {
    try {
      await openChatByPeer(page, row.title);
      await page.waitForTimeout(250);
      const messages = await extractMessages(page, 220);
      const inboundMessages = messages.filter(message => message.direction === 'inbound' && message.date === date);
      if (inboundMessages.length) {
        chats.push({
          title: row.title,
          lastActivity: row.timeText,
          preview: row.preview,
          inboundMessages,
        });
      }
    } catch {
      // A single unusual/system chat must not break the whole "who wrote today" request.
    }
  }

  return {
    date,
    timeZone: DEFAULT_TIME_ZONE,
    chats,
    count: chats.length,
  };
}

export async function whatsappBrowserStatus(request: Request, env: Env) {
  assertAdmin(request, env);
  assertBrowserBindings(env);
  const stored = await getWhatsAppBrowserAuthState(env);
  if (!stored?.storageState) {
    return { ok: true, mode: 'browser', paired: false, live: false, setupRequired: true };
  }

  try {
    const result = await withLivePage(env, async () => ({ live: true }));
    return {
      ok: true,
      mode: 'browser',
      paired: true,
      live: result.live,
      setupRequired: false,
      authUpdatedAt: stored.updatedAt,
    };
  } catch (error) {
    if (error instanceof Response && error.status === 409) {
      return {
        ok: true,
        mode: 'browser',
        paired: true,
        live: false,
        setupRequired: true,
        reauthRequired: true,
        authUpdatedAt: stored.updatedAt,
      };
    }
    throw error;
  }
}

export async function whatsappBrowserChats(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '50') || 50, 1), 100);
  return withLivePage(env, async page => {
    const chats = await chatRows(page, limit);
    return {
      chats,
      count: chats.length,
      source: 'whatsapp_web_live',
    };
  });
}

export async function whatsappBrowserChat(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const peer = (url.searchParams.get('peer') ?? '').trim();
  if (!peer) throw new Response('peer is required', { status: 400 });
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '100') || 100, 1), 300);

  return withLivePage(env, async page => {
    await openChatByPeer(page, peer);
    return {
      peer,
      title: await currentChatTitle(page),
      messages: await extractMessages(page, limit),
      source: 'whatsapp_web_live',
    };
  });
}

export async function whatsappBrowserToday(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const maxChats = Math.min(Math.max(Number(url.searchParams.get('maxChats') ?? '20') || 20, 1), 40);
  return withLivePage(env, page => liveToday(page, maxChats));
}

export async function whatsappBrowserTodayFromClients(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{ clients?: BrowserClient[]; maxChats?: number }>().catch(() => null);
  if (!input || !Array.isArray(input.clients)) throw new Response('clients array is required', { status: 400 });
  const clients = input.clients.slice(0, 500);
  const maxChats = Math.min(Math.max(Number(input.maxChats ?? 30) || 30, 1), 40);

  return withLivePage(env, async page => {
    const today = await liveToday(page, maxChats);
    const matches = today.chats
      .map(chat => ({ client: matchBrowserClient(chat.title, clients), chat }))
      .filter(value => Boolean(value.client));
    return {
      date: today.date,
      timeZone: today.timeZone,
      matches,
      count: matches.length,
      checkedClients: clients.length,
      source: 'whatsapp_web_live',
    };
  });
}

async function sendWithPage(page: any, to: string, text: string) {
  const recipient = normalizeBrowserRecipient(to);
  const cleanText = text.trim();
  if (!cleanText) throw new Response('Message text is required', { status: 400 });
  if (cleanText.length > 4096) throw new Response('Message is too long', { status: 400 });

  const target = WA_URL + 'send?' + new URLSearchParams({ phone: recipient, text: cleanText }).toString();
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });

  try {
    await page.locator('#main').waitFor({ state: 'visible', timeout: 22000 });
  } catch {
    const textContent = await page.locator('body').innerText().catch(() => '');
    if (/invalid|not on whatsapp|phone number/i.test(textContent)) {
      throw new Response('WhatsApp recipient is invalid or unavailable', { status: 400 });
    }
    throw new Response('Unable to open WhatsApp recipient chat', { status: 502 });
  }

  await page.waitForTimeout(400);
  const sendIcon = page.locator('[data-icon="send"]').first();
  if (await sendIcon.count()) {
    await sendIcon.click();
  } else {
    const composer = page.locator('#main footer [contenteditable="true"][role="textbox"]').first();
    if (!(await composer.count())) throw new Response('WhatsApp composer is unavailable', { status: 502 });
    await composer.press('Enter');
  }

  await page.waitForTimeout(650);
  return {
    ok: true,
    to: recipient,
    sentAt: new Date().toISOString(),
    source: 'whatsapp_web_live',
  };
}

export async function whatsappBrowserSend(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{ to?: string; text?: string; requestId?: string }>().catch(() => null);
  const to = input?.to?.trim() ?? '';
  const text = input?.text ?? '';
  const requestId = input?.requestId?.trim() ?? '';

  if (!to || !text.trim()) throw new Response('to and text are required', { status: 400 });
  if (requestId) {
    const existing = await getWhatsAppBrowserSendResult(env, requestId);
    if (existing) return { ...existing, idempotentReplay: true };
  }

  const result = await withLivePage(env, page => sendWithPage(page, to, text));
  const stored = { ...result, requestId: requestId || undefined };
  if (requestId) await saveWhatsAppBrowserSendResult(env, requestId, stored);
  return stored;
}

export async function whatsappBrowserSendMany(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{
    messages?: Array<{ to?: string; text?: string; requestId?: string }>;
  }>().catch(() => null);
  if (!input || !Array.isArray(input.messages)) throw new Response('messages array is required', { status: 400 });
  if (input.messages.length < 1 || input.messages.length > 15) {
    throw new Response('Batch must contain between 1 and 15 messages', { status: 400 });
  }

  return withLivePage(env, async page => {
    const results: Array<Record<string, unknown>> = [];
    for (const item of input.messages) {
      const to = item.to?.trim() ?? '';
      const text = item.text ?? '';
      const requestId = item.requestId?.trim() ?? '';
      if (!to || !text.trim()) throw new Response('Every batch item requires to and text', { status: 400 });

      if (requestId) {
        const existing = await getWhatsAppBrowserSendResult(env, requestId);
        if (existing) {
          results.push({ ...existing, idempotentReplay: true });
          continue;
        }
      }

      const result = await sendWithPage(page, to, text);
      const stored = { ...result, requestId: requestId || undefined };
      if (requestId) await saveWhatsAppBrowserSendResult(env, requestId, stored);
      results.push(stored);
      await page.waitForTimeout(700);
    }

    return {
      ok: true,
      sent: results.length,
      results,
      source: 'whatsapp_web_live',
    };
  });
}
