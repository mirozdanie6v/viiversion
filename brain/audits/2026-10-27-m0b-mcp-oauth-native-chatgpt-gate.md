# VIIVERSION Brain — M0B MCP/OAuth delivery and native ChatGPT handoff status

**2026-10-27. Stage:** deployed server transport, **not accepted as native ChatGPT E2E**.

## Delivered, built and verified

- [PR #38](https://github.com/mirozdanie6v/viiversion/pull/38): durable D1 `invocation_context_receipts`, protected POST/readback API, replay/id conflict tests.
- [PR #39](https://github.com/mirozdanie6v/viiversion/pull/39): protected `/context` includes recent invocation receipts with coverage truthfulness.
- [PR #40](https://github.com/mirozdanie6v/viiversion/pull/40): `/mcp` endpoint in the **same** Brain Worker, tools `mark_capture_context`, `mark_recall_context`; separate OAuth2.1 authorization code/PKCE + dynamic client registration, OAuth access and refresh tokens hashed at rest in existing D1. No new infrastructure and no commercial approval privileges.
- PR #40 CI [40520434896](https://github.com/mirozdanie6v/viiversion/actions/runs/40520434896): **44/44 unit and SQLite integration tests passed**, Wrangler dry-run and typed check passed. Local synthetic OAuth token → MCP tool list → context capture A → receipt → recall B path passed.
- Production [40520576183](https://github.com/mirozdanie6v/viiversion/actions/runs/40520576183): **success**, deploy and migrations succeeded; HTTP public/invalid credential access smoke checked OAuth resource metadata and unauthorized MCP denied 401, on revision `brain-m0b-mcp-oauth-20261027`.
- Cloudflare-admin read only D1 inspection: **1 decision, 4 approved commitments, 2 execution plans, 10 runs, 0 real invocation receipts, 0 OAuth clients, 0 OAuth tokens**; migration tables exist and previous data preserved.
- The legacy raw API credential stays inside existing Cloudflare secret storage; the Brain founder-approval credential remains entirely separate from OAuth. OAuth owner consent page requires the owner to enter the existing Brain API credential on the verified HTTPS Worker origin; it is never passed through GitHub or ChatGPT tool parameters.

## Authentication/security review boundaries

- OAuth PKCE S256; single-use authorization code; access token 1h, rotating refresh token 30d; DCR accepts only expected ChatGPT redirect URI forms; bearer resource audience fixed to the Brain MCP endpoint.
- The owner consent form uses the existing private Brain API credential for owner proof. **If its original value is unavailable to the owner**, the owner cannot finish the consent with this implementation; do not reveal or rotate existing production Cloudflare secrets. An owner-approved alternative authentication method would require a separate implementation decision.
- The code proves the OAuth protocol with local synthetic DB, not the actual ChatGPT OAuth callback. No real OAuth client has registered yet. Actual compatibility with the user's account, ordinary Chat UI and permissions is **UNVERIFIED**.
- The server stores the **context actually passed in a Mark tool call**, not the entire conversation. `coverage=unknown` remains until tested; MCP cannot independently read other chat messages.

## Remaining first-class acceptance gate (Linear VII-192)

1. Account owner explicitly connects remote MCP server `https://viiversion-brain.viiversion.workers.dev/mcp` through ChatGPT Plugins on web; OAuth authorizes with owner-only consent at correct Worker host, with no secrets in ChatGPT.
2. Confirm the Mark tools are available **in ordinary Chat**, not merely in a Work-only test surface. If ordinary Chat cannot invoke custom plugins, record a real platform UX blocker without silently changing requirement.
3. In ordinary chat A, write a known synthetic set of three facts, one proposal, one decision and an unresolved question; explicitly invoke Mark once. Inspect actual MCP tool arguments and the durable receipt/coverage.
4. In a distinct ordinary chat B, invoke Mark explicitly; independently retrieve the earlier payload; compare exact markers and classifications, and document omissions.
5. Verify access revocation, unsupported scopes, invalid/duplicate inputs and that uninvoked chat content does not appear automatically.

## Separate authenticated production protocol probe

A standalone synthetic-only script `brain/runtime/tests/live-mcp-oauth-smoke.mjs` was prepared on a separate unpublished test branch. Automating a scoped temporary D1 bearer insertion from the current ChatGPT/GitHub surface was **blocked by a tool security control** when modifying GitHub Actions. Do **not** route around the control or claim the live authenticated tool call passed; the positive live evidence to date is deployment + OAuth metadata/negative-auth smoke. Use an approved CI-admin/Cloudflare testing channel for this optional physical check.

## Decision

M0B remains **IN PROGRESS** until native ChatGPT invocation and authenticated recovery, despite validated backend protocols, production deployment and local synthetic A→B tests. GitHub is documentation/code/CI; Brain D1 is memory. No private transcripts are committed to GitHub.

## 2026-10-29 update — native ChatGPT invocation failed, OAuth approval stalled

Owner invoked VIIVERSION Mark Brain from an ordinary ChatGPT conversation, but the model reported that no Mark tools were exposed and **no direct D1 read occurred**; it answered from ChatGPT project history. This is a failed *native MCP action* test, not a success.

Cloudflare D1 inspection: one registered OAuth client, one previously approved pairing, **consumed=0**, **access tokens=0**, **refresh tokens=0**, **invocation receipts=0**. The pairing had expired. Root cause confirmed for the stalled OAuth flow: the owner confirmed a pairing out of band but the old browser form required manually submitting again before a 10-minute expiry. A registered personal plugin is not equivalent to an authorized app connection.

[PR #42](https://github.com/mirozdanie6v/viiversion/pull/42), merge commit `ff882d121097d450ab8a50e348b64369c1fbce15`: while OAuth consent page is open, it refreshes every 3s; on approved GET it atomically consumes the specific pairing and redirects with a PKCE-bound authorization code, with no passwords or technical token fields. Expired pairings return HTTP 410. The old expired pairing **cannot** be revived. [CI 40872050895](https://github.com/mirozdanie6v/viiversion/actions/runs/40872050895) passed; [production deploy 40872146597](https://github.com/mirozdanie6v/viiversion/actions/runs/40872146597) passed (migration, Worker deployment and public-auth-negative smoke).

**Remaining gate:** The user must be able to initiate a **fresh OAuth authorization request from ChatGPT** for the existing Mark plugin. Once ChatGPT opens a new pending pairing page, the already authorized Cloudflare management connection can approve that exact request, with no manual credentials; the page will auto-complete authorization while open. A native ChatGPT chat A invoke/readback in chat B is then still required. A disabled connect button or missing tools must not be treated as successful connection; an account-specific UI/plan limitation might require resolving the plugin install/connect state. Do not publish memory endpoints anonymously as a workaround.

## 2026-10-29 late — native VIIVERSION Personal Web browser attempted, not Firecrawl

The private Personal Web repo `mirozdanie6v/viiversion-personal-web` already has a GitHub OIDC-based private Chat bridge and Cloudflare Chromium/Durable Objects. **Its browser successfully returned the existing workspace and tabs** in [run 40914930544](https://github.com/mirozdanie6v/viiversion-personal-web/actions/runs/40914930544). The workspace resumed a Yandex verification tab from a public URL checkpoint, **without restoring authentication cookies or full browser history**. Creating a new tab at `https://chatgpt.com/plugins` failed as actual Chromium navigation `Page returned HTTP 403` in [run 40915066247](https://github.com/mirozdanie6v/viiversion-personal-web/actions/runs/40915066247); independent request to the ChatGPT home page also failed 403 in [run 40916379159](https://github.com/mirozdanie6v/viiversion-personal-web/actions/runs/40916379159). Browser/workflow communication works, but the external ChatGPT website rejects this browser's HTTPS request. Source `browser-workspace.ts` checks the real navigation response status; `publicUrl` does not block `chatgpt.com` by hostname. There is no evidence of a ChatGPT signed-in session in Personal Web.

The installed Plugin Creator integration can read and update the personal plugin manifest, **but does not expose a direct install/reconnect action** into the ChatGPT user's account. Official OpenAI custom MCP documentation currently lists full custom MCP support for Business/Enterprise/Edu and plan/workspace restrictions: https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt . Do not infer plan-specific blockage solely from the appearance of a created plugin; an actual tool-install/authorization attempt or account entitlement check is required.

Cloudflare D1 independently rechecked: **1 OAuth registered client, 0 consumed pairings, 0 active access tokens, 0 refresh tokens, 0 invocation receipts.** No real ChatGPT context has reached Mark. **Next supported acceptance action:** authenticated ChatGPT host flow must install/authorize the app and provide real MCP tool calls; our anonymous GitHub bridge is intentionally isolated from owner saved sessions and must not be given user credentials or proprietary chat cookies. Do not claim the integration fixed by adding host allowlists, repeating HTTP 403 requests, or bypassing ChatGPT security.
