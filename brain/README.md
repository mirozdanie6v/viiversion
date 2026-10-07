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


## VII-142 extraction pass 1 — concrete reuse map

### Mini App Factory: reuse by adaptation, source remains untouched
- apps/orchestrator/src/index.ts :: FactoryRunCoordinator — single-writer Durable Object serialization via exclusive tail; DO last-known-run recovery cache. Brain adaptation: BrainStateCoordinator.
- apps/orchestrator/src/index.ts :: FactoryRunWorkflow — durable cycle, step.do retries/timeouts, waitForEvent, bounded cycles, error routing/resume. Brain adaptation: CeoOperatingWorkflow.
- apps/orchestrator/src/storage.mjs :: CloudflareD1Repository — transactional D1 snapshot + audit writes; workflow_step_receipts for idempotent workflow transitions; error-route persistence; immutable evidence references. Brain adaptation: BrainD1Repository.
- apps/orchestrator/wrangler.jsonc — D1 + R2 + DO + Workflow binding topology. Brain gets separate bindings/namespaces; no Factory binding is reused directly.

Reuse mode: pattern-copy/adaptation into Brain-owned code. No import from Factory runtime and no Factory schema/binding mutation.

### VIIVERSION AI Engineer: reuse by adaptation, source remains untouched
- apps/control-plane/src/task-state.ts — explicit finite-state transition graph + terminal states + transition assertion. Brain adaptation: CEO run/action lifecycle.
- apps/control-plane/src/storage.ts :: findTaskByIdempotency + createTask + updateTaskTransition — account-scoped idempotency, compare request semantics, conditional legal transitions. Brain adaptation: run/action idempotency and state CAS.
- apps/control-plane/src/workflow.ts — inspect→plan→risk/approval→lock→apply→authoritative verify→proof; model cannot declare completion; failed verification triggers rollback; rollback itself is verified.
- apps/control-plane/src/coordinator.ts — lease + fencing token concurrency protection. Brain adaptation: mutation/connector-action lease where single-writer DO ordering is insufficient.
- packages/change-engine/src/index.ts — canonical JSON hashing and deterministic risk decision. Brain adaptation: canonical decision/action hash + deterministic approval policy.
- packages/verification/src/index.ts — expected-vs-authoritative-observed verifier contract. Brain adaptation: typed source-specific verification adapters.
- apps/control-plane/src/index.ts — Idempotency-Key conflict semantics and rollback-as-new-task pattern. Brain adaptation: every consequential external action has immutable request hash and compensating action lineage.

Reuse mode: pattern-copy/adaptation. WordPress-specific operations, site schemas, credentials and verification are not copied.

### Minimal missing CEO layer
Existing systems already provide persistence, durable orchestration, concurrency, idempotency, approvals, verification, rollback and evidence patterns. Mark-specific delta is limited to:
1. CEO domain contracts: CompanyEntity/Relationship, CurrentState, Event, Decision, Checkpoint, SourceCursor, OperatingRun, Objective/OpenLoop.
2. Brain-owned D1 repository/schema implementing those contracts and append-only reconciliation history.
3. BrainStateCoordinator for ordered state mutations/checkpoint CAS.
4. CeoOperatingWorkflow implementing Audit→Diagnose→Strategize→Organize→Assign→Measure→Correct→Learn with resumable checkpoint stages.
5. Source adapters with declared authority/freshness for GitHub, Linear and Drive; read selectively.
6. Reconciliation engine: remembered state vs authoritative observation → event + affected-decision trace, never silent overwrite.
7. CEO policy/approval adapter enforcing Constitution/decision-rights and founder overrides.
8. Verification adapter requiring authoritative evidence before consequential completion.

Not in v0.1: new generic agent framework, new model platform, product-specific execution engine, refactor of Factory/AI Engineer, autonomous material spending or irreversible production control.
