# VIIVERSION Sales Engine

Machine-readable commercial rules for the VIIVERSION sales operating system.

## Source-of-truth contract

- **Google Sheet `VIIVERSION Commercial Matrix`** — operational data: Products, Assets, Verticals, Offers, Experiments, Sales Router, Cross Sell, actual outcomes and working price hypotheses. https://docs.google.com/spreadsheets/d/14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4/edit
- **Google Doc `VIIVERSION Sales Playbook v1`** — human operating rules and governance. https://docs.google.com/document/d/1itFsDhoPZqyH1NN1emca9u1HFeqYouPu4gcuuzm9BL4/edit
- **This directory** — stable IDs, machine rules, routing, scoring and schemas.

## Rules

1. Stable IDs are never reused for a different meaning.
2. A lead is routed from observed signal → `problem_code` → eligible products → entry offer → proof asset → next action.
3. GitHub changes to scoring/routing are versioned code changes.
4. Dynamic commercial facts such as prices, experiment status and lead stages live in Google Sheets.
5. Never claim an internal business problem as fact unless it is supported by evidence; use a hypothesis/question otherwise.
6. Large proposals are not a default cold-outreach artifact. Proposal Studio is invoked after commercial interest or discovery.
7. Enterprise/custom work enters through paid discovery, PoC, diagnostic or technical sprint.

## Directory

- `catalog/products.yaml` — canonical product IDs.
- `catalog/verticals.yaml` — canonical vertical codes.
- `config/problem-codes.yaml` — normalized observable problems.
- `config/routing.yaml` — problem-to-product/offer routing.
- `config/scoring.yaml` — speed-to-cash scoring and lanes.
- `schemas/lead.schema.json` — Sales Router contract.
- `playbooks/experiment-rules.md` — commercial experiment rules.