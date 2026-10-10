import { launch } from "@cloudflare/playwright";
import { handleMcp } from "./mcp";
import { beginBrowserLogin, finishBrowserLogin, listBrowserLogins, revokeBrowserLogin, scrapeWithSavedLogin } from "./sessions";
export { PersonalWebVault } from "./session-vault";
import { InputError, publicUrl, canonicalSiteLink, robotsAllows } from "./policy";
import { readRenderedPage, extractFields, type PageDocument } from "./extract";

interface Env {
  BROWSER: Fetcher;
  VAULT: DurableObjectNamespace;
  SESSION_VAULT_KEY?: string;
  ENABLE_SAVED_SESSIONS?: string;
  WEB_API_TOKEN?: string;
  ALLOWED_HOSTS?: string;
  MAX_CRAWL_PAGES?: string;
  ENABLE_INTERACT?: string;
}

const NAME = "viiversion-personal-web";
const VERSION = "0.1.0";
const MAX_BODY = 16000;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: {
    "cache-control": "no-store", "x-content-type-options": "nosniff"
  } });
}

function errorResponse(error: unknown): Response {
  if (error instanceof InputError) return json({ ok: false, error: error.message }, error.status);
  console.error("Personal Web request failed:", error instanceof Error ? error.message : String(error));
  return json({ ok: false, error: "Browser operation failed" }, 502);
}

function authorized(request: Request, env: Env): boolean {
  const key = env.WEB_API_TOKEN;
  if (!key || key.length < 32) return false;
  return request.headers.get("authorization") === "Bearer " + key;
}

async function parseBody(request: Request): Promise<Record<string, any>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new InputError("Content-Type must be application/json");
  }
  const text = await request.text();
  if (text.length > MAX_BODY) throw new InputError("Request body exceeds 16KB");
  try {
    const data: unknown = JSON.parse(text);
    if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, any>;
  } catch { /* handled below */ }
  throw new InputError("A JSON object is required");
}

async function withBrowser<T>(env: Env, work: (page: any) => Promise<T>): Promise<T> {
  if (!env.BROWSER) throw new InputError("Browser Run binding is unavailable", 503);
  const browser = await launch(env.BROWSER);
  let context: any;
  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-US" });
    const page = await context.newPage();

    // Never allow public API inputs or third-party page resources to reach
    // loopback, internal hostnames, IP literals, or non-HTTPS schemes.
    await page.route("**/*", async (route: any) => {
      const url = route.request().url();
      try { publicUrl(url); await route.continue(); }
      catch { await route.abort(); }
    });

    return await work(page);
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function visit(page: any, input: string, env: Env): Promise<string> {
  const target = publicUrl(input, env.ALLOWED_HOSTS);
  const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
  if (!response || response.status() >= 400) {
    throw new InputError("Page returned HTTP " + (response?.status() ?? "no response"), 502);
  }
  await page.waitForTimeout(400);
  // The destination may differ because of a redirect or a JS navigation.
  return publicUrl(page.url(), env.ALLOWED_HOSTS);
}

async function robotsForSite(origin: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(new URL("/robots.txt", origin), {
      headers: { "user-agent": "VIIVERSION-Personal-Web/0.1" },
      redirect: "manual",
      signal: AbortSignal.timeout(6000)
    });
  } catch {
    throw new InputError("Could not validate robots.txt; automatic crawl stopped", 502);
  }
  if (response.status === 404 || response.status === 410) return "";
  if (!response.ok || response.status >= 300) {
    throw new InputError("Could not validate robots.txt; automatic crawl stopped", 502);
  }
  return (await response.text()).slice(0, 64_000);
}

function checkRobots(robots: string, url: string): void {
  const address = new URL(url);
  if (!robotsAllows(robots, address.pathname + address.search)) {
    throw new InputError("Crawling this path is disallowed by robots.txt", 403);
  }
}

