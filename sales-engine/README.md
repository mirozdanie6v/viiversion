# VIIVERSION Sales Engine

Machine-readable commercial rules for the VIIVERSION sales operating system.

## Source-of-truth contract

- **Google Doc `VIIVERSION — Corporate Strategy & Positioning`** — highest semantic Source of Truth for company identity, business model, product architecture, markets and external positioning. https://docs.google.com/document/d/1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4/edit
- **Google Sheet `VIIVERSION Commercial Matrix`** — operational data: Products, Assets, Verticals, Offers, Experiments, Sales Router, Cross Sell, actual outcomes and working price hypotheses. https://docs.google.com/spreadsheets/d/14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4/edit
- **Google Doc `VIIVERSION Sales Playbook v1`** — human operating rules and governance. https://docs.google.com/document/d/1itFsDhoPZqyH1NN1emca9u1HFeqYouPu4gcuuzm9BL4/edit
- **This directory** — machine implementation of the strategy and Sales OS: stable IDs, routing, scoring, discovery, messaging and schemas. It must not contradict Corporate Strategy or live operational data.

## Rules

1. Corporate Strategy & Positioning has semantic precedence for brand identity, business model and product architecture. Commercial Matrix has operational precedence for live products/offers/assets/prices/experiments/leads/outcomes.
2. Lead Discovery starts from evidence and a commercially meaningful buyer job/problem, then maps it to one concrete VIIVERSION product. It must not invent an offer from a missing feature merely to create outreach volume.
3. A qualified lead is routed from validated problem/job → `problem_code` → eligible products → one concrete entry offer → proof asset → buyer → next action.
4. The client-facing product must be understandable in buyer language. Internal abstractions such as “mobile layer” or “structured flow” are not product names.
5. GitHub changes to discovery/scoring/routing/messaging are versioned code changes.
6. Dynamic commercial facts such as prices, experiment status and lead stages live in Google Sheets.
7. Never claim an internal business problem as fact unless it is supported by evidence; use a hypothesis/question otherwise.
8. Large proposals are not a default cold-outreach artifact. Proposal Studio is invoked after commercial interest or discovery.
9. Enterprise/custom work enters through paid discovery, PoC, diagnostic or technical sprint.
10. Lead Discovery is only the FAST_DIRECT acquisition lane. Daily GTM must also allocate work to platform distribution, product launches, partners, freelance marketplaces and enterprise/vendor pipeline according to product-channel fit.

## Directory

- `catalog/products.yaml` — canonical product IDs.
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
