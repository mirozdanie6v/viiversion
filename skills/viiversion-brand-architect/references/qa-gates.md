# Brand QA Gates

Run these gates silently before delivering a VIIVERSION brand/structure result.

## G1 — Identity

PASS when:
- VIIVERSION remains an engineering product company;
- Engineering Solutions and Software remain visible when relevant;
- the material does not accidentally redefine the company as a web studio,
  bot studio, design shop, generic AI agency or Vietnam-only developer.

Critical fail → revise.

## G2 — Entity integrity

PASS when:
- Products, Offers, Verticals, Assets and capabilities are not flattened into one
  misleading peer list;
- cases/proofs are not renamed into products;
- CRM integration is not presented as proprietary VIIVERSION CRM;
- owned software remains separate from Engineering Solutions.

Critical fail → revise.

## G3 — Buyer relevance

PASS when:
- the audience can recognize its problem/job/result before needing internal
  taxonomy;
- technical detail appears at the appropriate depth;
- each section has one dominant job.

Fail → revise structure.

## G4 — Commercial truth

PASS when every claim about:
- readiness,
- sellability,
- pricing,
- external availability,
- release status

comes from live Commercial Matrix when the output is public/final.

If live refresh was required but unavailable → label uncertainty; do not invent.

Critical fail → block the unsupported claim, not the whole task.

## G5 — Proof integrity

PASS when:
- major claims have relevant proof where proof exists;
- maturity is stated honestly;
- prototype/demo/concept is not described as production;
- proof demonstrates the actual claim.

Fail → downgrade claim or choose different proof.

## G6 — Channel fit

PASS when:
- the structure matches the current channel and audience;
- channel presentation does not overwrite canonical identity;
- CTA matches the visitor state;
- in REDESIGN mode, current/approved legacy copy is treated as a constraint or
  observed state, not as the mandatory creative answer.

Fail when a redesign simply restores old channel copy without independent
synthesis proving that it is still the best presentation for the current goal.

Fail → revise.

## G7 — System balance

PASS when:
- a small buyer can see a complete small result;
- a larger buyer can see extension/system depth;
- the page does not imply every buyer needs the full stack;
- engineering depth exists without dominating early relevance.

Fail → rebalance.

## G8 — AI discipline

PASS when AI is tied to:
- approved data,
- a concrete workflow,
- a user/business action,
- human handoff or system output where relevant.

Fail if AI is generic decoration or unsupported autonomy.

## G9 — Existing-system trust

PASS when the material does not imply unnecessary replacement of current CRM,
site, POS, databases or other working systems.

Prefer integration when enough.

## G10 — Decision freshness

For website/public implementation:
- check current APPROVED / IMPLEMENTATION_READY / SUPERSEDED decisions;
- do not implement a REVIEW/DRAFT as approved;
- do not use stale GitHub copy against a newer upstream decision.

For REDESIGN:
- APPROVED means "current governed presentation", not "best immutable copy";
- an approved presentation may be challenged and superseded by a new candidate;
- do not confuse governance status with creative quality;
- do not force old approved copy back into the answer when the user explicitly
  rejects that presentation.

Critical fail → refresh source or correct the decision interpretation before
implementation.

## G11 — Clarity

PASS only against the **proposed final artifact**, not against the audit report.

A non-insider must be able to answer from the proposed output itself:
- what is this;
- what can I get;
- why is it relevant;
- what can I verify;
- what should I do next.

For REDESIGN, it is an automatic FAIL if:
- the output only says that the current version is unclear;
- the output only lists MISMATCH / REQUIRED_CHANGE;
- the proposed replacement is materially the same abstraction the user rejected;
- the answer depends on internal VIIVERSION terminology to explain the basic
  offer;
- no new presentation candidate was actually produced.

Finding a clarity problem is not evidence that the proposed solution is clear.

Fail → return rework to PRESENTATION_SYNTHESIS / CHANNEL_ARCHITECT.

## G12 — No ornamental complexity / material redesign

PASS when every major block/category/diagram changes understanding or decision.

For REDESIGN, also require material difference from the rejected/current
presentation. A synonym swap, restoration of an older Hero, or rearrangement
without a new communication logic is FAIL.

The synthesis artifact must explicitly state:
- what old presentation principle is being discarded;
- what new presentation principle replaces it;
- how the first-screen understanding changes.

Remove structure that exists only to display internal sophistication.


## G13 — GTM coherence

PASS when:
- one primary motion owns the next action;
- audience, channel, offer/entity, proof, CTA and KPI are mutually consistent;
- a campaign is not just a list of messages or channels;
- current execution state is refreshed before claiming a live next action.

Fail → rebuild GTM plan.

## G14 — Distribution truth

PASS when:
- marketplace/platform recommendation fits the actual product form;
- current distribution stage/blocker comes from live Distribution_Pipeline when
  the output is operational/final;
- Product Hunt is treated as launch/discovery, not billing;
- adapters are not built before core contracts/productization justify them.

Critical fail → refresh distribution sources and revise.

## G15 — Feedback governance

PASS when:
- one observation is not called a validated market truth;
- repeated evidence is separated from anecdote;
- market learning can change messaging/channel/package without silently changing canon;
- canonical changes go through Change Request / Strategic Review / Decision_Log.

Critical fail → downgrade the learning stage.


## G16 — Commercial economics integrity

PASS when:
- profitability, margin, delivery effort, support cost, CAC and LTV claims come
  from `Commercial_Economics` or an explicitly labelled measurement/assumption;
- missing economics stay unknown;
- sellability is not treated as proof of profitability;
- repeatability and customization are considered when judging scalability.

Critical fail when the output invents a cost, margin, CAC, LTV or profitability
claim.

Fail → route rework to COMMERCIAL_ECONOMICS.

## G17 — Revenue learning integrity

PASS when:
- material sales conclusions are traceable to recorded replies, qualification,
  proposal/deal outcomes or other evidence;
- sales events are mapped to lead/entity/offer where known;
- one reply/deal is kept at observation level;
- repeated objections or requests are separated from validated learning;
- actual won/lost state is never inferred from silence.

Critical fail when an unrecorded outcome is presented as fact or one anecdote is
promoted directly to strategic truth.

Fail → route rework to REVENUE_INTELLIGENCE.

## G18 — Portfolio intelligence integrity

PASS when:
- productization, merge, priority or deprioritization recommendations identify
  the entities reviewed and evidence basis;
- commercial state, proof, revenue evidence and economics are used when relevant;
- a portfolio recommendation remains analytical until governance is required;
- repeated client delivery is not silently renamed into a canonical product;
- strategic priority distinguishes "sell now", "productize", "experiment",
  "keep as module", "merge review" and "deprioritize".

Critical fail when portfolio priority is asserted without evidence or a new
canonical entity is created silently.

Fail → route rework to PORTFOLIO_INTELLIGENCE or governance.
