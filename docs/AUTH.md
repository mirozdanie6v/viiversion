# Telegram Mini App authentication

## Trust boundary

The frontend must send the raw value from `Telegram.WebApp.initData` to the backend.

The backend must never trust `Telegram.WebApp.initDataUnsafe`, Telegram user fields supplied separately by the frontend, or a Telegram user ID supplied in an ordinary request body.

## Login flow

1. Telegram opens the Mini App and provides `Telegram.WebApp.initData`.
2. Mini App sends `POST /api/v1/auth/telegram` with JSON `{ "initData": "..." }`.
3. Backend verifies the Telegram HMAC-SHA-256 hash using the client-specific bot token.
4. Backend validates `auth_date` freshness.
5. Backend parses and validates the signed Telegram user object.
6. Backend creates or updates the user in the client's D1 database.
7. Backend creates a random opaque session token.
8. Only the SHA-256 hash of the session token is stored in D1.
9. The raw session token is returned once to the Mini App.
10. Protected API calls send `Authorization: Bearer <token>`.

## Endpoints

### POST /api/v1/auth/telegram

Request:

```json
{
  "initData": "<Telegram.WebApp.initData>"
}
```

Successful response includes:

- `accessToken`
- `tokenType: Bearer`
- `expiresAt`
- normalized user data

Invalid, forged or expired Telegram data returns HTTP 401 without exposing validation internals to the client.

### GET /api/v1/me

Requires:

```text
Authorization: Bearer <accessToken>
```

The backend hashes the presented token and looks up a non-revoked, non-expired session in D1.

## Secrets

`TELEGRAM_BOT_TOKEN` is a secret. It must never appear in `wrangler.jsonc`, source files, tests with a real token, GitHub commits or client-side JavaScript.

For production configure it with Cloudflare secrets, for example:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

Each client must use that client's own bot token in that client's own Worker deployment.

## Timing configuration

Non-secret defaults:

- `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS=300`
- `AUTH_SESSION_TTL_SECONDS=86400`

The initData age limit reduces replay risk. The session lifetime can be adjusted per client, but should remain bounded.

## Session security

- 32 random bytes per session;
- opaque token returned to the client;
- SHA-256 token hash stored in D1;
- expiry checked server-side;
- revoked sessions rejected;
- no raw session tokens logged;
- no Telegram bot token logged;
- no raw `initData` logged.

## Client integration rule

The Mini App should authenticate immediately after Telegram initialization and use the returned Bearer token for subsequent API calls. Business endpoints must derive the current user from the validated session rather than accepting a trusted `userId` from the frontend.
