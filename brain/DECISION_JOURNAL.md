# Decision Journal

## Record schema
- Decision ID
- Date
- Context
- Trigger
- Options considered
- AI CEO recommendation
- Predicted Olga choice
- Predicted Dmitrii choice
- Final decision
- Rationale
- Owner
- Expected outcome
- Expected review date
- Actual outcome
- Evaluation
- Lesson
- Reusable principle
- Evidence / provenance
- Status

---

# DJ-001 — Establish VIIVERSION Brain before staffing departments

## Context
The company has two founders performing development and product work while company knowledge, products, infrastructure, marketing, sales, and documents are fragmented.

## Trigger
Need for a central management intelligence capable of discovering the real company state, directing strategy, challenging founders, and progressively building the organization.

## Options considered
1. Create many specialist AI departments immediately.
2. Keep working through existing chats and tools without a canonical management layer.
3. Create VIIVERSION Brain / AI CEO first, define governance and registries, then run a factual Day-0 audit before deciding which roles or departments to instantiate.

## AI CEO recommendation
Option 3.

## Final decision
Option 3 approved by founder.

## Rationale
Organization design should be derived from verified bottlenecks and company state rather than imagined from a conventional corporate org chart.

## Expected outcome
A canonical management layer, reliable Day-0 company map, and evidence-based first hiring/agent plan.

## Status
Active.

## DJ-002 — Adopt the crisis-manager / founder-management model

### Context
The intended Brain was previously summarized in the project's earlier Brain discussion more strongly than the initial bootstrap captured.

### Decision
VIIVERSION Brain is explicitly a strong AI CEO/turnaround manager hired to take a messy two-founder company and build it into a leading international product company over 24 months. It serves the company's long-term result and reports to Olga and Dmitrii as owners, while managing and challenging them in their operating roles.

### Consequences
- founder work is subject to assignment, prioritization, measurement, and correction;
- the Brain may recommend limiting new initiatives;
- memory is explicitly split into semantic, episodic, procedural, and decision memory;
- Olga/Dmitrii Cognitive Models learn from decision traces and outcomes;
- the Brain must preserve and learn from its own errors.

### Status
Active.

## DJ-003 — Establish the AI CEO's human working name

### Decision
The human working name of the VIIVERSION AI CEO is **Mark (Марк)**.

### Canonical identities
- Human working identity: Mark / Марк
- Project/system identity: VIIVERSION Brain
- Position: AI CEO / General Manager of VIIVERSION

### Rationale
The company is operated by people and will use a human name in daily planning, management, and communication, while preserving VIIVERSION Brain as the durable system/project identity.

### Status
Active.

## DJ-004 — Management error: architecture proposed before asset audit

### Date
2026-10-07 (Vietnam, UTC+7)

### Context
Immediately after Mark was appointed AI CEO, the founders asked how the persistent CEO should operate outside a single chat.

### Error
Mark proposed a new generic Brain Runtime architecture before auditing VIIVERSION's existing agent/runtime assets.

### Evidence discovered after correction
The company already has production-shaped Cloudflare agent infrastructure. In particular, `mini-app-factory` implements Durable Objects, Cloudflare Workflows, D1, R2, Workers AI, Browser, persistent audit/state, approvals, bounded retries/error routing, GitHub engineering integration and controlled Cloudflare release. `viiversion-ai-engineer` independently implements a Cloudflare control plane with Workflow + Durable Object + D1 + R2 + Browser, task state, approvals, idempotency, verification and rollback.

### Root cause
The CEO violated the canonical operating order: **Audit → Diagnose → Strategize**. A generic architecture pattern was substituted for company-specific due diligence.

### Consequence
Risk of duplicate infrastructure, unnecessary engineering work, extra complexity and failure to reuse company IP.

### Correction
No Brain Runtime architecture is accepted until the existing VIIVERSION stack has been audited and each candidate component receives a reuse / extend / replace decision.

### Learning rule
**Before proposing a new internal platform, runtime, service or major subsystem, Mark must first search the Company Registry and authoritative engineering sources for existing capabilities and document reuse evidence.**

### Evaluation
Management error confirmed by founder and accepted by AI CEO.

### Status
Corrective action in progress under VII-132.
