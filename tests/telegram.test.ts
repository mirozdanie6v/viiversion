import { describe, expect, it } from 'vitest';
import {
  parseTelegramInitData,
  telegramThirdPartyDataCheckString,
  validateTelegramInitData,
  verifyTelegramThirdPartySignature,
} from '../src/worker/telegram';

function base64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

describe('Telegram Mini App identity', () => {
  it('extracts the public Telegram user fields without persisting raw initData', () => {
    const params = new URLSearchParams({
      auth_date: '1788950000',
      start_param: 'uniq-proposal',
      chat_type: 'sender',
      chat_instance: '1234567890',
      user: JSON.stringify({
        id: 123456789,
        first_name: 'Ivan',
        last_name: 'Petrov',
        username: 'ivan_petrov',
        language_code: 'ru',
        is_premium: true,
        added_to_attachment_menu: true,
        allows_write_to_pm: true,
        photo_url: 'https://t.me/i/userpic/320/example.svg',
      }),
    });
    const parsed = parseTelegramInitData(params.toString());
    expect(parsed?.identity).toMatchObject({
      userId: '123456789',
      username: 'ivan_petrov',
      firstName: 'Ivan',
      lastName: 'Petrov',
      languageCode: 'ru',
      isPremium: true,
      startParam: 'uniq-proposal',
      chatType: 'sender',
    });
  });

  it('marks valid-looking identity unverified until a trusted project Bot ID is configured', async () => {
    const now = Date.now();
    const params = new URLSearchParams({
      auth_date: String(Math.floor(now / 1000)),
      user: JSON.stringify({ id: 987654321, first_name: 'Olga', username: 'olga_test' }),
      signature: 'not-used-without-bot-id',
    });
    const result = await validateTelegramInitData(params.toString(), '', now);
    expect(result.identity?.username).toBe('olga_test');
    expect(result.verified).toBe(false);
    expect(result.verification).toBe('bot_id_missing');
  });

  it('verifies Telegram third-party signature semantics with Ed25519', async () => {
    const keys = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']) as CryptoKeyPair;
    const publicRaw = await crypto.subtle.exportKey('raw', keys.publicKey);
    const botId = '123456789';
    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000)),
      query_id: 'AAE-test-query',
      user: JSON.stringify({ id: 123456789, first_name: 'Test', username: 'verified_user' }),
      hash: 'excluded-from-third-party-check',
    });
    const data = new TextEncoder().encode(telegramThirdPartyDataCheckString(params, botId));
    const signature = await crypto.subtle.sign({ name: 'Ed25519' }, keys.privateKey, data);
    params.set('signature', base64Url(signature));

    expect(await verifyTelegramThirdPartySignature(params, botId, hex(publicRaw))).toBe(true);
    params.set('auth_date', String(Math.floor(Date.now() / 1000) - 5));
    expect(await verifyTelegramThirdPartySignature(params, botId, hex(publicRaw))).toBe(false);
  });
});
