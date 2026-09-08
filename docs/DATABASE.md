# VIIVERSION D1 database workflow

## Core rule

The backend is not multi-tenant.

Every client receives a separate Cloudflare D1 database and a separate Worker binding. Production data is never shared between clients.

## Template binding

The `backend` branch uses:

- binding: `DB`
- database name: `viiversion-backend-template`
- database ID: `00000000-0000-0000-0000-000000000000`

The all-zero UUID is an intentional sentinel. It prevents the reusable template from accidentally targeting a real production D1 database.

Before any client deployment, create that client's D1 database and replace the sentinel in the client-specific Wrangler configuration.

## Naming convention

Recommended production names:

- RIC: `ric-production`
- Eco Voyage: `eco-voyage-production`
- Max Tour: `max-tour-production`
- UNIQ: `uniq-production`
- PET NIKA: `pet-nika-production`
- AVE Dental: `ave-dental-production`

Recommended Worker names follow the same client prefix, for example `ric-backend` and `uniq-backend`.

## Create a client database

Example:

```bash
npx wrangler d1 create ric-production
```

Wrangler returns the created database UUID. Put that UUID only into the RIC deployment configuration. Never reuse it for another client.

## Local migrations

The reusable binding name is `DB`.

```bash
npm run db:migrate:local
```

Local Wrangler development uses local D1 state and must not require production credentials.

## Production migrations

Production migrations are always explicit and reviewed.

Example after the client binding has been configured:

```bash
npx wrangler d1 migrations list DB --remote
npx wrangler d1 migrations apply DB --remote
```

Do not add an automatic production migration command to ordinary application startup.

## Migration source of truth

Versioned SQL files in `migrations/` are the deployment source of truth.

The Drizzle schema in `src/db/schema.ts` is the typed application model and must stay synchronized with migrations.

For schema changes:

1. change `src/db/schema.ts`;
2. create a new numbered SQL migration;
3. never edit an already-applied production migration;
4. run CI;
5. apply the migration to preview/local D1;
6. review data-impact and rollback/recovery plan;
7. export production data before destructive/high-risk changes;
8. apply to the single intended client database.

## Backup / export before risky changes

Example:

```bash
npx wrangler d1 export DB --remote --output=backup-before-migration.sql
```

Keep production backups outside the public repository. Production exports may contain personal data and must never be committed to Git.

## Base tables

The core schema currently includes:

- `users`
- `admins`
- `auth_sessions`
- `audit_log`
- `app_settings`

Business tables are added only when implementing a specific client's domain module.

## Isolation checklist before production deployment

Confirm all of the following:

- Worker name belongs to the intended client;
- D1 database name belongs to the intended client;
- D1 UUID belongs to the intended client;
- Telegram bot token belongs to the intended client;
- payment credentials belong to the intended client;
- allowed Mini App origins belong to the intended client;
- no other client's secrets are present;
- migrations were tested locally/preview first;
- CI is green;
- production export exists before destructive migration.
