export interface PageDocument {
  url: string;
  title: string;
  description: string;
  markdown: string;
  links: string[];
  truncated: boolean;
}

/**
 * Executes inside Chromium, after JavaScript rendering. Intentionally has no
 * model dependency, arbitrary script input, or access to stored credentials.
 */
export async function readRenderedPage(page: any, maxChars = 40000): Promise<PageDocument> {
  return page.evaluate((cap: number) => {
    const omit = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "IFRAME", "TEMPLATE", "NAV", "FOOTER"]);
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
    const inline = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue ?? "").replace(/\s+/g, " ");
      if (!(node instanceof Element) || omit.has(node.tagName)) return "";
      if (node.getAttribute("aria-hidden") === "true") return "";
      const content = Array.from(node.childNodes).map(inline).join("");
      if (node.tagName === "BR") return "\n";
      if (node.tagName === "A") {
        const href = (node as HTMLAnchorElement).href;
        const label = normalize(content);
        return label && /^https?:/.test(href) ? "[" + label + "](" + href + ")" : content;
      }
      if (node.tagName === "STRONG" || node.tagName === "B") return "**" + content.trim() + "**";
      if (node.tagName === "EM" || node.tagName === "I") return "*" + content.trim() + "*";
      if (node.tagName === "CODE") return "`" + content.trim().replace(/`/g, "") + "`";
      if (node.tagName === "IMG") {
        const image = node as HTMLImageElement;
        return image.alt && image.src ? "![" + image.alt + "](" + image.src + ")" : "";
      }
      return content;
    };
    const render = (element: Element): string => {
      if (omit.has(element.tagName) || element.getAttribute("aria-hidden") === "true") return "";
      const name = element.tagName.toLowerCase();
      if (/^h[1-6]$/.test(name)) return "\n\n" + "#".repeat(Number(name[1])) + " " + normalize(inline(element)) + "\n\n";
      if (name === "p" || name === "blockquote") {
        const body = normalize(inline(element));
        return body ? "\n\n" + (name === "blockquote" ? "> " : "") + body + "\n\n" : "";
      }
      if (name === "li") return "\n- " + normalize(inline(element));
      if (name === "pre") return "\n\n```\n" + (element.textContent ?? "").slice(0, 5000) + "\n```\n\n";
      if (name === "tr") {
        const cells = Array.from(element.querySelectorAll(":scope > th, :scope > td"));
        return cells.length ? "\n| " + cells.map(c => normalize(inline(c))).join(" | ") + " |" : "";
      }
      if (name === "img" || name === "a" || name === "button") return inline(element);
      return Array.from(element.childNodes).map(n => n instanceof Element ? render(n) : inline(n)).join("");
    };

    const chosen = document.querySelector("main") ?? document.querySelector("article") ?? document.body;
    const raw = render(chosen).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map(a => a.href.split("#", 1)[0]).filter(href => href.startsWith("https://"))
      .filter((href, index, arr) => arr.indexOf(href) === index).slice(0, 300);
    return {
      url: location.href,
      title: document.title ?? "",
      description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "",
      markdown: raw.slice(0, cap),
      links,
      truncated: raw.length > cap
    };
  }, maxChars);
}

export async function extractFields(page: any, fields: Record<string, string>): Promise<Record<string, string | null>> {
  const entries = Object.entries(fields);
  if (!entries.length || entries.length > 20) throw new Error("1–20 selectors are required");
  const result: Record<string, string | null> = {};
  for (const [name, selector] of entries) {
    if (name.length > 80 || !name || typeof selector !== "string" || !selector || selector.length > 200) {
      throw new Error("Invalid extract selector");
    }
    const loc = page.locator(selector).first();
    result[name] = (await loc.count()) ? ((await loc.textContent()) ?? "").trim().slice(0, 4000) : null;
  }
  return result;
}
