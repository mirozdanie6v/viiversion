import { acquire, connect, launch } from "@cloudflare/playwright";
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

async function closeRemote(env: SessionEnv, sessionId: string): Promise<void> {
  const binding = env.BROWSER as any;
  if (typeof binding.closeSession === "function") {
    await binding.closeSession(sessionId).catch(() => {});
  }
}

async function protectContext(context: any): Promise<void> {
  await context.route("**/*", async (route: any) => {
    try { publicUrl(route.request().url()); await route.continue(); }
    catch { await route.abort(); }
  });
}

export async function beginBrowserLogin(env: SessionEnv, input: unknown) {
  requireVault(env);
  const target = publicUrl(input, env.ALLOWED_HOSTS);
  const origin = new URL(target).origin;
  const { sessionId } = await acquire(env.BROWSER, { keep_alive: 600000 });
  let browser: any;
  try {
    browser = await connect(env.BROWSER, sessionId);
    const context = await browser.newContext({
      viewport: { width: 1365, height: 900 }, locale: "en-US"
    });
    await protectContext(context);
    const page = await context.newPage();
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 25000 });

    const cdp = await context.newCDPSession(page);
    let liveViewUrl: string;
    try {
      const view = await cdp.send("Cloudflare.getLiveView", {
        mode: "tab", expiresInMs: 300000
      });
      liveViewUrl = view.devtoolsFrontendUrl;
    } finally {
      await cdp.detach().catch(() => {});
    }
    if (!liveViewUrl || !liveViewUrl.startsWith("https://live.browser.run/")) {
      throw new InputError("Cloudflare did not return a valid Live View URL", 502);
    }

    const now = Date.now();
    const pending: Pending = {
      id: crypto.randomUUID(), origin, browserSessionId: sessionId,
      createdAt: now, expiresAt: now + 8 * 60_000
    };
    await vault(env, "/pending/create", { value: pending });
    return {
      ok: true, loginId: pending.id, origin, liveViewUrl,
      expiresAt: new Date(pending.expiresAt).toISOString(),
      instructions: "Open Live View, log in yourself, return to the original site, then call session/commit. Treat this URL as a secret."
    };
  } catch (error) {
    await closeRemote(env, sessionId);
    throw error;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export async function finishBrowserLogin(env: SessionEnv, loginId: unknown) {
  const key = requireVault(env);
  if (typeof loginId !== "string" || !/^[0-9a-f-]{36}$/i.test(loginId)) {
    throw new InputError("loginId must be a valid UUID");
  }
  const { pending } = await vault<{ pending: Pending }>(env, "/pending/get", { id: loginId });
  const browser = await connect(env.BROWSER, pending.browserSessionId);
  try {
    const context = browser.contexts()[0];
    const page = context?.pages()[0];
    if (!context || !page) throw new InputError("Remote login session is no longer available", 409);
    const url = publicUrl(page.url(), env.ALLOWED_HOSTS);
    if (new URL(url).origin !== pending.origin) {
      throw new InputError("Complete login and return to the requested site before saving", 409);
    }
    const state = filterStorageState(await context.storageState({ indexedDB: true }), pending.origin);
    const sealed = await sealSession(JSON.stringify(state), pending.origin, key);
    const now = Date.now();
    const saved: Saved = {
      ...sealed, origin: pending.origin, createdAt: now,
      expiresAt: now + 7 * 24 * 3600 * 1000, cookieCount: state.cookies.length
    };
    await vault(env, "/state/put", { value: saved });
    await vault(env, "/pending/consume", { id: loginId });
    return {
      ok: true, origin: pending.origin,
      cookieCount: saved.cookieCount, expiresAt: new Date(saved.expiresAt).toISOString(),
      warning: state.cookies.length === 0 && state.origins.length === 0
        ? "No persistent cookies or local storage were detected; this login may not survive browser restart."
        : null
    };
  } finally {
    await browser.close().catch(() => {});
    await closeRemote(env, pending.browserSessionId);
  }
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
