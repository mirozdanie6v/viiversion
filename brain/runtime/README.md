> **2026-10-27 DOC ACCURACY NOTICE:** canonical target for Mark is [the unified architecture](../architecture/MARK_ARCHITECTURE.md), which is not implemented in this v0.1 runtime. Existing deploy Github Actions verifies Cloudflare Worker secret names; without separately supplied GitHub test credentials it **skips authenticated Actions smoke**, even though the separately initiated Cloudflare administrator production acceptance was successful (see [audit](../audits/2026-10-27-stage1-production-acceptance.md)). This runtime currently has one **global** checkpoint, not isolated per-run. All "would"/"must" statements below are design intent unless backed by current evidence. The earlier statement that normal deployment always runs a fresh authenticated remote checkpoint smoke is **superseded** by this notice and the Oct 27 deploy description.

# Mark Brain Runtime v0.1

Dedicated Cloudflare Worker with independent D1 `viiversion-brain` and CEO Workflow. Source products remain untouched.

## Deployment and persistence

D1 was provisioned once and its UUID is pinned in `wrangler.jsonc`. Normal GitHub Actions deployment never calls `wrangler d1 list` or `wrangler d1 create`: it runs tests, verifies Cloudflare credentials, applies existing migrations, deploys, then checks the remote Worker/Workflow with a fresh-session D1 checkpoint smoke test.

**Authorization:** All company-state endpoints (`/state`, `/context`, `/bootstrap`, `/runs`) require a Cloudflare `BRAIN_API_TOKEN` Worker secret (Bearer token, minimum 32 characters). Without it they fail closed with HTTP 401. Public `GET /health` does not disclose state. **Stage-1 Cloudflare-owned secrets:** existing `BRAIN_API_TOKEN` and independent `BRAIN_APPROVAL_TOKEN` remain on the Cloudflare Worker. GitHub Actions checks their names using Wrangler before deployment and never reads, replaces, or rotates their values. Cloudflare documents that Wrangler deployments preserve existing Worker secrets. GitHub Actions secrets with the same names are optional and used solely for full authenticated remote smoke tests; they are not prerequisites for deployment. When those credentials are absent, a public revision/negative-auth smoke and direct D1 inventory must be recorded, while authenticated end-to-end verification remains outstanding. There is no random token fallback.

The live smoke proof covers: denied unauthenticated read; bootstrap and canonical approved decision DJ-001 import from brain/DECISION_JOURNAL.md; read objective/open loops/decisions; idempotent run replay; Workflow audit-to-diagnose persistence; and a **separate Node.js process** restoring the objective, decision, open loops, and checkpoint from D1 without chat history. `/context` returns the protected persisted context, including up to 100 chronological decisions; it is not yet integrated into ChatGPT chat startup.

This is **only v0.1 persistence**. It does not prove a completed autonomous CEO Operating Loop, comprehensive Day-0 source reconciliation, or cross-chat ChatGPT integration.

## Approved commitments and deterministic execution (v0.2)

No commercial/client records are committed to the **public** source repository. All private
approved agreements must be imported to the protected D1 through authenticated API calls.
The import endpoint requires a **separate** Worker secret `BRAIN_APPROVAL_TOKEN` (minimum 32 characters), not the read/run `BRAIN_API_TOKEN`. Until this new secret is configured, imports intentionally return HTTP 401. The caller must cite the approved source and the human attesting it. The API cannot verify
that a founder truly approved a statement; do not let an AI model possess its write token.

- `POST /approved-commitments`: append one explicit founder-attested, source-linked
  approved or cancellation record; idempotent on identical record ID and payload.
  New terms require a new ID, `revision`, and exact `supersedes` reference.
- `GET /approved-commitments`: fetch append-only history (private, bearer-protected).
- `POST /execution-plans`: derive and durably persist a content-addressed plan
  from **only approved** steps; no AI inference or invented terms.
- `GET /execution-plans?id=PLAN-...`: recover that exact durable snapshot in a fresh process.

Examples intentionally use fictitious projects in tests; there is **no automatic import of
real client contracts**. Import real facts only through a trusted secure channel.
The operational statuses are not inferred from GitHub/Linear automatically.
A plan is a faithful reconstruction of recorded commitments, not autonomous reasoning.

Safety: bearer token required for every endpoint, append-only versions; no client system,
production secrets, billing, ad budget or external task is modified. Concurrent conflicting
revisions fail under a DB unique constraint. D1 migration 0002 is additive.

### Approval-token provisioning

The deploy workflow requires both secret *names* on the Cloudflare Worker, checks for them before applying migrations, and never overwrites their values. Wrangler cannot read existing secret values. Their independence and length must be attested by the administrator or confirmed with separately authorized API tests. Real client contracts are not sent by smoke tests. GitHub workflows must never echo tokens or approval payloads.

## One-time private import of real approved client decisions

