# VIIVERSION Backend

This branch contains the backend foundation for VIIVERSION Telegram Mini App projects.

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

Reusable code may be shared between projects, but client runtime data and infrastructure are not shared.

## Current stack

- TypeScript
- Cloudflare Workers
- Hono
- Zod
- Wrangler
- Vitest
- D1 / Drizzle ORM planned for Stage 2

## Current endpoints

- `GET /health`
- `GET /api/v1/status`

## Commands

```bash
npm install
npm run types
npm run typecheck
npm test
npm run dev
```

## Configuration

Non-secret local defaults are in `wrangler.jsonc`.

Never commit:

- Telegram bot tokens;
- API keys;
- payment credentials;
- production customer data;
- `.dev.vars` / `.env` files.

## Roadmap

See `docs/VIIVERSION_BACKEND_ROADMAP.txt`.

## Branches

- `viiversion` — landing deployment
- `backend` — backend platform development
