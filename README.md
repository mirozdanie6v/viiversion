# VIIVERSION

Production website for **VIIVERSION**.

Public targets:
- https://viiversion.com/
- https://landing.viiversion.workers.dev/

Deployment branch: `viiversion`  
Cloudflare Worker: `landing`

## Brand, product system and website rules

The public website is an **L4 buyer-facing projection** of the VIIVERSION canonical/commercial/market system. It is not the canonical product database, corporate ontology or global marketing strategy.

Binding website rules:

- `docs/WEBSITE_PRESENTATION_SYSTEM.md` — product/system-to-site mapping rules
- Google Doc `VIIVERSION — Global Brand & Market Strategy` (`1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI`) — L3 global positioning, market, messaging, distribution and Projection Engine rules
- Google Doc `VIIVERSION — Website Channel Strategy & Projection` (`1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI`) — canonical L4 website narrative and conversion logic
- `docs/WEBSITE_MARKETING_PRESENTATION.md` — GitHub implementation summary of that Google Doc
- Google Doc `VIIVERSION — Website UX & Design System` (`1nWOpqPFpTYG1N8OCPcc0GLwvN5ed3gl5NmeIqECRcNE`) — canonical UX/UI, layout, responsive, accessibility and performance rules
- `docs/WEBSITE_UX_DESIGN_SYSTEM.md` — GitHub implementation summary of the UX/Design System
- Google Doc `VIIVERSION — Website Decision & Execution Protocol` (`1N3buptlE0FvjdtwMe79u747ZOq_DgzdAMs3kqODnoOY`) — approval, change-control and implementation governance
- `docs/WEBSITE_DECISION_EXECUTION_PROTOCOL.md` — GitHub implementation contract for website governance

Source-of-truth priority:

1. **VIIVERSION — Corporate Strategy & Positioning** — L1 identity, directions and canonical ontology.
2. **VIIVERSION Commercial Matrix → Entity_Registry / Products / Assets** — structured L1 + L2 commercial/proof state.
3. **VIIVERSION — Global Brand & Market Strategy** — L3 global positioning, market strategy, messaging, distribution and projection rules.
4. **VIIVERSION Sales Playbook v1** — sales execution.
5. **VIIVERSION — Website Channel Strategy & Projection** — L4 website projection.
6. **VIIVERSION — Website UX & Design System** — L5 website UX/UI contract.
7. **VIIVERSION — Website Decision & Execution Protocol** — website-specific change control.
8. GitHub website code — L5 implementation only.

Google Drive source IDs are recorded in `docs/WEBSITE_PRESENTATION_SYSTEM.md`.

### Website change gate

Marketing/UX/information-architecture changes follow:

`SOURCE CHECK → DRAFT → REVIEW → APPROVED → CANONICAL SYNC → IMPLEMENTATION_READY → IMPLEMENTATION → QA → IMPLEMENTED`

Operational state is tracked in Commercial Matrix:
- `Website_Decisions`
- `Homepage_Blocks`
- `UX_Rules`

DRAFT / REVIEW decisions must not drive production changes or rewrite canonical strategy/UX documents.

### Presentation principle

The internal system is multi-dimensional:

- Products/modules;
- commercial types and layers;
- horizontal portfolio families;
- Verticals;
- Offers;
- Assets/proof;
- channel/distribution fit;
- readiness/status.

The website must **not flatten these internal entity types into one catalogue**.

Public pages translate the system into buyer language and preserve the source relationships. A standalone entry product can be sold on its own; several products can be composed into a larger system when the buyer's workflow requires it.

### Public routes

Stable public intent routes may include:

- products / solutions;
- industries;
- cases / proof;
- partners / white-label;
- engineering / enterprise;
- company/about;
- owned software when a real external product path exists.

Exact public labels are presentation copy, not canonical internal taxonomy.

### CRM guardrail

VIIVERSION configures, extends and integrates the CRM selected/used by the client. A custom back-office/internal operational system is a separate product class.

