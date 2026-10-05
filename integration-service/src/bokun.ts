import { decryptSecret, encryptSecret } from './crypto';
import {
  consumeOAuthState,
  getInstallation,
  getRestCredentials,
  saveInstallation,
  saveOAuthState,
  saveRestCredentials,
  claimLoveTravelDemoBooking,
  updateLoveTravelDemoBooking,
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
  BOKUN_REAL_BOOKING_ENABLED?: string;
  BOKUN_BOOKING_TEST_TOKEN?: string;
  LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256?: string;
  ALLOWED_ORIGIN_SUFFIX?: string;
  META_WHATSAPP_ACCESS_TOKEN?: string;
  META_WHATSAPP_PHONE_NUMBER_ID?: string;
  META_WHATSAPP_VERIFY_TOKEN?: string;
  META_APP_SECRET?: string;
  META_GRAPH_VERSION?: string;
  META_APP_ID?: string;
  META_EMBEDDED_SIGNUP_CONFIG_ID?: string;
  META_SETUP_TOKEN?: string;
  META_SETUP_EXPIRES_AT?: string;
  BROWSER?: Fetcher;
  WHATSAPP_BROWSER_SETUP_TOKEN?: string;
  WHATSAPP_BROWSER_SETUP_EXPIRES_AT?: string;
}

const encoder = new TextEncoder();
const LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256 = '0551905d7ba4e0dee3190b5e9f29f7a07be5ce0d09a27cd35ce587f601019432';


async function sha256Hex(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function loveTravelDemoTokenHash(request: Request, env: Env) {
  const token = request.headers.get('x-love-travel-demo-token')?.trim() ?? '';
  if (!token) throw new Response('Unauthorized', { status:401 });
  const hash = await sha256Hex(token);
  const expected = env.LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256?.trim() || LOVE_TRAVEL_CLIENT_DEMO_TOKEN_SHA256;
  if (hash !== expected) throw new Response('Unauthorized', { status:401 });
  return hash;
}


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

async function restRequest(
  env: Env,
  vendorId: string,
  path: string,
  init: { method?: 'GET' | 'POST'; body?: unknown } = {},
) {
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  const stored = await ensureRestCredentials(env, vendorId);
  if (!stored) throw new Response('REST credentials are not configured for this vendor', { status: 503 });
  const accessKey = await decryptSecret(stored.accessKeyEncrypted, encryptionKey);
  const secretKey = await decryptSecret(stored.secretKeyEncrypted, encryptionKey);
  const method = init.method ?? 'GET';
  const date = bokunRestDate();
  const signature = await signRest(secretKey, date, accessKey, method, path);
  const headers: Record<string, string> = {
    accept: 'application/json',
    'X-Bokun-Date': date,
    'X-Bokun-AccessKey': accessKey,
    'X-Bokun-Signature': signature,
  };
  const requestInit: RequestInit = { method, headers };
  if (method === 'POST') {
    headers['content-type'] = 'application/json; charset=utf-8';
    requestInit.body = JSON.stringify(init.body ?? {});
  }

  const response = await fetch((env.BOKUN_REST_BASE_URL?.trim() || 'https://api.bokun.io') + path, requestInit);
  const text = await response.text();
  if (!response.ok) {
    console.error('Bókun REST request failed', method, path, response.status, text.slice(0, 1000));
    throw new Response('Bókun REST request failed', { status: 502 });
  }
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Response('Bókun REST returned invalid JSON', { status: 502 });
  }
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
    checkoutOptionsAvailable: Boolean(rest),
    realBookingWriteEnabled: env.BOKUN_REAL_BOOKING_ENABLED?.trim().toLowerCase() === 'true',
    oneTimeBookingTestArmed: Boolean(env.BOKUN_BOOKING_TEST_TOKEN?.trim()),
  };
}

export function productPath(productId: string, lang = '') {
  numeric(productId, 'productId');
  const path = '/activity.json/' + encodeURIComponent(productId);
  const language = lang.trim().toUpperCase().replace('-', '_');
  if (!language) return path;
  if (!/^[A-Z]{2}(?:_[A-Z]{2})?$/.test(language)) throw new Response('Invalid lang', { status: 400 });
  return path + '?lang=' + encodeURIComponent(language);
}

