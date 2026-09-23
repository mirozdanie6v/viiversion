# Orchestration Runtime

Initial Cloudflare Worker runtime for VIIVERSION Orchestration.

## Current state

Implemented:
- D1 run state;
- D1 audit events;
- sales and website workflow step maps;
- run creation;
- run inspection;
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

The runtime intentionally cannot send messages or deploy website changes yet.

## Endpoints

- `GET /health`
- `POST /runs`
- `GET /runs/:id`
- `POST /runs/:id/advance`
- `POST /runs/:id/approve`

## Deployment guard

`wrangler.jsonc` contains a placeholder D1 database id. Replace it only when creating the isolated orchestration environment. Do not bind this runtime to production website storage.
