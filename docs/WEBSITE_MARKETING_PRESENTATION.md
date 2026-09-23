# VIIVERSION Website Projection — Implementation Rules

**Canonical L4 Website Projection Source of Truth:**  
Google Doc: **VIIVERSION — Website Channel Strategy & Projection**  
Document ID: `1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI`  
https://docs.google.com/document/d/1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI/edit

This GitHub file is **not** an independent marketing strategy. It is an L5 implementation contract for the website. L3 is governed by `VIIVERSION — Global Brand & Market Strategy`; the Website Channel Strategy & Projection governs L4. If this file conflicts with those sources, the higher source wins.

## Source hierarchy

1. Corporate Strategy & Positioning — L1 identity and ontology.
2. Commercial Matrix / Entity_Registry / Assets — structured L1, L2 commercial state and proof.
3. Global Brand & Market Strategy — L3 positioning, market, messaging, distribution and Projection Engine.
4. Sales Playbook — sales execution.
5. Website Channel Strategy & Projection — L4 website adaptation and conversion logic.
6. Website UX & Design System — L5 UX/UI rules.
7. Website Decision & Execution Protocol — website-specific approval/change control.
8. Website Presentation System — system-to-site mapping contract.
9. Website code/content — L5 implementation.

## Decision governance

No DRAFT or REVIEW block/copy/CTA/visual may change this implementation contract or production code.

Operational decision state lives in Commercial Matrix → `Website_Decisions`.
Only APPROVED / IMPLEMENTATION_READY decisions may drive canonical sync and implementation.

Canonical governance:
- Google Doc `VIIVERSION — Website Decision & Execution Protocol`
- `docs/WEBSITE_DECISION_EXECUTION_PROTOCOL.md`

If a local draft conflicts with this file or the canonical Marketing Strategy, record the conflict instead of rewriting the rule around the draft.

## Homepage narrative

The homepage must preserve this approved sequence (HOME-ARCH-CR-02):

1. **Clarity** — explain what kind of company VIIVERSION is and what it creates.
2. **Immediate heterogeneous proof** — prove breadth with 3–4 materially different working scenarios: customer-facing action, operations/back-office, AI interaction, and integration/data/system response. Do not use an app-heavy case gallery as the only early proof.
3. **Scale fit** — one complete task → several connected solutions → custom company system.
4. **Buyer job → concrete solution** — let the visitor recognise the job first, then show the corresponding finished solution type. Do not expose P01–P36 as a flat catalogue.
5. **Vertical fit** — show how the same engineering base adapts to different business processes.
6. **Modular expansion** — only now explain how standalone solutions can remain independent or connect into a larger flow.
7. **Existing-system trust** — show that current CRM/site/POS/payment/databases can remain and be integrated when appropriate.
8. **Engineering depth** — API/data/ETL/DB/Oracle/RBAC/internal systems/managed engineering for complex buyers.
9. **Cases** — explain how multiple solutions were composed in real projects; a case is proof, not a product.
10. **Owned software** — show the second VIIVERSION business direction using only externally usable/distributable software; current primary eligible example is Proposal Studio.
11. **How work starts** — bounded first scope and optional expansion.
12. **Team/accountability**.
13. **Partner gateway**.
14. **Final CTA**.

Early-proof rule:
- The first proof section is not a product catalogue, vertical catalogue, architecture map, or case library.
- Prefer neutral/no-name functional recordings or equivalent working proof when they truthfully demonstrate the exact capability.
- Every proof must state real maturity/status; decorative mockups do not count as primary proof.
- The first two semantic steps remain: **understand → see proof**.
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
- The primary hero CTA must be reviewed against the final Block 2 proof experience. The rejected CTA «Посмотреть реальные проекты» must not be restored automatically. Discussion/contact remains secondary above the fold.
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