Legacy internal labels such as `CRM Core` or `CRM Lite` must be translated through the current Corporate Strategy before public rendering.

### Software products

Owned Software Products are a long-term company direction. A specific owned product is promoted publicly according to its real readiness and external distribution/use path; internal or future products do not need to appear as finished catalogue items.

## Legacy URL policy

Old product-family, module and starter-offer URLs remain available only as noindex redirects.

Examples:

- `/modules/online-booking/` → `/products/online-booking/`
- `/offers/booking-start/` → `/products/online-booking/`
- `/products/booking/` → `/products/online-booking/`

Legacy commercial routes are excluded from the sitemap.

## Proof

Case cards use real screenshots captured from public demos and stored in:

`site_assets/cases/`

Proof status is explicit:

- INTERACTIVE DEMO
- PUBLIC PROTOTYPE
- CLIENT CONCEPT

A prototype is never presented as a production deployment.

Screenshot capture workflow:

`.github/workflows/capture-case-screenshots.yml`

## Team and trust

Real team portraits are stored in:

`site_assets/team/`

The public site explains the controlled delivery model:

- start with one defined task;
- agree scope, timeline and price guide before development;
- keep working systems when integration is enough;
- connect to live systems after review.

## Lead capture

The enquiry form now saves leads server-side before opening Telegram / WhatsApp / email.

API:

- `POST /api/leads`
- `GET /api/leads/health`

Storage:

- Cloudflare SQLite-backed Durable Object `LeadStore`

Worker:

`src/worker.js`

Configuration:

`wrangler.jsonc`

Optional environment variables:

- `LEADS_WEBHOOK_URL` — receive a server-side notification for each new lead.
- `LEADS_ADMIN_TOKEN` — enables authenticated `GET /api/leads`.

Without an admin token, lead capture still works; the stored Durable Object data can also be inspected from Cloudflare tooling.

The site publishes:

- `/privacy/`
- `/en/privacy/`

Analytics receives source/campaign/CTA metadata but not the submitted name, contact details or task text.

## Attribution

The browser stores first-touch attribution separately from later navigation:

- initial UTM source / medium / campaign;
- landing page;
- first referrer;
- current page and later touch.

Internal navigation does not overwrite the original acquisition source.

## Languages

Russian is served at root URLs.

English mirrors the same information architecture under:

`/en/`

RU and EN use the same source relationships and presentation architecture, translated for each buyer language.

## Build

The current build still restores the legacy proof site because some historic case/prototype pages remain useful.

Build order:

1. restore legacy proof pages;
2. apply legacy compatibility patches;
3. verify historic prototype links;
4. generate the canonical RU/EN product site;
5. generate Proposal Studio public/legal pages;
6. inject analytics.

The commercial site is data-driven through:

- `scripts/product_catalog.py` — current website presentation mapping/cache (not corporate Source of Truth);
- `scripts/site_content.py` — brand, proof, team and navigation;
- `scripts/build-product-site.py` — rendering and interaction.

## QA

Every push to `viiversion` verifies:

- canonical product routes;
- old module/offer URLs are noindex redirects;
- old commercial routes are excluded from sitemap;
- industry-first homepage;
- Enterprise is not an industry;
- primary vs later product groups;
- RU and EN navigation;
- real team portraits;
- real proof screenshots;
- server-side lead API;
- disposable Durable Object storage probe;
- Worker / Durable Object configuration via Wrangler dry-run;
- first-touch attribution;
- existing public demo availability.

## Rule for future product changes

Add/update the canonical entity in `Entity_Registry` when identity changes; update the relevant L2 Commercial Matrix record when commercial state changes. Then create or update the appropriate website projection.

A new Product/Offer/Vertical/Asset does **not** automatically create a new public navigation category or page. Map it through `docs/WEBSITE_PRESENTATION_SYSTEM.md` and create the public route only when the buyer job, outcome, proof/status and CTA are clear.
