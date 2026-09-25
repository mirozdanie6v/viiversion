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
