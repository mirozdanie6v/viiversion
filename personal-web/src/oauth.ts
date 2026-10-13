/**
 * Personal Web OAuth 2.1 adapter for ChatGPT custom MCP connections.
 * Dynamic Client Registration is restricted to ChatGPT OAuth redirects;
 * authorization code + S256 PKCE, resource audience and rotating refresh.
 *
 * The owner's existing 64-character WEB_API_TOKEN authorizes the consent
 * form, but is NEVER sent to ChatGPT as an access token or placed in a URL.
 */
interface OAuthEnv {
  OAUTH: DurableObjectNamespace;
  WEB_API_TOKEN?: string;
  ENABLE_OAUTH?: string;
}
const SCOPE = "web:read";
const json = (data: unknown, status = 200) => Response.json(data, { status,
  headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const error = (code: string, status = 400, description?: string) =>
  json({ error: code, ...(description ? { error_description: description } : {}) }, status);

function escaped(value: string): string {
  return value.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c] ?? c);
}
function originFor(request: Request): string {
  const url = new URL(request.url);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".workers.dev")) {
    throw new Error("Only the verified HTTPS staging origin is supported");
  }
  return url.origin;
}
function resourceFor(request: Request): string {
  return originFor(request) + "/mcp";
}
function bodyForm(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    throw new Error("Expected application/x-www-form-urlencoded");
  }
  return request.text().then(text => {
    if (text.length > 8192) throw new Error("Oversized OAuth request");
    return new URLSearchParams(text);
  });
}
async function vault(env: OAuthEnv, action: string, payload: unknown) {
  if (!env.OAUTH) throw new Error("OAuth Durable Object unavailable");
  const id = env.OAUTH.idFromName("owner-chatgpt-oauth");
  const response = await env.OAUTH.get(id).fetch("https://oauth.internal" + action, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json() as Record<string, any>;
  return { ok: response.ok && body.ok === true, status: response.status, body };
}
function oauthHeaders(origin: string): Record<string, string> {
  return {
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "content-security-policy": "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; style-src 'unsafe-inline'"
  };
}
function consentHtml(params: URLSearchParams, clientName: string, origin: string): Response {
  const field = (k: string) => `<input type="hidden" name="${k}" value="${escaped(params.get(k) ?? "")}">`;
  const content = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>VIIVERSION Personal Web — доступ ChatGPT</title>
<style>:root{color-scheme:dark;font-family:system-ui,sans-serif}body{background:#0c1420;color:#e9edf4;margin:0;padding:30px 15px}main{max-width:520px;margin:auto;border:1px solid #526177;border-radius:16px;background:#1a2535;padding:23px}h1{font-size:1.4rem}p{line-height:1.55;color:#c5d1e2}input{box-sizing:border-box;width:100%;padding:12px;margin-top:8px;border:1px solid #7286a4;background:#101b29;color:white;border-radius:9px;font-size:16px}button{margin-top:20px;width:100%;padding:13px;background:#bddcff;color:#07121f;border:0;border-radius:9px;font-weight:700;cursor:pointer}</style>
</head><body><main>
<h1>Разрешить ChatGPT читать страницы через VIIVERSION?</h1>
<p>Приложение: <strong>${escaped(clientName)}</strong>. Разрешение: чтение страниц и сохранённых сессий на заранее разрешённых доменах. Автоматические клики и отправка форм отключены.</p>
<p>Введите персональный токен VIIVERSION Personal Web из менеджера паролей. Пароль сайта здесь вводить нельзя. Ваш токен не будет передан ChatGPT.</p>
<form action="/oauth/authorize" method="POST">
${["client_id","redirect_uri","response_type","scope","state","code_challenge","code_challenge_method","resource"].map(field).join("")}
<label for="credential">Личный ключ доступа</label>
<input id="credential" type="password" name="owner_token" required autocomplete="off" spellcheck="false">
<button type="submit">Разрешить чтение в ChatGPT</button>
</form>
<p>Адрес этой страницы: ${escaped(origin)}. Если вы не запрашивали подключение, просто закройте вкладку.</p>
</main></body></html>`;
  return new Response(content, { headers: {
    "content-type": "text/html; charset=utf-8", ...oauthHeaders(origin)
  } });
}
async function verifyAuthorization(
  env: OAuthEnv, params: URLSearchParams, request: Request
): Promise<{ clientId: string; redirectUri: string; clientName: string } | null> {
  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const challenge = params.get("code_challenge") ?? "";
  const scope = params.get("scope") ?? SCOPE;
  const resource = params.get("resource") ?? "";
  if (!clientId.startsWith("pw_") || params.get("response_type") !== "code" ||
      params.get("code_challenge_method") !== "S256" ||
      !/^[A-Za-z0-9_-]{43}$/.test(challenge) ||
      !scope.split(" ").includes(SCOPE) || resource !== resourceFor(request) ||
      (params.get("state") ?? "").length > 512) return null;
  const client = await vault(env, "/client", { clientId });
  if (!client.ok || !client.body.client.redirectUris.includes(redirectUri)) return null;
  return { clientId, redirectUri, clientName: client.body.client.clientName };
}
async function ownerMatches(input: string, expected: string | undefined): Promise<boolean> {
  if (!expected || expected.length < 32 || !input || input.length > 512) return false;
  const hash = async (v: string) => new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v))
  );
  const a = await hash(input), b = await hash(expected);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function oauthChallenge(request: Request): Response {
  const origin = new URL(request.url).origin;
  const resourceUrl = origin + "/.well-known/oauth-protected-resource";
  return json({ ok: false, error: "Unauthorized; connect VIIVERSION Personal Web using OAuth." }, 401,);
}
export function oauthUnauthorized(request: Request): Response {
  const resourceUrl = new URL(request.url).origin + "/.well-known/oauth-protected-resource";
  return new Response(JSON.stringify({ ok: false, error: "OAuth authentication required" }), {
    status: 401, headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
      "www-authenticate": `Bearer resource_metadata="${resourceUrl}", scope="${SCOPE}"`
    }
  });
}
export async function verifyOAuth(request: Request, env: OAuthEnv): Promise<boolean> {
  if (env.ENABLE_OAUTH !== "true") return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const resource = resourceFor(request);
  const check = await vault(env, "/verify", { token: header.slice(7), resource });
  return check.ok;
}
export async function oauthRoute(request: Request, env: OAuthEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.startsWith("/oauth/") && !path.startsWith("/.well-known/oauth-")) return null;
  if (env.ENABLE_OAUTH !== "true") return error("temporarily_unavailable", 503);
  const origin = originFor(request), resource = resourceFor(request);
  try {
    if (path === "/.well-known/oauth-protected-resource" && request.method === "GET") {
      return json({ resource, authorization_servers: [origin], scopes_supported: [SCOPE],
        bearer_methods_supported: ["header"] });
    }
    if (path === "/.well-known/oauth-authorization-server" && request.method === "GET") {
      return json({ issuer: origin,
        authorization_endpoint: origin + "/oauth/authorize",
        token_endpoint: origin + "/oauth/token",
        registration_endpoint: origin + "/oauth/register",
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["none"],
        authorization_response_iss_parameter_supported: true,
        scopes_supported: [SCOPE] });
    }
    if (path === "/oauth/register" && request.method === "POST") {
      if (!request.headers.get("content-type")?.includes("application/json")) return error("invalid_client_metadata");
      const raw = await request.text();
      if (raw.length > 3000) return error("invalid_client_metadata");
      const input = JSON.parse(raw);
      const result = await vault(env, "/register", {
        redirectUris: input.redirect_uris,
        clientName: input.client_name
      });
      if (!result.ok) return error("invalid_client_metadata", result.status);
      const client = result.body.client;
      return json({ client_id: client.clientId, client_id_issued_at: Math.floor(client.registeredAt / 1000),
        client_name: client.clientName,
        redirect_uris: client.redirectUris, grant_types: ["authorization_code","refresh_token"],
        response_types: ["code"], token_endpoint_auth_method: "none" }, 201);
    }
    if (path === "/oauth/authorize") {
      const params = request.method === "GET" ? url.searchParams :
        request.method === "POST" ? await bodyForm(request) : null;
      if (!params) return error("invalid_request", 405);
      const checked = await verifyAuthorization(env, params, request);
      if (!checked) return error("invalid_request", 400, "Invalid client, redirect, scope, audience or PKCE.");
      if (request.method === "GET") return consentHtml(params, checked.clientName, origin);
      if (!await ownerMatches(params.get("owner_token") ?? "", env.WEB_API_TOKEN)) {
        return new Response("Incorrect owner token. No authorization issued.", {
          status: 403, headers: {
            "content-type": "text/plain; charset=utf-8", ...oauthHeaders(origin)
          }
        });
      }
      const issued = await vault(env, "/code/issue", {
        clientId: checked.clientId, redirectUri: checked.redirectUri,
        challenge: params.get("code_challenge"), resource
      });
      if (!issued.ok) return error("temporarily_unavailable", issued.status);
      const callback = new URL(checked.redirectUri);
      callback.searchParams.set("code", issued.body.code);
      if (params.has("state")) callback.searchParams.set("state", params.get("state")!);
      callback.searchParams.set("iss", origin);
      return new Response(null, { status: 302, headers: {
        "location": callback.href,
        "cache-control": "no-store",
        "referrer-policy": "no-referrer"
      } });
    }
    if (path === "/oauth/token" && request.method === "POST") {
      const params = await bodyForm(request);
      const kind = params.get("grant_type"), clientId = params.get("client_id") ?? "";
      const target = params.get("resource") ?? "";
      if (target !== resource || !clientId.startsWith("pw_")) return error("invalid_grant");
      const action = kind === "authorization_code" ? "/code/redeem" :
        kind === "refresh_token" ? "/refresh" : null;
      if (!action) return error("unsupported_grant_type");
      const received = await vault(env, action, {
        clientId, resource: target,
        redirectUri: params.get("redirect_uri"),
        code: params.get("code"), verifier: params.get("code_verifier"),
        refreshToken: params.get("refresh_token")
      });
      return received.ok ? json(received.body.tokens) : error("invalid_grant");
    }
    return error("invalid_request", 404);
  } catch {
    return error("invalid_request", 400);
  }
}
