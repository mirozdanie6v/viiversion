# MARK M0B — Invocation context backend acceptance, 2026-10-27

**Result:** BACKEND VERIFIED; REAL CHATGPT INVOCATION NOT YET VERIFIED; milestone M0B **PARTIAL / IN PROGRESS**.

## Approved requirement

At explicit invocation in an ordinary ChatGPT conversation, the context that ChatGPT **actually supplies to Mark** is transferred to external Brain and durably saved as operational memory. Mark independently processes knowledge after receipt. Passive monitoring of every message is **not required**, nor may the system claim that an MCP invocation contains the entire transcript.

Sources: [DJ-006](../DECISION_JOURNAL.md), [handoff contract](../architecture/CHAT_CONTEXT_HANDOFF_CONTRACT.md), [roadmap M0B/M3](../architecture/MARK_ROADMAP.md).

## Implemented in existing Brain

- PR [#38](https://github.com/mirozdanie6v/viiversion/pull/38), merged to `brain-v0.1-bootstrap`, commit `fd61546976ad2032b054e3200244c6e567641af9`.
- New additive migration `brain/runtime/migrations/0003_invocation_contexts.sql`, table `invocation_context_receipts`, D1 indexes for project/time.
- `brain/runtime/src/invocation-context.ts`: input validation, UTF-8 size limits, bounded request-stream reader, SHA-256 content checksum, idempotent receipt insert, no silent overwrite, protected readback and bounded recent-project list.
- `brain/runtime/src/worker.ts`: authenticated `POST /invocation-context` and `GET /invocation-context?invocationId=...` / `GET /invocation-context?projectKey=viiversion&limit=10`. Same existing `BRAIN_API_TOKEN`; no founder-approval token required/exposed. POST success deliberately omits raw content.
- Coverage is explicitly `unknown` until a real invocation verifies what the platform supplied. Caller-supplied conversation reference and labels are **claims**, not platform-attested chat metadata.
- No new Cloudflare service, queue, OAuth installation, or separate store. GitHub is code/coordination, not storage for private chat text.

## Verified evidence

1. [Pull-request CI run 40512434846](https://github.com/mirozdanie6v/viiversion/actions/runs/40512434846): **PASS 40/40 tests**, including five new M0B D1 SQLite tests; Wrangler deploy dry-run PASS; TypeScript check PASS.
2. [Production deploy run 40512633743](https://github.com/mirozdanie6v/viiversion/actions/runs/40512633743): **SUCCESS**. D1 migration applied; Worker deployed; public/invalid-Bearer negative-auth smoke PASS, including new routes. GitHub-only authenticated smoke was **SKIPPED**, so do not claim protected HTTP write/read was exercised live.
3. Cloudflare administrator D1 read (27 Oct 2026): table `invocation_context_receipts` exists; baseline preserved: **1 decision, 4 approved commitments, 2 plans, 10 existing runs**.
4. Cloudflare administrator production-D1 **synthetic-only** physical insertion/readback test: record `m0b-physical-smoke-20261027` was inserted, exact context text read back successfully, coverage remained `unknown`, and a stored SHA-256 digest matched the test fixture. The test receipt was **deleted immediately**; post-test table count 0; decisions/commitments/plans unchanged. This verifies physical D1 persistence, **not** authenticated Worker HTTP nor native ChatGPT integration.
5. CI first failed on unsupported TypeScript parameter-property syntax under Node22 strip-only mode; corrected in PR before merge and re-ran successfully. Historical failed CI result is not counted as pass.

## Remaining blockers / exact acceptance gates

- **ChatGPT-facing Mark tool/connector is not registered in this conversation.** No actual native invoke → model-available context → Worker receipt has been observed. The existing GitHub plugin cannot independently capture messages that ChatGPT did not pass.
- Whether ChatGPT supplies a full history, excerpt, summary or no older context must be determined through a controlled real chat fixture. Never infer completeness from success of D1 storage.
- Full end-to-end test: chat A (known facts/proposal/decision/question) → explicit Mark invocation → capture **actual tool payload** → independent protected HTTP readback → new authorized chat B → actual next invocation, verify correct contextual recall, missing-history disclosure, no capture from uninvoked chat.
- Verify permission/authentication for the custom ChatGPT-facing connector on the user's actual ChatGPT plan/workspace; current backend uses a confidential static `BRAIN_API_TOKEN` and must **never** expose it to a user-visible tool schema, prompt, URL or GitHub repo. Choose a supported secure auth approach rather than an anonymous public write endpoint.
- Full persistent identity, autonomous context extraction and promotion to long-term memory are later M1/M2/M3/M5 features. This backend receipt capability alone does not satisfy the full Brain mission.

## Rollback

Source changes are isolated to Brain runtime and additive D1 table; reverting Worker to prior commit does not require deleting the new table or changing existing company data/secrets. Preserve historic receipts if real data is later ingested; deletion/retention only after an approved data policy.

**Conclusion:** The first working context persistence interface exists and is deployed. **M0B cannot be declared complete until a real native ChatGPT tool invocation and a trusted readback demonstrate the intended path.**

## M0B second backend slice: unified context hydration (same date)

- [PR #39](https://github.com/mirozdanie6v/viiversion/pull/39) merged, commit `82383c1f8680059a03934602e936b151c92bf678`. `GET /context` now carries `invocationContexts` from the 10 latest D1 receipts, visible to the same authorized Brain reader that restores other persisted knowledge. Older receipts can still be fetched explicitly; the field is a limited recent view, **not comprehensive working-memory reasoning**.
- [Pull-request CI 40513691012](https://github.com/mirozdanie6v/viiversion/actions/runs/40513691012): **PASS 41/41 tests**, including the unified-context hydration regression, Wrangler dry-run and static TypeScript checks.
- [Production deployment 40513791412](https://github.com/mirozdanie6v/viiversion/actions/runs/40513791412): **SUCCESS**, including D1 migration and negative-auth public smoke. Authenticated Actions smoke again skipped due unavailable approved testing credential; no claim of real authenticated `GET /context` E2E from Cloudflare Worker.
- Independent Cloudflare D1 read after deploy: 1 decision, 4 approved commitments, 2 plans, 10 runs, 0 invocation receipts (synthetic test cleaned up; no real ChatGPT content uploaded).

**Current conclusion:** Both protected HTTP endpoints for context receipt/readback **and the unified Brain context read model** are implemented, CI-tested and deployed. **M0B still PARTIAL** until an authorized real ChatGPT invocation transfers its actual context and a second chat can recover it through an authenticated tool. This is NOT passive chat monitoring, not whole-chat transcript completeness, and not autonomous semantic interpretation.
