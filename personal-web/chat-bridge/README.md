# Personal Web — direct ChatGPT chat bridge via installed GitHub plugin

**This works in an ordinary ChatGPT conversation, without Work and without a custom MCP registration.**

The GitHub plugin already connected to ChatGPT can read/write this repo and
inspect GitHub Actions. A small workflow acts as a secure *transport* from
GitHub Actions to the existing owner-authenticated remote MCP server:

```
normal ChatGPT → GitHub plugin → request.json push → GitHub Actions
  → PERSONAL_WEB_API_TOKEN (existing Actions secret) → Cloudflare /mcp
  → JSON-RPC tools/call → sanitized bounded result in job log
  → GitHub plugin fetch_workflow_job_logs → same ChatGPT conversation
```

## Tested live

- 13 October 2026, [run 38396071404](https://github.com/mirozdanie6v/viiversion/actions/runs/38396071404): public page scraped with the personal Chrome browser.
- 13 October 2026, [run 38396217569](https://github.com/mirozdanie6v/viiversion/actions/runs/38396217569): map found 30 links on viiversion.com.
- 13 October 2026, [run 38396424512](https://github.com/mirozdanie6v/viiversion/actions/runs/38396424512): **actual MCP `tools/call`** returned the page title and 33 discovered links.

## How to submit a new command from ChatGPT

Do not paste credentials into chat. Using the already connected GitHub tools,
read `personal-web/chat-bridge/request.json` on the branch
`feat/personal-web-firecrawl-mvp`, then update it with its current blob SHA
and a unique `id` to trigger the workflow.

Example:

```json
{
  "id": "my-public-page-test-001",
  "operation": "scrape",
  "url": "https://viiversion.com/"
}
```

Supported operations: `scrape`, `map`, `crawl`, `extract`.
For `map/crawl`, specify `limit` (1–5) and `depth` (0–2).
For `extract`, specify `fields` mapping field names to CSS selectors.

The workflow [Personal Web — ChatGPT GitHub bridge (public reads)](
https://github.com/mirozdanie6v/viiversion/actions/workflows/personal-web-chat-bridge.yml)
will start on push to the exact request path. Locate its newest run for the
corresponding commit. Call `fetch_workflow_run_jobs`, then
`fetch_workflow_job_logs`. Parse the JSON between
`PERSONAL_WEB_BRIDGE_RESULT_BEGIN` and
`PERSONAL_WEB_BRIDGE_RESULT_END`. The result includes its request ID, the
MCP transport marker and the browser document or link map.

### Security boundary: PUBLIC REPOSITORY

`mirozdanie6v/viiversion` is **public**. All request files and workflow logs
are public and may be retained by GitHub. The runner rejects all except
`https://viiversion.com/*` and public
`https://github.com/mirozdanie6v/*` pages, rejects URLs with query strings,
fragments or URL credentials, never includes cookies or session tokens in logs,
and invokes **only the existing read-only MCP tools**.

NEVER enable `web_session_scrape`, `web_interact`, account or admin pages in
this workflow. For real logged-in accounts, implement a **separate private
repository bridge** with private results, restricted access and an owner-scoped
credential, or a reviewed connected plugin. Do not use this public Action as
a generic private browser/WhatsApp/Gmail workflow.

The Bearer credential remains an Actions secret and is not output to logs.
A permanent credential was previously visible in an older chat message:
**rotate it before any authenticated use**.

### What this proves (and what it does not)

This proves normal-chat orchestration via the existing GitHub plugin and the
*real*, deployed VIIVERSION MCP server. It does **not** dynamically register
Personal Web as a new ChatGPT MCP app, nor give ChatGPT access to arbitrary
authenticated private webpages. The GitHub-based mechanism adds workflow
latency and has no persistent foreground browser session from ChatGPT's
perspective. For rich interactive browser automation, a secure private
connection must be implemented separately.
