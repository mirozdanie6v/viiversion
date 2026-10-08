# Company Registry Schema v0.1

Canonical inventory of what exists in VIIVERSION.

## Entity types
Person, Role, Department, Product, Repository, Domain, InfrastructureService, Integration, Client, Lead, Vendor, Document, FinancialObligation, CommercialOpportunity, Experiment, Project, Risk, Dependency, Decision, Asset.

## Required fields
- canonical_id
- entity_type
- name
- status
- owner
- description
- source_provenance
- confidence
- last_verified_at
- created_at
- updated_at
- relationships
- notes

## Status principle
Distinguish claimed, discovered, verified, active, dormant, deprecated, and unknown.

## Provenance principle
Important items should link where possible to GitHub, Linear, Google Drive, production URLs, contracts/invoices, client correspondence, or explicit founder confirmation.

## Relationship examples
client → product
product → repository
repository → deployment
product → domain
project → issue
decision → project
lead → commercial opportunity
role → person
risk → asset
dependency → product

## Architecture capability inventory
For Repository, InfrastructureService, Integration, Product, and Asset records used in architecture decisions, capture where applicable:
- runtime_capabilities
- persistence_mechanisms
- orchestration_mechanisms
- model_providers
- execution_surfaces
- approval_and_safety_controls
- verification_and_rollback
- deployment_state
- reuse_status: reuse / extend / replace / unrelated / not_evaluated
- reuse_evidence

The Company Registry is the mandatory first lookup before proposing a new VIIVERSION internal platform or major subsystem.

## Persistent Brain state contracts

### Current State
- state_version
- as_of
- active_objective
- priorities
- active_projects
- blockers
- open_loops
- pending_approvals
- risks
- operating_loop_stage
- last_checkpoint_id

### Event Log
Append-only:
- event_id
- occurred_at / observed_at
- event_type
- entity_refs
- source / source_ref
- before / after
- confidence
- run_id
- idempotency_key

### Checkpoint
- checkpoint_id / previous_checkpoint_id
- created_at / run_id
- active_objective
- operating_loop_stage
- audit_cursor
- completed_scope / remaining_scope
- open_loops / blockers
- open_hypotheses / invalidated_conclusions
- pending_approvals
- source_cursors
- evidence_refs
- state_version

### Source reconciliation
A conflicting authoritative observation never silently overwrites history. Record old value, new value, source, observed_at, confidence, affected decisions and reconciliation status.

### Invariants
Unknown remains unknown. Models may propose state changes but may not self-certify consequential completion. Cross-type aggregation requires explicit relationships. Retried runs use idempotency keys and must not duplicate decisions, tasks or external writes.
