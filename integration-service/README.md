# VIIVERSION Integration Service

Standalone integration backend for VIIVERSION applications.

It is intentionally independent from MAX TOUR and can be consumed by separate demo or production applications.

## Public host

`https://integration.viiversion.com`

## Current Bókun PoC

Nha Trang Love Travel two-product PoC:

- Vendor ID: `137689`
- Robinson Beach — Product ID: `1287578`, code: `5690738P8`
- Hòn Mun Marine Park Snorkeling and Nha Trang Island Tour — Product ID: `1287580`, code: `5690738P7`

## Bókun Custom App URLs

- App URL: `https://integration.viiversion.com/bokun/install`
- Redirect URL: `https://integration.viiversion.com/bokun/callback`
- Requested scope: `LEGACY_API`

Bókun creates legacy REST credentials after the vendor installs an app with the `LEGACY_API` scope. Those credentials remain server-side and are stored encrypted by this service.

## API

- `GET /health`
- `GET /api/bokun/status`
- `GET /api/bokun/products`
- `GET /api/bokun/product`
- `GET /api/bokun/availability?start=YYYY-MM-DD&end=YYYY-MM-DD&currency=USD`

Optional query parameters `vendorId` and `productId` override the configured defaults.

## Administration

`POST /admin/bokun/rest-credentials` is protected by `INTEGRATION_ADMIN_TOKEN` and is used by VIIVERSION to store the legacy REST credentials generated for an installed Bókun vendor.

No customer Bókun login or password is ever stored.

## Required Worker secrets

- `BOKUN_APP_API_KEY`
- `BOKUN_APP_API_SECRET`
- `DATA_ENCRYPTION_KEY`
- `INTEGRATION_ADMIN_TOKEN`


## WhatsApp Business / Cloud API

The same integration service now exposes a private WhatsApp transport for VIIVERSION.

Webhook:
- `GET /webhooks/whatsapp` — Meta verification challenge.
- `POST /webhooks/whatsapp` — signed WhatsApp message/status callbacks.

Private action API (protected by `INTEGRATION_ADMIN_TOKEN`):
- `GET /api/whatsapp/status`
- `GET /api/whatsapp/chats?limit=50`
- `GET /api/whatsapp/messages?peer=...&q=...&direction=inbound|outbound&unread=0|1&limit=100`
- `GET /api/whatsapp/unread?limit=100`
- `POST /api/whatsapp/review` with `{"ids":["wamid..."]}`
- `POST /api/whatsapp/send` with `{"to":"849...","text":"...","replyTo":"wamid..."}`

The ChatGPT-facing action schema is `openapi-whatsapp.yaml`. It uses the same bearer token as the existing integration administration boundary, so no OpenAI API call is required inside this service.

### Required WhatsApp Worker secrets

- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_VERIFY_TOKEN`
- `META_APP_SECRET`

Public variable:
- `META_GRAPH_VERSION=v26.0`

Meta webhook callback URL:
- `https://integration.viiversion.com/webhooks/whatsapp`

Incoming webhook requests are validated using the Meta app-secret HMAC signature before any message is stored. The store keeps normalized message content, contact name/number, delivery state, and VIIVERSION review state; access tokens and app secrets are never persisted in the message store.


## WhatsApp Business App Coexistence

VIIVERSION now supports the Meta Embedded Signup path for connecting an existing WhatsApp Business App number while keeping the mobile app active.

Flow:

1. An authenticated VIIVERSION action calls `POST /admin/whatsapp/onboarding-session`.
2. The service returns a one-time connection URL valid for 15 minutes.
3. The user opens the URL and completes Meta Embedded Signup with `featureType=whatsapp_business_app_onboarding`.
4. The browser returns the Meta authorization code and WABA ID to `POST /whatsapp/onboarding/complete`.
5. The Worker exchanges the code server-side, subscribes the app to the WABA, discovers the phone-number ID, encrypts the access token using `DATA_ENCRYPTION_KEY`, and stores the connection in the existing Durable Object.
6. `/api/whatsapp/*` reads and sends using the stored Coexistence credentials. No separate OpenAI API is involved.

Public onboarding page:
- `GET /whatsapp/connect?session=<one-time-session>`

Private onboarding action:
- `POST /admin/whatsapp/onboarding-session`

Meta webhook:
- `https://integration.viiversion.com/webhooks/whatsapp`

Static Meta configuration required before the connection button is enabled:
- `META_APP_ID`
- `META_APP_SECRET`
- `META_EMBEDDED_SIGNUP_CONFIG_ID`
- `META_WHATSAPP_VERIFY_TOKEN`

The phone-number access token and phone-number ID do not need to be copied into Cloudflare manually when Embedded Signup succeeds; they are obtained and stored by the integration service.

### Meta-side prerequisites

The Meta app must be configured for WhatsApp Embedded Signup / Tech Provider onboarding and released with the permissions required by Meta for customer onboarding. Coexistence must be launched through the WhatsApp Business App onboarding feature rather than normal Cloud API number migration.
