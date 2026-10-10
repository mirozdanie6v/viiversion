import { launch } from "@cloudflare/playwright";
import { InputError, publicUrl } from "./policy";
import { filterStorageState, sealSession } from "./session-crypto";

interface VaultEnv {
  BROWSER: Fetcher;
  ALLOWED_HOSTS?: string;
  SESSION_VAULT_KEY?: string;
}

/**
 * Single-owner Durable Object: encrypted storage plus a live, in-memory Chrome
 * connection during short manual login handoffs. No web credentials are logged.
 * Login is fail-closed if the DO instance is evicted mid-handoff.
 */
type Stored = {
  origin: string;
  ciphertext: string;
  iv: string;
  createdAt: number;
  expiresAt: number;
  cookieCount: number;
};
type Pending = { id: string; origin: string; createdAt: number; expiresAt: number };

export class PersonalWebVault {
  private browser: any = null;
  private context: any = null;
  private page: any = null;
  private activeLoginId: string | null = null;
  constructor(private readonly state: DurableObjectState, private readonly env: VaultEnv) {}

  private async closeLogin(): Promise<void> {
    const browser = this.browser;
    const context = this.context;
    this.browser = null; this.context = null; this.page = null; this.activeLoginId = null;
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  async alarm(): Promise<void> {
    const pending = await this.state.storage.get<Pending>("pending:active");
    if (!pending || pending.expiresAt <= Date.now()) {
      await this.closeLogin();
      await this.state.storage.delete("pending:active");
    } else {
      await this.state.storage.setAlarm(pending.expiresAt);
    }
  }

  private async startLogin(target: unknown): Promise<Response> {
    if (!this.env.SESSION_VAULT_KEY || !/^[a-f0-9]{64}$/i.test(this.env.SESSION_VAULT_KEY)) {
      return Response.json({ error: "Session encryption key is unavailable" }, { status: 503 });
    }
    const url = publicUrl(target, this.env.ALLOWED_HOSTS);
    const origin = new URL(url).origin;
    const current = await this.state.storage.get<Pending>("pending:active");
    if (current && current.expiresAt > Date.now()) {
      return Response.json({ error: "A manual browser login is already active" }, { status: 409 });
    }
    await this.closeLogin();
    await this.state.storage.delete("pending:active");
    try {
      // Keep the connected Playwright browser in the DO for both requests.
      // browser.close() is called only after commit/expiry, never after start.
      const browser = await launch(this.env.BROWSER, { keep_alive: 600000 });
      this.browser = browser;
      const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
      this.context = context;
      await context.route("**/*", async (route: any) => {
        try { publicUrl(route.request().url()); await route.continue(); }
        catch { await route.abort(); }
      });
      const page = await context.newPage();
      this.page = page;
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
      if (!response || response.status() >= 400) {
        throw new InputError("Requested site did not open for login", 502);
      }
      const cdp = await context.newCDPSession(page);
      let liveViewUrl: string;
      try {
        const view = await cdp.send("Cloudflare.getLiveView", { mode: "tab", expiresInMs: 300000 });
        liveViewUrl = view.devtoolsFrontendUrl;
      } finally {
        await cdp.detach().catch(() => {});
      }
      if (!liveViewUrl || !liveViewUrl.startsWith("https://live.browser.run/")) {
        throw new InputError("Live View is unavailable", 502);
      }
      const now = Date.now();
      const pending: Pending = {
        id: crypto.randomUUID(), origin, createdAt: now, expiresAt: now + 8 * 60_000
      };
      this.activeLoginId = pending.id;
      await this.state.storage.put("pending:active", pending);
      await this.state.storage.setAlarm(pending.expiresAt);
      return Response.json({
        ok: true, loginId: pending.id, origin,
        liveViewUrl, expiresAt: new Date(pending.expiresAt).toISOString(),
        instructions: "Open the private Live View URL, sign in, navigate back to this origin and commit before expiry."
      });
    } catch (error) {
      await this.closeLogin();
      await this.state.storage.delete("pending:active");
      if (error instanceof InputError) return Response.json({ error: error.message }, { status: error.status });
      return Response.json({ error: "Could not create live browser session" }, { status: 502 });
    }
  }

  private async commitLogin(loginId: unknown): Promise<Response> {
    const pending = await this.state.storage.get<Pending>("pending:active");
    if (typeof loginId !== "string" || !pending || loginId !== pending.id) {
      return Response.json({ error: "Invalid login session" }, { status: 404 });
    }
    if (pending.expiresAt <= Date.now()) {
      await this.closeLogin();
      await this.state.storage.delete("pending:active");
      return Response.json({ error: "Manual login window expired" }, { status: 410 });
    }
    if (!this.page || !this.context || this.activeLoginId !== pending.id) {
      return Response.json({
        error: "The live Chrome connection was interrupted. Start login again."
      }, { status: 409 });
    }
    try {
      const url = publicUrl(this.page.url(), this.env.ALLOWED_HOSTS);
      if (new URL(url).origin !== pending.origin) {
        return Response.json({
          error: "Return to the original website before saving the login"
        }, { status: 409 });
      }
      const state = filterStorageState(
        await this.context.storageState({ indexedDB: true }), pending.origin
      );
      const sealed = await sealSession(
        JSON.stringify(state), pending.origin, this.env.SESSION_VAULT_KEY!
      );
      const now = Date.now();
      const saved: Stored = {
        ...sealed, origin: pending.origin, createdAt: now,
        expiresAt: now + 7 * 24 * 3600 * 1000, cookieCount: state.cookies.length
      };
      const existing = await this.state.storage.list<Stored>({ prefix: "state:" });
      if (existing.size >= 8 && !existing.has("state:" + saved.origin)) {
        return Response.json({ error: "Maximum eight saved sites" }, { status: 409 });
      }
      await this.state.storage.put("state:" + saved.origin, saved);
      await this.state.storage.delete("pending:active");
      await this.closeLogin();
      return Response.json({
        ok: true, origin: saved.origin, cookieCount: saved.cookieCount,
        expiresAt: new Date(saved.expiresAt).toISOString(),
        warning: state.cookies.length === 0 && state.origins.length === 0
          ? "No persistent site state was found; this may not be an authenticated session." : null
      });
    } catch {
      return Response.json({ error: "Could not safely capture the browser's session" }, { status: 502 });
    }
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });
    let data: Record<string, any>;
    try { data = await request.json() as Record<string, any>; }
    catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
    const action = new URL(request.url).pathname;
    const now = Date.now();
    const storage = this.state.storage;