This is intentionally separate from the public Git repository. A founder adds the prepared
base64-encoded UTF-8 JSON package as a temporary Actions repository secret named
`BRAIN_COMMITMENTS_IMPORT_B64`. Base64 is **only an encoding, not encryption**.
The commercial package is protected by GitHub's Actions secret storage; never commit it
or put its contents in workflow inputs, issues, PRs or logs.

1. Founder records must already exist in the canonical closed company Decision Journal.
   The package must be an object `{"schemaVersion":1,"records":[...]}` using the
   `ApprovedCommitment` schema. Import cannot attest to a client's contractual acceptance
   on its own; preserve explicit distinctions between sent offers and signed contracts.
2. In repository Settings > Secrets and variables > Actions, add temporary
   `BRAIN_COMMITMENTS_IMPORT_B64` with the **entire single-line file contents**.
3. Run the existing **Deploy VIIVERSION Brain** workflow manually on
   `brain-v0.1-bootstrap` (or push code to that branch). The runner obtains separate,
   masked, transient read and founder-approval tokens using the existing deploy setup.
4. The importer verifies schema/dependencies, checks **all** conflicts before writing,
   appends only missing records (re-runs are idempotent), then reads back all imported records,
   builds a content-addressed execution plan and verifies its exact content. A **separate
   Node process** independently fetches records and the saved plan from Cloudflare D1 and
   verifies SHA-256 digests. Logs contain only counts and PASS/FAIL markers.
5. Once the action reports PASS, **delete the temporary import secret** in GitHub UI.
   Re-running ordinary deployments afterward does not delete company decisions from D1.

If the import secret is missing, deployment remains functional but logs SKIP (not PASS).
If any source record is changed, the importer must stop on a conflict instead of rewriting
it silently. Changes require explicit new `revision` and `supersedes` (handled via
reviewed import workflow changes); no automatic marketing spend or client notification is made.

## Unified read context and explicit acceptance gate

The protected `GET /context` endpoint now returns the persisted CEO state/checkpoint,
legacy decision log, **all append-only approved commitments** stored separately in D1,
and a deterministic execution plan. The endpoint never edits decisions, changes
commercial terms, or interprets unverified observations as approval. The same
source data is recoverable across independent processes.

Protected `GET /readiness` reports acceptance checks and record counts. Its
`ready` field remains **false** until the unimplemented capabilities are actually
integrated: Company Registry hydration, authoritative GitHub/Linear/Drive source
reconciliation, full CEO operating loop, and chat-startup hydration. A successful
deployment, bootstrap checkpoint, or four restored client records cannot turn
`ready` true. End-to-end smoke checks this invariant.

This is an **incremental repair to the existing Brain**, not a new company
inventory, claim of company-wide coverage, or independent autonomous CEO.

## Stage-1 run durability contract (26 Oct 2026)

- A request key is claimed by one atomic D1 `runs.idempotency_key` unique insertion. Racing callers read back the same run ID; the former `brain_events` receipts remain readable for legacy requests.
- Dispatch uses the deterministic Cloudflare Workflow instance ID equal to the persisted run ID. A repeated POST with the same request key retries dispatch safely after transient errors; only Workflows duplicate-instance code 10405 is treated as already queued.
- `GET /runs?idempotencyKey=...` returns the persisted run, including its stage/status. The currently implemented audit-to-diagnose Workflow records `status=blocked` and `blockedReason=CEO_LOOP_NOT_IMPLEMENTED`, not fictitious completion.
- The singleton `checkpoints` record represents the latest checkpoint, not a per-run history. Do not interpret concurrent independent runs as an independently verified multi-run CEO orchestration system. Full CEO cycle, registry hydration and chat connector are outside stage 1.
- Production deployment requires persistent GitHub Action secrets; if absent, the **existing deployed Worker remains unchanged**. A passing PR CI is not a production rollout.

## 27 Oct 2026 — live deployment with Cloudflare-managed secrets

- GitHub Actions no longer requires duplicates of existing Cloudflare secrets: Wrangler verifies required binding names, then deploys without writing Worker secrets.
- Public smoke checks health revision `brain-stage1-secure-retention-20261027`, unauthenticated denial on every protected route, and wrong-token denial.
- Authenticated smoke tests and private import run **only when two independent valid GitHub Actions test credentials are supplied**. A public-only green deployment does not prove authenticated read/run or full CEO acceptance.
- Remote D1 inventory via authorized Cloudflare API is a separate read-only check. Data in D1 is not deleted or reseeded by this deploy workflow unless an explicitly enabled smoke/import step performs its documented idempotent writes.

## M0B — invocation-time ChatGPT context receipt (2026-10-27)

