import { decryptSecret, encryptSecret } from './crypto';
import type { Env } from './bokun';
import {
  consumeWhatsAppOnboardingSession,
  getWhatsAppConnection,
  getWhatsAppMetaConfig,
  getWhatsAppOnboardingSession,
  saveWhatsAppConnection,
  saveWhatsAppMetaConfig,
  saveWhatsAppOnboardingSession,
} from './store';

function required(value: string | undefined, name: string) {
  const clean = value?.trim();
  if (!clean) throw new Response(`Missing ${name}`, { status: 503 });
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

function randomVerifyToken() {
  return (
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '')
  );
}

export async function getWhatsAppMetaRuntimeConfig(env: Env) {
  const stored = await getWhatsAppMetaConfig(env);
  if (stored) {
    const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
    return {
      appId: stored.appId,
      appSecret: await decryptSecret(stored.appSecretEncrypted, encryptionKey),
      embeddedSignupConfigId: stored.embeddedSignupConfigId,
      verifyToken: stored.verifyToken,
      source: 'store' as const,
      updatedAt: stored.updatedAt,
    };
  }

  const appId = env.META_APP_ID?.trim() ?? '';
  const appSecret = env.META_APP_SECRET?.trim() ?? '';
  const embeddedSignupConfigId = env.META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() ?? '';
  const verifyToken = env.META_WHATSAPP_VERIFY_TOKEN?.trim() ?? '';
  if (!appId && !appSecret && !embeddedSignupConfigId && !verifyToken) return null;

  return {
    appId,
    appSecret,
    embeddedSignupConfigId,
    verifyToken,
    source: 'environment' as const,
    updatedAt: null,
  };
}

export async function configureWhatsAppMeta(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{
    appId?: string;
    appSecret?: string;
    embeddedSignupConfigId?: string;
  }>();

  const appId = input.appId?.trim() ?? '';
  const appSecret = input.appSecret?.trim() ?? '';
  const embeddedSignupConfigId = input.embeddedSignupConfigId?.trim() ?? '';

  if (!/^\d+$/.test(appId)) throw new Response('Invalid Meta App ID', { status: 400 });
  if (!appSecret || appSecret.length < 16 || appSecret.length > 256) {
    throw new Response('Invalid Meta App Secret', { status: 400 });
  }
  if (!/^\d+$/.test(embeddedSignupConfigId)) {
    throw new Response('Invalid Meta Embedded Signup Configuration ID', { status: 400 });
  }

  const existing = await getWhatsAppMetaConfig(env);
  const verifyToken = existing?.verifyToken || env.META_WHATSAPP_VERIFY_TOKEN?.trim() || randomVerifyToken();
  const updatedAt = new Date().toISOString();
  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');

  await saveWhatsAppMetaConfig(env, {
    appId,
    appSecretEncrypted: await encryptSecret(appSecret, encryptionKey),
    embeddedSignupConfigId,
    verifyToken,
    updatedAt,
  });

  return {
    ok: true,
    configured: true,
    appId,
    embeddedSignupConfigId,
    webhookCallbackUrl: 'https://integration.viiversion.com/webhooks/whatsapp',
    verifyToken,
    updatedAt,
  };
}

export async function getWhatsAppMetaAdminConfig(request: Request, env: Env) {
  assertAdmin(request, env);
  const config = await getWhatsAppMetaRuntimeConfig(env);
  return {
    ok: true,
    configured: Boolean(
      config?.appId &&
      config?.appSecret &&
      config?.embeddedSignupConfigId &&
      config?.verifyToken
    ),
    appId: config?.appId || null,
    embeddedSignupConfigId: config?.embeddedSignupConfigId || null,
    webhookCallbackUrl: 'https://integration.viiversion.com/webhooks/whatsapp',
    verifyToken: config?.verifyToken || null,
    source: config?.source || null,
    updatedAt: config?.updatedAt || null,
  };
}

export async function createWhatsAppOnboardingSession(request: Request, env: Env) {
  assertAdmin(request, env);
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  if (!meta?.appId || !meta.appSecret || !meta.embeddedSignupConfigId || !meta.verifyToken) {
    throw new Response('WhatsApp Meta configuration is incomplete', { status: 503 });
  }
  const id = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Date.now() + 15 * 60 * 1000;
  await saveWhatsAppOnboardingSession(env, { id, expiresAt });
  return {
    ok: true,
    expiresAt: new Date(expiresAt).toISOString(),
    url: 'https://integration.viiversion.com/whatsapp/connect?session=' + encodeURIComponent(id),
  };
}

