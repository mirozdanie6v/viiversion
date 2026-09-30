export type OAuthState = {
  state: string;
  domain: string;
  expiresAt: number;
};

export type Installation = {
  vendorId: string;
  domain: string;
  scopes: string;
  accessTokenEncrypted: string;
  installedAt: string;
};

export type RestCredentials = {
  vendorId: string;
  accessKeyEncrypted: string;
  secretKeyEncrypted: string;
  updatedAt: string;
};

export type WhatsAppMessageDirection = 'inbound' | 'outbound';

export type WhatsAppMessage = {
  id: string;
  peer: string;
  from: string;
  to: string;
  direction: WhatsAppMessageDirection;
  timestamp: string;
  type: string;
  text: string;
  profileName?: string;
  phoneNumberId?: string;
  contextMessageId?: string;
  mediaId?: string;
  mimeType?: string;
  status?: string;
  statusUpdatedAt?: string;
  reviewedAt?: string;
};

export type WhatsAppStatus = {
  id: string;
  status: string;
  timestamp: string;
  recipientId?: string;
  conversationId?: string;
  pricingCategory?: string;
  billable?: boolean;
};

export type WhatsAppConnection = {
  mode: 'coexistence' | 'cloud_api';
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  accessTokenEncrypted: string;
  connectedAt: string;
};

export type WhatsAppWebhookConfig = {
  verifyToken: string;
  createdAt: string;
};

export type WhatsAppOnboardingSession = {
  id: string;
  expiresAt: number;
};

export type WhatsAppMessageQuery = {
  peer?: string;
  query?: string;
  direction?: WhatsAppMessageDirection;
  unreadOnly?: boolean;
  limit?: number;
};

function messageStorageKey(message: WhatsAppMessage) {
  const time = Date.parse(message.timestamp);
  const safeTime = Number.isFinite(time) ? time : Date.now();
  return `wa:message:${String(safeTime).padStart(13, '0')}:${message.id}`;
}

function normalizedLimit(value: number | undefined, fallback: number, max: number) {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value as number, 1), max);
}

export class IntegrationStore {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

    if (url.pathname === '/state' && request.method === 'POST') {
      const input = await request.json<OAuthState>();
      await this.state.storage.put(`oauth:${input.state}`, input);
      return json({ ok: true });
    }

    if (url.pathname === '/state/consume' && request.method === 'POST') {
      const input = await request.json<{ state: string; domain: string }>();
      const key = `oauth:${input.state}`;
      const result = await this.state.storage.transaction(async txn => {
        const value = await txn.get<OAuthState>(key);
        if (!value || value.domain !== input.domain || value.expiresAt <= Date.now()) return null;
        await txn.delete(key);
        return value;
      });
      return json({ ok: Boolean(result), value: result });
    }

    if (url.pathname === '/installation' && request.method === 'POST') {
      const input = await request.json<Installation>();
      await this.state.storage.put(`installation:${input.vendorId}`, input);
      return json({ ok: true });
    }

    if (url.pathname === '/installation' && request.method === 'GET') {
      const vendorId = url.searchParams.get('vendorId') ?? '';
      const value = await this.state.storage.get<Installation>(`installation:${vendorId}`);
      return json({ value: value ?? null });
    }

    if (url.pathname === '/rest' && request.method === 'POST') {
      const input = await request.json<RestCredentials>();
      await this.state.storage.put(`rest:${input.vendorId}`, input);
      return json({ ok: true });
    }

    if (url.pathname === '/rest' && request.method === 'GET') {
      const vendorId = url.searchParams.get('vendorId') ?? '';
      const value = await this.state.storage.get<RestCredentials>(`rest:${vendorId}`);
      return json({ value: value ?? null });
    }

    if (url.pathname === '/whatsapp/onboarding-session' && request.method === 'POST') {
      const input = await request.json<WhatsAppOnboardingSession>();
      if (!input.id || !Number.isFinite(input.expiresAt)) return json({ error: 'invalid_onboarding_session' }, 400);
      await this.state.storage.put(`wa:onboarding:${input.id}`, input);
      return json({ ok: true });
    }

