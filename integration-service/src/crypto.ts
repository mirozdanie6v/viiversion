function b64(bytes: Uint8Array) {
  let out = '';
  for (const byte of bytes) out += String.fromCharCode(byte);
  return btoa(out);
}

function fromB64(value: string) {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function aesKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptSecret(value: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey(secret);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value));
  return `${b64(iv)}.${b64(new Uint8Array(encrypted))}`;
}

export async function decryptSecret(value: string, secret: string) {
  const [ivRaw, encryptedRaw] = value.split('.');
  if (!ivRaw || !encryptedRaw) throw new Error('Invalid encrypted value');
  const key = await aesKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(ivRaw) },
    key,
    fromB64(encryptedRaw),
  );
  return new TextDecoder().decode(decrypted);
}
