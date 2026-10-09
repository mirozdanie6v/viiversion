# VIIVERSION Personal Web

An **isolated, owner-only** web reading and automation service, designed to reuse the existing
VIIVERSION Cloudflare Browser Run/Playwright experience without modifying `integration-service`,
WhatsApp, production landing, ZL Web Agent or VIIVERSION AI Engineer.

This is an independent implementation of a **subset** of Firecrawl features, not a Firecrawl fork.

## Implemented in this MVP

| Capability | HTTP | MCP tool |
| --- | --- | --- |
| JavaScript-rendered page to Markdown, title, description, links | `POST /v1/scrape` | `web_scrape` |
| Discover up to 300 same-site URLs by visiting up to 8 pages | `POST /v1/map` | `web_map` |
| Crawl up to 8 pages, depth 0–2, respecting robots.txt | `POST /v1/crawl` | `web_crawl` |
| Structured extraction with named CSS selectors | `POST /v1/extract` | `web_extract` |
| PNG screenshot of a rendered page | `POST /v1/screenshot` | planned |
| Explicit click, fill, select, scroll, wait actions | `POST /v1/interact` | `web_interact` (disabled by default) |
| Health endpoint | `GET /health` | — |
| Stateless MCP Streamable HTTP endpoint | `POST /mcp` | — |

It does **not** yet provide: web-wide search, AI-inferred JSON schemas, PDFs,
authenticated persistent browser sessions, async long-running crawl queues,
browser history, or a registered ChatGPT App. These are later development steps.

## Local checks

```bash
cd personal-web
npm install
npm run check
npm test
npx wrangler deploy --dry-run
```

The code checks do not require a live Browser Run session. Browser navigation needs a configured
Cloudflare account and deployed Worker for an end-to-end test.

## Deployment (new Worker; no changes to existing production)

This package has its own `wrangler.jsonc` with **workers_dev** set to true. It does not
claim an existing custom domain or a production Worker route.

1. From `personal-web/`, authenticate to Cloudflare with `npx wrangler login`.
2. Create an unpredictable token of at least 32 characters and run `npx wrangler secret put WEB_API_TOKEN`.
   Do not put credentials in the repository, URL parameters, example commands or logs.
3. Strongly recommended: set `ALLOWED_HOSTS` to a comma-separated set of personally approved
   domains with `npx wrangler secret put ALLOWED_HOSTS`. Use e.g. `viiversion.com,*.viiversion.com`
   for a bounded internal trial. Without this value the service accepts **public HTTPS domains**
   but rejects obvious internal hostnames, IP literals and custom ports.
4. Deploy with `npm run deploy`.
5. Enable `ENABLE_INTERACT` in `wrangler.jsonc` only when necessary, after reviewing the
   possible side effects of clicks and form submissions. Redeploy to apply.

### Examples

```bash
export URL="https://<your-personal-web-worker>.workers.dev"
export WEB_API_TOKEN="<token-from-secret-store>"

curl -sS "$URL/v1/scrape" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://viiversion.com/"}'

curl -sS "$URL/v1/map" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://viiversion.com/","limit":4,"depth":1}'

curl -sS "$URL/v1/extract" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://viiversion.com/","fields":{"headline":"h1","cta":"a"}}'
```

`/mcp` speaks stateless MCP JSON-RPC over Streamable HTTP and requires the **same bearer token**.
An MCP client must support passing that header. ChatGPT App connection/authorization
requires a separate configured connector/authentication step; deployment alone does not
make these tools available automatically in a chat.

## Security & reliability

- All non-health requests require a bearer token of at least 32 characters.
- No unrestricted JavaScript execution endpoint, and no credential extraction.
- Public HTTPS only; deny IP literals, localhost, local/internal suffixes and custom ports.
- Browser request routing blocks obvious private destinations, including subresources.
- Crawls are same-origin, limited to eight rendered pages and depth two, with `robots.txt`
  checks and a bounded execution window.
- New browser context for each operation; credentials and WhatsApp sessions are **not reused**.
- Logs contain no authorization token; API replies use `Cache-Control: no-store`.
- For stronger SSRF protection, **always set ALLOWED_HOSTS**, especially if the tool becomes
  reachable outside a trusted personal environment. DNS rebinding and authenticated
  session abuse need additional controls before broader access.
- Browser Run usage is billable subject to the Cloudflare plan. Review quota/budget alerts.

## Sequential next development gates

1. Unit checks and build, then staging deploy and live browser smoke test.
2. Durable authenticated sessions with per-domain isolation and explicit login.
3. Search provider integration and async queued crawl (not unbounded synchronous loops).
4. Higher-quality extraction (schema-based JSON, article selection, PDFs) and tests.
5. OAuth or an equivalent supported authorization flow to connect as a private ChatGPT App.
6. Observability, quotas, retention and cost guardrails before increasing crawl caps.
