# Architectural conflict audit — Mark unified architecture, 2026-10-27

**Conclusion:** seven original Brain documents and v0.1 runtime are useful, but did NOT together specify the accepted unified Mark. This audit reconciles source-of-truth ordering and explicitly preserves implementation gaps. No existing production records, credentials, schemas or code modified by this documentation PR.

| ID | Severity | Contradiction / evidence | Resolution | Actual implemented status |
| --- | --- | --- | --- | --- |
| A01 | CRITICAL | CONSTITUTION defines Mark identity, but production runtime only seeds Day-0 state; it does not hydrate and enforce a verified Identity Core as durable versioned memory | Architecture §2; identity versions and independent permission gate; no self-modification of Constitution | M1 NOT IMPLEMENTED |
| A02 | CRITICAL | Original proposal assumed chat-connected autonomous receipt, while official ChatGPT custom MCP docs say app selection applies per message rather than an entire chat | Architecture §7; feasibility M0B, acceptance M3; forbid treating a one-message MCP call as persistent subscription | M0B BLOCKED |
| A03 | HIGH | COMPANY_REGISTRY_SCHEMA calls its subject a canonical inventory, but code has no always-current entity registry; DAY_0_AUDIT_BRIEF mandates wholesale audit before architecture | Schema is desired contract, not existing hydrated registry. Event-driven updates first; Day-0 audit now historical/baseline and cannot block this architectural decision | M4 NOT IMPLEMENTED |
| A04 | CRITICAL | CEO_OPERATING_LOOP.md describes 8-stage CEO behavior; runtime executes only audit→diagnose and truthfully returns CEO_LOOP_NOT_IMPLEMENTED | CEO doc labeled TARGET, runtime evidence cited, no claims full loop in acceptance | M5 NOT IMPLEMENTED |
| A05 | HIGH | Global singleton checkpoints(id=1) represents only latest run. Original registry schema describes richer run checkpoints; multiple chats/runs not isolated | Architecture §6; per-run/per-session checkpoint after safe migration; preserve existing checkpoint and evidence | M2/M6 NOT IMPLEMENTED |
| A06 | HIGH | Event Log and Working Context described without a defined committed receipt, ordering or idempotent semantics | Architecture §4,§6: durable receipt before interpretation; at-least-once with deduplication, version checks and D1 atomic operations; external side effects separately verified | M2 NOT IMPLEMENTED |
| A07 | HIGH | COGNITIVE_MODEL describes founder cognitive models; this is not Mark's Identity Core nor an operational working context | Keep founder-model and memory-class text, distinguish Identity Core, Self-Model, context and evidence | M1/M2 NOT IMPLEMENTED |
| A08 | HIGH | README promotes earlier infrastructure topology and "minimal missing CEO layer" as if historical design was current; actual cross-project components are portable patterns only | New source hierarchy: Constitution > ADR > unified architecture > roadmap > specialized docs > historical README/brief. Append supersession notice to README, preserve past extraction audits | HISTORIC, NOT TARGET |
| A09 | MEDIUM | Runtime README says normal Actions deployment does fresh authenticated E2E; current GitHub workflow skips authenticated tests if GitHub token copies absent, while authorized Cloudflare control-plane probe passed | Clarify distinction; preserve last actual Cloudflare E2E evidence; do not claim normal CI performs authenticated smoke | CORRECTED DOCUMENTATION |
| A10 | HIGH | Privacy/retention and chat-by-chat isolation unspecified; uploading all chat text would overcollect personal and client material | Only explicitly connected corporate chat scopes; metadata/derived summaries by default; retention, owner permissions and deletion workflow must be approved before broader collection | POLICY IMPLEMENTATION GATE |
| A11 | HIGH | Decision-rights allow planning/approved reversible actions, but automated "learn" might mistakenly promote chat suggestions to founder-approved obligations | Protected Identity Core; distinctions proposal/decision/evidence; founder-approval channel required for binding actions | EXISTING APPROVAL API TESTED, COMPLETE GOVERNANCE NOT IMPLEMENTED |
| A12 | MEDIUM | Canonical Brain docs are on brain-v0.1-bootstrap, not on default main, which hosts other active project code | Approve and merge docs into Brain branch first; separate reviewed main-branch integration with conflict audit, no force push/automatic product deployment | INTEGRATION PENDING |
| A13 | HIGH | Previous architecture could lead to many "necessary" queues, DOs, R2 stores and additional projects without evidence | Modular single Brain Worker + existing D1 + existing Workflow only where needed; any added service via evidence-backed ADR | CONSTRAINT ACCEPTED |
| A14 | HIGH | CI green, Worker deployed and 35 tests previously gave impression that Mark as a whole is working | Roadmap uses separate architectural / code / running-user-path acceptance; /readiness false until capabilities implemented | RUNTIME v0.1 ONLY |

## Decision and corrective action

1. Adopt [MARK_ARCHITECTURE.md](MARK_ARCHITECTURE.md) and [MARK_ROADMAP.md](MARK_ROADMAP.md) as the technically reconciled **target**, under existing Constitution.
2. Ratify ADR-0001 on the founder's explicit direction to audit, correct and approve the final unified architecture; do not interpret this as blanket authorization to change policy, copy whole conversations, or deploy features.
3. Add a Decision Journal record linking the approved architecture, with ChatGPT passive message intake explicitly UNVERIFIED.
4. Do not require another full product inventory before implementing the mechanism of information transfer. Historical Day-0 inventory can be used as selective evidence once streaming/incremental reconciliation is real.
5. No separate services or new repositories are justified by this audit.
6. Document boundaries before source access: default to corporate opt-in scopes, least privilege, source freshness, and evidence-backed state updates.

## External support for the critical boundary

- Official OpenAI documentation: https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt — app selection per message, re-mention for new data/action; does not provide a promise of passive whole-conversation streaming.
- Official Cloudflare D1 behavior: https://developers.cloudflare.com/d1/worker-api/d1-database/ — batched D1 prepared statements may be transactionally grouped. It does not transact over remote GitHub or ChatGPT.
- Existing proof of limited runtime: ../audits/2026-10-27-stage1-production-acceptance.md. The runtime's healthy deployed D1/Workflow is **not evidence** of M1–M6 functionality.

## Requirements before calling Mark production ready

An actual supported chat integration, versioned identity, reliable intake/working context, live registry, independently isolated checkpoints, authority/retention controls and a full validated cognition–action–learning cycle. Missing any is reported as a limitation, never represented as complete.
