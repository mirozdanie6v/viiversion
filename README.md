# VIIVERSION Backend

Reference backend core for VIIVERSION Telegram Mini App projects.

## Architecture decision

The first production architecture is **not multi-tenant**.

Each client gets an isolated deployment:

- separate Cloudflare Worker;
- separate Cloudflare D1 database;
- separate R2/KV/Queues when required;
- separate secrets and Telegram bot token;
- separate payment credentials;
- separate domain/subdomain;
- separate production data and migrations.

Reusable source code may be reused between projects, but client runtime data and infrastructure are never shared.

The `backend` branch is the reference core. Client-specific business backends should be derived from this core and then configured/deployed independently.

## Implemented stack

- TypeScript
- Cloudflare Workers
- Hono
- Zod
- Cloudflare D1
- Drizzle ORM / Drizzle Kit
- Wrangler
- Vitest
- GitHub Actions CI

R2, KV, Queues, Cron and Workflows are added only when a client requires them.

## Implemented core

- request IDs and structured request logging;
- CORS allowlist;
- centralized API errors;
- `/api/v1` API versioning;
- D1 core schema and versioned migrations;
- Telegram Mini App `initData` HMAC validation;
- `auth_date` freshness checks;
- opaque server sessions with only token hashes stored in D1;
- shared authentication middleware;
- RBAC roles: `owner`, `admin`, `manager`;
- audit log writer;
- CI validation of typecheck, tests, D1 migrations and Wrangler build.

## Current endpoints

- `GET /health`
- `GET /api/v1/status`
- `POST /api/v1/auth/telegram`
- `GET /api/v1/me`
- `GET /api/v1/admin/me`

## Commands

```bash
npm install
npm run types
npm run typecheck
npm test
npm run db:migrate:local
npm run dev
```

## D1 template safety

The reusable `wrangler.jsonc` contains an all-zero D1 UUID sentinel. It must be replaced by the intended client's own D1 database UUID in that client's deployment configuration.

See `docs/DATABASE.md`.

## Telegram bot token

`TELEGRAM_BOT_TOKEN` is never stored in Git. Configure it as a Cloudflare secret for the client-specific Worker.

See `docs/AUTH.md`.

## Never commit

- Telegram bot tokens;
- API keys;
- payment credentials;
- raw session tokens;
- production customer data;
- production D1 exports;
- `.dev.vars` / `.env` files.

## Documentation

- `docs/VIIVERSION_BACKEND_ROADMAP.txt`
- `docs/DATABASE.md`
- `docs/AUTH.md`

## Branches

- `viiversion` — landing deployment
- `backend` — reusable isolated-client backend core

## Next architectural boundary

The next stage is client-specific business logic. Do not add multiple clients into one runtime database. Create/derive a separate client backend from this core and add only that client's domain tables, integrations and deployment configuration.
