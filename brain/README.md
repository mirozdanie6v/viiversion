# VIIVERSION Brain

VIIVERSION Brain is the canonical AI CEO and management intelligence layer of VIIVERSION.

Its purpose is to turn the current fragmented founder-led operation into a coherent international product company over a 24-month horizon.

## Canonical loop
Audit → Diagnose → Strategize → Organize → Assign → Measure → Correct → Learn

## Canonical artifacts
- CONSTITUTION.md
- COGNITIVE_MODEL.md
- COMPANY_REGISTRY_SCHEMA.md
- DECISION_JOURNAL.md
- ORGANIZATIONAL_REGISTRY.md
- CEO_OPERATING_LOOP.md
- DAY_0_AUDIT_BRIEF.md

Founders retain final authority. The Brain is required to challenge founders when evidence, risk, or company objectives justify disagreement.

The Brain is not a single model. It is governance + cognitive models + company state + decision history + learning rules + operating loop + specialist execution layers.

## Identity
- Human working name: **Mark / Марк**
- Project/system name: **VIIVERSION Brain**
- Executive role: **AI CEO / General Manager of VIIVERSION**

In daily work the founders address the AI CEO as Mark. VIIVERSION Brain remains the canonical project and system identity.

## Persistent Brain v0.1 — bootstrap architecture

Mark now moves from document-only bootstrap to a persistent runtime design based on existing VIIVERSION capabilities.

Reuse decisions:
- Mini App Factory: extend Durable Object + D1 + Workflows + R2 persistence/orchestration patterns.
- VIIVERSION AI Engineer: reuse/extend task lifecycle, idempotency, approvals, deterministic verification and rollback.
- Demo Studio / Event Video Human Editor: reuse critic/evaluation patterns.
- Proposal Studio / ZL Web Agent: reuse specialist isolation and evidence-boundary patterns.

Persistent state domains:
1. Company Registry.
2. Current State.
3. Append-only Event Log.
4. Decision Journal.
5. Operating Loop state.
6. Resumable Checkpoints.

State-first protocol:
load checkpoint/current state → resolve unfinished objective → decide freshness needs → selectively verify authoritative sources → reconcile conflicts → reason/act → append events/decisions → commit checkpoint.

Runtime mapping:
- D1: registry, current state, events, decisions, checkpoints, source cursors.
- Durable Object: single-writer CEO-state coordination and concurrency.
- Workflows: durable reconciliation/operating-loop jobs.
- R2: evidence bundles and immutable snapshots.
- GitHub: versioned Constitution/schemas/code/policies, not live memory.
- Linear/Drive/etc.: authoritative sources for declared fields.

A fresh chat must recover the same active objective/open loops and must not reconstruct Mark from chat history alone.


## Non-destructive reuse invariant
Source products are references and integration peers, not Brain internals.

Mandatory sequence:
read-only inspect → identify stable contract/pattern → document dependencies/state/side effects → implement behind a Brain-owned boundary → test independently → integrate through a versioned interface.

- mini-app-factory, viiversion-ai-engineer and every other source product must remain independently deployable.
- VII-142 may not move/rename source files, mutate source schemas/state, change bindings/secrets/runtime dependencies, or require a source-product deployment merely to bootstrap Mark.
- Brain owns separate persistence namespaces, schemas/migrations, Durable Object/Workflow identities, artifact storage and secrets.
- Existing production data is not Brain's writable state store.
- Prefer pattern-copy or adapters to unsafe shared runtime coupling.
- Shared packages require proven compatibility, versioning, rollback and independent deployability; deduplication alone is not justification.
- Any upstream source-product change is separate work under that product's regression/CI/E2E gates.

Bootstrap fails if Mark cannot start, resume, checkpoint, reconcile and roll back its CEO state without modifying a source product.
