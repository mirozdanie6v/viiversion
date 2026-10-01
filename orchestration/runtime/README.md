# Orchestration Runtime

Initial Cloudflare Worker runtime for VIIVERSION Orchestration.

## Current state

Implemented:
- D1 run state;
- D1 audit events;
- four workflow step maps: sales, website, proposal, brand governance;
- exact-prefix command resolver for САЙТ / ПРОДАЖИ / КП / БРЕНД and approved aliases;
- command-to-run routing;
- run creation and inspection;
- deterministic step advancement;
- explicit approval gates.

Not implemented yet:
- OpenAI/agent calls;
- Google Drive/Sheets live adapters;
- GitHub write adapters;
- email/WhatsApp/LinkedIn delivery;
- webhook reply triggers;
- Cloudflare Workflows / Durable Objects;
- automatic retries.

The runtime intentionally cannot send messages, publish proposals, mutate canon, or deploy website changes by itself yet.

## Endpoints

- `GET /health`
- `POST /commands/resolve`
- `POST /commands/run`
- `POST /runs`
- `GET /runs/:id`
- `POST /runs/:id/advance`
- `POST /runs/:id/approve`

## Command rule

Only the first non-empty token is evaluated. This avoids accidental activation when words such as "сайт" or "продажи" appear later in ordinary prose.

## Deployment guard

`wrangler.jsonc` contains a placeholder D1 database id. Replace it only when creating the isolated orchestration environment. Do not bind this runtime to production website storage.
