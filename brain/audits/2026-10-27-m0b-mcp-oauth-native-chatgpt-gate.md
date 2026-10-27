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