async function walkSite(
  page: any, env: Env, inputUrl: string, mode: "map" | "crawl",
  requestedPages: number, requestedDepth: number
): Promise<Record<string, unknown>> {
  const start = publicUrl(inputUrl, env.ALLOWED_HOSTS);
  const origin = new URL(start).origin;
  const robots = await robotsForSite(origin);
  checkRobots(robots, start);
  if (!Number.isInteger(requestedPages) || requestedPages < 1 || requestedPages > 8) {
    throw new InputError("limit must be an integer from 1 to 8");
  }
  if (!Number.isInteger(requestedDepth) || requestedDepth < 0 || requestedDepth > 2) {
    throw new InputError("depth must be an integer from 0 to 2");
  }
  const limit = Math.min(requestedPages, Math.min(8, Number(env.MAX_CRAWL_PAGES) || 8));
  const depthLimit = Math.min(Math.max(0, requestedDepth), 2);
  const pending: Array<{ url: string; depth: number }> = [{ url: start, depth: 0 }];
  const queued = new Set([start]);
  const visited = new Set<string>();
  const discovered = new Set<string>([start]);
  const documents: PageDocument[] = [];
  const errors: Array<{ url: string; error: string }> = [];
  const started = Date.now();

  while (pending.length && visited.size < limit && Date.now() - started < 45000) {
    const next = pending.shift()!;
    if (visited.has(next.url)) continue;
    visited.add(next.url);

    try {
      checkRobots(robots, next.url);
      const final = await visit(page, next.url, env);
      if (new URL(final).origin !== origin) {
        errors.push({ url: next.url, error: "Redirected outside the requested site" });
        continue;
      }
      checkRobots(robots, final);
      const document = await readRenderedPage(page, mode === "crawl" ? 40000 : 3000);
      if (mode === "crawl") documents.push(document);
      for (const href of document.links) {
        const child = canonicalSiteLink(href, origin, env.ALLOWED_HOSTS);
        if (!child || discovered.size >= 300) continue;
        if (!robotsAllows(robots, new URL(child).pathname + new URL(child).search)) continue;
        discovered.add(child);
        if (next.depth < depthLimit && !queued.has(child)) {
          pending.push({ url: child, depth: next.depth + 1 });
          queued.add(child);
        }
      }
    } catch (error) {
      errors.push({ url: next.url, error: error instanceof Error ? error.message : "Read failed" });
    }
    if (pending.length) await page.waitForTimeout(300);
  }

  return {
    ok: true, startUrl: start, visitedPages: visited.size,
    urls: [...discovered], errors,
    ...(mode === "crawl" ? { documents } : {}),
    partial: pending.length > 0 || errors.length > 0
  };
}

type BrowserAction =
  | { type: "click"; selector: string }
  | { type: "fill"; selector: string; value: string }
  | { type: "select"; selector: string; value: string }
  | { type: "scroll"; pixels: number }
  | { type: "wait"; milliseconds: number };

async function interact(page: any, env: Env, data: Record<string, any>) {
  if (env.ENABLE_INTERACT !== "true") throw new InputError("Interactive mode is disabled", 403);
  const actions: BrowserAction[] = data.actions;
  if (!Array.isArray(actions) || actions.length > 10) throw new InputError("actions must be an array of up to 10 steps");
  const initial = await visit(page, data.url, env);
  const results: Array<{ type: string; url: string }> = [];

  for (const action of actions) {
    if (!action || typeof action !== "object") throw new InputError("Invalid browser action");
    if (action.type === "wait") {
      if (!Number.isInteger(action.milliseconds) || action.milliseconds < 0 || action.milliseconds > 3000) {
        throw new InputError("Invalid wait duration");
      }
      await page.waitForTimeout(action.milliseconds);
    } else if (action.type === "scroll") {
      if (!Number.isInteger(action.pixels) || Math.abs(action.pixels) > 3000) throw new InputError("Invalid scroll distance");
      await page.mouse.wheel(0, action.pixels);
    } else if (["click", "fill", "select"].includes(action.type)) {
      if (typeof action.selector !== "string" || !action.selector || action.selector.length > 200) {
        throw new InputError("Invalid CSS selector");
      }
      const target = page.locator(action.selector).first();
      if (action.type === "click") await target.click({ timeout: 5000 });
      else {
        if (typeof (action as any).value !== "string" || (action as any).value.length > 4000) {
          throw new InputError("Invalid field value");
        }
        if (action.type === "fill") await target.fill((action as any).value, { timeout: 5000 });
        else await target.selectOption((action as any).value, { timeout: 5000 });
      }
    } else throw new InputError("Unsupported browser action");

    // Navigation and page-origin validation after each step.
    publicUrl(page.url(), env.ALLOWED_HOSTS);
    results.push({ type: action.type, url: page.url() });
  }
  return { ok: true, initialUrl: initial, actions: results, document: await readRenderedPage(page, 40000) };
}

