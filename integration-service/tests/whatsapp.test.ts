import { describe, expect, it } from 'vitest';
import { verifyMetaWebhookSignature } from '../src/whatsapp';

function toHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

describe('WhatsApp Cloud API primitives', () => {
  it('verifies Meta webhook HMAC-SHA256 signatures', async () => {
    const secret = 'test-app-secret';
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));

    await expect(verifyMetaWebhookSignature(body, 'sha256=' + signature, secret)).resolves.toBe(true);
    await expect(verifyMetaWebhookSignature(body + 'x', 'sha256=' + signature, secret)).resolves.toBe(false);
  });

  it('rejects malformed signatures', async () => {
    await expect(verifyMetaWebhookSignature('{}', null, 'secret')).resolves.toBe(false);
    await expect(verifyMetaWebhookSignature('{}', 'sha256=abc', 'secret')).resolves.toBe(false);
  });
});
