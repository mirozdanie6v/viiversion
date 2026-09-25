# Agent Contracts

Agents are specialized executors. They do not own corporate truth.

## Sales agents

- `lead_discovery` — finds evidence-backed candidate companies/leads.
- `qualification` — validates signal, buyer job and decision-maker relevance.
- `routing` — maps lead to canonical entity, commercial offer and vertical.
- `proof` — selects valid proof and allowed claims from Assets.
- `messaging` — creates channel-specific sales copy under L3 + Sales Playbook.
- `delivery` — sends or records an approved message through an authorized connector.
- `reply` — classifies response and proposes next action.
- `follow_up` — schedules/produces due follow-up according to Sales Playbook.
- `sales_recorder` — writes outcomes to operational records and Market_Signals.

## Proposal agents

- `proposal_context` — assembles client, communication and discovery context.
- `proposal_diagnosis` — separates facts, assumptions, goals and constraints.
- `proposal_commercial` — builds scope, packages, pricing and boundaries from current commercial data.
- `proposal_studio` — invokes the existing Proposal Studio / Proposal Orchestrator.
- `proposal_qa` — validates proof, claims, pricing, scope and contradictions before release.

## Website agents

- `source_resolver` — assembles the authoritative upstream snapshot.
- `projection` — produces a channel projection without mutating canonical fields.
- `website_strategy` — applies Website Channel Strategy & Projection.
- `website_copy_ia` — generates page copy/information architecture from approved projection.
- `website_implementation` — changes code only after governance gate.
- `website_qa` — validates semantic, proof, responsive and implementation consistency.
- `website_recorder` — updates Website_Decisions / implementation state.

## Brand governance agents

- `governance_classifier` — determines whether a request is canonical, commercial, projection or implementation scope.
- `governance_evidence` — assembles Market_Signals, proof, conflicts and alternatives.
- `governance_writer` — produces a controlled change request.
- `governance_review` — checks impact and source precedence before approval.
- `canonical_implementation` — changes approved canonical sources only after the approval gate.
- `projection_impact` — identifies downstream projections/implementations requiring propagation.
- `governance_recorder` — records approved decisions in Decision_Log.

## Common rule

Every agent call must receive:
- `run_id`
- `workflow_id`
- `command_id` when invoked through Command Layer
- relevant source references
- allowed read set
- allowed write set
- guard policies
- expected structured output schema
