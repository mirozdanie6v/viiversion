export const KNOWN_PROJECTS: Record<string, { name: string; url: string }> = {
  'viiversion.com': { name: 'VIIVERSION', url: 'https://viiversion.com/' },
  'www.viiversion.com': { name: 'VIIVERSION', url: 'https://viiversion.com/' },
  'max-tour.viiversion.com': { name: 'MAX TOUR', url: 'https://max-tour.viiversion.com/' },
  'rusinfocenter.viiversion.com': { name: 'РИЦ', url: 'https://rusinfocenter.viiversion.com/' },
  'uniq-smart-rent.viiversion.com': { name: 'UNIQ Smart Rent', url: 'https://uniq-smart-rent.viiversion.com/' },
  'uniq-smart-rent-demo.viiversion.com': { name: 'UNIQ Smart Rent', url: 'https://uniq-smart-rent-demo.viiversion.com/' },
  'truesurf-app.viiversion.com': { name: 'TRUE SURF', url: 'https://truesurf-app.viiversion.com/' },
  'truesurf.viiversion.com': { name: 'TRUE SURF', url: 'https://truesurf.viiversion.com/' },
  'pet-nika.viiversion.com': { name: 'PET NIKA', url: 'https://pet-nika.viiversion.com/' },
};

export function clean(value: unknown, max = 200) {
  return String(value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

export function clampDays(raw: string | null) {
  const value = Number(raw ?? 7);
  if (!Number.isFinite(value)) return 7;
  return Math.max(1, Math.min(365, Math.round(value)));
}

export function allowedViiversionHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === 'viiversion.com' || host.endsWith('.viiversion.com');
}

export function projectName(hostname: string, requested?: unknown) {
  const host = hostname.toLowerCase();
  return KNOWN_PROJECTS[host]?.name || clean(requested || host.replace(/\.viiversion\.com$/i, ''), 80) || host;
}

export function safePath(value: unknown) {
  const text = clean(value, 500);
  if (!text.startsWith('/')) return '/';
  return text.split('?')[0].split('#')[0].slice(0, 500) || '/';
}

export function safeOccurredAt(value: unknown) {
  const candidate = clean(value, 40);
  const parsed = Date.parse(candidate);
  const now = Date.now();
  if (!Number.isFinite(parsed) || Math.abs(now - parsed) > 24 * 60 * 60 * 1000) return new Date(now).toISOString();
  return new Date(parsed).toISOString();
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
