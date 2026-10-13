/**
 * Owner-only OAuth authorization server state. Tokens, refresh tokens and
 * authorization codes are random 256-bit values; only SHA-256 digests persist.
 * All public entrypoints are implemented in oauth.ts.
 */
export type RegisteredClient = {
  clientId: string;
  redirectUris: string[];
  clientName: string;
  registeredAt: number;
};
type Code = {
  clientId: string; redirectUri: string; challenge: string;
  scope: string; resource: string; expiresAt: number;
};
type Session = {
  clientId: string; resource: string; scope: string; expiresAt: number;
};
const now = () => Date.now();

export async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(v => v.toString(16).padStart(2, "0")).join("");
}
export function secret(): string {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map(v => v.toString(16).padStart(2, "0")).join("");
}
export async function pkce(input: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  let s = "";
  for (const v of new Uint8Array(bytes)) s += String.fromCharCode(v);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export class PersonalWebOAuth {
  constructor(private readonly state: DurableObjectState) {}

  private async tokens(clientId: string, resource: string, scope: string) {
    const access = secret(), refresh = secret(), created = now();
    await this.state.storage.put("access:" + await digest(access), {
      clientId, resource, scope, expiresAt: created + 60 * 60_000
    } satisfies Session);
    await this.state.storage.put("refresh:" + await digest(refresh), {
      clientId, resource, scope, expiresAt: created + 30 * 24 * 60 * 60_000
    } satisfies Session);
    return { access_token: access, refresh_token: refresh, token_type: "Bearer",
      expires_in: 3600, scope };
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });
    let data: Record<string, any>;
    try { data = await request.json() as Record<string, any>; }
    catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
    const action = new URL(request.url).pathname;
    const storage = this.state.storage;

    if (action === "/register") {
      const uris = data.redirectUris;
      if (!Array.isArray(uris) || !uris.length || uris.length > 4 ||
          uris.some((u: unknown) => typeof u !== "string" || !/^https:\/\/chatgpt\.com\/(connector_platform_oauth_redirect|connector\/oauth\/[A-Za-z0-9_-]+)$/.test(u))) {
        return Response.json({ error: "Only approved ChatGPT OAuth redirect URLs are allowed" }, { status: 400 });
      }
      const list = await storage.list<RegisteredClient>({ prefix: "client:" });
      const existing = [...list.values()].find(c => JSON.stringify(c.redirectUris) === JSON.stringify(uris));
      if (existing) return Response.json({ ok: true, client: existing });
      if (list.size >= 20) return Response.json({ error: "Client limit reached" }, { status: 429 });
      const client: RegisteredClient = {
        clientId: "pw_" + secret(),
        redirectUris: uris,
        clientName: String(data.clientName ?? "ChatGPT").slice(0, 100),
        registeredAt: now()
      };
      await storage.put("client:" + client.clientId, client);
      return Response.json({ ok: true, client });
    }

    if (action === "/client") {
      const client = await storage.get<RegisteredClient>("client:" + String(data.clientId ?? ""));
      return client ? Response.json({ ok: true, client }) :
        Response.json({ error: "Unknown OAuth client" }, { status: 404 });
    }

    if (action === "/code/issue") {
      const clientId = String(data.clientId ?? ""), redirectUri = String(data.redirectUri ?? "");
      const client = await storage.get<RegisteredClient>("client:" + clientId);
      if (!client || !client.redirectUris.includes(redirectUri)) {
        return Response.json({ error: "Invalid client and redirect URI" }, { status: 400 });
      }
      const challenge = String(data.challenge ?? "");
      if (!/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
        return Response.json({ error: "S256 PKCE challenge required" }, { status: 400 });
      }
      const code = secret();
      await storage.put("code:" + await digest(code), {
        clientId, redirectUri, challenge,
        resource: String(data.resource),
        scope: "web:read", expiresAt: now() + 5 * 60_000
      } satisfies Code);
      return Response.json({ ok: true, code });
    }

    if (action === "/code/redeem") {
      const value = String(data.code ?? "");
      const verifier = String(data.verifier ?? "");
      if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || value.length !== 64) {
        return Response.json({ error: "invalid_grant" }, { status: 400 });
      }
      const digestKey = "code:" + await digest(value);
      const challenge = await pkce(verifier);
      const valid = await storage.transaction(async txn => {
        const record = await txn.get<Code>(digestKey);
        if (!record || record.expiresAt <= now() ||
            record.clientId !== data.clientId || record.redirectUri !== data.redirectUri ||
            record.resource !== data.resource || record.challenge !== challenge) return null;
        await txn.delete(digestKey);
        return record;
      });
      if (!valid) return Response.json({ error: "invalid_grant" }, { status: 400 });
      return Response.json({ ok: true, tokens: await this.tokens(valid.clientId, valid.resource, valid.scope) });
    }

    if (action === "/refresh") {
      const value = String(data.refreshToken ?? "");
      if (!/^[a-f0-9]{64}$/.test(value)) {
        return Response.json({ error: "invalid_grant" }, { status: 400 });
      }
      const key = "refresh:" + await digest(value);
      const valid = await storage.transaction(async txn => {
        const record = await txn.get<Session>(key);
        if (!record || record.expiresAt <= now() ||
            record.clientId !== data.clientId || record.resource !== data.resource) return null;
        await txn.delete(key);
        return record;
      });
      if (!valid) return Response.json({ error: "invalid_grant" }, { status: 400 });
      return Response.json({ ok: true, tokens: await this.tokens(valid.clientId, valid.resource, valid.scope) });
    }

    if (action === "/revoke") {
      const value = String(data.token ?? "");
      if (/^[a-f0-9]{64}$/.test(value)) {
        const hashed = await digest(value);
        await storage.delete("access:" + hashed);
        await storage.delete("refresh:" + hashed);
      }
      return Response.json({ ok: true });
    }

    if (action === "/verify") {
      const value = String(data.token ?? "");
      if (!/^[a-f0-9]{64}$/.test(value)) return Response.json({ ok: false }, { status: 401 });
      const found = await storage.get<Session>("access:" + await digest(value));
      if (!found || found.expiresAt <= now() ||
          found.resource !== data.resource || !found.scope.split(" ").includes("web:read")) {
        return Response.json({ ok: false }, { status: 401 });
      }
      return Response.json({ ok: true, clientId: found.clientId, scope: found.scope });
    }
    return Response.json({ error: "Unknown authorization operation" }, { status: 404 });
  }
}
