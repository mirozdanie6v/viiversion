const TELEGRAM_PRODUCTION_PUBLIC_KEY_HEX = 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d';

export type TelegramIdentity = {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  languageCode: string;
  isPremium: boolean | null;
  photoUrl: string;
  startParam: string;
  authDate: number | null;
  addedToAttachmentMenu: boolean | null;
  allowsWriteToPm: boolean | null;
  chatType: string;
  chatInstance: string;
};

export type TelegramValidation = {
  identity: TelegramIdentity | null;
  verified: boolean;
  verification: 'verified' | 'missing_init_data' | 'invalid_init_data' | 'bot_id_missing' | 'signature_missing' | 'signature_invalid' | 'auth_date_invalid' | 'auth_date_expired' | 'verification_error';
};

function asString(value: unknown, max: number) {
  return String(value ?? '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

function boolOrNull(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function parseJsonObject(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function base64UrlBytes(raw: string) {
  const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function hexBytes(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error('invalid_public_key');
  return Uint8Array.from(hex.match(/.{2}/g)!, (pair) => Number.parseInt(pair, 16));
}

export function parseTelegramInitData(raw: unknown): { params: URLSearchParams; identity: TelegramIdentity | null } | null {
  const text = String(raw ?? '').trim();
  if (!text || text.length > 16_384) return null;

  let params: URLSearchParams;
  try { params = new URLSearchParams(text); } catch { return null; }

  const user = parseJsonObject(params.get('user'));
  const userId = asString(user.id, 32);
  if (!/^\d{1,20}$/.test(userId)) return { params, identity: null };

  const authDateNumber = Number(params.get('auth_date'));
  const authDate = Number.isInteger(authDateNumber) && authDateNumber > 0 ? authDateNumber : null;

  return {
    params,
    identity: {
      userId,
      username: asString(user.username, 64).replace(/^@/, ''),
      firstName: asString(user.first_name, 128),
      lastName: asString(user.last_name, 128),
      languageCode: asString(user.language_code, 24),
      isPremium: boolOrNull(user.is_premium),
      photoUrl: asString(user.photo_url, 1000),
      startParam: asString(params.get('start_param'), 160),
      authDate,
      addedToAttachmentMenu: boolOrNull(user.added_to_attachment_menu),
      allowsWriteToPm: boolOrNull(user.allows_write_to_pm),
      chatType: asString(params.get('chat_type'), 40),
      chatInstance: asString(params.get('chat_instance'), 128),
    },
  };
}

export function telegramThirdPartyDataCheckString(params: URLSearchParams, botId: string) {
  const pairs = Array.from(params.entries())
    .filter(([key]) => key !== 'hash' && key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);
  return `${botId}:WebAppData\n${pairs.join('\n')}`;
}

export async function verifyTelegramThirdPartySignature(
  params: URLSearchParams,
  botId: string,
  publicKeyHex = TELEGRAM_PRODUCTION_PUBLIC_KEY_HEX,
) {
  if (!/^\d{1,20}$/.test(botId)) return false;
  const signature = params.get('signature') || '';
  if (!signature) return false;

  try {
    const key = await crypto.subtle.importKey('raw', hexBytes(publicKeyHex), { name: 'Ed25519' }, false, ['verify']);
    const data = new TextEncoder().encode(telegramThirdPartyDataCheckString(params, botId));
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, base64UrlBytes(signature), data);
  } catch {
    return false;
  }
}

export async function validateTelegramInitData(
  raw: unknown,
  botId: string,
  nowMs = Date.now(),
  maxAgeSeconds = 24 * 60 * 60,
): Promise<TelegramValidation> {
  const parsed = parseTelegramInitData(raw);
  if (!parsed) return { identity: null, verified: false, verification: 'missing_init_data' };
  if (!parsed.identity) return { identity: null, verified: false, verification: 'invalid_init_data' };
  if (!parsed.identity.authDate) return { identity: parsed.identity, verified: false, verification: 'auth_date_invalid' };

  const ageSeconds = Math.floor(nowMs / 1000) - parsed.identity.authDate;
  if (ageSeconds < -300 || ageSeconds > maxAgeSeconds) {
    return { identity: parsed.identity, verified: false, verification: 'auth_date_expired' };
  }
  if (!botId) return { identity: parsed.identity, verified: false, verification: 'bot_id_missing' };
  if (!parsed.params.get('signature')) return { identity: parsed.identity, verified: false, verification: 'signature_missing' };

  try {
    const verified = await verifyTelegramThirdPartySignature(parsed.params, botId);
    return {
      identity: parsed.identity,
      verified,
      verification: verified ? 'verified' : 'signature_invalid',
    };
  } catch {
    return { identity: parsed.identity, verified: false, verification: 'verification_error' };
  }
}
