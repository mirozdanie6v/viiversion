# MAX TOUR Backend

Isolated production backend for the MAX TOUR Telegram Mini App.

This branch is derived from the reusable VIIVERSION backend core, but from this point onward it belongs only to MAX TOUR.

## Isolation

MAX TOUR uses its own runtime resources:

- Cloudflare Worker: `max-tour-backend`;
- Cloudflare D1: `max-tour-production`;
- Mini App origin: `https://max-tour.viiversion.com`;
- separate Telegram bot token;
- separate payment credentials;
- separate future R2/KV/Queues when required;
- separate migrations and production data.

No RIC, UNIQ, PET NIKA, AVE or other client data/configuration belongs in this runtime.

## Inherited Core

The branch already includes:

- TypeScript + Cloudflare Workers;
- Hono routing;
- Zod validation;
- D1 + Drizzle ORM;
- versioned migrations;
- Telegram Mini App initData validation;
- server sessions;
- RBAC roles: `owner`, `admin`, `manager`;
- audit-log foundation;
- Vitest;
- GitHub Actions CI.

## Current API

- `GET /health`
- `GET /api/v1/status`
- `POST /api/v1/auth/telegram`
- `GET /api/v1/me`
- `GET /api/v1/admin/me`

## Local commands

```bash
npm install
npm run types
npm run typecheck
npm test
npm run db:migrate:local
npm run dev
```

## Production D1 creation

The checked-in `wrangler.jsonc` intentionally still contains the all-zero D1 UUID sentinel.

Create the real MAX TOUR database first:

```bash
npm run db:create:production
```

Then copy the returned D1 database ID into `wrangler.jsonc` for this branch only.

Do not deploy while the D1 UUID is still all zeroes.

## Production secrets

Never commit secrets. Configure them with Wrangler/Cloudflare secrets, including:

```text
TELEGRAM_BOT_TOKEN
```

Payment secrets will be added only when the MAX TOUR payment provider is selected.

## Next stage

After the real MAX TOUR D1 resource is created and bound, Stage 6 adds only MAX TOUR travel-domain tables and APIs:

- tours;
- tour_images;
- tour_dates;
- prices;
- availability/capacity;
- customers;
- bookings;
- booking_items;
- promocodes when required.

See `docs/MAX_TOUR_BACKEND.md` and `docs/VIIVERSION_BACKEND_ROADMAP.txt`.
