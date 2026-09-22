# VIIVERSION Website Marketing — Implementation Rules

**Canonical marketing Source of Truth:**  
Google Doc: **VIIVERSION — Website Marketing & Communication Strategy**  
Document ID: `1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI`  
https://docs.google.com/document/d/1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI/edit

This GitHub file is **not** an independent marketing strategy. It is the implementation contract for the website. If wording or marketing logic here conflicts with the Google Doc, the Google Doc wins.

## Source hierarchy

1. Corporate Strategy & Positioning — brand/business identity.
2. Commercial Matrix — current Products, Offers, Verticals, Assets, status and commercial facts.
3. Sales Playbook — sales/messaging governance.
4. Website Marketing & Communication Strategy — canonical website marketing narrative and conversion logic.
5. Website UX & Design System — canonical UX/UI rules.
6. Website Decision & Execution Protocol — approval/change-control for website decisions.
7. Website Presentation System — system-to-site mapping.
8. Website code/content — implementation.

## Decision governance

No DRAFT or REVIEW block/copy/CTA/visual may change this implementation contract or production code.

Operational decision state lives in Commercial Matrix → `Website_Decisions`.
Only APPROVED / IMPLEMENTATION_READY decisions may drive canonical sync and implementation.

Canonical governance:
- Google Doc `VIIVERSION — Website Decision & Execution Protocol`
- `docs/WEBSITE_DECISION_EXECUTION_PROTOCOL.md`

If a local draft conflicts with this file or the canonical Marketing Strategy, record the conflict instead of rewriting the rule around the draft.

## Homepage narrative

The homepage must preserve this sequence:

1. **Clarity** — one job: make it immediately clear what kind of company VIIVERSION is and what it creates. Scale is explained in Block 3; buyer jobs in Block 4; existing-system trust in Block 7; engineering depth in Block 8.
2. **Immediate proof** — real Assets/demos with honest maturity labels.
3. **Scale fit** — one task → connected processes → custom company system.
4. **Buyer jobs** — navigation by recognisable business task, not internal taxonomy.
5. **Vertical fit** — how the same engineering base is applied to industries.
6. **System composition** — only now explain how separate solutions connect.
7. **Integration trust** — show that existing CRM/site/POS/payment systems do not need to be replaced without reason.
8. **Engineering depth** — API/data/ETL/DB/Oracle/internal systems for complex buyers.
9. **Deeper cases** — task → implementation → verified proof.
10. **How work starts** — bounded first scope and clear next step.
11. **Team/accountability**.
12. **Partner gateway**.
13. **Final CTA**.

## Hero scope rule

The homepage Hero has one dominant job: orientation and category clarity.

Hero must not be used to fully explain:
- project scale;
- small-entry logic;
- existing-system compatibility;
- industries;
- internal architecture;
- engineering depth.

Those meanings belong to their dedicated later blocks.

H1 should directly communicate what VIIVERSION creates. A lead may add one clarifying idea, but must not become a multi-capability list.

CTA and visual are approved separately from the Hero function.

## Approved homepage Hero copy

Current approved Homepage Hero text:

**H1:** Разрабатываем приложения и системы для бизнеса.

**Lead:** Для работы с клиентами и для работы команды.

Decision IDs:
- `HOME-B01-CP-01`
- `HOME-B01-LD-01`

This approval covers copy only. Hero CTA and visual remain unresolved and must be approved separately through the Website Decision & Execution Protocol.

## Non-negotiable implementation rules

- Buyer language before seller/technical jargon.
- Russian commercial pages do not require English or IT vocabulary to understand the offer.
- Never flatten platform, function, product, module, integration, system and technology into one peer list.
- Do not imply every buyer needs a large system.
- Do not make VIIVERSION look limited to small apps/modules.
- Proof must appear immediately after the initial promise.
- The primary hero CTA should normally lead to self-service proof; discussion/contact is secondary.
- Technology proves capability only after the buyer understands value.
- Existing working systems are preserved when integration solves the job.
- CRM means configuration/extension/integration of the client's chosen CRM; a custom operational/internal system is a separate class.
- Owned software is promoted as a finished public product only when there is a real external use/distribution path.
- Public status, proof and price context must be traceable to Commercial Matrix / Assets.
- One primary CTA per local section.
- Do not create new product taxonomy in copy or layout.

## Marketing QA

A page fails if:

- the visitor cannot say what they can get after one read;
- the page needs internal terminology to be understood;
- there is no verifiable proof near the main claim;
- small buyers infer “too large/expensive by default”;
- enterprise buyers infer “only Mini Apps/widgets”;
- the page mixes entity levels;
- technical depth appears before basic relevance/value;
- demo/prototype maturity is overstated;
- the CTA does not describe a useful next action.

For full rationale, audience model, block-by-block functions, text semantics, pricing/trust rules and research basis, use the canonical Google Doc above.