    if (url.pathname === '/whatsapp/onboarding-session' && request.method === 'GET') {
      const id = url.searchParams.get('id') ?? '';
      const value = await this.state.storage.get<WhatsAppOnboardingSession>(`wa:onboarding:${id}`);
      const valid = Boolean(value && value.expiresAt > Date.now());
      return json({ valid, value: valid ? value : null });
    }

    if (url.pathname === '/whatsapp/onboarding-session/consume' && request.method === 'POST') {
      const input = await request.json<{ id: string }>();
      const key = `wa:onboarding:${input.id}`;
      const valid = await this.state.storage.transaction(async txn => {
        const value = await txn.get<WhatsAppOnboardingSession>(key);
        if (!value || value.expiresAt <= Date.now()) return false;
        await txn.delete(key);
        return true;
      });
      return json({ valid });
    }

    if (url.pathname === '/whatsapp/connection' && request.method === 'POST') {
      const input = await request.json<WhatsAppConnection>();
      if (!input.wabaId || !input.phoneNumberId || !input.accessTokenEncrypted) {
        return json({ error: 'invalid_whatsapp_connection' }, 400);
      }
      await this.state.storage.put('wa:connection', input);
      return json({ ok: true });
    }

    if (url.pathname === '/whatsapp/connection' && request.method === 'GET') {
      const value = await this.state.storage.get<WhatsAppConnection>('wa:connection');
      return json({ value: value ?? null });
    }

    if (url.pathname === '/whatsapp/webhook-config' && request.method === 'POST') {
      const input = await request.json<WhatsAppWebhookConfig>();
      if (!input.verifyToken) return json({ error: 'invalid_webhook_config' }, 400);
      await this.state.storage.put('wa:webhook-config', input);
      return json({ ok: true });
    }

    if (url.pathname === '/whatsapp/webhook-config' && request.method === 'GET') {
      const value = await this.state.storage.get<WhatsAppWebhookConfig>('wa:webhook-config');
      return json({ value: value ?? null });
    }

    if (url.pathname === '/whatsapp/message' && request.method === 'POST') {
      const input = await request.json<WhatsAppMessage>();
      if (!input.id || !input.peer || !input.timestamp) return json({ error: 'invalid_message' }, 400);

      const idKey = `wa:message-id:${input.id}`;
      await this.state.storage.transaction(async txn => {
        const existingKey = await txn.get<string>(idKey);
        const pendingStatus = await txn.get<WhatsAppStatus>(`wa:status:${input.id}`);
        if (existingKey) {
          const existing = await txn.get<WhatsAppMessage>(existingKey);
          const merged: WhatsAppMessage = {
            ...(existing ?? input),
            ...input,
            reviewedAt: existing?.reviewedAt ?? input.reviewedAt,
            status: pendingStatus?.status ?? input.status ?? existing?.status,
            statusUpdatedAt: pendingStatus?.timestamp ?? input.statusUpdatedAt ?? existing?.statusUpdatedAt,
          };
          await txn.put(existingKey, merged);
          return;
        }

        const key = messageStorageKey(input);
        const value: WhatsAppMessage = {
          ...input,
          status: pendingStatus?.status ?? input.status,
          statusUpdatedAt: pendingStatus?.timestamp ?? input.statusUpdatedAt,
        };
        await txn.put(key, value);
        await txn.put(idKey, key);
      });
      return json({ ok: true });
    }

    if (url.pathname === '/whatsapp/status' && request.method === 'POST') {
      const input = await request.json<WhatsAppStatus>();
      if (!input.id || !input.status || !input.timestamp) return json({ error: 'invalid_status' }, 400);

      const statusKey = `wa:status:${input.id}`;
      await this.state.storage.transaction(async txn => {
        await txn.put(statusKey, input);
        const messageKey = await txn.get<string>(`wa:message-id:${input.id}`);
        if (!messageKey) return;
        const message = await txn.get<WhatsAppMessage>(messageKey);
        if (!message) return;
        await txn.put(messageKey, {
          ...message,
          status: input.status,
          statusUpdatedAt: input.timestamp,
        } satisfies WhatsAppMessage);
      });
      return json({ ok: true });
    }

