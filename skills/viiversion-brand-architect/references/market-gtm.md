# Market / GTM / Distribution

Operational reference for VIIVERSION Brand Architect.

This file does not create a new marketing canon. It operationalizes the current
L3 Global Brand & Market Strategy and L2 Commercial Matrix.

## 1. Core model

VIIVERSION Mycelium:

`Core → Commercial State → Market Interpretation → Channel Projection → Implementation`

Projection formula:

`Entity × Market × Audience × Channel × Language × Goal → Projection`

Execution loop:

`Projection → GTM Motion → Action → Proof → CTA → Metric → Feedback`

Revenue loop:

`Lead/Conversation → Qualification → Proposal/Deal outcome → Revenue Signal → Revenue Learning`

Economics loop:

`Observed effort/cost/revenue → Commercial Economics → confidence → Portfolio decision`

Feedback loop:

`Observation → Pattern → Validated Learning → Change Request → Strategic Review`

Closed company loop:

`Core → Commercial State → Market Interpretation → Revenue Execution → Delivery → Revenue Learning → Economics → Portfolio Intelligence → Strategic Review → Core`

A downstream campaign, marketplace listing, reply or launch never rewrites L1-L3
by itself.

## 2. Active GTM motions snapshot

Current live definitions observed in Commercial Matrix on 2026-09-30:

- M01 FAST_DIRECT — qualified end-business direct acquisition.
- M02 FOLLOW_UP — advance active conversations and offers.
- M03 PARTNER_B2B2B — agencies, studios, CRM/ERP/POS integrators and vendors.
- M04 PLATFORM_DISTRIBUTION — app/plugin/platform ecosystems.
- M05 PRODUCT_LAUNCH — Product Hunt, owned product pages, maker/dev communities.
- M06 FREELANCE_MARKETPLACE — paid projects and platform proof.
- M07 ENTERPRISE_VENDOR — long-cycle enterprise/vendor pipeline.
- M08 PRODUCTIZATION — remove the blocker preventing repeatable sale/distribution.
- M09 LOCAL_REFERRAL — warm local introductions and quick service sales.

Live GTM_Motions remains authoritative for cadence, quota, owner and KPI.

## 3. Channel profiles

Current channel classes:

- CH-WEB — Website: parent brand, proof, solution discovery and conversion.
- CH-LINKEDIN — professional authority, founders, B2B proof and partnerships.
- CH-PH — one externally usable owned Software product per launch.
- CH-MKT — installable/usable product-first software/plugin marketplaces.
- CH-PARTNER — B2B2B co-delivery, white-label, specialist engineering.
- CH-OUT — direct acquisition: one signal → one offer/entity → one proof → one CTA.
- CH-FREELANCE — project fit, proof, delivery scope and paid entry.
- CH-ENT — enterprise problem → architecture → risk → proof → engagement model.

Channel_Profiles is authoritative when a live final projection is created.

## 4. Distribution decision

Before selecting a channel, answer:

1. What canonical entity is being distributed?
2. Is it Engineering Solution, Software, service, module or candidate?
3. Is it sellable/usable now?
4. Is there inspectable proof?
5. Does the channel accept this product form?
6. Is the current package installable/self-serve, partner-delivered or project-delivered?
7. What current blocker exists?
8. Which motion owns the next action?
9. What metric will determine whether to continue?

Use Distribution_Matrix for entity × channel fit and Distribution_Pipeline for
current stage/blocker/next action.

## 5. Launch waves

Snapshot:
- W1 · 0–30d — publish/sell now.
- W2 · 30–90d — marketplace adapters after stable core contracts.
- W3 · 90–180d — deeper platform expansion based on evidence.
- ONGOING · Enterprise — diagnostics, PoC, expert sprint, retainer.
- BETA · Validate — validate repeatable onboarding/output before broad distribution.

Do not build platform adapters merely to occupy a marketplace.

## 6. Productization

Productization is the bridge between delivery and scalable distribution.

For an existing entity:
`existing capability → repeatable workflow → generic contract → package → proof → distribution gate`

For a new idea:
`experiment → repeated solution → pattern → candidate entity → canonical review`

