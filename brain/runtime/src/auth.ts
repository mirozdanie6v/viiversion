export async function isAuthorized(request: Request, expected: string | undefined): Promise<boolean> {
  // Fail closed when the Cloudflare secret is missing or too weak.
  if (!expected || expected.length < 32) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const provided = header.slice(7);
  if (provided.length !== expected.length || provided.length > 512) return false;
  const bytes = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", bytes.encode(provided)),
    crypto.subtle.digest("SHA-256", bytes.encode(expected)),
  ]);
  const a = new Uint8Array(actualHash);
  const b = new Uint8Array(expectedHash);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