    if (url.pathname === '/whatsapp/review' && request.method === 'POST') {
      const input = await request.json<{ ids: string[]; reviewedAt: string }>();
      const ids = [...new Set(input.ids ?? [])].filter(Boolean).slice(0, 100);
      let reviewed = 0;

      for (const id of ids) {
        const messageKey = await this.state.storage.get<string>(`wa:message-id:${id}`);
        if (!messageKey) continue;
        const message = await this.state.storage.get<WhatsAppMessage>(messageKey);
        if (!message) continue;
        await this.state.storage.put(messageKey, { ...message, reviewedAt: input.reviewedAt } satisfies WhatsAppMessage);
        reviewed += 1;
      }
      return json({ ok: true, reviewed });
    }

    if (url.pathname === '/whatsapp/messages' && request.method === 'GET') {
      const limit = normalizedLimit(Number(url.searchParams.get('limit') ?? '100'), 100, 200);
      const peer = (url.searchParams.get('peer') ?? '').trim();
      const query = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase();
      const directionRaw = (url.searchParams.get('direction') ?? '').trim();
      const direction: WhatsAppMessageDirection | undefined =
        directionRaw === 'inbound' || directionRaw === 'outbound' ? directionRaw : undefined;
      const unreadOnly = url.searchParams.get('unread') === '1';
      const scanLimit = Math.min(Math.max(limit * 20, 500), 5000);
      const values = await this.state.storage.list<WhatsAppMessage>({
        prefix: 'wa:message:',
        reverse: true,
        limit: scanLimit,
      });

      const messages: WhatsAppMessage[] = [];
      for (const message of values.values()) {
        if (peer && message.peer !== peer) continue;
        if (direction && message.direction !== direction) continue;
        if (unreadOnly && (message.direction !== 'inbound' || Boolean(message.reviewedAt))) continue;
        if (
          query &&
          ![message.text, message.peer, message.profileName ?? '', message.type]
            .join('\n')
            .toLocaleLowerCase()
            .includes(query)
        ) {
          continue;
        }
        messages.push(message);
        if (messages.length >= limit) break;
      }

      return json({ messages, count: messages.length });
    }

    if (url.pathname === '/whatsapp/chats' && request.method === 'GET') {
      const limit = normalizedLimit(Number(url.searchParams.get('limit') ?? '50'), 50, 100);
      const values = await this.state.storage.list<WhatsAppMessage>({
        prefix: 'wa:message:',
        reverse: true,
        limit: 5000,
      });

      const chats = new Map<
        string,
        {
          peer: string;
          profileName?: string;
          lastMessageAt: string;
          lastText: string;
          lastDirection: WhatsAppMessageDirection;
          lastType: string;
          unreadCount: number;
        }
      >();

      for (const message of values.values()) {
        const existing = chats.get(message.peer);
        if (!existing) {
          chats.set(message.peer, {
            peer: message.peer,
            profileName: message.profileName,
            lastMessageAt: message.timestamp,
            lastText: message.text,
            lastDirection: message.direction,
            lastType: message.type,
            unreadCount: message.direction === 'inbound' && !message.reviewedAt ? 1 : 0,
          });
          continue;
        }

        if (!existing.profileName && message.profileName) existing.profileName = message.profileName;
        if (message.direction === 'inbound' && !message.reviewedAt) existing.unreadCount += 1;
      }

      const result = [...chats.values()]
        .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt))
        .slice(0, limit);
      return json({ chats: result, count: result.length });
    }

    return json({ error: 'not_found' }, 404);
  }
}

type StoreEnv = { STORE: DurableObjectNamespace };

function stub(env: StoreEnv) {
  return env.STORE.get(env.STORE.idFromName('global'));
}