function graphVersion(env: Env) {
  const version = env.META_GRAPH_VERSION?.trim() || 'v26.0';
  if (!/^v\d+\.\d+$/.test(version)) throw new Response('Invalid META_GRAPH_VERSION', { status: 503 });
  return version;
}

function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'content-security-policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://connect.facebook.net; connect-src 'self' https://www.facebook.com https://web.facebook.com https://graph.facebook.com; frame-src https://www.facebook.com https://web.facebook.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    },
  });
}

export async function whatsappConnectPage(request: Request, env: Env) {
  const sessionId = new URL(request.url).searchParams.get('session')?.trim() ?? '';
  const session = sessionId ? await getWhatsAppOnboardingSession(env, sessionId) : { valid: false, value: null };
  if (!session.valid) {
    return html('<!doctype html><meta charset="utf-8"><title>VIIVERSION WhatsApp</title><body style="font-family:system-ui;background:#07101d;color:#fff;max-width:680px;margin:64px auto;padding:24px"><h1>Invalid or expired connection link</h1><p>Create a new one-time WhatsApp onboarding link from the VIIVERSION admin bridge.</p></body>', 403);
  }
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  const appId = meta?.appId ?? '';
  const configId = meta?.embeddedSignupConfigId ?? '';
  const ready = Boolean(appId && configId && meta?.appSecret && meta?.verifyToken && env.DATA_ENCRYPTION_KEY?.trim());

  const safeAppId = JSON.stringify(appId);
  const safeConfigId = JSON.stringify(configId);
  const safeSessionId = JSON.stringify(sessionId);

  return html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VIIVERSION · Connect WhatsApp</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#10223a 0,#07101d 48%,#04070c 100%);color:#f7fbff}
    main{width:min(760px,calc(100% - 32px));margin:0 auto;padding:56px 0 80px}
    .brand{font-size:13px;font-weight:800;letter-spacing:.14em;color:#69dcff}
    h1{font-size:clamp(38px,8vw,72px);line-height:.98;letter-spacing:-.045em;margin:18px 0}
    p{color:#b9c8dc;line-height:1.6;font-size:16px}
    .card{margin-top:30px;padding:24px;border:1px solid #1e3854;border-radius:22px;background:rgba(9,19,33,.82);box-shadow:0 22px 70px rgba(0,0,0,.28)}
    button{width:100%;border:0;border-radius:16px;padding:16px 20px;font-size:16px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#55e1ff,#5a73ff);color:#03111e}
    button:disabled{cursor:not-allowed;opacity:.45}
    #status{margin-top:16px;padding:14px 16px;border-radius:14px;background:#07101d;color:#c8d8eb;min-height:52px;white-space:pre-wrap}
    .ok{color:#7df6be}.bad{color:#ff9d9d}.muted{color:#7d91aa;font-size:13px}
  </style>
</head>
<body>
<main>
  <div class="brand">VIIVERSION · WHATSAPP</div>
  <h1>Connect the existing WhatsApp Business number.</h1>
  <p>This uses Meta Embedded Signup in Coexistence mode. The WhatsApp Business app stays on the phone while VIIVERSION receives and sends messages through Cloud API.</p>
  <div class="card">
    <button id="connect" ${ready ? '' : 'disabled'}>Connect WhatsApp Business</button>
    <div id="status">${ready ? 'Ready to start Meta onboarding.' : 'Meta Embedded Signup is not configured yet.'}</div>
    <p class="muted">Callback: https://integration.viiversion.com/webhooks/whatsapp</p>
  </div>
</main>
<script>
  const APP_ID = ${safeAppId};
  const CONFIG_ID = ${safeConfigId};
  const ONBOARDING_SESSION = ${safeSessionId};
  const statusEl = document.getElementById('status');
  const button = document.getElementById('connect');
  let session = {};

  function setStatus(text, className='') {
    statusEl.textContent = text;
    statusEl.className = className;
  }

  window.addEventListener('message', (event) => {
    if (!/^https:\/\/(www\.|web\.)?facebook\.com$/.test(event.origin)) return;
    let data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return; }
    }
    if (!data || data.type !== 'WA_EMBEDDED_SIGNUP') return;

    if (data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' || data.event === 'FINISH') {
      session = {
        wabaId: data.data?.waba_id || data.data?.wabaId || session.wabaId,
        phoneNumberId: data.data?.phone_number_id || data.data?.phoneNumberId || session.phoneNumberId
      };
      setStatus('Meta linked the WhatsApp Business account. Finishing server connection…');
    } else if (data.event === 'CANCEL') {
      setStatus('Meta onboarding was cancelled.', 'bad');
    } else if (data.event === 'ERROR') {
      setStatus('Meta onboarding returned an error. Check the Meta app / Tech Provider status.', 'bad');
    }
  });

  window.fbAsyncInit = function() {
    FB.init({ appId: APP_ID, cookie: true, xfbml: false, version: 'v26.0' });
  };

  async function complete(code) {
    const deadline = Date.now() + 5000;
    while (!session.wabaId && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    if (!session.wabaId) throw new Error('Meta linked the account but did not return a WABA ID.');

    const response = await fetch('/whatsapp/onboarding/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, onboardingSession: ONBOARDING_SESSION, ...session })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || payload?.error || 'Server onboarding failed');

    setStatus(
      'Connected.\n' +
      (payload.displayPhoneNumber ? 'Number: ' + payload.displayPhoneNumber + '\n' : '') +
      (payload.verifiedName ? 'Name: ' + payload.verifiedName + '\n' : '') +
      'Mode: Coexistence\n' +
      (payload.coexistence?.verified ? 'Coexistence verified by Meta.\n' : '') +
      (payload.sync?.history?.accepted ? 'History sync requested.\n' : '') +
      (payload.sync?.contacts?.accepted ? 'Contact sync requested.' : ''),
      'ok'
    );
  }

  button?.addEventListener('click', () => {
    setStatus('Opening Meta Embedded Signup…');
    FB.login(async (response) => {
      const code = response?.authResponse?.code;
      if (!code) {
        setStatus('Meta did not return an authorization code.', 'bad');
        return;
      }
      try {
        await complete(code);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Connection failed', 'bad');
      }
    }, {
      config_id: CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: 'whatsapp_business_app_onboarding',
        sessionInfoVersion: '3'
      }
    });
  });
</script>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
</body>
</html>`);
}

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; code?: number; type?: string };
};

type PhoneNumber = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
};

async function exchangeCode(env: Env, code: string) {
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  const appId = required(meta?.appId, 'Meta App ID');
  const appSecret = required(meta?.appSecret, 'Meta App Secret');
  const url = new URL(`https://graph.facebook.com/${graphVersion(env)}/oauth/access_token`);
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('code', code);

  const response = await fetch(url.toString(), { headers: { accept: 'application/json' } });
  const payload = await response.json<TokenResponse>().catch(() => null);
  const token = payload?.access_token?.trim() ?? '';
  if (!response.ok || !token) {
    console.error('Meta Embedded Signup code exchange failed', response.status, payload?.error?.code ?? 'unknown');
    throw new Response('Meta authorization code exchange failed', { status: 502 });
  }
  return token;
}

async function subscribeWaba(env: Env, wabaId: string, token: string) {
  const subscribedFields = [
    'messages',
    'history',
    'smb_app_state_sync',
    'smb_message_echoes',
    'account_update',
    'phone_number_quality_update',
  ];
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(wabaId)}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ subscribed_fields: subscribedFields }),
    },
  );
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('Meta WABA subscription failed', response.status, body.slice(0, 300));
    throw new Response('Could not subscribe VIIVERSION to the Coexistence webhook fields', { status: 502 });
  }
  return subscribedFields;
}

