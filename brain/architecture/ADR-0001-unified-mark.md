# ADR-0001 — Unified Mark cognitive/memory architecture

**Status: ACCEPTED (target architecture)**
**Decision date:** 2026-10-27
**Authority:** Founder instruction in the Brain project discussion to critically audit the proposed unified architecture, resolve contradictions and adopt the final version. This is a technical architecture decision; it does not alter the authority limits in the Constitution.
**Implementation maturity:** NOT IMPLEMENTED AS A WHOLE. ChatGPT passive chat intake: BLOCKED / NOT VERIFIED.

## Context

Brain v0.1 was deployed and production-tested with a separate Worker/D1/Workflow, historical-run correction, protected context and narrowly tested commitment reads. But it lacks company-wide working memory, living registry, continuous meaningful intake from selected chats and the full autonomous CEO cognitive/action cycle. Original Brain documents intermix product intent, past decisions and implementation speculation.

The founders require Mark as a single evolving logical entity, not several integrations or independent products. The existing memory/infrastructure can be reused but must not define the product by accident.

## Accepted decision

Adopt the target described in [MARK_ARCHITECTURE.md](MARK_ARCHITECTURE.md) with five functional parts of **one** Mark: (1) permanent memory including identity, (2) operational context, (3) cognition, learning, decision and action, (4) internal sources including living registry/GitHub/Linear/Drive, (5) external sources including connected chats and internet.

- **Identity Core** is subject to founder-approved change control and cannot be autonomously rewritten. **Self-Model** and evidence-backed knowledge are versioned and may evolve according to policy.
- Working context is persistent, scoped by company/project/chat/task, and shared only across consented connected corporate sessions.
- Durable event receipt precedes interpretation; read, classification, update and external action have explicit evidence and idempotency rules. Technical event history is not a competing separate "memory product".
- Live registry changes incrementally. GitHub/Linear/Drive detailed records are retrieved selectively; wholesale recurring inventory is NOT the memory mechanism.
- One modular Brain runtime, existing Cloudflare Worker and D1, existing Workflows where justified. No speculative microservices.
- Authority and authenticity remain under [CONSTITUTION.md](../CONSTITUTION.md), with explicit rights for approvals and sensitive writes.

## Non-negotiable ChatGPT interface constraint

Official ChatGPT custom MCP documentation states that app selection applies to a message, not an entire conversation, and may require another app mention for another action:
https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt

Therefore **automatic continuous passive intake from specifically attached ordinary ChatGPT chats is not proven available**. Acceptance of this architecture does not accept an unimplemented interface. Keep milestone M0B and M3 blocked until tested and supported. No silent custom browser interception or replacement of the user's required ChatGPT UX with another product. No misleading pass/fail from MCP calls in a single message.

## Alternatives evaluated

| Alternative | Decision | Reason |
| --- | --- | --- |
| Periodic full import of products/docs/chats | REJECT as primary | Does not solve fresh continuous context and becomes stale |
| Set of independent memory/ingestion/decision microservices | REJECT at this stage | More failure, duplicated state, added reconciliation cost |
| Treat MCP tool access as subscription to entire conversation | REJECT | Not supported by current published capabilities |
| Versioned memory + operational context within modular Brain | ACCEPT | Meets conceptual model while preserving one durable state authority |
| Automatically grant Mark right to redefine Constitution | REJECT | Violates founder final approval and role separation |

## Relationship to existing approved documents

- Constitution and older Decision Journal records **remain intact**; this ADR changes technical architecture, not previously delegated business rights.
- Old Brain README, company Day-0 audit brief and early reusable runtime topology are historical provenance, not superior current technical standards. Their specific incompatible prescriptions are superseded by this ADR.
- COGNITIVE_MODEL founder profiles remain hypotheses/evidence only; Mark's own Self-Model is independent.
- COMPANY_REGISTRY_SCHEMA is a schema **contract**, not proof the registry is populated or updating.
- CEO_OPERATING_LOOP is target behavior, not proof the cycle has been coded.
- stage-1 acceptance evidence remains valid **only for the scoped tested behaviors**, not for live chat/registry/cognition.
- Reconciliation findings and status: [ARCHITECTURE_RECONCILIATION_AUDIT.md](ARCHITECTURE_RECONCILIATION_AUDIT.md).

## Consequences and controlled implementation

Implement the capability stages in [MARK_ROADMAP.md](MARK_ROADMAP.md). M0A design/decision is accepted. M0B automatic ordinary ChatGPT chat ingestion has a documented externally controlled capability blocker. M1–M6 are separately evaluated through real evidence and not accepted yet.

Approval of this ADR gives **no authorization** to alter production secrets, merge unrelated product code, import personal chats, change financial/legal commitments, or release incomplete Brain capabilities. Future changes to target architecture need a new ADR and decision journal entry; changes to Constitution require its original founder approval process.

## Evidence

- Founder explicit decision dated 2026-10-27: assess proposed architecture, resolve conflicts, approve final model.
- Earlier owner definition: permanent memory (including Mark himself), operational memory, mechanisms of learning/action, internal sources, external chats and internet as parts of the one Mark.
- Existing technical facts: [stage-1 production acceptance](../audits/2026-10-27-stage1-production-acceptance.md).
- GitHub PR #36 links accepted architecture/roadmap and systematic conflict audit.

**Final interpretation:** ACCEPTED = approved *target architecture*; NOT VERIFIED = capabilities still missing or blocked. A healthy Worker is not evidence of a fully operating Mark.
