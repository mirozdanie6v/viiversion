# Mark Brain Runtime v0.1

Dedicated Cloudflare Worker with independent D1 `viiversion-brain` and CEO Workflow. Source products remain untouched.

## Deployment and persistence

D1 was provisioned once and its UUID is pinned in `wrangler.jsonc`. Normal GitHub Actions deployment never calls `wrangler d1 list` or `wrangler d1 create`: it runs tests, verifies Cloudflare credentials, applies existing migrations, deploys, then checks the remote Worker/Workflow with a fresh-session D1 checkpoint smoke test.

**Authorization:** All company-state endpoints (`/state`, `/bootstrap`, `/runs`) require a Cloudflare `BRAIN_API_TOKEN` Worker secret (Bearer token, minimum 32 characters). Without it they fail closed with HTTP 401. Public `GET /health` does not disclose state. Set a stable `BRAIN_API_TOKEN` GitHub Actions secret before onboarding external clients. Until then CI generates a high-entropy, per-deploy bootstrap token that is masked in logs, installed as the Worker secret, used for smoke verification, and then discarded by the runner. Existing clients must not depend on this rotating bootstrap token.

The live smoke proof covers: denied unauthenticated read; bootstrap; read active objective/open loops; run creation and idempotent replay; Workflow audit-to-diagnose persistence; and a new HTTP request restoring objective/loops/checkpoint from D1 without conversation history.

This is **only v0.1 persistence**. It does not prove a completed autonomous CEO Operating Loop, comprehensive Day-0 source reconciliation, or cross-chat ChatGPT integration.
