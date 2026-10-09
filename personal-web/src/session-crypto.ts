import { InputError } from "./policy";

export type Sealed = { iv: string; ciphertext: string };

function hexToBytes(hex: string): Uint8Array {
  if (!/^[a-f0-9]{64}$/i.test(hex)) throw new InputError("Session vault encryption key is missing or malformed", 503);
  return new Uint8Array(hex.match(/.{2}/g)!.map(v => parseInt(v, 16)));
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

async function sessionKey(hex: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", asBuffer(hexToBytes(hex)), "AES-GCM", false, ["encrypt", "decrypt"]);
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 4096) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 4096));
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const bytes = atob(value);
  return Uint8Array.from(bytes, c => c.charCodeAt(0));
}

export async function sealSession(plaintext: string, origin: string, keyHex: string): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: asBuffer(iv), additionalData: new TextEncoder().encode(origin) },
    await sessionKey(keyHex),
    new TextEncoder().encode(plaintext)
  );
  return { iv: base64(iv), ciphertext: base64(new Uint8Array(encrypted)) };
}

export async function openSession(record: Sealed, origin: string, keyHex: string): Promise<string> {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asBuffer(fromBase64(record.iv)), additionalData: new TextEncoder().encode(origin) },
      await sessionKey(keyHex),
      asBuffer(fromBase64(record.ciphertext))
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new InputError("Could not decrypt saved browser session", 503);
  }
}

/** A separate origin cannot inherit cookies or local storage from a saved site. */
export function filterStorageState(
  input: unknown, origin: string
): { cookies: any[]; origins: any[] } {
  if (!input || typeof input !== "object") throw new InputError("Invalid browser storage state");
  const record = input as { cookies?: any[]; origins?: any[] };
  const host = new URL(origin).hostname;
  const cookies = (Array.isArray(record.cookies) ? record.cookies : []).filter(cookie => {
    if (!cookie || typeof cookie.domain !== "string") return false;
    const domain = cookie.domain.replace(/^\./, "").toLowerCase();
    return domain === host || host.endsWith("." + domain);
  });
  const origins = (Array.isArray(record.origins) ? record.origins : []).filter(item => {
    if (typeof item?.origin !== "string") return false;
    try { return new URL(item.origin).origin === origin; } catch { return false; }
  });
  return { cookies, origins };
}
