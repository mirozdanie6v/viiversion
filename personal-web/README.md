# VIIVERSION Personal Web

An **isolated, owner-only** web reading and automation service, designed to reuse the existing
VIIVERSION Cloudflare Browser Run/Playwright experience without modifying `integration-service`,
WhatsApp, production landing, ZL Web Agent or VIIVERSION AI Engineer.

This is an independent implementation of a **subset** of Firecrawl features, not a Firecrawl fork.

## New staged capabilities — 13 October 2026

The existing normal-ChatGPT → connected GitHub → GitHub Actions → Cloudflare
MCP bridge remains available for anonymous/public research. New capabilities:

- `web_explore`: preserve one anonymous browser context within an MCP call;
  inspect links and form structure, scroll, wait, follow existing anchor links,
  and read intermediate pages. It does **not** submit forms or click buttons.
- `web_batch`: render up to four public URLs inside one browser invocation;
  the public GitHub bridge limits this to three sites per request to bound time.
- `web_session_explore`: read-only exploration of a saved browser login,
  restricted to the saved site origin. The owner UI `/owner` can inspect a
  session's page and form structure without reading form field values.
- Owner-only HTTP endpoints `/v1/action/propose`,
  `/v1/action/approve`, and `/v1/action/execute` support a redacted
  action plan, explicit human confirmation and a three-minute single-use
  approval. Old `/v1/interact` is **always forbidden**, including when
  interactive support is enabled. Approved operations are currently only
  reachable using the owner's secure panel/API, never via the public bridge.
  **Execution is currently disabled** (`ENABLE_INTERACT=false`) until the
  previously disclosed owner bearer credential is replaced. The approval
  workflow passed its controlled live test before this safety lock was applied.
  Credentials/MFA must be entered manually in Live View.
- Actions and session contents **must never be passed through the public
  GitHub Actions logs**. Private-session chat orchestration is not deployed.