export async function getProducts(env: Env, vendorId: string, lang = '') {
  const products = configuredProducts(env);
  if (products.length === 0) throw new Response('No Bókun products are configured', { status: 503 });
  return Promise.all(products.map(async product => ({
    id: product.id,
    code: product.code,
    data: await getProduct(env, vendorId, product.id, lang),
  })));
}

export async function getProduct(env: Env, vendorId: string, productId: string, lang = '') {
  numeric(vendorId, 'vendorId');
  return restRequest(env, vendorId, productPath(productId, lang));
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


function currencyCode(value = 'USD') {
  const currency = value.trim().toUpperCase() || 'USD';
  if (!/^[A-Z]{3}$/.test(currency)) throw new Response('Invalid currency', { status: 400 });
  return currency;
}

export function checkoutOptionsPath(currency = 'USD') {
  return '/checkout.json/options/booking-request?' + new URLSearchParams({ currency: currencyCode(currency) }).toString();
}

export function checkoutSubmitPath(currency = 'USD') {
  return '/checkout.json/submit?' + new URLSearchParams({ currency: currencyCode(currency) }).toString();
}

function configuredProductIds(env: Env) {
  return new Set(configuredProducts(env).map(product => product.id));
}

function plainObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function validatePilotBookingRequest(env: Env, input: unknown) {
  const booking = plainObject(input);
  if (!booking) throw new Response('Invalid booking request', { status: 400 });
  const activityBookings = Array.isArray(booking.activityBookings) ? booking.activityBookings : [];
  if (activityBookings.length !== 1) throw new Response('Pilot requires exactly one activity booking', { status: 400 });

  const activity = plainObject(activityBookings[0]);
  const activityId = String(activity?.activityId ?? '').trim();
  if (!/^\d+$/.test(activityId) || !configuredProductIds(env).has(activityId)) {
    throw new Response('Unsupported Bókun product', { status: 400 });
  }

  const reference = String(booking.externalBookingReference ?? '').trim();
  if (!reference.startsWith('LT-TEST-')) {
    throw new Response('Pilot booking reference must start with LT-TEST-', { status: 400 });
  }
  if (booking.sendCustomerNotification === true) {
    throw new Response('Customer notification must stay disabled for the pilot', { status: 400 });
  }

  const passengers = Array.isArray(activity?.passengers) ? activity.passengers : [];
  if (passengers.length < 1) throw new Response('At least one passenger is required', { status: 400 });

  return booking;
}

export function validatePilotCheckoutRequest(env: Env, input: unknown) {
  const checkout = plainObject(input);
  if (!checkout) throw new Response('Invalid checkout request', { status: 400 });
  if (String(checkout.source ?? '') !== 'DIRECT_REQUEST') throw new Response('Only DIRECT_REQUEST is allowed', { status: 400 });
  if (String(checkout.paymentMethod ?? '') !== 'RESERVE_FOR_EXTERNAL_PAYMENT') {
    throw new Response('Only RESERVE_FOR_EXTERNAL_PAYMENT is allowed', { status: 400 });
  }
  if (!String(checkout.checkoutOption ?? '').trim()) throw new Response('checkoutOption is required', { status: 400 });
  if (checkout.sendNotificationToMainContact === true || checkout.showPricesInNotification === true) {
    throw new Response('Checkout notifications must stay disabled for the pilot', { status: 400 });
  }
  validatePilotBookingRequest(env, checkout.directBooking);
  return checkout;
}

export async function getCheckoutOptions(env: Env, vendorId: string, bookingRequest: unknown, currency = 'USD') {
  numeric(vendorId, 'vendorId');
  validatePilotBookingRequest(env, bookingRequest);
  return restRequest(env, vendorId, checkoutOptionsPath(currency), {
    method: 'POST',
    body: bookingRequest,
  });
}

function checkoutOptionsList(contract: unknown) {
  if (Array.isArray(contract)) return contract;
  const object = plainObject(contract);
  return Array.isArray(object?.options) ? object.options : [];
}

function reserveAllowed(contract: unknown, checkoutOption: string) {
  return checkoutOptionsList(contract).some(value => {
    const option = plainObject(value);
    const methods = plainObject(option?.paymentMethods)?.allowedMethods;
    return String(option?.type ?? '') === checkoutOption
      && Array.isArray(methods)
      && methods.map(String).includes('RESERVE_FOR_EXTERNAL_PAYMENT');
  });
}

export async function submitReservedCheckout(
  request: Request,
  env: Env,
  vendorId: string,
  checkoutRequest: unknown,
  currency = 'USD',
) {
  const adminToken = env.INTEGRATION_ADMIN_TOKEN?.trim() ?? '';
  const oneTimeToken = env.BOKUN_BOOKING_TEST_TOKEN?.trim() ?? '';
  const adminAuthorized = Boolean(adminToken) && request.headers.get('authorization') === 'Bearer ' + adminToken;
  const oneTimeAuthorized = Boolean(oneTimeToken)
    && request.headers.get('x-viiversion-booking-test-token') === oneTimeToken;

  if (!adminAuthorized && !oneTimeAuthorized) {
    throw new Response('Unauthorized', { status: 401 });
  }
  if (adminAuthorized && env.BOKUN_REAL_BOOKING_ENABLED?.trim().toLowerCase() !== 'true') {
    throw new Response('Real Bókun booking writes are disabled', { status: 423 });
  }
  if (request.headers.get('x-viiversion-booking-intent') !== 'RESERVE_REAL_BOKUN_BOOKING') {
    throw new Response('Explicit real-booking intent header is required', { status: 412 });
  }

  numeric(vendorId, 'vendorId');
  const checkout = validatePilotCheckoutRequest(env, checkoutRequest);
  const booking = checkout.directBooking;
  const optionType = String(checkout.checkoutOption ?? '');
  const liveContract = await getCheckoutOptions(env, vendorId, booking, currency);
  if (!reserveAllowed(liveContract, optionType)) {
    throw new Response('Live Bókun checkout no longer allows reserve for this option', { status: 409 });
  }

  return restRequest(env, vendorId, checkoutSubmitPath(currency), {
    method: 'POST',
    body: checkout,
  });
}


export async function submitLoveTravelClientDemoBooking(
  request: Request,
  env: Env,
  vendorId: string,
  checkoutRequest: unknown,
  currency = 'USD',
) {
  const tokenHash = await loveTravelDemoTokenHash(request, env);
  if (request.headers.get('x-viiversion-booking-intent') !== 'SUBMIT_LOVE_TRAVEL_CLIENT_DEMO_BOOKING') {
    throw new Response('Explicit Love Travel demo booking intent required', { status: 412 });
  }
  if (!allowedVendor(env, vendorId)) throw new Response('Vendor not allowed', { status: 403 });

  numeric(vendorId, 'vendorId');
  const checkout = validatePilotCheckoutRequest(env, checkoutRequest);
  const booking = checkout.directBooking;
  const reference = String(booking.externalBookingReference ?? '').trim();
  if (!reference.startsWith('LT-TEST-CLIENT-')) {
    throw new Response('Client demo reference must start with LT-TEST-CLIENT-', { status: 400 });
  }
  if (String(booking.externalBookingEntityName ?? '') !== 'VIIVERSION'
    || String(booking.externalBookingEntityCode ?? '') !== 'LOVE_TRAVEL') {
    throw new Response('Invalid client demo booking entity', { status: 400 });
  }

  const activity = plainObject(Array.isArray(booking.activityBookings) ? booking.activityBookings[0] : null);
  const productId = String(activity?.activityId ?? '').trim();
  if (!configuredProductIds(env).has(productId)) throw new Response('Unsupported Bókun product', { status:400 });

  const optionType = String(checkout.checkoutOption ?? '');
  const liveContract = await getCheckoutOptions(env, vendorId, booking, currency);
  if (!reserveAllowed(liveContract, optionType)) {
    throw new Response('Live Bókun checkout no longer allows reserve for this option', { status: 409 });
  }

  const claim = await claimLoveTravelDemoBooking(env, {
    tokenHash,
    productId,
    status:'PENDING',
    externalReference:reference,
    updatedAt:new Date().toISOString(),
  });
  if (!claim.claimed) {
    if (claim.value.status === 'CONFIRMED' && claim.value.confirmationCode) {
      return {
        ok:true,
        mode:'LOVE_TRAVEL_CLIENT_DEMO',
        reused:true,
        booking:{
          confirmationCode:claim.value.confirmationCode,
          status:claim.value.bookingStatus || 'CONFIRMED',
          paymentType:'NOT_PAID',
          totalPaid:0,
          externalBookingReference:claim.value.externalReference,
        },
      };
    }
    throw new Response('This client demo token has already been used for this product', { status:409 });
  }

  try {
    const reservation = await restRequest(env, vendorId, checkoutSubmitPath(currency), {
      method: 'POST',
      body: checkout,
    });
    const reservationRoot = plainObject(reservation);
    const reserved = plainObject(reservationRoot?.booking) ?? reservationRoot;
    const code = String(reserved?.confirmationCode ?? '').trim();
    const status = String(reserved?.status ?? '').trim().toUpperCase();
    if (!/^NHA-[0-9]+$/.test(code)) throw new Response('Bókun did not return a valid booking code', { status: 502 });

    let confirmed = reserved;
    if (status === 'RESERVED') {
      confirmed = plainObject(await restRequest(
        env,
        vendorId,
        '/booking.json/' + encodeURIComponent(code) + '/confirm?currency='
          + encodeURIComponent(currencyCode(currency)) + '&lang=EN&sendCustomerNotification=false',
        {
          method: 'POST',
          body: { externalBookingReference: reference },
        },
      ));
    } else if (status !== 'CONFIRMED') {
      throw new Response('Bókun client demo booking was not reservable', { status: 409 });
    }

    const confirmationCode = String(confirmed?.confirmationCode ?? code);
    const bookingStatus = String(confirmed?.status ?? 'CONFIRMED').toUpperCase();
    await updateLoveTravelDemoBooking(env, {
      ...claim.value,
      status:'CONFIRMED',
      confirmationCode,
      bookingStatus,
      updatedAt:new Date().toISOString(),
    });

    return {
      ok: true,
      mode: 'LOVE_TRAVEL_CLIENT_DEMO',
      booking: confirmed,
    };
  } catch (error) {
    await updateLoveTravelDemoBooking(env, {
      ...claim.value,
      status:'ERROR',
      updatedAt:new Date().toISOString(),
    }).catch(() => undefined);
    throw error;
  }
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

function authorizePilotLifecycle(request: Request, env: Env, vendorId: string) {
  const token = env.BOKUN_BOOKING_TEST_TOKEN?.trim();
  if (!token || request.headers.get('x-viiversion-booking-test-token') !== token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  if (!allowedVendor(env, vendorId)) throw new Response('Vendor not allowed', { status: 403 });
}

export async function readPilotBooking(request: Request, env: Env, vendorId: string, code: string) {
  authorizePilotLifecycle(request, env, vendorId);
  if (!/^NHA-(?:T)?[0-9]+$/.test(code)) throw new Response('Invalid booking code', { status: 400 });
  const result = await restRequest(env, vendorId, '/booking.json/booking/' + encodeURIComponent(code));
  const booking = plainObject(result);
  if (!booking || !String(booking.externalBookingReference ?? '').startsWith('LT-TEST-')) {
    throw new Response('Only VIIVERSION pilot bookings are permitted', { status: 403 });
  }
  return booking;
}

export async function confirmPilotBooking(request: Request, env: Env, vendorId: string, code: string) {
  if (request.headers.get('x-viiversion-booking-intent') !== 'CONFIRM_REAL_BOKUN_TEST_BOOKING') {
    throw new Response('Explicit test confirmation intent required', { status: 412 });
  }
  const booking = await readPilotBooking(request, env, vendorId, code);
  if (booking.status === 'CONFIRMED') return { booking };
  if (booking.status !== 'RESERVED') throw new Response('Booking is not reserved', { status: 409 });
  // Test confirmation must not assert that any payment has been received.
  const confirmed = await restRequest(env, vendorId,
    '/booking.json/' + encodeURIComponent(code) + '/confirm?currency=USD&lang=EN&sendCustomerNotification=false', {
      method: 'POST',
      body: { externalBookingReference: booking.externalBookingReference },
    });
  return { booking: confirmed };
}
