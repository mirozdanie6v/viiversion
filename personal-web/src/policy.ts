/**
 * For an internet-facing personal scraper, only public HTTPS domain names are
 * eligible. Private/internal network targets must never be forwarded to Chrome.
 * For sensitive deployments also set ALLOWED_HOSTS to a known host allowlist.
 */
export class InputError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function publicUrl(input: unknown, allowedHosts = ""): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 2048) {
    throw new InputError("url must be a string of 1–2048 characters");
  }
  let url: URL;
  try { url = new URL(input); }
  catch { throw new InputError("Invalid absolute URL"); }

  if (url.protocol !== "https:") throw new InputError("Only HTTPS URLs are supported");
  if (url.username || url.password) throw new InputError("URL credentials are prohibited");
  if (url.port && url.port !== "443") throw new InputError("Custom network ports are prohibited");

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host.includes(".") || host.length > 253 || host.includes(":") ||
      /^\d+(?:\.\d+){1,}$/.test(host) ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|onion)$/.test(host) ||
      host.endsWith(".home.arpa") || host.endsWith(".localhost") ||
      !/^[a-z0-9.-]+$/.test(host) || host.split(".").some(s => !s || s.length > 63 || s.startsWith("-") || s.endsWith("-"))) {
    throw new InputError("Private, non-public, IP-literal, or invalid host is prohibited");
  }

  if (allowedHosts.trim()) {
    const allowed = allowedHosts.split(",").map(h => h.trim().toLowerCase()).filter(Boolean);
    if (!allowed.some(h => host === h || (h.startsWith("*.") && host.endsWith(h.slice(1))))) {
      throw new InputError("Host is not in ALLOWED_HOSTS", 403);
    }
  }
  url.hash = "";
  return url.toString();
}

export function canonicalSiteLink(input: string, origin: string, allowHosts = ""): string | null {
  try {
    const url = publicUrl(input, allowHosts);
    const candidate = new URL(url);
    if (candidate.origin !== origin) return null;
    if (/\.(?:pdf|zip|exe|png|jpe?g|webp|svg|gif|mp4|mov|mp3|css|js)(?:$)/i.test(candidate.pathname)) return null;
    return url;
  } catch { return null; }
}

/** Subset of robots.txt sufficient for a polite small site crawler. */
export function robotsAllows(text: string, path: string): boolean {
  const lines = text.split(/\r?\n/);
  let active = false, seenRules = false;
  const rules: Array<{ prefix: string; allow: boolean }> = [];
  for (const raw of lines) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (name === "user-agent") {
      if (seenRules) { active = false; seenRules = false; }
      if (value === "*" || /viiversion-personal-web/i.test(value)) active = true;
    } else if (name === "allow" || name === "disallow") {
      seenRules = true;
      if (active && value) rules.push({ prefix: value.split("*", 1)[0], allow: name === "allow" });
    }
  }
  const matches = rules.filter(r => path.startsWith(r.prefix)).sort((a, b) => b.prefix.length - a.prefix.length || Number(b.allow) - Number(a.allow));
  return matches.length === 0 || matches[0].allow;
}
