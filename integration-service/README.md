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
