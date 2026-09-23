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
Orchestrator = dispatcher and state machine  
Agents = specialized executors  
Workflows = business processes  
D1 / Durable Objects = execution state and audit history

## Initial workflows

- `sales`: lead discovery → qualification → routing → proof → messaging → human approval/send → reply → proposal → follow-up → result
- `website`: source check → projection → website strategy → copy/IA → implementation → QA → decision update

## Safety boundary

No agent may:
- overwrite canonical fields;
- create a new L1 entity without a canonical change request;
- present prototype proof as production;
- send external communication without the workflow's approval gate;
- deploy website changes before the website governance gate is satisfied.

See `policies/canon-guard.yaml`.