Validated GitHub Actions:
- [Read-only multi-step navigation](https://github.com/mirozdanie6v/viiversion/actions/runs/38403294888)
- [Three-site batch via actual MCP](https://github.com/mirozdanie6v/viiversion/actions/runs/38404068149)
- [Session inspection, owner action approval / single-use enforcement](https://github.com/mirozdanie6v/viiversion/actions/runs/38405760730)

Latency: `web_explore` and `web_batch` avoid separate GitHub Actions
executions for each read/navigation step, but do NOT eliminate the Action
startup time. Direct calls from ChatGPT require an approved direct plugin/tool
connection; no such connection is currently installed for Personal Web.

Security prerequisite before any real account use: **rotate the original
owner API token that appeared in a past chat**. The simulated session smoke
is not evidence that a real login/MFA flow works.

## Implemented in this MVP

| Capability | HTTP | MCP tool |
| --- | --- | --- |
| JavaScript-rendered page to Markdown, title, description, links | `POST /v1/scrape` | `web_scrape` |
| Discover up to 300 same-site URLs by visiting up to 8 pages | `POST /v1/map` | `web_map` |
| Crawl up to 8 pages, depth 0–2, respecting robots.txt | `POST /v1/crawl` | `web_crawl` |
| Structured extraction with named CSS selectors | `POST /v1/extract` | `web_extract` |
| PNG screenshot of a rendered page | `POST /v1/screenshot` | `web_screenshot` |
| Explicit click, fill, select, scroll, wait actions | `POST /v1/interact` (direct route always forbidden) | —; use owner-approved actions |
| Health endpoint | `GET /health` | — |
| Manual remote login through time-limited Cloudflare Live View | `POST /v1/session/start` + `/v1/session/commit` | API-only |
| Encrypted saved sessions: list and revoke | `POST /v1/session/list` + `/v1/session/revoke` | API-only |
| Read with saved per-site cookies/storage | `POST /v1/session/scrape` | `web_session_scrape` |
| Stateless MCP Streamable HTTP endpoint | `POST /mcp` | — |

It does **not** yet provide: web-wide search, AI-inferred JSON schemas, PDFs,
fully verified live authenticated sessions, async long-running crawl queues,
browser history, or a registered ChatGPT App. These are later development steps.

## ChatGPT custom MCP plugin (private, OAuth)

**Live staging endpoint:** `https://viiversion-personal-web-staging.viiversion.workers.dev/mcp`

The server now supports OAuth 2.1 authorization-code + S256 PKCE, one-owner consent,
DCR for approved ChatGPT callback URLs, OAuth resource/issuer discovery, access and
rotating refresh tokens, revocation, and read-only tool scopes. Browser click/fill
is intentionally **not exposed to ChatGPT**. OAuth access cannot use the login/admin
API, even when a user guesses the URL.

Live tests on Cloudflare exercise: unauthorized request denial, OAuth metadata,
client registration, owner consent, PKCE authorization code exchange, MCP tool
inventory, denial of admin API access to OAuth access tokens, refresh rotation,
replay rejection and token revocation.

### Current ChatGPT plan limitation (verified 13 Oct 2026)

Official documentation for custom MCP apps currently enables developer mode on
**ChatGPT Pro** (read/fetch integrations only) and **Business/Enterprise/Edu**
(workspace-managed custom MCP; write actions only where allowed).
**ChatGPT Plus does not offer arbitrary private custom MCP registration**.
Do not promise a Plus user that the `Plugins → Add custom MCP server` action
will appear. This limitation concerns registration in the ChatGPT UI, not the
Cloudflare service or its OAuth endpoint.

Sources:
- https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt
- https://help.openai.com/en/articles/11509118-admin-controls-security-and-compliance-for-plugins-and-apps

While custom MCP registration is unavailable, the deployed owner console at
`/owner` continues to work as a separate website, and REST/MCP APIs can be
used by authorized developer clients. Genuine target-site login requires the
owner to complete passwords/MFA inside Live View. Never supply website passwords
or the owner bearer credential to the conversational assistant.

### Connect in ChatGPT (only when custom MCP creation is enabled on the plan)

1. Use **chatgpt.com** in a browser (not the Android client for creation).
2. Open **Plugins** → **Add** → **Add custom MCP server**.
3. Name: `VIIVERSION Personal Web`.
4. Server URL: `https://viiversion-personal-web-staging.viiversion.workers.dev/mcp`
5. Authentication: **OAuth**; prefer **Dynamic Client Registration (DCR)** when
   prompted, letting the server register the ChatGPT redirect.
6. Create the private plugin, install it and select it in a new **Work** chat with `@`.
7. On first usage, ChatGPT opens the owner's consent page on the Worker domain.
   Enter `PERSONAL_WEB_API_TOKEN` **there only**, not into a ChatGPT message.
   Consent issues a separate, revocable OAuth token to ChatGPT.
8. Try `@VIIVERSION Personal Web — read https://viiversion.com using web_scrape`.

This project has no integration that can create or install a plugin inside an
owner's ChatGPT account programmatically; that UI approval is user-controlled.

### Secure owner-assisted manual login

Open `https://viiversion-personal-web-staging.viiversion.workers.dev/owner`.
Paste the **rotated** personal bearer credential into the page (not the login
password for a target site), choose `https://github.com` or
`https://dash.cloudflare.com`, then:

1. Click **Открыть Chrome / Live View** and follow the short-lived private link.
2. Sign in manually at the legitimate target website, including MFA. No password
   is sent to our API.
3. Return the live Chrome tab to the same website and click **Сохранить
   браузерную сессию** before expiry (~8 min).
4. Click **Прочитать сайт с сохранённой сессией** to validate that the site can
   be read again in a fresh browser context.
5. In a Work chat with the personal plugin connected, call `web_session_scrape`
   for that site to verify that ChatGPT can read its authorized pages.

Warning: the first owner credential used in this project appeared in an earlier
chat response. **Rotate it in GitHub Actions Secrets and rerun the staging
workflow before signing into personal accounts.** Do not paste any secrets into
chat, GitHub issues, workflow logs or URLs. Only sign in at websites you own or
are expressly authorized to access. The session is encrypted at rest but this
does not neutralize risks from malicious or compromised target web pages.

## Current validated status

- **Stage 1:** deployed and live-tested on VIIVERSION: scrape, extract, map, crawl,
  screenshot, stateless MCP tool inventory, bearer authentication and disabled writes.
- **Stage 2 (automated staging smoke passed):** one owner-scoped Durable Object now
  holds the live Chrome connection during `/v1/session/start` and `commit`.
  A real Cloudflare Browser Run test confirms Live View URL generation, a
  separate-request commit, encrypted storage, a fresh-browser read and revocation.
  **A genuine manual login with MFA has not yet been performed by the owner**;
  this is still required before relying on saved account sessions.
- **Stage 3 (OAuth-ready, user connection pending):** ChatGPT-compatible OAuth 2.1
  transport and tooling are deployed and live-tested. Installing the personal
  plugin from the ChatGPT Plugins UI is not yet completed. TinyFish-like
  autonomous write/click workflows are deliberately not enabled.

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

## Private browser logins (development stage)

Live View browser session code and a Durable Object encryption vault are now included,
and staging now provisions an independent encryption key once in Cloudflare.
The first implementation disconnected from Chrome between the two requests and
lost the page; this has been replaced with a connected browser held by the
`PersonalWebVault` Durable Object. The automated staging login/commit/reuse/
revoke test now passes with `ENABLE_SAVED_SESSIONS=true` **without entering
account credentials**. Real account login (including SSO/MFA), browser idle
expiry and human interaction still need a manual owner acceptance test.

### Persistent secrets (required for real personal use)

In the GitHub repository's **Settings → Secrets and variables → Actions**, configure:

- `PERSONAL_WEB_API_TOKEN`: a long-lived random bearer token of **at least 32 characters**,
  stored securely by the owner. If missing, staging generates a **temporary**
  bearer token for the complete live smoke test and deletes it immediately
  afterward; therefore the Worker is **unusable by an owner** until this
  stable repository secret is supplied. The token is never printed to logs.
- `PERSONAL_WEB_VAULT_KEY`: an **optional backup-controlled** 64-character hex value
  representing 32 random bytes. If omitted, staging creates a random encryption
  secret **once in Cloudflare** and preserves it across redeploys. The generated
  key cannot be recovered from the dashboard; losing it makes previously saved
  logins undecryptable. Never put keys in source, chat, issues, workflow logs or URLs.

The staging deployment pipeline forwards supplied values as Cloudflare Worker secrets
(`WEB_API_TOKEN`, `SESSION_VAULT_KEY`) and provisions the missing vault key only once.
The `PERSONAL_WEB_API_TOKEN` repository secret is a required owner setup step before
the Worker can be used by an external API or MCP client. Keep the bearer token private. The encryption secret is **not**
derived from the HTTP access token. Cookie data lives encrypted at rest in the
`PersonalWebVault` Durable Object.

### First permanent owner setup

1. Open [repository Actions secrets](https://github.com/mirozdanie6v/viiversion/settings/secrets/actions/new).
2. Name the new secret exactly `PERSONAL_WEB_API_TOKEN`.
3. Generate an unpredictable value with a password manager (at least 32 characters;
   preferably 64 random characters), save it securely and add the same value as
   the GitHub Actions secret. Never commit it or paste it into an issue or chat.
4. Run the GitHub Action **Personal Web staging deployment** with **Run workflow**
   on branch `feat/personal-web-firecrawl-mvp` (or trigger a new branch commit).
   This deploys the bearer token into the isolated Cloudflare Worker and runs
   the complete authenticated browser and MCP live test.
5. HTTP API calls and the MCP client must use `Authorization: Bearer <your secret>`.

### Session lifecycle

1. `POST /v1/session/start` with `{"url":"https://viiversion.com/"}` creates an isolated
   remote Chrome session and returns `loginId` and a **short-lived sensitive**
   `liveViewUrl`. It does not collect a password.
2. Open `liveViewUrl` in your own browser, sign in manually using the website
   and finish at the original site. The URL grants temporary browser control;
   do not forward it, include it in logs or paste it into untrusted systems.
3. `POST /v1/session/commit` with `{"loginId":"..."}` captures browser storage,
   filters it to the initial origin, encrypts it using AES-256-GCM and stores it
   for up to seven days. The remote login browser closes.
4. `POST /v1/session/scrape` with the same origin URL loads those cookies/storage
   into a fresh browser context and refreshes them following a successful visit.
5. `POST /v1/session/list` with `{}` returns metadata, **not cookie values**.
6. `POST /v1/session/revoke` with `{"url":"https://viiversion.com/"}` deletes
   the saved login.

Limits: one human login browser stays alive at most ~10 minutes; Live View links
last 5 minutes; at most 8 saved site origins; 7-day encrypted storage TTL.

Only start or reuse sessions on **sites you control or are authorized to access**.
Browser credentials are never imported from WhatsApp or another VIIVERSION project.
A saved session does not prove that a website is currently logged in; sites can
expire cookies, require MFA, or forbid automated access. Test on an owned
account before using this feature.

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
