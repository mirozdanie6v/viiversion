import { InputError, publicUrl } from "./policy";
import { readRenderedPage } from "./extract";

/**
 * Read-only navigation under one Playwright browser context. Does not click
 * buttons, submit forms, fill fields, run arbitrary JS, or reuse login state.
 * Following a link navigates to an href actually present in the current page.
 */
type ExploreStep =
  | { type: "follow"; href: string }
  | { type: "scroll"; pixels: number }
  | { type: "wait"; milliseconds: number }
  | { type: "read" };

function stepsFrom(data: Record<string, any>): ExploreStep[] {
  const input = data.steps ?? [];
  if (!Array.isArray(input) || input.length > 6) throw new InputError("steps must be an array of up to 6");
  return input.map((step: any) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) throw new InputError("Invalid navigation step");
    if (step.type === "follow" && typeof step.href === "string" && step.href.length <= 2048)
      return { type: "follow", href: step.href };
    if (step.type === "scroll" && Number.isInteger(step.pixels) && Math.abs(step.pixels) <= 2400)
      return { type: "scroll", pixels: step.pixels };
    if (step.type === "wait" && Number.isInteger(step.milliseconds) && step.milliseconds >= 0 && step.milliseconds <= 2000)
      return { type: "wait", milliseconds: step.milliseconds };
    if (step.type === "read") return { type: "read" };
    throw new InputError("Unsupported or invalid read-only navigation step");
  });
}

async function snapshot(page: any): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const readable = (x: Element | null) => String(x?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 110);
    const links = Array.from(document.querySelectorAll("a[href]")).slice(0, 80)
      .map((e) => ({ text: readable(e), href: (e as HTMLAnchorElement).href }))
      .filter(x => x.href.startsWith("https:"));
    const controls = Array.from(document.querySelectorAll("button,input,select,textarea,[role=button]")).slice(0, 50)
      .map((e) => {
        const input = e as HTMLInputElement;
        return { tag: e.tagName.toLowerCase(), type: String(input.type ?? "").slice(0, 30),
          name: String(input.name ?? "").slice(0, 80),
          id: String(input.id ?? "").slice(0, 80),
          label: String(e.getAttribute("aria-label") ?? readable(e)).slice(0, 110),
          disabled: Boolean(input.disabled) };
      });
    const forms = Array.from(document.querySelectorAll("form")).slice(0, 15)
      .map(f => ({ method: f.method, action: f.action,
        inputs: f.querySelectorAll("input,select,textarea").length }));
    // Deliberately never return form values, cookies, tokens, or localStorage.
    return { links, controls, forms };
  });
}

export async function explorePublicPage(
  page: any, data: Record<string, any>, allowedHosts = ""
): Promise<Record<string, unknown>> {
  const start = publicUrl(data.url, allowedHosts);
  const initialOrigin = new URL(start).origin;
  const restrictedToOrigin = data.stayOnOrigin === true;
  const steps = stepsFrom(data);
  const response = await page.goto(start, { waitUntil: "domcontentloaded", timeout: 20000 });
  if (!response || response.status() >= 400) throw new InputError("Page returned HTTP " + (response?.status() ?? "no response"), 502);
  let current = publicUrl(page.url(), allowedHosts);
  if (restrictedToOrigin && new URL(current).origin !== initialOrigin) throw new InputError("Navigation left saved origin", 409);
  const history: Array<{ step: string; url: string; title: string }> = [];
  const readings: Array<{ url: string; title: string; markdown: string }> = [];
  for (const step of steps) {
    if (step.type === "follow") {
      const target = publicUrl(new URL(step.href, current).toString(), allowedHosts);
      if (restrictedToOrigin && new URL(target).origin !== initialOrigin) {
        throw new InputError("Authenticated navigation must stay on the saved site's origin", 403);
      }
      const found = await page.locator("a[href]").evaluateAll((elements: Element[], wanted: string) =>
        elements.some(e => (e as HTMLAnchorElement).href === wanted), target);
      if (!found) throw new InputError("Follow target is not a link on the current page", 403);
      const result = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
      if (!result || result.status() >= 400) throw new InputError("Navigation HTTP " + (result?.status() ?? "no response"), 502);
    } else if (step.type === "scroll") {
      await page.mouse.wheel(0, step.pixels);
      await page.waitForTimeout(250);
    } else if (step.type === "wait") {
      await page.waitForTimeout(step.milliseconds);
    }
    current = publicUrl(page.url(), allowedHosts);
    if (restrictedToOrigin && new URL(current).origin !== initialOrigin) {
      throw new InputError("Navigation left the authorized site's origin", 409);
    }
    if (step.type === "read") {
      const doc = await readRenderedPage(page, 7000);
      readings.push({ url: doc.url, title: doc.title, markdown: doc.markdown.slice(0, 7000) });
    }
    history.push({ step: step.type, url: current, title: await page.title() });
  }
  const doc = await readRenderedPage(page, 12000);
  const inspect = data.inspect === false ? null : await snapshot(page);
  return { ok: true, startUrl: start, finalUrl: current,
    document: { url: doc.url, title: doc.title, description: doc.description,
      markdown: doc.markdown.slice(0, 12000), links: doc.links.slice(0, 120) },
    history, readings, ...(inspect ? { pageControls: inspect } : {}) };
}
