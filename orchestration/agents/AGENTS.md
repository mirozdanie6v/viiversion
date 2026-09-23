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
- `proposal_studio` — invokes Proposal Studio after interest/discovery.
- `follow_up` — schedules/produces due follow-up according to Sales Playbook.
- `sales_recorder` — writes outcomes to operational records and Market_Signals.

## Website agents

- `source_resolver` — assembles the authoritative L1-L3 snapshot.
- `projection` — produces a channel projection without mutating canonical fields.
- `website_strategy` — applies Website Channel Strategy & Projection.
- `website_copy_ia` — generates page copy/information architecture from approved projection.
- `website_implementation` — changes code only after governance gate.
- `website_qa` — validates semantic, proof, responsive and implementation consistency.
- `website_recorder` — updates Website_Decisions / implementation state.

## Common rule

Every agent call must receive:
- `run_id`
- `workflow_id`
- relevant source references
- allowed read set
- allowed write set
- guard policies
- expected structured output schema
