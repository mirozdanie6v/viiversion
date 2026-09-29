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
  BOKUN_PRODUCT_IDS?: string;
  BOKUN_PRODUCT_CODES?: string;
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

export function canonicalVendorId(value: string) {
  const clean = value.trim();
  if (/^\d+$/.test(clean)) return clean;

  try {
    const normalized = clean.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const decoded = atob(padded);
    const numericId = decoded.match(/:(\d+)$/)?.[1];
    if (numericId) return numericId;
  } catch {
    // Keep opaque vendor identifiers unchanged if they are not valid base64.
  }

  return clean;
}

function allowedVendor(env: Env, vendorId: string) {
  const candidate = canonicalVendorId(vendorId);
  const allowed = (env.BOKUN_ALLOWED_VENDOR_IDS ?? '')
    .split(',')
    .map(x => canonicalVendorId(x))
    .filter(Boolean);
  return allowed.length === 0 || allowed.includes(candidate);
}

function host(env: Env, domain: string) {
  const suffix = (env.BOKUN_VENDOR_HOST_SUFFIX?.trim() || 'bokun.io').replace(/^\./, '');
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
  const vendorId = canonicalVendorId(String(token.vendor_id ?? ''));
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

  try {
    await ensureRestCredentials(env, vendorId);
  } catch (error) {
    console.error(
      'Bókun REST credential bootstrap after OAuth failed:',
      error instanceof Response ? `HTTP ${error.status}` : error instanceof Error ? error.message : 'Unknown error',
    );
  }

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

type RestApiCredentialsPayload = {
  accessKey?: string;
  secretKey?: string;
};

async function fetchRestCredentialsFromGraphql(env: Env, installation: {
  vendorId: string;
  domain: string;
  accessTokenEncrypted: string;
}) {
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const accessToken = await decryptSecret(installation.accessTokenEncrypted, encryptionKey);
  const endpoint = host(env, installation.domain) + '/api/graphql';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'X-Bokun-App-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: 'query RestApiCredentials { restApiCredentials { accessKey secretKey } }',
    }),
  });

  const payload = await response.json<{
    data?: { restApiCredentials?: RestApiCredentialsPayload | null };
    errors?: Array<{ message?: string }>;
  }>().catch(() => null);

  if (!response.ok) {
    throw new Response('Bókun GraphQL request failed', { status: 502 });
  }

  if (payload?.errors?.length) {
    console.error('Bókun GraphQL restApiCredentials error:', payload.errors.map(error => error.message ?? 'Unknown GraphQL error').join('; '));
    throw new Response('Bókun GraphQL restApiCredentials query failed', { status: 502 });
  }

  const accessKey = payload?.data?.restApiCredentials?.accessKey?.trim() ?? '';
  const secretKey = payload?.data?.restApiCredentials?.secretKey?.trim() ?? '';
  if (!accessKey || !secretKey) {
    throw new Response('Bókun REST credentials were not returned by GraphQL', { status: 503 });
  }

  return { accessKey, secretKey };
}

async function ensureRestCredentials(env: Env, vendorId: string) {
  const existing = await getRestCredentials(env, vendorId);
  if (existing) return existing;

  const installation = await getInstallation(env, vendorId);
  if (!installation) return null;

  const credentials = await fetchRestCredentialsFromGraphql(env, installation);
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  await saveRestCredentials(env, {
    vendorId,
    accessKeyEncrypted: await encryptSecret(credentials.accessKey, encryptionKey),
    secretKeyEncrypted: await encryptSecret(credentials.secretKey, encryptionKey),
    updatedAt: new Date().toISOString(),
  });

  return getRestCredentials(env, vendorId);
}

