# VIIVERSION

Production website for **VIIVERSION — Digital Business Systems**.

## Public targets

- https://viiversion.com/
- https://landing.viiversion.workers.dev/

Deployment branch: `viiversion`  
Cloudflare Worker: `landing`

## Commercial architecture

The public website is built around a simple customer-facing path:

```
problem → product → proof → small first offer → expansion
```

The internal product matrix remains:

```
product × industry × problem × offer
```

but internal terms such as buyer journey, entry offer, commercial core and vertical are not exposed as client copy.

### Main products

- Online Sales
- Booking
- Operations
- AI Operator
- PayBridge

### Deep industry pages

- Tourism
- Rental
- Clinics

Other industries remain visible in the catalogue but do not get thin SEO pages until there is enough specific content and proof.

### Starting offers

- Booking Start
- Mini App Pilot
- AI Operator Pilot
- Operations Core
- Integration Sprint

### Targeted Product × Industry landings

Examples:

- `/solutions/tourism/booking/`
- `/solutions/tourism/ai-operator/`
- `/solutions/rental/booking/`
- `/solutions/clinics/booking/`
- `/solutions/clinics/ai-operator/`
- `/solutions/restaurants/paybridge/`

## Languages

Russian is published at root URLs.

English mirrors the same commercial architecture under:

`/en/`

Generated pages include canonical and hreflang links.

## Content and rendering

Client-facing marketing content is stored separately from rendering logic:

- `scripts/site_content.py` — RU/EN product, offer, industry, case, Labs and team content.
- `scripts/build-product-site.py` — page rendering, shared components, SEO, conversion UX and sitemap generation.

This allows copy to be edited without rewriting page templates.

## Conversion layer

Every generated commercial page includes a contextual enquiry form.

The form captures:

- page path;
- UTM source / medium / campaign / content / term;
- referrer;
- selected CTA / interest;
- contact and task supplied by the visitor.

The current static implementation prepares a structured message for an already-published VIIVERSION contact channel and does **not** pretend to submit to a CRM endpoint that does not exist yet. The form UI can later be connected to a webhook/CRM without changing page structure.

## Proof status

Public proof is explicitly labelled:

- WORKING DEMO
- PUBLIC PROTOTYPE
- CLIENT CONCEPT

A prototype is not presented as a production deployment.

Legacy proof routes remain published because several working demos and existing case pages depend on them.

## Build order

1. restore legacy proof site;
2. apply legacy compatibility patches;
3. verify legacy prototype links;
4. generate the commercial RU/EN product site;
5. generate Proposal Studio public/legal pages;
6. inject analytics into all generated HTML.

## QA

Every push to `viiversion` runs:

- Build check
- VIIVERSION build QA
- Public smoke check
- Live diagnostics

QA covers:

- RU and EN homepages;
- product, offer and targeted solution routes;
- price/timeline content;
- proof status labels;
- contextual lead form;
- Product × Industry interaction;
- absence of internal marketing jargon on the homepage;
- mobile navigation;
- legacy public demos.

## Current technical note

The repository still restores the original archived site because legacy proof pages remain in use. The commercial site itself is now data-driven through `site_content.py`; the next infrastructure cleanup can remove the archive dependency once legacy proof pages are migrated into the same content architecture.
