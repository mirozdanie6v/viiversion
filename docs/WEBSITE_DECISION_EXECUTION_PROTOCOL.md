# VIIVERSION Website Decision & Execution Protocol


> Architecture: L1 Corporate Canon → L2 Commercial Matrix / Entity_Registry / Assets → L3 Global Brand & Market Strategy → L4 Website Channel Strategy & Projection → this L5 contract.

**Canonical governance Source of Truth:**  
Google Doc: **VIIVERSION — Website Decision & Execution Protocol**  
Document ID: `1N3buptlE0FvjdtwMe79u747ZOq_DgzdAMs3kqODnoOY`  
https://docs.google.com/document/d/1N3buptlE0FvjdtwMe79u747ZOq_DgzdAMs3kqODnoOY/edit

This file is the GitHub implementation contract for website decision governance. It does not define marketing or UX content.

## Mandatory flow

SOURCE CHECK  
→ DRAFT  
→ REVIEW  
→ APPROVED  
→ CANONICAL SYNC  
→ IMPLEMENTATION_READY  
→ IMPLEMENTATION  
→ QA  
→ IMPLEMENTED

A DRAFT or REVIEW decision must not change canonical strategy, canonical UX rules, production code, or binding GitHub implementation rules.

## Statuses

- `DRAFT` — working hypothesis.
- `REVIEW` — ready for explicit review, not approved.
- `APPROVED` — explicitly approved by Olga.
- `IMPLEMENTATION_READY` — canonical sources are synced and the implementation scope is clear.
- `IMPLEMENTED` — deployed and QA-verified against the approved decision.
- `SUPERSEDED` — replaced by a newer approved decision.
- `REJECTED` — reviewed and rejected.
- `BLOCKED` — unresolved dependency or source conflict.

Operational decision state lives in the Google Sheet **VIIVERSION Commercial Matrix**, sheet `Website_Decisions`.

## Approval authority

Olga is the approval authority for website marketing, UX, information architecture and visual architecture.

Discussion, critique, a question, “maybe”, “I like the idea”, or lack of objection are not approval.

Only explicit approval moves a decision to `APPROVED`.

## Decision IDs

Format:

`[PAGE]-[BLOCK]-[TYPE]-[NN]`

Examples:

- `HOME-B01-FN-01`
- `HOME-B01-CP-01`
- `HOME-B01-VS-01`
- `HOME-B01-CTA-01`
- `GLOBAL-NAV-01`

## Locked decisions

An `APPROVED` decision is locked.

If a new idea conflicts with it, the change must be presented as:

- CURRENT
- PROPOSED CHANGE
- REASON
- IMPACT
- affected decision IDs

The old decision remains active until the change is approved.

## Source check before drafting

Before proposing a website block/change, read only the applicable sources:

1. relevant Website Marketing Strategy section;
2. relevant Website UX & Design System section;
3. `Homepage_Blocks` / page block row;
4. applicable `UX_Rules`;
5. related Commercial Matrix Products / Offers / Verticals / Assets;
6. existing `APPROVED` decisions;
7. current site/code only when needed.

Do not design primarily from chat memory.

## Block brief before copy

Before final copy/visual/CTA, define:

- USER QUESTION
- BLOCK FUNCTION
- REQUIRED CONCLUSION
- BOUNDARY

If the block brief is unresolved, final copy/visual/CTA must not be treated as implementation-ready.

## Draft preflight

Before a DRAFT is shown as a recommendation, verify:

- no conflict with canonical sources;
- no hidden change to page/block order;
- one dominant block job;
- buyer-language clarity;
- no mixed entity levels;
- visual supports the exact message;
- CTA matches the visitor state;
- no draft is being used to rewrite the rules that should judge it.

## Canonical sync after approval

After a decision is `APPROVED`:

1. update `Website_Decisions`;
2. update `Homepage_Blocks` / relevant page block record;
3. update Homepage/Page Architecture;
4. change global Marketing/UX docs only if the approved decision actually changes a global rule;
5. update website mapping/Commercial Matrix only where source relationships change;
6. update GitHub implementation docs;
7. only then change code.

## Implementation gate

Website code/content changes driven by marketing/UX decisions require:

- decision status `APPROVED` or `IMPLEMENTATION_READY`;
- canonical sync complete;
- no unresolved blocker conflict;
- implementation scope defined.

## QA gate

A decision becomes `IMPLEMENTED` only after:

- functional QA;
- responsive QA;
- accessibility QA;
- performance QA;
- marketing/clarity QA;
- comparison with the approved decision.

Working code that differs from the approved decision is not `IMPLEMENTED`.

## Critical rule

Do not fix a bad DRAFT by rewriting the canonical rules around it.

Correct flow:

`DRAFT → REJECTED/REWORK → new DRAFT`

If canonical sources genuinely conflict, record the conflict and resolve it through review/approval before continuing.

## Current Hero state

At protocol adoption, Hero is **BLOCKED** because the restored canonical Marketing Strategy Block 1 and UX rule `UX001` are not automatically compatible.

No Hero H1, lead, CTA or visual is currently approved by this protocol.

See:
- Commercial Matrix → `Website_Decisions`
- Commercial Matrix → `Homepage_Blocks`
- Google Doc → `VIIVERSION — Homepage Architecture`
