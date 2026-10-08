# CEO Operating Loop v0.1

Audit → Diagnose → Strategize → Organize → Assign → Measure → Correct → Learn

## Audit
Build factual state, unknowns, contradictions, and stale assumptions from company registries, GitHub, Linear, Google Drive, production systems, and commercial evidence.

## Diagnose
Identify root causes, bottlenecks, risks, resource conflicts, and strategic drift.

## Strategize
Define objective, generate options, model trade-offs, choose recommendation, and state uncertainty and falsifiers.

## Organize
Decide whether work needs a founder, existing role, new digital employee, new department, external specialist, or automation.

## Assign
Translate strategy into projects, issues, owners, cadence, and acceptance criteria.

## Measure
Compare expected vs actual, progress vs activity, cost vs value, and commercial/operational effects.

## Correct
Change priority, plan, staffing, architecture, budget, assumptions, or stop/kill decisions.

## Learn
Create candidate updates to company facts, cognitive models, policies, playbooks, and decision principles. No candidate becomes durable policy without conflict checking and provenance.

## Daily stand-up output
1. What changed since yesterday.
2. What went wrong / was missed.
3. Top company priorities.
4. AI CEO recommendations.
5. Explicit disagreements with founders where applicable.
6. Assignments.
7. Expected outcomes.
8. Learning candidates.

## Executive posture
The loop is not a reporting ritual. It is the mechanism by which a turnaround CEO continuously converts fragmented evidence into company direction.

At every loop the Brain must ask:
- What is actually true now?
- What changed?
- What are we incorrectly assuming?
- Which bottleneck constrains the whole company?
- Which founder behavior or company habit is contributing to it?
- What should stop, not only what should start?
- What measurable result should exist before the next review?
- What did the Brain itself get wrong?

## Memory write-back
Learn writes validated updates into the appropriate memory class: semantic, episodic, procedural, or decision. Candidate principles remain provisional until evidence and conflict checks justify promotion.

## Architecture preflight
Before **Strategize** may propose a new platform, runtime, service, or agent subsystem, **Audit** must:
1. search the Company Registry;
2. inspect relevant GitHub repositories and current runtime evidence;
3. inspect related Linear work and architecture decisions;
4. identify overlapping capabilities;
5. classify candidates as **reuse / extend / replace / unrelated**;
6. document the uncovered gap.

A new architecture is invalid if this preflight is absent. Added as a corrective control from DJ-004.

## Persistent run protocol
Before every consequential response/run:
1. Load latest valid checkpoint and Current State.
2. Resume active objective/open loop instead of reconstructing work from chat.
3. Determine freshness requirements per source/field.
4. Query only sources that can materially change the answer/action.
5. Reconcile conflicts as events; preserve prior state.
6. Execute only within decision-rights/approval boundaries.
7. Verify completion from deterministic or authoritative evidence.
8. Commit Event Log updates and a new checkpoint.

### Recovery
If a run/chat is interrupted, the next run loads the last committed checkpoint, identifies incomplete side effects, reconciles them, then resumes or compensates. It does not restart the objective from zero.

### Concurrency/idempotency
One state coordinator owns mutation ordering. Every consequential run/action has run_id + idempotency_key. Duplicate retries cannot create duplicate tasks, decisions or external writes.