**Implementation scope:** protected `POST /invocation-context` (accept actual supplied context), protected `GET /invocation-context?invocationId=...` (exact durable readback), and `GET /invocation-context?projectKey=viiversion&limit=10` (recent company/project receipts). The data lives in the existing Brain D1 table `invocation_context_receipts` (migration `0003_invocation_contexts.sql`). No new secrets, queues, databases or background services. Existing `BRAIN_API_TOKEN` grants access; external callers without that token are rejected. This is **not** a founder approval channel.

Example **synthetic-only** POST payload:

```json
{
  "invocationId":"demo-invocation-0001",
  "projectKey":"viiversion",
  "sourceChatRef":"sample-chat-A",
  "captureKind":"model_summary",
  "declaredWindow":"caller selected messages; completeness unknown",
  "contextText":"Synthetic decision: review the test workflow; no real client data."
}
```

On success the Worker returns a durable receipt ID, SHA-256, persisted timestamp, coverage `unknown` and replay status. POST response omits raw `contextText`; authenticated GET returns exactly what was saved. Same invocation ID and same payload is an idempotent replay; same ID with different content returns `409 INVOCATION_ID_CONFLICT`.

**Do not mistake this HTTP API for a connected ChatGPT invocation.** A ChatGPT tool/connector still needs to pass the model-accessible context on explicit Mark invocation, and its real payload scope must be compared to a known fixture. A user-supplied `sourceChatRef` is **not** a verified native ChatGPT conversation ID. The server never claims that a receipt contains the entire conversation. An unknown/partial scope remains unknown/partial, not `verified_complete`.

No live client/transcript content is committed to public GitHub or used in GitHub CI. M0B is accepted only after a native ordinary-ChatGPT call with known context successfully reaches this protected API and is later independently retrieved. See [contract](../architecture/CHAT_CONTEXT_HANDOFF_CONTRACT.md). Until then: **backend implementation exists; native integration is PENDING VERIFICATION.**

### Unified /context now includes received invocation memory (M0B second slice)

Protected `GET /context` includes `invocationContexts`, the **10 most recent D1 receipts** (across project keys accessible to this single-company token) alongside previously existing state, decisions, approvals and execution plan. The receipts preserve exactly the originally supplied `contextText`, `captureKind` and honest `coverage=unknown`; they are not autonomously classified as approved founder decisions. `GET /readiness` omits the private receipt list, still reports `ready=false` and `chatStartupHydrationIntegrated=false` because no actual ChatGPT tool was connected. Large archives/older receipts must be queried separately with authorized `GET /invocation-context` and are not implicitly lost. This is an implementation step toward Mark's working memory, not proof of continuous listening or true semantic processing.

## ChatGPT MCP interface (M0B — OAuth deployment)

The same Worker now offers an owner-scoped, authenticated remote MCP endpoint:

**Server URL:** `https://viiversion-brain.viiversion.workers.dev/mcp`

Tools:
- `mark_capture_context`: store the caller's *actually available* conversation context as a durable invocation receipt. Only explicit calls; no passive transcript access.
- `mark_recall_context`: return saved context from prior invocations, with `coverage=unknown` unless separately verified.

**Security:** ChatGPT must use OAuth authorization code + S256 PKCE and dynamic client registration at this Worker's own `/.well-known/oauth-authorization-server`. The owner authorizes through a secured HTTPS form hosted at the **verified Brain Worker origin**, using the **existing Brain API credential from their own password manager**. Never paste that credential into ChatGPT, GitHub files, tool arguments or OAuth redirect URLs. ChatGPT receives only random scoped short-lived OAuth tokens, stored as SHA-256 digests in the existing D1 table. The commercial `BRAIN_APPROVAL_TOKEN` is never accessible to ChatGPT. Authentication is required even for MCP `initialize` and `tools/list` calls; unauthorized calls yield a Bearer OAuth resource challenge. OAuth registrations accept only expected ChatGPT callback origins/paths.

**Manual account binding:** The ChatGPT account owner must explicitly add the custom MCP server at ChatGPT web → Plugins → Add custom MCP server, enter the URL above, select OAuth, authorize on the verified Brain site and install. This action is **not performed merely by deploying the Worker**, and custom ChatGPT app installation cannot be done by GitHub commits. If the owner does not possess the previously provisioned Brain API credential, a separate approved owner-authentication method is required: do not read, copy or rotate Cloudflare secrets just to complete the demo.

**Acceptance limitation:** Tests simulate MCP/A→B calls with synthetic data, not actual ChatGPT. M0B remains IN PROGRESS until the personal plugin is installed and a real native invocation passes a known fixture, reads it in another ChatGPT chat, and verifies actual model context coverage. Registration permissions/plan can block the manual installation; report such blocks truthfully.

OAuth code hashes expire in five minutes, access tokens after one hour, refresh tokens after 30 days. Token refresh rotates the refresh token; owner can revoke individual tokens via standard `/oauth/revoke`. D1 migration `0004_mark_oauth.sql` is additive. No new Cloudflare components or source-repository storage for private chat text are introduced.
