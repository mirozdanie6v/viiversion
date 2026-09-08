# MAX TOUR Backend — Stage 5

Date: 2026-09-09
Branch: `backend-max-tour`

## Purpose

This branch is the first client-specific backend derived from the reusable VIIVERSION `backend` core.

It is intentionally single-client. MAX TOUR is the only business allowed in this runtime.

## Fixed production resource names

- Worker: `max-tour-backend`
- D1: `max-tour-production`
- Mini App: `https://max-tour.viiversion.com`
- Future R2 bucket: `max-tour-media`

## What is already complete in GitHub

- branch derived from `backend` core;
- package renamed to `max-tour-backend`;
- Worker renamed to `max-tour-backend`;
- D1 logical database name changed to `max-tour-production`;
- CORS allowlist includes only MAX TOUR production Mini App plus localhost development;
- all reusable auth/session/RBAC/audit code retained;
- production D1 UUID intentionally remains the all-zero sentinel;
- no other client's business tables or credentials added.

## Cloudflare resource step

The real D1 resource must be created in the VIIVERSION Cloudflare account before production deployment.

Command:

```bash
npm run db:create:production
```

Equivalent:

```bash
wrangler d1 create max-tour-production
```

After Cloudflare returns the database ID:

1. replace `00000000-0000-0000-0000-000000000000` in `wrangler.jsonc` on this branch;
2. generate Worker types if required: `npm run types`;
3. apply migrations locally and verify tests;
4. apply production migrations with `npm run db:migrate:production`;
5. configure `TELEGRAM_BOT_TOKEN` as a Cloudflare secret;
6. deploy only after the D1 binding and secrets are verified.

## Mandatory pre-deploy checks

```bash
npm install
npm run types
npm run typecheck
npm test
npm run db:migrate:local
```

Production deployment is blocked conceptually while the D1 UUID is the all-zero sentinel.

## Stage 6 scope

The next code stage is MAX TOUR travel-domain schema and catalog API.

Planned domain tables:

- `tours`
- `tour_images`
- `tour_dates`
- `tour_prices`
- `customers`
- `bookings`
- `booking_items`
- `promocodes` only if MAX TOUR needs them

Availability should be represented by tour-date capacity/remaining capacity rather than a disconnected generic availability table unless the actual business rules require otherwise.

Planned public API foundation:

- `GET /api/v1/tours`
- `GET /api/v1/tours/:id`
- `GET /api/v1/tours/:id/dates`

Planned protected admin API foundation:

- catalog create/update/archive;
- tour-date management;
- prices;
- capacity;
- media metadata.

Booking creation is Stage 7 and must not be mixed into the catalog schema before price/capacity rules are fixed.

## Isolation rules

Never add:

- another client's tenant ID;
- another client's bot token;
- another client's D1 binding;
- another client's business data;
- shared production tables across clients.

Source patterns may be reused from VIIVERSION Core, but runtime resources remain isolated.