async function requestAppSync(env: Env, phoneNumberId: string, token: string, syncType: 'history' | 'smb_app_state_sync') {
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(phoneNumberId)}/smb_app_data`,
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + token,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', sync_type: syncType }),
    },
  );
  const payload = await response.json<{ request_id?: string; error?: { code?: number; message?: string } }>().catch(() => null);
  if (!response.ok) {
    console.warn('WhatsApp app sync request was not accepted', syncType, response.status, payload?.error?.code ?? 'unknown');
  }
  return {
    accepted: response.ok,
    requestId: payload?.request_id ?? null,
    errorCode: payload?.error?.code ?? null,
    error: payload?.error?.message ?? null,
  };
}

async function checkCoexistence(env: Env, phoneNumberId: string, token: string) {
  const url = new URL(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(phoneNumberId)}`,
  );
  url.searchParams.set('fields', 'is_on_biz_app,platform_type');
  const response = await fetch(url.toString(), {
    headers: { authorization: 'Bearer ' + token, accept: 'application/json' },
  });
  const payload = await response.json<{ is_on_biz_app?: boolean; platform_type?: string }>().catch(() => null);
  return {
    verified: Boolean(response.ok && payload?.is_on_biz_app === true && payload?.platform_type === 'CLOUD_API'),
    isOnBizApp: payload?.is_on_biz_app ?? null,
    platformType: payload?.platform_type ?? null,
  };
}

