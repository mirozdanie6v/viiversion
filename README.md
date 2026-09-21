# VIIVERSION

Production website for **VIIVERSION — Digital Business Systems**.

## Public targets

- https://viiversion.com/
- https://landing.viiversion.workers.dev/

Deployment branch: `viiversion`  
Cloudflare Worker: `landing`

## Site architecture

The public site is generated as a connected product system rather than a single landing page.

### Products
- `/products/sales/`
- `/products/booking/`
- `/products/operations/`
- `/products/ai-operator/`
- `/products/paybridge/`

### Industries
- `/industries/`
- Tourism, rental, clinics, beauty, hospitality, restaurants, retail, real estate, education, events, e-commerce and service businesses.

### Solutions
- `/solutions/online-sales/`
- `/solutions/booking-automation/`
- `/solutions/ai-sales/`
- `/solutions/fast-checkout/`
- `/solutions/private-operations/`

### Proof / special lanes
- `/cases/`
- `/enterprise/`
- `/labs/`
- `/about/`
- `/proposal-studio/`

## Build model

The repository still restores the legacy static site because existing case/prototype pages remain valuable proof assets.

Build order:

1. restore legacy site;
2. apply legacy compatibility patches;
3. verify legacy prototype links;
4. generate the new product site with `scripts/build-product-site.py`;
5. build Proposal Studio public/legal pages;
6. inject analytics into all generated HTML.

The new homepage and product architecture are therefore generated **after** legacy verification, while old prototype/case pages remain published.

## QA

Every push to `viiversion` runs:

- `Build check`
- `VIIVERSION build QA`
- `Public smoke check`
- `Live diagnostics`

The checks verify both the new product routes and the existing proof/demo routes.

## Product principle

The public architecture follows:

```
product core × industry × business problem
            ↓
entry offer → module combination → vertical system → private system
```

The internal commercial catalogue can contain many modules, but the public site presents a smaller number of understandable product cores and composes them into industry-specific solutions.
