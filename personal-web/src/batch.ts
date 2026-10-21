import { InputError, publicUrl } from "./policy";
import { readRenderedPage } from "./extract";

/** Bounded multi-site public research within one Browser Run invocation. */
export async function batchReadPublic(
  page: any, input: unknown, allowedHosts = ""
): Promise<Record<string, unknown>> {
  if (!Array.isArray(input) || input.length < 1 || input.length > 4) {
    throw new InputError("urls must contain 1–4 public HTTPS pages");
  }
  const urls = input.map(url => publicUrl(url, allowedHosts));
  const documents: Record<string, unknown>[] = [];
  for (const url of urls) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded", timeout: 18000
      });
      if (!response || response.status() >= 400) {
        documents.push({ ok: false, requestedUrl: url, status: response?.status() ?? null });
        continue;
      }
      const final = publicUrl(page.url(), allowedHosts);
      await page.waitForTimeout(350);
      const doc = await readRenderedPage(page, 7000);
      documents.push({
        ok: true, requestedUrl: url, url: final,
        title: doc.title, description: doc.description,
        markdown: doc.markdown.slice(0, 6500),
        links: doc.links.slice(0, 40)
      });
    } catch (error) {
      documents.push({
        ok: false, requestedUrl: url,
        error: error instanceof InputError ? error.message : "Page could not be rendered"
      });
    }
  }
  return { ok: true, requested: urls.length,
    completed: documents.filter(item => item.ok).length, documents };
}