async function phoneNumbers(env: Env, wabaId: string, token: string) {
  const url = new URL(
    `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(wabaId)}/phone_numbers`,
  );
  url.searchParams.set('fields', 'id,display_phone_number,verified_name,quality_rating');
  const response = await fetch(url.toString(), {
    headers: { authorization: 'Bearer ' + token, accept: 'application/json' },
  });
  const payload = await response.json<{ data?: PhoneNumber[]; error?: { message?: string } }>().catch(() => null);
  if (!response.ok) {
    console.error('Meta phone number discovery failed', response.status);
    throw new Response('Could not discover WhatsApp phone number ID', { status: 502 });
  }
  return payload?.data ?? [];
}

export async function completeWhatsAppCoexistence(request: Request, env: Env) {
  const input = await request.json<{ code?: string; wabaId?: string; phoneNumberId?: string; onboardingSession?: string }>();
  const code = input.code?.trim() ?? '';
  const wabaId = input.wabaId?.trim() ?? '';
  const requestedPhoneNumberId = input.phoneNumberId?.trim() ?? '';
  const onboardingSession = input.onboardingSession?.trim() ?? '';

  if (!code || !/^\d+$/.test(wabaId) || !onboardingSession) {
    return Response.json({ error: { message: 'Meta authorization code, WABA ID, and onboarding session are required' } }, { status: 400 });
  }

  const session = await consumeWhatsAppOnboardingSession(env, onboardingSession);
  if (!session.valid) {
    return Response.json({ error: { message: 'Onboarding session is invalid or expired' } }, { status: 401 });
  }

  const token = await exchangeCode(env, code);
  const subscribedFields = await subscribeWaba(env, wabaId, token);
  const numbers = await phoneNumbers(env, wabaId, token);

  const selected = requestedPhoneNumberId
    ? numbers.find(number => number.id === requestedPhoneNumberId)
    : numbers.length === 1
      ? numbers[0]
      : undefined;

  if (!selected?.id) {
    return Response.json(
      {
        error: { message: 'Phone number selection is required' },
        phones: numbers.map(number => ({
          id: number.id,
          displayPhoneNumber: number.display_phone_number,
          verifiedName: number.verified_name,
          qualityRating: number.quality_rating,
        })),
      },
      { status: 409 },
    );
  }

  const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
  await saveWhatsAppConnection(env, {
    mode: 'coexistence',
    wabaId,
    phoneNumberId: selected.id,
    displayPhoneNumber: selected.display_phone_number,
    verifiedName: selected.verified_name,
    accessTokenEncrypted: await encryptSecret(token, encryptionKey),
    connectedAt: new Date().toISOString(),
  });

  const coexistence = await checkCoexistence(env, selected.id, token);
  const contactSync = await requestAppSync(env, selected.id, token, 'smb_app_state_sync');
  const historySync = await requestAppSync(env, selected.id, token, 'history');

  return Response.json({
    ok: true,
    mode: 'coexistence',
    wabaId,
    phoneNumberId: selected.id,
    displayPhoneNumber: selected.display_phone_number ?? null,
    verifiedName: selected.verified_name ?? null,
    coexistence,
    subscribedFields,
    sync: {
      contacts: contactSync,
      history: historySync,
    },
  });
}

export async function getConnectedWhatsAppCredentials(env: Env) {
  const connection = await getWhatsAppConnection(env);
  if (connection) {
    const encryptionKey = required(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
    return {
      token: await decryptSecret(connection.accessTokenEncrypted, encryptionKey),
      phoneNumberId: connection.phoneNumberId,
      connection,
    };
  }

  const token = env.META_WHATSAPP_ACCESS_TOKEN?.trim() ?? '';
  const phoneNumberId = env.META_WHATSAPP_PHONE_NUMBER_ID?.trim() ?? '';
  if (!token || !phoneNumberId) return null;
  return {
    token,
    phoneNumberId,
    connection: null,
  };
}
