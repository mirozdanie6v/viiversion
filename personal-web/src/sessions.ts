import { launch } from "@cloudflare/playwright";
import { InputError, publicUrl } from "./policy";
import { openSession, sealSession, filterStorageState } from "./session-crypto";
import { readRenderedPage } from "./extract";

interface SessionEnv {
  BROWSER: Fetcher;
  VAULT: DurableObjectNamespace;
  ALLOWED_HOSTS?: string;
  SESSION_VAULT_KEY?: string;
}

type Pending = {
  id: string;
  origin: string;
  browserSessionId: string;
  createdAt: number;
  expiresAt: number;
};

type Saved = {
  origin: string;
  ciphertext: string;
  iv: string;
  createdAt: number;
  expiresAt: number;
  cookieCount: number;
};

function requireVault(env: SessionEnv): string {
  if (!env.VAULT || !env.BROWSER || !env.SESSION_VAULT_KEY ||
      !/^[a-f0-9]{64}$/i.test(env.SESSION_VAULT_KEY)) {
    throw new InputError("Encrypted browser session vault is not configured", 503);
  }
  return env.SESSION_VAULT_KEY;
}

async function vault<T>(env: SessionEnv, action: string, data: unknown): Promise<T> {
  const id = env.VAULT.idFromName("private-personal-web-owner");
  const response = await env.VAULT.get(id).fetch("https://vault.internal" + action, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json() as any;
  if (!response.ok) throw new InputError(result.error ?? "Session vault error", response.status);
  return result as T;
}

async function protectContext(context: any): Promise<void> {
  await context.route("**/*", async (route: any) => {
    try { publicUrl(route.request().url()); await route.continue(); }
    catch { await route.abort(); }
  });
}

/**
 * The owner-scoped Durable Object owns both the browser and the login state.
 * We do not disconnect from Chrome between starting and committing a login.
 */
export async function beginBrowserLogin(env: SessionEnv, input: unknown) {
  requireVault(env);
  const target = publicUrl(input, env.ALLOWED_HOSTS);
  return vault(env, "/login/start", { url: target });
}

export async function finishBrowserLogin(env: SessionEnv, loginId: unknown) {
  requireVault(env);
  if (typeof loginId !== "string" || !/^[0-9a-f-]{36}$/i.test(loginId)) {
    throw new InputError("loginId must be a valid UUID");
  }
  return vault(env, "/login/commit", { loginId });
}

export async function listBrowserLogins(env: SessionEnv) {
  requireVault(env);
  return vault(env, "/state/list", {});
}

export async function revokeBrowserLogin(env: SessionEnv, target: unknown) {
  requireVault(env);
  const url = publicUrl(target, env.ALLOWED_HOSTS);
  const origin = new URL(url).origin;
  await vault(env, "/state/delete", { origin });
  return { ok: true, origin, revoked: true };
}

export async function scrapeWithSavedLogin(env: SessionEnv, input: unknown) {
  const key = requireVault(env);
  const target = publicUrl(input, env.ALLOWED_HOSTS);
  const origin = new URL(target).origin;
  const { session } = await vault<{ session: Saved }>(env, "/state/get", { origin });
  const raw = await openSession(session, origin, key);
  const state = filterStorageState(JSON.parse(raw), origin);

  const browser = await launch(env.BROWSER);
  let context: any;
  try {
    context = await browser.newContext({
      storageState: state, viewport: { width: 1280, height: 900 }, locale: "en-US"
    });
    await protectContext(context);
    const page = await context.newPage();
    const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 25000 });
    if (!response || response.status() >= 400) {
      throw new InputError("Authenticated page returned HTTP " + (response?.status() ?? "no response"), 502);
    }
    await page.waitForTimeout(500);
    const final = publicUrl(page.url(), env.ALLOWED_HOSTS);
    if (new URL(final).origin !== origin) {
      throw new InputError("Saved login navigated to an unexpected origin", 409);
    }
    const document = await readRenderedPage(page, 40000);

    // Refresh rotated cookies only after a successful same-origin navigation.
    const updated = filterStorageState(await context.storageState({ indexedDB: true }), origin);
    const sealed = await sealSession(JSON.stringify(updated), origin, key);
    await vault(env, "/state/put", { value: {
      ...sealed, origin, createdAt: session.createdAt, expiresAt: session.expiresAt,
      cookieCount: updated.cookies.length
    } satisfies Saved });

    return { ok: true, document, sessionOrigin: origin, authenticated: "session-reused" };
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