A new plugin/app request should produce:

- canonical/candidate mapping;
- target user and buyer job;
- repeatable workflow;
- inputs/outputs;
- integration/API boundaries;
- authentication/data/privacy requirements;
- install/use path;
- support/terms requirements where applicable;
- proof plan;
- distribution ecosystem;
- launch/readiness gates;
- engineering implementation handoff.

Brand Architect owns this contract and market fit. Engineering agents own actual
implementation unless the user explicitly asks Brand Architect to invoke a build
workflow and the required tools are available.

## 7. Outreach / campaign architecture

A campaign is not a bulk message list.

Required fields:
- market;
- segment/audience;
- buyer trigger/signal;
- primary entity or offer;
- proof;
- channel;
- language;
- first-touch message logic;
- follow-up logic;
- CTA;
- quota/cadence;
- KPI;
- stop rule;
- feedback capture.

For live execution refresh Sales Playbook + Sales_Router + Outreach_Queue.
Draft-only work must never be marked as sent.

## 8. Partner motion

Use Partner_Channels for current partner classes and fit.

Current priority partner classes include:
- web/digital agencies;
- software studios;
- Odoo/ERP integrators;
- HubSpot/CRM agencies;
- Shopify/e-commerce agencies;
- POS/payment integrators;
- AI automation agencies;
- enterprise/telecom integrators and vendors.

Partner presentation should lead with the partner's delivery gap, VIIVERSION
capacity/capability, relevant proof and one partnership/pilot CTA. Do not dump the
full catalogue.

## 9. Software/platform distribution

Marketplace distribution is appropriate only when the product has a credible
install/use path.

Examples of current active pipeline:
- P28 Proposal Studio → ChatGPT app directory / Product Hunt.
- P29 AI Website / WordPress Audit Agent → WordPress.org.
- P20 POS/payment middleware → Clover/Square validation.
- P07 Booking Engine → generic product extraction before scalable distribution.
- P21 Connect → stable connector/API contract before adapter marketplaces.
- P27 Mini App Factory → partner packaging before scale.

Refresh Distribution_Pipeline before treating any of these stages as current.

## 10. Revenue intelligence

Sales activity is a measurement surface for the company.

Record material events in `Revenue_Intelligence` when they carry learning:
- positive/negative reply;
- qualification outcome;
- objection;
- requested capability or integration;
- price reaction;
- proof reaction;
- proposal reaction;
- won/lost/no-decision.

Whenever known, preserve `lead_id + source_entity_id + offer_id`.
Do not infer won/lost from silence. One event stays an observation.

Revenue patterns may justify:
- offer revision;
- messaging revision;
- proof improvement;
- pricing/economics measurement;
- productization review;
- portfolio review;
- market-signal proposal.

They do not silently rewrite canon.

## 11. Commercial economics

Before calling a motion scalable or a product commercially attractive, distinguish:
- price/revenue;
- delivery effort;
- delivery cost;
- recurring support burden;
- customization level;
- repeatability;
- CAC assumption;
- LTV potential;
- confidence/evidence.

`Commercial_Economics` is authoritative for recorded economics. Missing
economics must become a measurement task, not an invented margin.

## 12. Portfolio intelligence

Cross-product decisions must combine, where relevant:
- current Products state;
- proof strength;
- Revenue_Intelligence;
- Commercial_Economics;
- Market_Signals;
- Distribution_Matrix / pipeline.

Portfolio actions are analytical classes:
`sell_now / productize / keep_as_module / experiment / merge_review / deprioritize / governance_candidate`.

A portfolio recommendation cannot create or delete canonical entities by itself.

## 13. Feedback governance

Market evidence may justify:
- messaging revision;
- channel reprioritization;
- packaging revision;
- offer revision;
- productization work;
- candidate-entity proposal.

It does not justify silent canonical change.

Minimum discipline:
- one observation = observation;
- repeated consistent observations = possible pattern;
- pattern + meaningful evidence/outcome = candidate validated learning;
- strategic change = explicit change request and review.

Market_Signals is the operational register for this loop.
