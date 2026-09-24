# VIIVERSION Orchestration

Execution layer for VIIVERSION business workflows.

This directory does **not** define the VIIVERSION brand, ontology, product truth or global marketing strategy. It consumes:

1. L1 — Corporate Strategy & Positioning + Commercial Matrix / Entity_Registry
2. L2 — Commercial Matrix + Assets / Proof
3. L3 — Global Brand & Market Strategy
4. Sales Execution — Sales Playbook / Sales Engine
5. Channel-specific L4 contracts such as Website Channel Strategy & Projection

## Principle

Brand System = rules and truth  
Command Layer = concise operating entry point  
Orchestrator = dispatcher and state machine  
Agents = specialized executors  
Workflows = business processes  
D1 / Durable Objects = execution state and audit history

## Command Layer

The authoritative operational registry is `Commercial Matrix → Command_Registry`.
`commands.yaml` is its executable mirror.

Primary commands:

- `САЙТ` → `website`
- `ПРОДАЖИ` → `sales`
- `КП` → `proposal`
- `БРЕНД` → `brand_governance`

Activation requires an exact first token (or an approved alias). The remaining text is the task payload.

A trigger is **not** approval. It never by itself authorizes external sending, deployment, proposal release, publication, or canonical mutation.

## Workflows

- `sales`: lead discovery → qualification → routing → proof → messaging → approval/send → reply → proposal → follow-up → result
- `website`: source check → projection → website strategy → copy/IA → governance → implementation → QA → decision update
- `proposal`: client context → source check → diagnosis → solution/proof → commercial design → Proposal Studio → QA → release gate → record
- `brand_governance`: source check → change classification → evidence → change request → strategic review → approval → canonical update → propagation → Decision Log

## Safety boundary

No agent may:
- overwrite canonical fields outside approved brand governance;
- create a new L1 entity without an approved canonical change;
- present prototype proof as production;
- send external communication without the workflow's approval gate;
- release a proposal without the release gate;
- deploy website changes before website governance;
- treat a command trigger as approval.

See `commands.yaml` and `policies/canon-guard.yaml`.
