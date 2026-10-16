# Mark Brain Runtime v0.1

Dedicated Cloudflare Worker with independent D1 `viiversion-brain` and CEO Workflow. Source products remain untouched.

## Deployment and persistence

D1 was provisioned once and its UUID is pinned in `wrangler.jsonc`. Normal GitHub Actions deployment never calls `wrangler d1 list` or `wrangler d1 create`: it runs tests, verifies Cloudflare credentials, applies existing migrations, deploys, then checks the remote Worker/Workflow with a fresh-session D1 checkpoint smoke test.

**Authorization:** All company-state endpoints (`/state`, `/context`, `/bootstrap`, `/runs`) require a Cloudflare `BRAIN_API_TOKEN` Worker secret (Bearer token, minimum 32 characters). Without it they fail closed with HTTP 401. Public `GET /health` does not disclose state. Set a stable `BRAIN_API_TOKEN` GitHub Actions secret before onboarding external clients. Until then CI generates a high-entropy, per-deploy bootstrap token that is masked in logs, installed as the Worker secret, used for smoke verification, and then discarded by the runner. Existing clients must not depend on this rotating bootstrap token.

The live smoke proof covers: denied unauthenticated read; bootstrap and canonical approved decision DJ-001 import from brain/DECISION_JOURNAL.md; read objective/open loops/decisions; idempotent run replay; Workflow audit-to-diagnose persistence; and a **separate Node.js process** restoring the objective, decision, open loops, and checkpoint from D1 without chat history. `/context` returns the protected persisted context, including up to 100 chronological decisions; it is not yet integrated into ChatGPT chat startup.

This is **only v0.1 persistence**. It does not prove a completed autonomous CEO Operating Loop, comprehensive Day-0 source reconciliation, or cross-chat ChatGPT integration.

## Approved commitments and deterministic execution (v0.2)

No commercial/client records are committed to the **public** source repository. All private
approved agreements must be imported to the protected D1 through authenticated API calls.
The caller must cite the approved source and the human attesting it. The API cannot verify
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