async function signedRestFetch(
  env: Env,
  vendorId: string,
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown,
) {
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const stored = await ensureRestCredentials(env, vendorId);
  if (!stored) throw new Response('REST credentials are not configured for this vendor', { status: 503 });
  const accessKey = await decryptSecret(stored.accessKeyEncrypted, encryptionKey);
  const secretKey = await decryptSecret(stored.secretKeyEncrypted, encryptionKey);
  const date = bokunRestDate();
  const signature = await signRest(secretKey, date, accessKey, method, path);
  const headers: Record<string, string> = {
    accept: 'application/json',
    'X-Bokun-Date': date,
    'X-Bokun-AccessKey': accessKey,
    'X-Bokun-Signature': signature,
  };
  if (body !== undefined) headers['content-type'] = 'application/json;charset=UTF-8';
  return fetch((env.BOKUN_REST_BASE_URL?.trim() || 'https://api.bokun.io') + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function restRequest(env: Env, vendorId: string, path: string) {
  const response = await signedRestFetch(env, vendorId, path);
  if (!response.ok) throw new Response('Bókun REST request failed', { status: 502 });
  return response.json<unknown>();
}

function numeric(value: string, name: string) {
  if (!/^\d+$/.test(value)) throw new Response(`Invalid ${name}`, { status: 400 });
  return value;
}

function configuredProducts(env: Env) {
  const ids = (env.BOKUN_PRODUCT_IDS ?? env.BOKUN_DEFAULT_PRODUCT_ID ?? '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  const codes = (env.BOKUN_PRODUCT_CODES ?? env.BOKUN_DEFAULT_PRODUCT_CODE ?? '')
    .split(',')
    .map(x => x.trim());
  return ids.map((id, index) => ({ id, code: codes[index] || null }));
}

export async function getStatus(env: Env, vendorId: string) {
  const installation = await getInstallation(env, vendorId);
  let rest = await getRestCredentials(env, vendorId);
  let restCredentialSyncError: string | null = null;

  if (!rest && installation) {
    try {
      rest = await ensureRestCredentials(env, vendorId);
    } catch (error) {
      restCredentialSyncError =
        error instanceof Response
          ? `HTTP ${error.status}: ${await error.clone().text().catch(() => 'credential sync failed')}`
          : error instanceof Error
            ? error.message
            : 'Unknown credential sync error';
    }
  }

  return {
    ok: true,
    vendorId,
    oauthConnected: Boolean(installation),
    restCredentialsReady: Boolean(rest),
    restCredentialSyncError,
    domain: installation?.domain ?? null,
    scopes: installation?.scopes?.split(',').map(x => x.trim()).filter(Boolean) ?? [],
    products: configuredProducts(env),
    defaultProduct: {
      id: env.BOKUN_DEFAULT_PRODUCT_ID ?? null,
      code: env.BOKUN_DEFAULT_PRODUCT_CODE ?? null,
    },
  };
}

export async function getProducts(env: Env, vendorId: string) {
  const products = configuredProducts(env);
  if (products.length === 0) throw new Response('No Bókun products are configured', { status: 503 });
  return Promise.all(products.map(async product => ({
    id: product.id,
    code: product.code,
    data: await getProduct(env, vendorId, product.id),
  })));
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

export function pickupPlacesPath(productId: string) {
  numeric(productId, 'productId');
  return '/activity.json/' + encodeURIComponent(productId) + '/pickup-places';
}

export async function getPickupPlaces(env: Env, vendorId: string, productId: string) {
  numeric(vendorId, 'vendorId');
  return restRequest(env, vendorId, pickupPlacesPath(productId));
}


function addDaysIso(date: Date, days: number) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy.toISOString().slice(0, 10);
}

function arr(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function summarizeCheckoutProbe(status: number, payload: any) {
  const options = arr(payload?.options ?? payload?.checkoutOptions);
  const questions = payload?.questions ?? null;
  return {
    status,
    ok: status >= 200 && status < 300,
    topLevelKeys: payload && typeof payload === 'object' ? Object.keys(payload) : [],
    optionCount: options.length,
    options: options.map((option: any) => ({
      type: option?.type ?? null,
      currency: option?.currency ?? null,
      amount: option?.amount ?? null,
      allowedMethods: arr(option?.paymentMethods?.allowedMethods),
    })),
    questions,
    error: status >= 200 && status < 300 ? null : payload,
  };
}

export async function getBookingContractProbe(env: Env, vendorId: string, productId: string) {
  numeric(vendorId, 'vendorId');
  numeric(productId, 'productId');

  const now = new Date();
  const start = addDaysIso(now, 1);
  const end = addDaysIso(now, 14);
  const availabilityPath =
    '/activity.json/' + encodeURIComponent(productId) +
    '/availabilities?' + new URLSearchParams({ start, end, currency: 'USD' }).toString();

  const [productRaw, availabilityRaw, pickupRaw] = await Promise.all([
    getProduct(env, vendorId, productId),
    restRequest(env, vendorId, availabilityPath),
    getPickupPlaces(env, vendorId, productId),
  ]);

  const product = productRaw as any;
  const availabilities = arr(availabilityRaw);
  const slot = availabilities.find((item: any) => !item?.soldOut && !item?.unavailable && arr(item?.rates).length > 0)
    ?? availabilities.find((item: any) => !item?.soldOut && !item?.unavailable);
  if (!slot) throw new Response('No bookable availability available for contract probe', { status: 409 });

  const rateId = Number(slot?.defaultRateId ?? arr(slot?.rates)[0]?.id);
  const pricingCategoryId = Number(arr(product?.pricingCategories)[0]?.id);
  if (!Number.isFinite(rateId) || !Number.isFinite(pricingCategoryId)) {
    throw new Response('Unable to resolve rate/pricing category for contract probe', { status: 409 });
  }

  const pickupPlaces = arr((pickupRaw as any)?.pickupPlaces ?? pickupRaw);
  const roomPickup = pickupPlaces.find((item: any) => item?.askForRoomNumber === true) ?? pickupPlaces[0] ?? null;

  const activityBase: Record<string, unknown> = {
    activityId: Number(productId),
    rateId,
    date: String(slot?.dateIso ?? slot?.localizedDate ?? '').match(/^\d{4}-\d{2}-\d{2}$/)
      ? String(slot?.dateIso ?? slot?.localizedDate)
      : String(slot?.id ?? '').match(/_(\d{4})(\d{2})(\d{2})$/)
        ? String(slot.id).replace(/^.*_(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
        : start,
    startTimeId: Number(slot?.startTimeId),
    pickup: Boolean(roomPickup),
    dropoff: false,
    checkedIn: false,
    customized: false,
    passengers: [{ pricingCategoryId }],
  };
  if (roomPickup?.id) activityBase.pickupPlaceId = Number(roomPickup.id);

  const bookingBase: Record<string, unknown> = {
    sendCustomerNotification: false,
    activityBookings: [activityBase],
  };

  const variants: Array<{ name: string; body: Record<string, unknown> }> = [
    { name: 'base', body: bookingBase },
  ];
  if (roomPickup?.id) {
    variants.push({
      name: 'pickupAnswers_roomNumber',
      body: {
        ...bookingBase,
        activityBookings: [{
          ...activityBase,
          pickupAnswers: [{ questionId: 'roomNumber', values: ['804'] }],
        }],
      },
    });
  }
  variants.push({
    name: 'externalReferenceAndEntity',
    body: {
      ...bookingBase,
      externalBookingReference: 'VIIVERSION-CONTRACT-PROBE',
      externalBookingEntityName: 'VIIVERSION',
      externalBookingEntityCode: 'LOVE_TRAVEL',
    },
  });
  variants.push({
    name: 'fullDynamicAnswers',
    body: {
      ...bookingBase,
      mainContactDetails: [
        { questionId: 'firstName', values: ['VIIVERSION'] },
        { questionId: 'lastName', values: ['CONTRACT PROBE'] },
        { questionId: 'email', values: ['probe@viiversion.com'] },
        { questionId: 'phoneNumber', values: ['+84000000000'] },
      ],
      activityBookings: [{
        ...activityBase,
        ...(roomPickup?.id ? {
          pickupAnswers: [{ questionId: 'roomNumber', values: ['804'] }],
        } : {}),
      }],
      externalBookingReference: 'VIIVERSION-CONTRACT-PROBE',
      externalBookingEntityName: 'VIIVERSION',
      externalBookingEntityCode: 'LOVE_TRAVEL',
    },
  });

  const path = '/checkout.json/options/booking-request?currency=USD';
  const results = [];
  for (const variant of variants) {
    const response = await signedRestFetch(env, vendorId, path, 'POST', variant.body);
    const text = await response.text();
    let payload: any = text;
    try { payload = JSON.parse(text); } catch {}
    results.push({ name: variant.name, ...summarizeCheckoutProbe(response.status, payload) });
  }

  return {
    ok: true,
    readOnly: true,
    createsBooking: false,
    vendorId,
    productId,
    oauth: {
      installation: await getStatus(env, vendorId),
    },
    sample: {
      date: activityBase.date,
      startTimeId: activityBase.startTimeId,
      rateId,
      pricingCategoryId,
      pickupPlace: roomPickup ? {
        id: roomPickup.id ?? null,
        title: roomPickup.title ?? roomPickup.name ?? null,
        askForRoomNumber: roomPickup.askForRoomNumber ?? null,
      } : null,
    },
    endpoint: path,
    probes: results,
  };
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