async function handle(request: Request, env: Env): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (request.method === "GET" && pathname === "/health") {
    return json({ ok: true, name: NAME, version: VERSION, configured: Boolean(env.WEB_API_TOKEN && env.WEB_API_TOKEN.length >= 32) });
  }
  if (!authorized(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
  if (pathname === "/mcp") {
    return handleMcp(request, async (path, params) => handle(
      new Request(new URL(path, request.url), {
        method: "POST",
        headers: {
          "authorization": request.headers.get("authorization") ?? "",
          "content-type": "application/json"
        },
        body: JSON.stringify(params)
      }),
      env
    ));
  }
  if (request.method !== "POST") return json({ ok: false, error: "POST required" }, 405);
  if (!["/v1/scrape", "/v1/map", "/v1/crawl", "/v1/extract", "/v1/interact", "/v1/screenshot",
    "/v1/session/start", "/v1/session/commit", "/v1/session/list", "/v1/session/revoke", "/v1/session/scrape"].includes(pathname)) {
    return json({ ok: false, error: "Unknown operation" }, 404);
  }

  try {
    const data = await parseBody(request);
    if (pathname.startsWith("/v1/session/") && env.ENABLE_SAVED_SESSIONS !== "true") {
      throw new InputError("Saved browser sessions are not enabled until live verification passes", 503);
    }
    if (pathname === "/v1/session/start") return json(await beginBrowserLogin(env, data.url));
    if (pathname === "/v1/session/commit") return json(await finishBrowserLogin(env, data.loginId));
    if (pathname === "/v1/session/list") return json(await listBrowserLogins(env));
    if (pathname === "/v1/session/revoke") return json(await revokeBrowserLogin(env, data.url));
    if (pathname === "/v1/session/scrape") return json(await scrapeWithSavedLogin(env, data.url));
    const target = publicUrl(data.url, env.ALLOWED_HOSTS);
    if (pathname === "/v1/interact" && env.ENABLE_INTERACT !== "true") {
      throw new InputError("Interactive mode is disabled", 403);
    }
    return await withBrowser(env, async page => {
      if (pathname === "/v1/map" || pathname === "/v1/crawl") {
        return json(await walkSite(page, env, target, pathname === "/v1/map" ? "map" : "crawl",
          Number(data.limit ?? (pathname === "/v1/map" ? 5 : 3)),
          Number(data.depth ?? 1)));
      }
      if (pathname === "/v1/interact") return json(await interact(page, env, data));
      const final = await visit(page, target, env);
      if (pathname === "/v1/screenshot") {
        const bytes = await page.screenshot({ fullPage: data.fullPage !== false, timeout: 15000 });
        return new Response(bytes, { headers: {
          "content-type": "image/png", "cache-control": "no-store", "x-content-type-options": "nosniff"
        } });
      }
      if (pathname === "/v1/extract") {
        if (!data.fields || typeof data.fields !== "object" || Array.isArray(data.fields)) {
          throw new InputError("fields must contain CSS selectors");
        }
        try { return json({ ok: true, url: final, data: await extractFields(page, data.fields) }); }
        catch (error) { throw new InputError(error instanceof Error ? error.message : "Invalid selectors"); }
      }
      return json({ ok: true, document: await readRenderedPage(page, 40000) });
    });
  } catch (error) { return errorResponse(error); }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env);
  }
} satisfies ExportedHandler<Env>;

export { handle as handlePersonalWebRequest };
