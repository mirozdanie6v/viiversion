# Brain stage 1: production reconciliation and acceptance evidence — 2026-10-27

**Scope:** persistent Brain v0.1 runtime, existing Cloudflare Worker `viiversion-brain`, D1 `viiversion-brain`, and CEO Workflow `viiversion-brain-ceo`. No claim of a complete CEO Operating Loop or ChatGPT Chat connector.

## 1. Pre-change evidence and legacy run reconciliation

D1 initially contained eight runs with `status=running` and `stage=diagnose`, dated 13–20 October 2026. Cloudflare Workflow list retained one matching instance, from 20 October, with actual Workflow status `complete`; the other seven were absent from the current list. Absence of a retained Workflow instance is **not** evidence of success or failure.

On 27 October, each of the eight D1 rows received an audited, compare-and-set reconciliation. An independent `brain_events` entry of type `run_status_reconciled` records the original snapshot, target status, reason, and available evidence. No existing runs, decisions, commitments, or execution plans were deleted.

- 1 verifiable completed Workflow, whose CEO business loop stops at `diagnose`: D1 `status=blocked`, `blockedReason=CEO_LOOP_NOT_IMPLEMENTED`.
- 7 unverified legacy Workflow instances: D1 `status=blocked`, `blockedReason=LEGACY_WORKFLOW_STATUS_UNVERIFIED`. Their historical Workflow outcomes remain unknown. They must never be reported as completed or errored.
- Audit entries: 8. Original started timestamps and IDs were retained.
- Historical records now reporting `running` without a live Workflow: 0.

## 2. Production deployment and secret ownership

Cloudflare alone owns the existing `BRAIN_API_TOKEN` and `BRAIN_APPROVAL_TOKEN`. Neither secret was copied into GitHub or rotated. Wrangler preflight checked binding **names**, followed by a successful deploy and unauthenticated access-control smoke.

Evidence: PRs [#30](https://github.com/mirozdanie6v/viiversion/pull/30), [#31](https://github.com/mirozdanie6v/viiversion/pull/31), [#32](https://github.com/mirozdanie6v/viiversion/pull/32), [#33](https://github.com/mirozdanie6v/viiversion/pull/33), and [#34](https://github.com/mirozdanie6v/viiversion/pull/34).

Latest production deployment: [GitHub Actions 40482091439](https://github.com/mirozdanie6v/viiversion/actions/runs/40482091439) at commit `eac13c7a43349a5af8b492e77667fd2fb6b3a34e`. **35 automated tests passed, zero failed.** No migrations to apply; protected HTTP routes denied anonymous and invalid tokens.

## 3. Authenticated production acceptance, using the Cloudflare control plane

The Cloudflare account administrator triggered an existing Workflow with a diagnostic-only `owner_production_acceptance` payload. This payload cannot be selected through public `/runs`; the public API passes only `runId`. The diagnostic Workflow reads its own protected Worker secret bindings and makes real HTTP requests to the deployed Brain Worker. **No secret values are printed or returned.**

Latest instance `acceptance-20261027-prod-03`: Cloudflare Workflow status `complete`, output `ok:true`.

The 13 reported test flags are all true:

1. Anonymous context denied.
2. Invalid bearer denied.
3. Authorized `/state` readable.
4. Authorized `/context` readable.
5. Normal read token cannot approve commitments.
6. Approval token reaches strict payload validation without writing a record.
7. Authenticated synthetic `POST /runs` accepted.
8. Identical replay is idempotent.
9. Five parallel replays use the same run.
10. D1 contains exactly one corresponding idempotency key.
11. CEO workflow correctly reports incomplete loop as `blocked`.
12. A separate HTTP request restores its persisted D1 checkpoint.
13. The four previously approved client commitments are preserved.

The diagnostic Workflow's deliberately failing transient step was retried and succeeded on its **second** attempt. The authenticated test step succeeded on its **first** attempt. This validates durable Workflow step retry and state recovery, not an arbitrary network outage or complete server disaster.

Two earlier diagnostic instances are retained as honest test evidence:
- `acceptance-20261027-prod-01`: `errored` due to Cloudflare control-plane JSON-string parameter mismatch (fixed by PR #33).
- `acceptance-20261027-prod-02`: encountered an idempotent replay race (fixed by PR #34); admin terminated the old diagnostic instance so it would not continue retrying.
- Neither diagnostic failure deleted or rewrote the four approved commitments or the two execution plans.

## 4. Independent D1 readback after successful acceptance

| Metric | Verified result |
| --- | ---: |
| Decisions | 1 |
| Approved commitments | 4 |
| Execution plans | 2 |
| D1 run rows | 10 |
| D1 runs still marked running | 0 |
| Historical audit entries | 8 |
| Run rows blocked: CEO loop incomplete | 3 |
| Run rows blocked: legacy Workflow outcome unverified | 7 |
| Checkpoints | 1 |
| Production acceptance instance status | complete |

The two synthetic test runs account for the increase from 8 to 10; both ended blocked truthfully. Last checkpoint refers to the verified successful synthetic run.

## 5. Audit judgement and known limitations

**PASS for the explicitly tested stage-1 behaviors:** deploy and secret retention; D1 historical run reconciliation; authorized reads; access separation; single-key idempotency and concurrent replay; explicit incomplete-stage status; checkpoint reload; controlled Workflow retry; preservation of decisions and commitments.

**Not proven / outside this narrow acceptance:**
- Seven old Workflow outcomes cannot be reconstructed from the current retention window; they remain explicitly unverified.
- The existing `checkpoints` schema is a **single company-global row** (`id=1`), not a per-run checkpoint log. Concurrency with **different** run IDs and multiple independent concurrent state transitions has not been stress-tested or isolated; this remains a blocker to claiming unrestricted multi-run durability.
- A malformed approval POST returned 400, intentionally avoiding any new founder-approved business record. A fully valid write of a new founder approval was **not** tested.
- Only the `audit -> diagnose` section of the CEO Workflow exists; full CEO Operating Loop is not implemented.
- Company Registry, authoritative source synchronization and intentional ordinary-Chat connection are not yet operational. `/readiness.ready` is intentionally false.

**Acceptance decision:** the scoped stage-1 core is operational and passed actual authenticated production acceptance. Full Brain/business functionality and safe arbitrary concurrent multi-run persistence are **not accepted**. Those limitations must be resolved before declaring unrestricted chat-connected production readiness.

## Security and repeatability

The full privileged Cloudflare admin acceptance is initiated through the Cloudflare control plane; it cannot be triggered unauthenticated from HTTP. GitHub CI does not store or copy the existing Brain API secret values. Use a fresh diagnostic Workflow instance ID for future verification. Keep the synthetic test run IDs separate from business operations.