    if (action === "/login/start") return this.startLogin(data.url);
    if (action === "/login/commit") return this.commitLogin(data.loginId);

    if (action === "/state/put") {
      const item = data.value as Stored;
      if (!item || item.expiresAt <= now || item.expiresAt > now + 8 * 24 * 3600 * 1000 ||
        typeof item.iv !== "string" || typeof item.ciphertext !== "string" ||
        typeof item.origin !== "string") {
        return Response.json({ error: "Invalid stored session" }, { status: 400 });
      }
      const existing = await storage.list<Stored>({ prefix: "state:" });
      if (existing.size >= 8 && !existing.has("state:" + item.origin)) {
        return Response.json({ error: "Maximum eight saved sites" }, { status: 409 });
      }
      await storage.put("state:" + item.origin, item);
      return Response.json({ ok: true });
    }
    if (action === "/state/get") {
      const origin = String(data.origin ?? "");
      const item = await storage.get<Stored>("state:" + origin);
      if (!item || item.expiresAt <= now) {
        if (item) await storage.delete("state:" + origin);
        return Response.json({ error: "No saved session" }, { status: 404 });
      }
      return Response.json({ ok: true, session: item });
    }
    if (action === "/state/list") {
      const records = await storage.list<Stored>({ prefix: "state:" });
      const out: Array<Pick<Stored, "origin" | "createdAt" | "expiresAt" | "cookieCount">> = [];
      for (const [key, item] of records) {
        if (item.expiresAt <= now) { await storage.delete(key); continue; }
        out.push({
          origin: item.origin, createdAt: item.createdAt,
          expiresAt: item.expiresAt, cookieCount: item.cookieCount
        });
      }
      return Response.json({ ok: true, sessions: out });
    }
    if (action === "/state/delete") {
      await storage.delete("state:" + String(data.origin ?? ""));
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Unknown vault operation" }, { status: 404 });
  }
}
