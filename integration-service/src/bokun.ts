import { decryptSecret, encryptSecret } from './crypto';
import {
  consumeOAuthState,
  getInstallation,
  getRestCredentials,
  saveInstallation,
  saveOAuthState,
  saveRestCredentials,
} from './store';

export interface Env {
  STORE: DurableObjectNamespace;
  BOKUN_APP_API_KEY?: string;
  BOKUN_APP_API_SECRET?: string;
  DATA_ENCRYPTION_KEY?: string;
  INTEGRATION_ADMIN_TOKEN?: string;
  BOKUN_ALLOWED_VENDOR_IDS?: string;
  BOKUN_DEFAULT_VENDOR_ID?: string;
  BOKUN_DEFAULT_PRODUCT_ID?: string;
  BOKUN_DEFAULT_PRODUCT_CODE?: string;
  BOKUN_REDIRECT_URI?: string;
  BOKUN_SCOPES?: string;
  BOKUN_VENDOR_HOST_SUFFIX?: string;
  BOKUN_REST_BASE_URL?: string;
  ALLOWED_ORIGIN_SUFFIX?: string;
}

const encoder = new TextEncoder();

function required(value: string | undefined, name: string) {
  const clean = value?.trim();
  if (!clean) throw new Error(`Missing ${name}`);
  return clean;
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export function canonicalOAuthQuery(url: URL) {
  const map = new Map<string, string>();
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== 'hmac') map.set(key, value);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export async function verifyOAuthHmac(url: URL, secret: string) {
  const signature = hexToBytes(url.searchParams.get('hmac') ?? '');
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(canonicalOAuthQuery(url)));
}

function assertFresh(url: URL) {
  const timestamp = Number(url.searchParams.get('timestamp'));
  if (!Number.isFinite(timestamp)) throw new Response('Missing timestamp', { status: 400 });
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) {
    throw new Response('Expired authorization request', { status: 401 });
  }
}

