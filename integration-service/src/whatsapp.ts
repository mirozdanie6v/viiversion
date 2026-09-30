import type { Env } from './bokun';
import { getConnectedWhatsAppCredentials, getWhatsAppMetaRuntimeConfig } from './whatsapp-onboarding';
import {
  getWhatsAppSyncState,
  listWhatsAppChats,
  listWhatsAppContacts,
  listWhatsAppMessages,
  reviewWhatsAppMessages,
  saveWhatsAppContact,
  saveWhatsAppMessage,
  saveWhatsAppStatus,
  saveWhatsAppSyncState,
  type WhatsAppMessage,
} from './store';

const encoder = new TextEncoder();

type MetaContact = {
  wa_id?: string;
  profile?: { name?: string };
};

type MetaMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
  document?: { id?: string; caption?: string; filename?: string; mime_type?: string; sha256?: string };
  audio?: { id?: string; mime_type?: string; sha256?: string; voice?: boolean };
  video?: { id?: string; caption?: string; mime_type?: string; sha256?: string };
  sticker?: { id?: string; mime_type?: string; sha256?: string; animated?: boolean };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string; description?: string };
  };
  button?: { payload?: string; text?: string };
  location?: { latitude?: number; longitude?: number; name?: string; address?: string };
  context?: { from?: string; id?: string; forwarded?: boolean; frequently_forwarded?: boolean };
  to?: string;
  history_context?: { status?: string };
  original_message_id?: string;
};

type MetaStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  conversation?: { id?: string };
  pricing?: { billable?: boolean; pricing_model?: string; category?: string; type?: string };
};

type MetaValue = {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: MetaContact[];
  messages?: MetaMessage[];
  statuses?: MetaStatus[];
  message_echoes?: MetaMessage[];
  history?: Array<{
    metadata?: { phase?: number; chunk_order?: number; progress?: number };
    threads?: Array<{ id?: string; messages?: MetaMessage[] }>;
    errors?: Array<{ code?: number; title?: string; message?: string; error_data?: { details?: string } }>;
  }>;
  state_sync?: Array<{
    type?: string;
    action?: string;
    contact?: {
      full_name?: string;
      first_name?: string;
      phone_number?: string;
      user_id?: string;
      parent_user_id?: string;
      username?: string;
    };
    metadata?: { timestamp?: string };
  }>;
};

type MetaWebhook = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{ field?: string; value?: MetaValue }>;
  }>;
};

function required(value: string | undefined, name: string) {
  const clean = value?.trim();
  if (!clean) throw new Response(`Missing ${name}`, { status: 503 });
  return clean;
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export async function verifyMetaWebhookSignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  const signature = signatureHeader?.match(/^sha256=([0-9a-f]{64})$/i)?.[1];
  if (!signature) return false;
  const bytes = hexToBytes(signature);
  if (!bytes) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify('HMAC', key, bytes, encoder.encode(rawBody));
}

function assertAdmin(request: Request, env: Env) {
  const expected = required(env.INTEGRATION_ADMIN_TOKEN, 'INTEGRATION_ADMIN_TOKEN');
  const authorization = request.headers.get('authorization') ?? '';
  const gatewayKey = request.headers.get('x-viiversion-integration-key') ?? '';
  if (authorization !== 'Bearer ' + expected && gatewayKey !== expected) {
    throw new Response('Unauthorized', { status: 401 });
  }
}

function safeIsoFromUnixSeconds(value: string | undefined) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

function onlyDigits(value: string | undefined) {
  return (value ?? '').replace(/[^0-9]/g, '');
}

function normalizeRecipient(value: string) {
  const digits = onlyDigits(value);
  if (!/^\d{7,15}$/.test(digits)) throw new Response('Invalid WhatsApp recipient', { status: 400 });
  return digits;
}

function messageText(message: MetaMessage) {
  switch (message.type) {
    case 'text':
      return message.text?.body?.trim() ?? '';
    case 'image':
      return [message.image?.caption?.trim(), '[image]'].filter(Boolean).join(' ');
    case 'document':
      return [message.document?.caption?.trim(), message.document?.filename?.trim(), '[document]'].filter(Boolean).join(' ');
    case 'audio':
      return message.audio?.voice ? '[voice message]' : '[audio]';
    case 'video':
      return [message.video?.caption?.trim(), '[video]'].filter(Boolean).join(' ');
    case 'sticker':
      return '[sticker]';
    case 'interactive':
      return (
        message.interactive?.button_reply?.title?.trim() ||
        message.interactive?.list_reply?.title?.trim() ||
        '[interactive]'
      );
    case 'button':
      return message.button?.text?.trim() || message.button?.payload?.trim() || '[button]';
    case 'location': {
      const location = message.location;
      const label = [location?.name?.trim(), location?.address?.trim()].filter(Boolean).join(' — ');
      const coords =
        Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude)
          ? `${location?.latitude}, ${location?.longitude}`
          : '';
      return [label || '[location]', coords].filter(Boolean).join(' ');
    }
    default:
      return message.type ? `[${message.type}]` : '[message]';
  }
}

