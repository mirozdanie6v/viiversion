# VIIVERSION Sales Engine

Machine-readable commercial rules for the VIIVERSION sales operating system.

## Source-of-truth contract

- **L1 Corporate Canon — Google Doc `VIIVERSION — Corporate Strategy & Positioning`** — company identity, principal directions, A–F ontology, canonical entity semantics and governance. https://docs.google.com/document/d/1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4/edit
- **Structured L1 + L2 — Google Sheet `VIIVERSION Commercial Matrix`** — `Entity_Registry` plus live Products, Offers, Assets/Proof, Verticals, prices, readiness, experiments, leads and outcomes. https://docs.google.com/spreadsheets/d/14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4/edit
- **L3 — Google Doc `VIIVERSION — Global Brand & Market Strategy`** — global positioning rules, markets, audiences, messaging principles, distribution and Projection Engine. https://docs.google.com/document/d/1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI/edit
- **Sales execution — Google Doc `VIIVERSION Sales Playbook v1`** — discovery, routing, outreach, follow-up, proposal and human sales workflow. https://docs.google.com/document/d/1itFsDhoPZqyH1NN1emca9u1HFeqYouPu4gcuuzm9BL4/edit
- **`/brand-system`** — machine-readable contract/mirror of L1–L4 rules; never an independent Source of Truth.
- **This directory `/sales-engine`** — machine implementation of Sales OS. It consumes the brand system and Commercial Matrix and must not redefine them.

## Rules

1. Corporate Strategy & Positioning has precedence for L1 identity and ontology. Entity_Registry mirrors L1 structurally. Commercial Matrix has operational precedence for L2 commercial state and proof. Global Brand & Market Strategy has precedence for L3 marketing/distribution rules.
2. Lead Discovery starts from evidence and a commercially meaningful buyer job/problem, then maps it to one concrete VIIVERSION product. It must not invent an offer from a missing feature merely to create outreach volume.
3. A qualified lead is routed from validated problem/job → `problem_code` → eligible products → one concrete entry offer → proof asset → buyer → next action.
4. The client-facing product must be understandable in buyer language. Internal abstractions such as “mobile layer” or “structured flow” are not product names.
5. GitHub changes to discovery/scoring/routing/messaging are versioned code changes.
6. Dynamic commercial facts such as prices, experiment status and lead stages live in Google Sheets.
7. Never claim an internal business problem as fact unless it is supported by evidence; use a hypothesis/question otherwise.
8. Large proposals are not a default cold-outreach artifact. Proposal Studio is invoked after commercial interest or discovery.
9. Enterprise/custom work enters through paid discovery, PoC, diagnostic or technical sprint.
10. Lead Discovery is a Sales Execution workflow for the FAST_DIRECT acquisition lane. Daily GTM must also allocate work to platform distribution, product launches, partners, freelance marketplaces and enterprise/vendor pipeline according to product-channel fit.

## Directory

- `catalog/products.yaml` — Sales Engine product mirror/routing catalogue using stable IDs; canonical identity and hierarchy live in Commercial Matrix → `Entity_Registry`.
- `catalog/verticals.yaml` — canonical vertical codes.
- `config/problem-codes.yaml` — normalized observable problems.
- `config/routing.yaml` — problem-to-product/offer routing.
- `config/scoring.yaml` — speed-to-cash scoring and lanes.
- `config/messaging.yaml` — client-facing messaging, CTA and pre-send QA.
- `config/lead-discovery.yaml` — machine rules for candidate discovery, qualification, rejection and product mapping.
- `config/gtm-motions.yaml` — multi-channel GTM portfolio, daily allocation rules and channel-specific KPIs.
- `schemas/lead.schema.json` — Sales Router contract.
- `playbooks/lead-discovery.md` — human Lead Discovery workflow and examples.
- `playbooks/daily-gtm.md` — daily multi-channel execution model across direct, platform, launch, partner, freelance and enterprise motions.
- `playbooks/outreach.md` — outbound messaging workflow.
- `playbooks/replies.md` — reply handling.
- `playbooks/experiment-rules.md` — commercial experiment rules.