function allowedVendor(env: Env, vendorId: string) {
  const allowed = (env.BOKUN_ALLOWED_VENDOR_IDS ?? '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(vendorId);
}

function host(env: Env, domain: string) {
  const suffix = (env.BOKUN_VENDOR_HOST_SUFFIX?.trim() || 'bokun.is').replace(/^\./, '');
  return `https://${domain}.${suffix}`;
}

export async function handleInstall(request: Request, env: Env) {
  const clientId = required(env.BOKUN_APP_API_KEY, 'BOKUN_APP_API_KEY');
  const clientSecret = required(env.BOKUN_APP_API_SECRET, 'BOKUN_APP_API_SECRET');
  const redirectUri = required(env.BOKUN_REDIRECT_URI, 'BOKUN_REDIRECT_URI');
  const url = new URL(request.url);

  assertFresh(url);
  if (!(await verifyOAuthHmac(url, clientSecret))) return new Response('Invalid signature', { status: 401 });

  const domain = (url.searchParams.get('domain') ?? '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(domain)) return new Response('Invalid vendor domain', { status: 400 });

  const state = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  await saveOAuthState(env, { state, domain, expiresAt: Date.now() + 15 * 60 * 1000 });

  const target = new URL(host(env, domain) + '/appstore/oauth/authorize');
  target.searchParams.set('client_id', clientId);
  target.searchParams.set('scope', env.BOKUN_SCOPES?.trim() || 'LEGACY_API');
  target.searchParams.set('redirect_uri', redirectUri);
  target.searchParams.set('state', state);
  return Response.redirect(target.toString(), 302);
}

export async function handleCallback(request: Request, env: Env) {
  const clientId = required(env.BOKUN_APP_API_KEY, 'BOKUN_APP_API_KEY');
  const clientSecret = required(env.BOKUN_APP_API_SECRET, 'BOKUN_APP_API_SECRET');
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const url = new URL(request.url);

  assertFresh(url);
  if (!(await verifyOAuthHmac(url, clientSecret))) return new Response('Invalid signature', { status: 401 });

  const domain = (url.searchParams.get('domain') ?? '').trim().toLowerCase();
  const state = (url.searchParams.get('state') ?? '').trim();
  const code = (url.searchParams.get('code') ?? '').trim();
  if (!domain || !state || !code) return new Response('Invalid OAuth callback', { status: 400 });

  const stateResult = await consumeOAuthState(env, state, domain);
  if (!stateResult.ok) return new Response('Invalid or expired OAuth state', { status: 401 });

  const tokenResponse = await fetch(host(env, domain) + '/appstore/oauth/access_token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!tokenResponse.ok) return new Response('Bókun token exchange failed', { status: 502 });

  const token = await tokenResponse.json<{ access_token?: string; scope?: string; vendor_id?: string | number }>();
  const vendorId = String(token.vendor_id ?? '').trim();
  const accessToken = token.access_token?.trim() ?? '';
  if (!vendorId || !accessToken) return new Response('Incomplete Bókun token response', { status: 502 });
  if (!allowedVendor(env, vendorId)) return new Response('Vendor is not allowed for this integration', { status: 403 });

  await saveInstallation(env, {
    vendorId,
    domain,
    scopes: token.scope ?? env.BOKUN_SCOPES ?? '',
    accessTokenEncrypted: await encryptSecret(accessToken, encryptionKey),
    installedAt: new Date().toISOString(),
  });

  return new Response(
    '<!doctype html><meta charset="utf-8"><title>VIIVERSION Integration</title><body style="font-family:system-ui;max-width:680px;margin:64px auto;padding:24px"><h1>Integration authorized</h1><p>Bókun is now connected to VIIVERSION. You can close this tab.</p></body>',
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );
}

function b64(bytes: ArrayBuffer) {
  const view = new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function bokunRestDate(date = new Date()) {
  const iso = date.toISOString();
  return iso.slice(0, 10) + ' ' + iso.slice(11, 19);
}

export async function signRest(secret: string, date: string, accessKey: string, method: string, path: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(date + accessKey + method.toUpperCase() + path));
  return b64(signature);
}

async function restRequest(env: Env, vendorId: string, path: string) {
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const stored = await getRestCredentials(env, vendorId);
  if (!stored) throw new Response('REST credentials are not configured for this vendor', { status: 503 });
  const accessKey = await decryptSecret(stored.accessKeyEncrypted, encryptionKey);
  const secretKey = await decryptSecret(stored.secretKeyEncrypted, encryptionKey);
  const date = bokunRestDate();
  const signature = await signRest(secretKey, date, accessKey, 'GET', path);
  const response = await fetch((env.BOKUN_REST_BASE_URL?.trim() || 'https://api.bokun.io') + path, {
    headers: {
      accept: 'application/json',
      'X-Bokun-Date': date,
      'X-Bokun-AccessKey': accessKey,
      'X-Bokun-Signature': signature,
    },
  });
  if (!response.ok) throw new Response('Bókun REST request failed', { status: 502 });
  return response.json<unknown>();
}

function numeric(value: string, name: string) {
  if (!/^\d+$/.test(value)) throw new Response(`Invalid ${name}`, { status: 400 });
  return value;
}

export async function getStatus(env: Env, vendorId: string) {
  const installation = await getInstallation(env, vendorId);
  const rest = await getRestCredentials(env, vendorId);
  return {
    ok: true,
    vendorId,
    oauthConnected: Boolean(installation),
    restCredentialsReady: Boolean(rest),
    domain: installation?.domain ?? null,
    scopes: installation?.scopes?.split(',').map(x => x.trim()).filter(Boolean) ?? [],
    defaultProduct: {
      id: env.BOKUN_DEFAULT_PRODUCT_ID ?? null,
      code: env.BOKUN_DEFAULT_PRODUCT_CODE ?? null,
    },
  };
}

export async function getProduct(env: Env, vendorId: string, productId: string) {
  numeric(vendorId, 'vendorId');
  numeric(productId, 'productId');
  return restRequest(env, vendorId, '/activity.json/' + encodeURIComponent(productId));
}

export async function getAvailability(env: Env, vendorId: string, productId: string, url: URL) {
  numeric(vendorId, 'vendorId');
  numeric(productId, 'productId');
  const start = url.searchParams.get('start') ?? '';
  const end = url.searchParams.get('end') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    throw new Response('start and end must be YYYY-MM-DD', { status: 400 });
  }
  const query = new URLSearchParams({ start, end });
  const currency = (url.searchParams.get('currency') ?? '').trim().toUpperCase();
  if (currency) {
    if (!/^[A-Z]{3}$/.test(currency)) throw new Response('Invalid currency', { status: 400 });
    query.set('currency', currency);
  }
  return restRequest(
    env,
    vendorId,
    '/activity.json/' + encodeURIComponent(productId) + '/availabilities?' + query.toString(),
  );
}

export async function saveAdminRestCredentials(request: Request, env: Env) {
  const expected = required(env.INTEGRATION_ADMIN_TOKEN, 'INTEGRATION_ADMIN_TOKEN');
  if (request.headers.get('authorization') !== 'Bearer ' + expected) return new Response('Unauthorized', { status: 401 });

  const input = await request.json<{ vendorId?: string; accessKey?: string; secretKey?: string }>();
  const vendorId = String(input.vendorId ?? '').trim();
  const accessKey = input.accessKey?.trim() ?? '';
  const secretKey = input.secretKey?.trim() ?? '';
  if (!vendorId || !accessKey || !secretKey || !allowedVendor(env, vendorId)) return new Response('Invalid credentials payload', { status: 400 });

  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  await saveRestCredentials(env, {
    vendorId,
    accessKeyEncrypted: await encryptSecret(accessKey, encryptionKey),
    secretKeyEncrypted: await encryptSecret(secretKey, encryptionKey),
    updatedAt: new Date().toISOString(),
  });
  return Response.json({ ok: true, vendorId });
}