function mediaFields(message: MetaMessage) {
  const media = message.image ?? message.document ?? message.audio ?? message.video ?? message.sticker;
  return {
    mediaId: media?.id,
    mimeType: media?.mime_type,
  };
}

function graphVersion(env: Env) {
  const version = env.META_GRAPH_VERSION?.trim() || 'v26.0';
  if (!/^v\d+\.\d+$/.test(version)) throw new Response('Invalid META_GRAPH_VERSION', { status: 503 });
  return version;
}

export async function verifyWhatsAppWebhook(request: Request, env: Env) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode') ?? '';
  const challenge = url.searchParams.get('hub.challenge') ?? '';
  const token = url.searchParams.get('hub.verify_token') ?? '';
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  const expected = required(meta?.verifyToken, 'Meta WhatsApp verify token');

  if (mode === 'subscribe' && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  return new Response('Webhook verification failed', { status: 403 });
}

export async function receiveWhatsAppWebhook(request: Request, env: Env) {
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  const appSecret = required(meta?.appSecret, 'Meta App Secret');
  const rawBody = await request.text();
  const valid = await verifyMetaWebhookSignature(rawBody, request.headers.get('x-hub-signature-256'), appSecret);
  if (!valid) return new Response('Invalid webhook signature', { status: 401 });

  let payload: MetaWebhook;
  try {
    payload = JSON.parse(rawBody) as MetaWebhook;
  } catch {
    return new Response('Invalid webhook payload', { status: 400 });
  }

  if (payload.object !== 'whatsapp_business_account') {
    return Response.json({ received: true, ignored: true });
  }

  let savedMessages = 0;
  let savedStatuses = 0;
  let savedContacts = 0;
  let historyMessages = 0;
  let echoedMessages = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value || value.messaging_product !== 'whatsapp') continue;

      const phoneNumberId = value.metadata?.phone_number_id?.trim() || undefined;
      const businessDisplayNumber = value.metadata?.display_phone_number?.trim() || undefined;
      const businessDigits = onlyDigits(businessDisplayNumber);
      const names = new Map(
        (value.contacts ?? [])
          .filter(contact => Boolean(contact.wa_id))
          .map(contact => [contact.wa_id as string, contact.profile?.name?.trim() || undefined] as const),
      );

      if (change.field === 'history') {
        for (const chunk of value.history ?? []) {
          const error = chunk.errors?.[0];
          const phase = chunk.metadata?.phase;
          const progress = chunk.metadata?.progress;
          const chunkOrder = chunk.metadata?.chunk_order;

          await saveWhatsAppSyncState(env, {
            history: {
              phase,
              progress,
              chunkOrder,
              updatedAt: new Date().toISOString(),
              error: error?.message || error?.title || error?.error_data?.details,
            },
          });

          if (error) continue;

          for (const thread of chunk.threads ?? []) {
            const threadPeer = onlyDigits(thread.id);
            for (const message of thread.messages ?? []) {
              const id = message.id?.trim() ?? '';
              const from = onlyDigits(message.from);
              const to = onlyDigits(message.to);
              if (!id || (!from && !to)) continue;

              const outbound = Boolean(businessDigits && from === businessDigits);
              const peer = threadPeer || (outbound ? to : from);
              if (!peer) continue;

              await saveWhatsAppMessage(env, {
                id,
                peer,
                from: from || (outbound ? businessDigits : peer),
                to: to || (outbound ? peer : businessDigits || 'business'),
                direction: outbound ? 'outbound' : 'inbound',
                timestamp: safeIsoFromUnixSeconds(message.timestamp),
                type: message.type?.trim() || 'unknown',
                text: messageText(message),
                phoneNumberId,
                contextMessageId: message.context?.id?.trim() || undefined,
                mediaId: mediaFields(message).mediaId,
                mimeType: mediaFields(message).mimeType,
                status: message.history_context?.status?.trim() || undefined,
                reviewedAt: new Date().toISOString(),
                source: 'history',
                historyPhase: phase,
              });
              savedMessages += 1;
              historyMessages += 1;
            }
          }
        }
        continue;
      }

      if (change.field === 'smb_app_state_sync') {
        let changed = 0;
        for (const item of value.state_sync ?? []) {
          if (item.type !== 'contact') continue;
          const contact = item.contact;
          const peer = onlyDigits(contact?.phone_number) || contact?.user_id?.trim() || contact?.username?.trim() || '';
          if (!peer) continue;

          await saveWhatsAppContact(
            env,
            {
              peer,
              fullName: contact?.full_name?.trim() || undefined,
              firstName: contact?.first_name?.trim() || undefined,
              username: contact?.username?.trim() || undefined,
              userId: contact?.user_id?.trim() || undefined,
              updatedAt: safeIsoFromUnixSeconds(item.metadata?.timestamp),
            },
            item.action === 'remove' ? 'remove' : 'upsert',
          );
          savedContacts += 1;
          changed += 1;
        }
        await saveWhatsAppSyncState(env, {
          contacts: { updatedAt: new Date().toISOString(), count: changed },
        });
        continue;
      }

      if (change.field === 'smb_message_echoes' || change.field === 'message_echoes') {
        for (const message of value.message_echoes ?? []) {
          const id = message.id?.trim() ?? '';
          const to = onlyDigits(message.to);
          if (!id || !to) continue;
          const media = mediaFields(message);
          await saveWhatsAppMessage(env, {
            id,
            peer: to,
            from: onlyDigits(message.from) || businessDigits || 'business',
            to,
            direction: 'outbound',
            timestamp: safeIsoFromUnixSeconds(message.timestamp),
            type: message.type?.trim() || 'unknown',
            text: messageText(message),
            phoneNumberId,
            contextMessageId: message.context?.id?.trim() || message.original_message_id?.trim() || undefined,
            mediaId: media.mediaId,
            mimeType: media.mimeType,
            source: 'business_app',
          });
          savedMessages += 1;
          echoedMessages += 1;
          await saveWhatsAppSyncState(env, { lastEchoAt: safeIsoFromUnixSeconds(message.timestamp) });
        }
        continue;
      }

      if (change.field !== 'messages') continue;

      for (const message of value.messages ?? []) {
        const id = message.id?.trim() ?? '';
        const from = onlyDigits(message.from);
        if (!id || !from) continue;
        const type = message.type?.trim() || 'unknown';
        const media = mediaFields(message);

        const normalized: WhatsAppMessage = {
          id,
          peer: from,
          from,
          to: businessDisplayNumber || phoneNumberId || 'business',
          direction: 'inbound',
          timestamp: safeIsoFromUnixSeconds(message.timestamp),
          type,
          text: messageText(message),
          profileName: names.get(message.from?.trim() ?? ''),
          phoneNumberId,
          contextMessageId: message.context?.id?.trim() || undefined,
          mediaId: media.mediaId,
          mimeType: media.mimeType,
          source: 'cloud_api',
        };
        await saveWhatsAppMessage(env, normalized);
        savedMessages += 1;
      }

      for (const status of value.statuses ?? []) {
        const id = status.id?.trim() ?? '';
        const state = status.status?.trim() ?? '';
        if (!id || !state) continue;
        await saveWhatsAppStatus(env, {
          id,
          status: state,
          timestamp: safeIsoFromUnixSeconds(status.timestamp),
          recipientId: status.recipient_id?.trim() || undefined,
          conversationId: status.conversation?.id?.trim() || undefined,
          pricingCategory: status.pricing?.category?.trim() || status.pricing?.type?.trim() || undefined,
          billable: status.pricing?.billable,
        });
        savedStatuses += 1;
      }
    }
  }

  return Response.json({
    received: true,
    messages: savedMessages,
    statuses: savedStatuses,
    contacts: savedContacts,
    historyMessages,
    echoedMessages,
  });
}