async function call<T>(env: StoreEnv, path: string, init?: RequestInit): Promise<T> {
  const response = await stub(env).fetch('https://internal' + path, init);
  if (!response.ok) throw new Error('Integration store request failed');
  return response.json<T>();
}

export async function saveOAuthState(env: StoreEnv, value: OAuthState) {
  await call(env, '/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function consumeOAuthState(env: StoreEnv, state: string, domain: string) {
  return call<{ ok: boolean; value: OAuthState | null }>(env, '/state/consume', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state, domain }),
  });
}

export async function saveInstallation(env: StoreEnv, value: Installation) {
  await call(env, '/installation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function getInstallation(env: StoreEnv, vendorId: string) {
  const result = await call<{ value: Installation | null }>(env, '/installation?vendorId=' + encodeURIComponent(vendorId));
  return result.value;
}

export async function saveRestCredentials(env: StoreEnv, value: RestCredentials) {
  await call(env, '/rest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function getRestCredentials(env: StoreEnv, vendorId: string) {
  const result = await call<{ value: RestCredentials | null }>(env, '/rest?vendorId=' + encodeURIComponent(vendorId));
  return result.value;
}

export async function saveWhatsAppOnboardingSession(env: StoreEnv, value: WhatsAppOnboardingSession) {
  await call(env, '/whatsapp/onboarding-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function getWhatsAppOnboardingSession(env: StoreEnv, id: string) {
  return call<{ valid: boolean; value: WhatsAppOnboardingSession | null }>(
    env,
    '/whatsapp/onboarding-session?id=' + encodeURIComponent(id),
  );
}

export async function consumeWhatsAppOnboardingSession(env: StoreEnv, id: string) {
  return call<{ valid: boolean }>(env, '/whatsapp/onboarding-session/consume', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}

export async function saveWhatsAppConnection(env: StoreEnv, value: WhatsAppConnection) {
  await call(env, '/whatsapp/connection', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function getWhatsAppConnection(env: StoreEnv) {
  const result = await call<{ value: WhatsAppConnection | null }>(env, '/whatsapp/connection');
  return result.value;
}

export async function saveWhatsAppWebhookConfig(env: StoreEnv, value: WhatsAppWebhookConfig) {
  await call(env, '/whatsapp/webhook-config', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function getWhatsAppWebhookConfig(env: StoreEnv) {
  const result = await call<{ value: WhatsAppWebhookConfig | null }>(env, '/whatsapp/webhook-config');
  return result.value;
}

export async function saveWhatsAppMessage(env: StoreEnv, value: WhatsAppMessage) {
  await call(env, '/whatsapp/message', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function saveWhatsAppStatus(env: StoreEnv, value: WhatsAppStatus) {
  await call(env, '/whatsapp/status', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export async function listWhatsAppMessages(env: StoreEnv, query: WhatsAppMessageQuery = {}) {
  const params = new URLSearchParams();
  if (query.peer) params.set('peer', query.peer);
  if (query.query) params.set('q', query.query);
  if (query.direction) params.set('direction', query.direction);
  if (query.unreadOnly) params.set('unread', '1');
  params.set('limit', String(normalizedLimit(query.limit, 100, 200)));
  return call<{ messages: WhatsAppMessage[]; count: number }>(env, '/whatsapp/messages?' + params.toString());
}

export async function listWhatsAppChats(env: StoreEnv, limit = 50) {
  return call<{
    chats: Array<{
      peer: string;
      profileName?: string;
      lastMessageAt: string;
      lastText: string;
      lastDirection: WhatsAppMessageDirection;
      lastType: string;
      unreadCount: number;
    }>;
    count: number;
  }>(env, '/whatsapp/chats?limit=' + encodeURIComponent(String(normalizedLimit(limit, 50, 100))));
}

export async function reviewWhatsAppMessages(env: StoreEnv, ids: string[], reviewedAt: string) {
  const result = await call<{ ok: boolean; reviewed: number }>(env, '/whatsapp/review', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids, reviewedAt }),
  });
  return result.reviewed;
}
