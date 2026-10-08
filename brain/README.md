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


## VII-142 extraction pass 2 — cognitive/quality/recovery patterns

A wider reuse scan was performed beyond persistence/runtime infrastructure.

### EventVideoHumanEditor
Direct reusable runtime is intentionally limited: README confirms Semantic v5 is implemented and passed 18/18 human sample approvals, while Editor Brain and Premiere/After Effects execution are not implemented in that repository.
Reusable concept: semantic decomposition before action, typed intent/importance/continuity/story-note/edit-strategy, and a human-calibrated quality gate. Do not import video-domain code into Brain.

### VIIVERSION Demo Studio — useful cross-domain patterns
Verified current implementation already ports Human Editor semantics and adds production cognitive controls:
- docs/EDITOR_BRAIN_REUSE.md + src/editor-brain.ts: transform raw timeline/events into typed semantic units before action; preserve causal action→result relationships; attach intent, importance and rationale.
- src/editor-critic.ts: independent deterministic critic over a proposed plan; critic produces findings/revisions and can reject before execution.
- docs/UX_DESIGN_BRAIN_REUSE.md + src/presentation-design-brain.ts: strict PASS / REVISE / BLOCKED review contract; reviewer does not directly edit owner artifact; finding → owner stage → required action; bounded revision.
- docs/JOB_RELIABILITY.md + src/job-manager.ts: observable long-running stage/progress/attempt/heartbeat; distinguish transient vs permanent failures; bounded automatic recovery; same job ID resumes from private recovery state; terminal failure instead of infinite retry.
- AI Director: inspect environment → structured plan → validate plan in deterministic engine before execution.

Brain adaptations:
1. **Semantic Decision Frame**: raw observations are first classified into typed facts/entities/relationships/importance/causal links before strategy.
2. **Independent CEO Critic**: proposed diagnosis/strategy is reviewed separately from its authoring stage. Critic cannot silently edit the proposal; returns PASS/REVISE/BLOCKED + findings.
3. **Bounded Management Revision**: revision returns to the owning stage with explicit required action; repeated no-progress becomes BLOCKED.
4. **Causal continuity**: decisions and actions preserve objective→action→expected result→observed result links; no isolated task counting.
5. **Observable CEO run**: stage, attempt, heartbeat, blocker/retry reason and last checkpoint are first-class state.
6. **Recovery classification**: transient source/tool failures retry boundedly; policy/evidence/authority failures block rather than loop.

Reuse mode: pattern-copy/adaptation only. Demo Studio and EventVideoHumanEditor remain unchanged.

### Proposal Studio
Useful additional pattern already implemented:
- context isolation between specialists;
- independent review gates;
- bounded owner-stage revisions;
- hashes + invalidated downstream stages;
- BLOCKED_NO_PROGRESS when revision repeats without artifact/finding change.
Brain adaptation: invalidate downstream diagnosis/strategy/assignments when an upstream factual premise changes, rather than leaving stale conclusions active.

### ZL Web Agent
Useful additional pattern:
- lead retains responsibility for integrated result while specialists provide bounded expert judgments;
- explicit read-only evidence bridge and least privilege;
- cannot claim completion without evidence.
Brain adaptation: Mark remains accountable CEO; specialist agents advise/execute bounded mandates and do not fragment final accountability.

### Revised minimal CEO delta
The wider scan reduces, rather than expands, custom Brain logic. New CEO-specific code should be limited to:
- company ontology/current-state/decision/checkpoint contracts;
- semantic management-frame builder over company observations;
- reconciliation + downstream invalidation graph;
- CEO-specific policy/decision-rights/founder-override rules;
- CEO critic rubric (diagnosis/strategy/organization/assignment) using PASS/REVISE/BLOCKED;
- Operating Loop stage mapping and management-specific acceptance criteria;
- source authority/freshness adapters.

Persistence, orchestration, retries, recovery, idempotency, generic verification, bounded revision and critic mechanics are existing VIIVERSION patterns to adapt, not reinvent.


## VII-142 audit correction — reuse claims vs proven portability

A source-level audit challenged extraction passes 1–2. Result: the overall reuse direction is valid, but previous wording overstated how much is "ready-made" for Mark.

Evidence classes for reuse:
- **Verified implemented source mechanism**: code exists and behavior is inspectable in source.
- **Verified product-domain behavior**: tests/docs demonstrate it inside its original product.
- **Portable pattern**: architecture is suitable to adapt, but portability to Brain is not yet proven.
- **Brain-ready module**: requires an extraction/adapter test inside Brain. None of the audited cross-product mechanisms may be called Brain-ready until this gate passes.

Corrections:
1. Mini App Factory DO serialization, Cloudflare Workflow, D1 repository/audit/receipts and error routing are implemented mechanisms, but are coupled to Factory run schemas, CoreError, bindings and stage model. Reuse status: PORTABLE PATTERN / extraction candidate, not drop-in module.
2. AI Engineer lifecycle/idempotency/verification/rollback/concurrency are implemented mechanisms, but coupled to task/site/change-engine semantics. Reuse status: PORTABLE PATTERN / extraction candidate, not drop-in module.
3. Demo Studio critic/revision/recovery mechanisms are implemented and some have regression tests, but they are editorial/design/job-domain code. Reuse status: PORTABLE COGNITIVE/RELIABILITY PATTERN, not generic CEO critic/runtime.
4. EventVideoHumanEditor contributes semantic-v5 concepts and human calibration only. Its README explicitly states Editor Brain execution is not implemented. It is not a source of executable CEO/editor orchestration.
5. Proposal Studio documents and implements proposal-specific orchestration/gates, but it explicitly has no separate model runtime. Its downstream invalidation/no-progress policy is a strong pattern, not reusable infrastructure.
6. ZL Web Agent has concrete Lead + bounded specialist tools and typed evidence report. This validates responsibility/context-boundary architecture, not persistence/orchestration.

Therefore the safe conclusion is:
**VIIVERSION already contains several independently implemented mechanisms that substantially reduce design risk for Mark, but it does not yet contain a pre-existing generic Brain runtime that can simply be assembled.**

Required proof before claiming code reuse:
source mechanism → isolate minimal dependencies → Brain-owned adapter/copy → unit/contract tests → fault/idempotency/recovery tests where relevant → prove no source-repo changes → only then mark Brain-ready.

VII-144 must implement the smallest CEO layer while treating cross-product code as reference implementations until each extraction candidate passes this portability gate.