export async function whatsappStatus(request: Request, env: Env) {
  assertAdmin(request, env);
  const credentials = await getConnectedWhatsAppCredentials(env);
  const syncState = await getWhatsAppSyncState(env);
  const meta = await getWhatsAppMetaRuntimeConfig(env);
  const metaReady = Boolean(meta?.appId && meta.appSecret && meta.embeddedSignupConfigId && meta.verifyToken);
  return {
    ok: true,
    configured: Boolean(credentials && metaReady),
    transportReady: Boolean(credentials),
    webhookReady: Boolean(meta?.appSecret && meta?.verifyToken),
    embeddedSignupReady: Boolean(meta?.appId && meta?.appSecret && meta?.embeddedSignupConfigId),
    metaConfigSource: meta?.source ?? null,
    graphVersion: graphVersion(env),
    phoneNumberId: credentials?.phoneNumberId ?? null,
    mode: credentials?.connection?.mode ?? (credentials ? 'cloud_api' : null),
    wabaId: credentials?.connection?.wabaId ?? null,
    displayPhoneNumber: credentials?.connection?.displayPhoneNumber ?? null,
    verifiedName: credentials?.connection?.verifiedName ?? null,
    sync: syncState,
  };
}

export async function whatsappMessages(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '100');
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 100;
  const peer = (url.searchParams.get('peer') ?? '').trim();
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 200);
  const directionRaw = (url.searchParams.get('direction') ?? '').trim();
  const direction =
    directionRaw === 'inbound' || directionRaw === 'outbound'
      ? directionRaw
      : undefined;
  const unreadOnly = url.searchParams.get('unread') === '1';

  return listWhatsAppMessages(env, { peer, query, direction, unreadOnly, limit });
}

