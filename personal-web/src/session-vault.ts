import { launch } from "@cloudflare/playwright";
import { InputError, publicUrl } from "./policy";
import { filterStorageState, sealSession, openSession } from "./session-crypto";
import { fillWithoutSubmit, draftTarget } from "./draft";

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
type PendingDraft = Pending & { url: string; filled: number };

export class PersonalWebVault {
  private browser: any = null;
  private context: any = null;
  private page: any = null;
  private activeLoginId: string | null = null;
  private activeDraftId: string | null = null;
  constructor(private readonly state: DurableObjectState, private readonly env: VaultEnv) {}

  private async closeLogin(): Promise<void> {
    const browser = this.browser;
    const context = this.context;
    this.browser = null; this.context = null; this.page = null; this.activeLoginId = null; this.activeDraftId = null;
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  async alarm(): Promise<void> {
    const login = await this.state.storage.get<Pending>("pending:active");
    const draft = await this.state.storage.get<PendingDraft>("pending:draft");
    const now = Date.now();
    if (login && login.expiresAt <= now) await this.state.storage.delete("pending:active");
    if (draft && draft.expiresAt <= now) await this.state.storage.delete("pending:draft");
    const active = [login, draft].filter((x): x is Pending => Boolean(x && x.expiresAt > now));
    if (!active.length) await this.closeLogin();
    else await this.state.storage.setAlarm(Math.min(...active.map(x => x.expiresAt)));
  }

  private async startDraft(data: Record<string, any>): Promise<Response> {
    if (!this.env.SESSION_VAULT_KEY || !/^[a-f0-9]{64}$/i.test(this.env.SESSION_VAULT_KEY)) {
      return Response.json({ error: "Draft session encryption is unavailable" }, { status: 503 });
    }
    const url = draftTarget(data.url, this.env.ALLOWED_HOSTS);
    const origin = new URL(url).origin;
    // Never mix manual sign-in and draft editing in the same browser.
    const login = await this.state.storage.get<Pending>("pending:active");
    const active = await this.state.storage.get<PendingDraft>("pending:draft");
    if ((login && login.expiresAt > Date.now()) || (active && active.expiresAt > Date.now())) {
      return Response.json({ error: "Finish the active browser session first" }, { status: 409 });
    }
    await this.closeLogin();
    await this.state.storage.delete("pending:draft");
    await this.state.storage.delete("pending:active");
    try {
      let state: {cookies: any[]; origins: any[]} | undefined;
      if (data.useSavedSession === true) {
        const record = await this.state.storage.get<Stored>("state:" + origin);
        if (!record || record.expiresAt <= Date.now()) {
          throw new InputError("No saved login for this site", 404);
        }
        const decrypted = await openSession(record, origin, this.env.SESSION_VAULT_KEY);
        state = filterStorageState(JSON.parse(decrypted), origin);
      }
      this.browser = await launch(this.env.BROWSER, { keep_alive: 600000 });
      this.context = await this.browser.newContext({
        ...(state ? { storageState: state } : {}),
        viewport: { width: 1365, height: 900 }, locale: "en-US"
      });
      await this.context.route("**/*", async (route: any) => {
        try { publicUrl(route.request().url()); await route.continue(); }
        catch { await route.abort(); }
      });
      this.page = await this.context.newPage();
      const result = await this.page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
      if (!result || result.status() >= 400) throw new InputError("Draft page cannot be opened", 502);
      if (new URL(draftTarget(this.page.url(), this.env.ALLOWED_HOSTS)).origin !== origin) {
        throw new InputError("Draft page redirected to another site", 409);
      }
      const cdp = await this.context.newCDPSession(this.page);
      let liveViewUrl = "";
      try {
        const view = await cdp.send("Cloudflare.getLiveView", { mode: "tab", expiresInMs: 300000 });
        liveViewUrl = String(view.devtoolsFrontendUrl ?? "");
      } finally {
        await cdp.detach().catch(() => {});
      }
      if (!liveViewUrl.startsWith("https://live.browser.run/")) {
        throw new InputError("Private Live View unavailable", 502);
      }
      const now = Date.now();
      const draft: PendingDraft = {
        id: crypto.randomUUID(), origin, url, filled: 0,
        createdAt: now, expiresAt: now + 5 * 60_000
      };
      this.activeDraftId = draft.id;
      await this.state.storage.put("pending:draft", draft);
      await this.state.storage.setAlarm(draft.expiresAt);
      return Response.json({ ok: true, draftId: draft.id, origin, url,
        liveViewUrl, expiresAt: new Date(draft.expiresAt).toISOString(),
        savedLoginUsed: Boolean(state),
        notice: "Draft editor never presses Save. Websites with autosave may still persist changes on input." });
    } catch (error) {
      await this.closeLogin();
      await this.state.storage.delete("pending:draft");
      if (error instanceof InputError) return Response.json({ error: error.message }, { status: error.status });
      return Response.json({ error: "Could not open private draft session" }, { status: 502 });
    }
  }

  private async fillDraft(data: Record<string, any>): Promise<Response> {
    const saved = await this.state.storage.get<PendingDraft>("pending:draft");
    if (!saved || data.draftId !== saved.id || saved.expiresAt <= Date.now()) {
      return Response.json({ error: "Draft session expired or not found" }, { status: 410 });
    }
    if (this.activeDraftId !== saved.id || !this.page) {
      return Response.json({ error: "Live draft browser disconnected. Start a new draft" }, { status: 409 });
    }
    if (saved.filled !== 0) return Response.json({ error: "Draft was already used; open another session" }, { status: 409 });
    try {
      if (new URL(draftTarget(this.page.url(), this.env.ALLOWED_HOSTS)).origin !== saved.origin) {
        return Response.json({ error: "Draft left its original site" }, { status: 409 });
      }
      // Limit to one fill request per draft: retrying could cause duplicate autosaves.
      await this.state.storage.put("pending:draft", { ...saved, filled: -1 });
      const result = await fillWithoutSubmit(this.page, data.fields, saved.origin);
      await this.state.storage.put("pending:draft", { ...saved, filled: result.filled });
      return Response.json({ ok: true, draftId: saved.id,
        filled: result.filled, selectors: result.selectors, url: this.page.url(),
        noSaveClicked: true,
        warning: "Some sites autosave immediately after typing. Inspect the Live View before closing." });
    } catch (error) {
      if (error instanceof InputError) return Response.json({ error: error.message }, { status: error.status });
      return Response.json({ error: "Draft fill failed; some fields may have changed" }, { status: 502 });
    }
  }

  private async draftStatus(data: Record<string, any>): Promise<Response> {
    const saved = await this.state.storage.get<PendingDraft>("pending:draft");
    if (!saved || saved.id !== data.draftId || saved.expiresAt <= Date.now()) {
      return Response.json({ error: "No active draft" }, { status: 404 });
    }
    if (!this.page || this.activeDraftId !== saved.id) {
      return Response.json({ error: "Draft browser was interrupted" }, { status: 409 });
    }
    return Response.json({ ok: true, draftId: saved.id,
      url: this.page.url(), filled: saved.filled > 0 ? saved.filled : 0,
      expiresAt: new Date(saved.expiresAt).toISOString(), noSaveClicked: true });
  }

  private async inspectDraft(data: Record<string, any>): Promise<Response> {
    const saved = await this.state.storage.get<PendingDraft>("pending:draft");
    if (!saved || saved.id !== data.draftId || saved.expiresAt <= Date.now()) {
      return Response.json({ error: "No active draft" }, { status: 404 });
    }
    if (!this.page || this.activeDraftId !== saved.id) {
      return Response.json({ error: "Live draft browser disconnected" }, { status: 409 });
    }
    if (new URL(draftTarget(this.page.url(), this.env.ALLOWED_HOSTS)).origin !== saved.origin) {
      return Response.json({ error: "Draft left its permitted website" }, { status: 409 });
    }
    // Selectors/labels only. Never inspect input.value, form text, cookies, or auth tokens.
    const fields = await this.page.locator("input,textarea,[contenteditable=true]").evaluateAll((elements: Element[]) =>
      elements.slice(0, 50).map((el) => {
        const input = el as HTMLInputElement;
        const tag = el.tagName.toLowerCase();
        const type = String(input.type ?? "").toLowerCase();
        const id = String(el.id ?? "");
        const name = String(input.name ?? "");
        const label = String(el.getAttribute("aria-label") ?? el.getAttribute("placeholder") ?? "").slice(0, 100);
        const sensitive = /(password|one.time|otp|token|secret|card)/i.test([id,name,label,type].join(" "));
        return { tag, type, name: sensitive ? "" : name,
          id: sensitive ? "" : id,
          label: sensitive ? "[sensitive field]" : label,
          supported: !sensitive && (tag === "textarea" || (tag === "input" &&
            ["", "text", "email", "search", "url", "tel"].includes(type)) || el.getAttribute("contenteditable") === "true")
        };
      }));
    return Response.json({ ok: true, draftId: saved.id, url: this.page.url(), fields });
  }

  private async closeDraft(data: Record<string, any>): Promise<Response> {
    const saved = await this.state.storage.get<PendingDraft>("pending:draft");
    if (!saved || saved.id !== data.draftId) return Response.json({ error: "No matching draft" }, { status: 404 });
    await this.state.storage.delete("pending:draft");
    await this.closeLogin();
    return Response.json({ ok: true, closed: true,
      warning: "Any edits not saved by the site may be lost." });
  }

  private async startLogin(target: unknown): Promise<Response> {
    if (!this.env.SESSION_VAULT_KEY || !/^[a-f0-9]{64}$/i.test(this.env.SESSION_VAULT_KEY)) {
      return Response.json({ error: "Session encryption key is unavailable" }, { status: 503 });
    }
    const url = publicUrl(target, this.env.ALLOWED_HOSTS);
    const origin = new URL(url).origin;
    const current = await this.state.storage.get<Pending>("pending:active");
    const draft = await this.state.storage.get<PendingDraft>("pending:draft");
    if (draft && draft.expiresAt > Date.now()) return Response.json({ error: "Finish the open draft first" }, { status: 409 });
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
    if (action === "/draft/start") return this.startDraft(data);
    if (action === "/draft/fill") return this.fillDraft(data);
    if (action === "/draft/status") return this.draftStatus(data);
    if (action === "/draft/inspect") return this.inspectDraft(data);
    if (action === "/draft/close") return this.closeDraft(data);
    if (action === "/login/commit") return this.commitLogin(data.loginId);

    // Action plans persist only a SHA-256 digest, never submitted form values.
    if (action === "/action/propose") {
      const digest = String(data.digest ?? "");
      const origin = String(data.origin ?? "");
      if (!/^[a-f0-9]{64}$/.test(digest) || !origin.startsWith("https://")) {
        return Response.json({ error: "Invalid plan" }, { status: 400 });
      }
      const pending = await storage.list<{expiresAt: number}>({ prefix: "approval:" });
      let active = 0;
      for (const [key, item] of pending) {
        if (item.expiresAt <= now) await storage.delete(key);
        else active++;
      }
      if (active >= 10) return Response.json({ error: "Too many pending plans" }, { status: 429 });
      const planId = crypto.randomUUID();
      const expiresAt = now + 3 * 60_000;
      await storage.put("approval:" + planId, { digest, origin, expiresAt, approved: false });
      return Response.json({ ok: true, planId, expiresAt: new Date(expiresAt).toISOString() });
    }
    if (action === "/action/approve") {
      const key = "approval:" + String(data.planId ?? "");
      const expiration = await storage.transaction(async txn => {
        const p = await txn.get<{digest: string; origin: string; expiresAt: number; approved: boolean}>(key);
        if (!p || p.expiresAt <= now) return null;
        await txn.put(key, { ...p, approved: true });
        return p.expiresAt;
      });
      if (!expiration) return Response.json({ error: "Plan expired or consumed" }, { status: 410 });
      return Response.json({ ok: true, expiresAt: new Date(expiration).toISOString() });
    }
    if (action === "/action/consume") {
      const key = "approval:" + String(data.planId ?? "");
      const result = await storage.transaction(async txn => {
        const p = await txn.get<{digest: string; origin: string; expiresAt: number; approved: boolean}>(key);
        if (!p || !p.approved || p.expiresAt <= now ||
            p.digest !== data.digest || p.origin !== data.origin) return false;
        await txn.delete(key);
        return true;
      });
      return result ? Response.json({ ok: true }) :
        Response.json({ error: "Explicit approval is required for this exact plan" }, { status: 403 });
    }

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
