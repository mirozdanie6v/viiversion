# VIIVERSION

Production website for **VIIVERSION**.

Public targets:
- https://viiversion.com/
- https://landing.viiversion.workers.dev/

Deployment branch: `viiversion`  
Cloudflare Worker: `landing`

## Product architecture

There is one canonical commercial catalogue:

```
FAMILIES
  ↓
SELLABLE_PRODUCTS
  ↓
PACKAGES + ADDONS
  ↓
INDUSTRY_CONFIGS
  ↓
TARGET_LANDINGS / COMPOSITE_SYSTEMS
```

Source of truth: `scripts/product_catalog.py`.

### Families

Families organise the catalogue internally. They are not separate products sold to the customer.

- Online Sales
- Booking
- Operations
- AI
- Payments
- Integrations

### Sellable products

These are the canonical products customers can buy directly:

- Online booking
- Telegram Mini App
- Catalogue with pricing
- CRM for leads and orders
- AI assistant
- Payment integration
- System integration

Canonical routes:

`/products/<product>/`

A starter package is embedded inside each product. It is not a separate product or indexable page.

### Add-ons

Add-ons extend a canonical product and are not automatically promoted to standalone products. Examples:

- customer account
- staff dashboard
- notifications
- analytics
- owner dashboard
- repeat sales
- reconciliation
- managed support

### Industry configurations

The homepage and industry pages filter the canonical catalogue by business type.

They do not create new products.

Current business types:

- tours & activities
- hotels
- retail
- rental
- clinics
- restaurants
- services

Each industry shows:

1. 2–3 products that usually make sense first;
2. products/add-ons that can be added later.

Enterprise is intentionally **not** an industry. It has its own commercial path.

### Product × industry pages

Targeted landing pages may exist for outbound, ads or SEO, for example:

- `/solutions/tourism/online-booking/`
- `/solutions/tourism/ai-consultant/`
- `/solutions/rental/online-booking/`
- `/solutions/clinics/online-booking/`
- `/solutions/clinics/ai-consultant/`
- `/solutions/restaurants/payment-integration/`

These pages reference the canonical product and its starter package. They do not duplicate pricing or create a new catalogue entity.

## Separate commercial paths

### Software products

`/software/`

Standalone products developed by VIIVERSION, separate from custom client delivery:

- Proposal Studio
- ZL Web Agent
- Event Video Human Editor

### Partners

`/partners/`

Partner / white-label paths:

- Mini App Factory
- payment integration delivery for POS vendors and platforms

### Enterprise

`/enterprise/`

Complex internal and engineering work:

- roles / permissions / approvals
- API and webhooks
- ETL / data
- database migration
- Oracle / PL/SQL
- Revenue Assurance
- L2/L3 technical support

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

RU and EN use the same product catalogue, industry configuration and commercial paths.

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

- `scripts/product_catalog.py` — canonical commercial data;
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

Do **not** add a new public product by creating a new page first.

Decide whether it is:

1. a sellable product;
2. an add-on;
3. a package of an existing product;
4. an industry configuration;
5. a composite system;
6. a standalone software product;
7. a partner product;
8. an Enterprise capability.

Only after that classification should a route or landing page be created.