export async function whatsappChats(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '50');
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
  return listWhatsAppChats(env, limit);
}

export async function whatsappContacts(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 200);
  const rawLimit = Number(url.searchParams.get('limit') ?? '200');
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 1000) : 200;
  return listWhatsAppContacts(env, query, limit);
}

export async function whatsappSyncStatus(request: Request, env: Env) {
  assertAdmin(request, env);
  return { ok: true, sync: await getWhatsAppSyncState(env) };
}

export async function whatsappUnread(request: Request, env: Env) {
  assertAdmin(request, env);
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '100');
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 100;
  return listWhatsAppMessages(env, { unreadOnly: true, limit });
}

export async function whatsappReview(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{ ids?: string[] }>();
  const ids = [...new Set((input.ids ?? []).map(id => id.trim()).filter(Boolean))].slice(0, 100);
  if (ids.length === 0) throw new Response('ids are required', { status: 400 });
  const reviewedAt = new Date().toISOString();
  const count = await reviewWhatsAppMessages(env, ids, reviewedAt);
  return { ok: true, reviewed: count, reviewedAt };
}

export async function sendWhatsAppText(request: Request, env: Env) {
  assertAdmin(request, env);
  const input = await request.json<{ to?: string; text?: string; previewUrl?: boolean; replyTo?: string }>();
  const to = normalizeRecipient(input.to ?? '');
  const text = input.text?.trim() ?? '';
  if (!text || text.length > 4096) throw new Response('text must contain 1-4096 characters', { status: 400 });

  const credentials = await getConnectedWhatsAppCredentials(env);
  if (!credentials) throw new Response('WhatsApp is not connected', { status: 503 });
  const phoneNumberId = credentials.phoneNumberId;
  if (!/^\d+$/.test(phoneNumberId)) throw new Response('Invalid WhatsApp phone number ID', { status: 503 });
  const accessToken = credentials.token;
  const endpoint = `https://graph.facebook.com/${graphVersion(env)}/${encodeURIComponent(phoneNumberId)}/messages`;

  const body: {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'text';
    context?: { message_id: string };
    text: { preview_url: boolean; body: string };
  } = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: Boolean(input.previewUrl), body: text },
  };

  const replyTo = input.replyTo?.trim();
  if (replyTo) body.context = { message_id: replyTo };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json<{
    messaging_product?: string;
    contacts?: Array<{ input?: string; wa_id?: string }>;
    messages?: Array<{ id?: string }>;
    error?: { message?: string; type?: string; code?: number };
  }>().catch(() => null);

  if (!response.ok) {
    console.error('WhatsApp send failed', response.status, payload?.error?.code ?? 'unknown');
    return Response.json(
      {
        error: {
          code: 'WHATSAPP_SEND_FAILED',
          message: payload?.error?.message || 'WhatsApp Cloud API rejected the message',
          providerStatus: response.status,
        },
      },
      { status: 502 },
    );
  }

  const messageId = payload?.messages?.[0]?.id?.trim() || crypto.randomUUID();
  const timestamp = new Date().toISOString();
  await saveWhatsAppMessage(env, {
    id: messageId,
    peer: to,
    from: 'business',
    to,
    direction: 'outbound',
    timestamp,
    type: 'text',
    text,
    phoneNumberId,
    contextMessageId: replyTo || undefined,
    status: 'accepted',
    source: 'api',
  });

  return {
    ok: true,
    to,
    messageId,
    timestamp,
  };
}
