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
