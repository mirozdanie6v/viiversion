# VIIVERSION Website Presentation System

**Status:** binding rules for the public VIIVERSION website  
**Scope:** `viiversion.com`, RU/EN pages, product/solution/industry/case/partner/enterprise pages, future owned-software pages  
**Purpose:** keep the website aligned with the VIIVERSION brand and commercial/product system while translating the internal model into language a real buyer can understand.

---

## 1. Source of Truth

The website is a **public projection** of the VIIVERSION system. It is not a separate source of product truth and it is not a literal mirror of internal tables.

Priority:

1. **VIIVERSION — Corporate Strategy & Positioning**  
   Google Doc ID: `1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4`  
   Defines company identity, business model, product architecture principles, markets and external positioning.

2. **VIIVERSION Commercial Matrix**  
   Google Sheet ID: `14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4`  
   Defines current Products, Offers, Assets, Verticals, statuses, prices/hypotheses, distribution and commercial relationships.

3. **VIIVERSION Sales Playbook v1**  
   Google Doc ID: `1itFsDhoPZqyH1NN1emca9u1HFeqYouPu4gcuuzm9BL4`  
   Defines buyer language, messaging, proof, CTA, partner selling and commercial governance.

4. **GitHub website data/code**  
   Implements a presentation layer. GitHub may cache or map the current public view, but it must not redefine the product system.

When sources conflict semantically, Corporate Strategy wins for identity/architecture. Commercial Matrix wins for current operational facts such as product status, asset status and current price hypotheses.

---

## 2. What the website is for

The website must support the company VIIVERSION is building, not only the projects that happen to exist today.

It must:

- make the VIIVERSION parent brand understandable to a non-technical buyer;
- sell concrete products/solutions that are commercially real now;
- show that a complete entry product can stand alone;
- show extensibility into a larger system when the buyer's process actually requires it;
- use vertical pages to adapt one engineering base to different buyer jobs;
- use cases/demos as proof of products and capabilities;
- support end-business buyers, partners/white-label buyers and enterprise/technical buyers;
- leave a clean place for independently distributed VIIVERSION software products as they become publicly available;
- support future recurring revenue, marketplace distribution, partner distribution and enterprise delivery without rebuilding the entire information architecture.

The website is **not** a dump of P01–P36 and is **not** a visual copy of Commercial Matrix.

---

## 3. Internal model and public language are different layers

The internal system may use:

- Product IDs `P01–P36+`;
- `Layer`;
- `Commercial type`;
- `Public family`;
- `Vertical`;
- `Offer`;
- `Asset`;
- launch waves;
- channel-fit tags;
- internal price bands;
- technical names.

These fields exist to operate the business. They do not automatically become website headings, navigation labels or product names.

### Mandatory rule

Every public page must translate internal entities into a buyer-facing proposition.

A visitor should understand, after one read:

1. **What can I get?**
2. **What changes in my current process?**
3. **Is this relevant to a business like mine?**
4. **Can I see proof?**
5. **What is the next useful step?**

If understanding the page requires knowing internal VIIVERSION terminology, software architecture vocabulary or English labels, the presentation layer has failed.

---

## 4. Entity boundaries: never flatten different entity types into one list

| Internal entity | Meaning in the system | Website role |
|---|---|---|
| **Product / module (Pxx)** | Reusable commercial/technical unit | May become a public product page when it passes the public-product gate |
| **Offer (Oxxx)** | Product(s) packaged for a specific buyer trigger / vertical / job | Becomes contextual sales copy, campaign landing or vertical offer |
| **Vertical** | Market packaging of the same engineering base | Industry page / buyer-context route |
| **Asset (Axx)** | Demo, prototype, deployed system, technical proof | Case/proof attached to relevant products/offers |
| **Layer** | Internal technical/business layer | Architecture metadata; normally not a primary buyer-facing category |
| **Commercial type** | Standalone module, reusable module, service, custom system, product, etc. | Controls packaging; usually hidden from buyer |
| **Public family** | Distribution/portfolio grouping in Commercial Matrix | May help organise navigation, but is not automatically a website category |
| **Channel / platform** | Telegram, web, marketplace, partner ecosystem, etc. | Delivery/distribution context unless the channel itself is the buyer's product |
| **Capability / technology** | API, ETL, Oracle, Cloudflare, D1, webhooks, etc. | Proof/technical depth; surfaced where the buyer needs it |

### Example of the rule

These cannot appear as peer items in one generic list:

- online booking;
- Telegram;
- payment;
- CRM;
- automation;
- ETL;
- internal system.

They are different entity types.

A website section may combine them only inside one clear buyer scenario, for example:

**Customer books a service → pays → booking enters the team's existing workflow → CRM is updated automatically.**

The public hierarchy is determined by the buyer job, not by convenience of listing internal entities.

---

## 5. Product model: standalone value first, system composition second

VIIVERSION has products/modules that can be sold independently and larger systems assembled from several products.

The website must preserve both facts.

### Entry-product rule

An entry product is a **finished, useful purchase**, not a teaser for a larger transformation.

A booking product, Mini App, AI consultant, audit, integration sprint or other valid entry product must be allowed to stand on its own when it solves the buyer job.

### System rule

A larger system is shown when multiple products/modules must work together to solve one business process.

The website must never imply that every customer needs a large system.

Architecture/system diagrams therefore explain **how solutions can connect**, not **what every customer is required to buy**.

---

## 6. Horizontal structure vs vertical packaging

Commercial Matrix contains horizontal product/family logic and vertical market packaging. The site must preserve this distinction.

### Horizontal axis

Horizontal product families/capabilities are reusable across industries. They include current matrix families such as Booking Commerce, Mini Apps, Automation, AI Sales, PayBridge, VIIVERSION Connect, Data Engineering, Private Systems, Managed Engineering and owned product families.

These are **internal portfolio groupings**, not mandatory public navigation labels.

### Vertical axis

Verticals describe how the reusable base is applied to a specific buyer job: tourism, rental, clinics, beauty, retail, education, events, enterprise operations, telecom, agencies, etc.

A vertical does not create a new technical platform.

### Website rule

A vertical page should answer:

- what usually happens in this business;
- what buyer problem/trigger is being addressed;
- which concrete VIIVERSION products/offers fit that job;
- what the buyer gets;
- which proof is relevant;
- what can be added later only if the process requires it.

Products stay canonical; vertical pages package them.

---

## 7. Offers are contextual packaging, not the canonical product taxonomy

The `Offers` sheet contains combinations such as Booking Start, Rental Catalog + Quote, One-Flow Automation, Integration Rescue, Paid Discovery + PoC, etc.

Use these as:

- vertical page propositions;
- outbound/ad landing pages;
- campaign-specific packages;
- commercial entry points.

Do not promote every Offer into a permanent top-level product.

One Product may support many Offers. One Offer may combine several Products.

---

## 8. Owned Software Products

Corporate Strategy defines Owned Software Products as a second long-term business direction of VIIVERSION.

Website treatment must follow actual readiness.

### Current rule

- The parent brand may state that VIIVERSION also develops its own software products.
- A specific owned product receives a prominent public product page/navigation position when it has a real external use/distribution path.
- Internal, beta or future products may remain in Commercial Matrix/Assets without being promoted as a finished public catalogue.
- The website must not advertise a future roadmap merely to make the portfolio look larger.

As Proposal Studio, Website Audit Agent, Mini App Factory and future products become independently usable/distributable, the software section can expand without changing the parent-site architecture.

---

## 9. CRM rule

CRM is a special semantic guardrail.

VIIVERSION does not present a proprietary replacement CRM as its general client product.

Public positioning:

- configure the CRM selected/used by the client;
- adapt pipelines, entities, statuses, roles and automations to the process where appropriate;
- integrate CRM with VIIVERSION-built booking, Mini Apps, AI, payments, operational tools, websites and external systems.

A custom **operational/back-office/internal system** is a different product class and must not be mislabeled as CRM.

Legacy matrix labels such as `CRM Core`, `CRM Lite`, `CRM / lead pipeline` are internal/legacy wording and must be translated through the current Corporate Strategy before rendering public copy.

---

## 10. Buyer language rule

Sales Playbook is binding for public copy:

> Buyer language is more important than seller jargon.

### RU site

Use Russian buyer language by default.

Allowed untranslated terms are established names/acronyms where translation would reduce clarity, e.g. CRM, AI, API, Telegram, Oracle.

Internal English labels such as `SELL & BOOK`, `OPERATE`, `Operational Workspace`, `Handoffs`, `Business OS` or `Public family` are not Russian commercial copy.

### Technical terms

Technical detail belongs:

- on technical/enterprise pages;
- in an expandable implementation section;
- in partner/developer material;
- when the buyer explicitly needs it.

For an ordinary business buyer, lead with the observable result/process.

Examples:

- internal: `API / webhooks integration layer`  
  public: **Связать сайт, CRM, кассу или другой сервис и передавать данные автоматически.**

- internal: `Payment integration`  
  public in a booking context: **Добавить оплату в процесс бронирования и автоматически получать её статус.**

- internal: `Admin / back-office portal`  
  public: **Рабочая панель для заказов, статусов и действий команды.**

The examples are translation patterns, not permanent product names.

---

## 11. Homepage rules

The homepage is the parent-brand surface, not the full catalogue.

Above the fold follows Sales Playbook:

**buyer/job → clear value → proof → one primary CTA**

The homepage must:

1. explain VIIVERSION in plain language;
2. show a small number of recognisable things a buyer can actually obtain;
3. avoid implying that every engagement is a large digital-system project;
4. show real proof early;
5. show that standalone products can connect into larger systems when needed;
6. provide separate routes for industries, partners and deeper engineering;
7. mention owned software as a company direction only to the degree it is publicly real.

The homepage must not expose internal taxonomy simply because that taxonomy exists.

---

## 12. Public product-page gate

A Product/Offer gets a canonical public sales page only when all are true:

1. it exists in the Commercial Matrix or is explicitly approved by Corporate Strategy;
2. its current status/readiness supports external selling or an explicitly labelled beta;
3. the buyer job is concrete;
4. the buyer result can be stated without internal jargon;
5. scope/boundary is understandable;
6. proof or honest maturity status exists;
7. one next-step CTA exists;
8. any public price is supported by the current matrix/approved commercial data.

Creating a page does not create a product.

The source entity must exist first.

---

## 13. Product page anatomy

A normal product page should contain, in this order:

1. **What the buyer gets** — concrete category/result.
2. **Who it is for / trigger** — recognisable situation.
3. **Before → after** — what changes in the process.
4. **How it works** — user/business workflow.
5. **What is included** — grouped by workflow, not a random feature list.
6. **Where it can work** — web, Telegram, existing CRM, POS, etc. only when relevant.
7. **What it can connect to** — existing systems/integrations.
8. **Proof** — relevant Asset(s).
9. **Scope/status/price** — only current verified data.
10. **One useful CTA**.

Technology stack comes later unless the target buyer is technical.

---

## 14. Vertical page anatomy

A vertical page is not a duplicate catalogue.

It should contain:

1. the real buyer situation / workflow;
2. 1–3 relevant entry products or offers;
3. the outcome of each entry product;
4. relevant proof from Assets;
5. a simple view of how the solution may expand if the process requires it;
6. one CTA relevant to that vertical.

The vertical page must use the Commercial Matrix `Verticals` and `Offers` relationships rather than inventing a new product list.

---

## 15. Cases and proof

Cases are proof assets, never substitute product names.

Use the Asset status honestly:

- production/deployed;
- full-stack demo;
- production-oriented demo/prototype;
- validated frontend prototype;
- standalone prototype;
- architecture/concept;
- technical beta.

Proof hierarchy from Sales Playbook:

**live relevant demo > relevant production/case > clickable prototype > screenshot/sample > architecture/description > unsupported claim**

A case page should explain **what the asset proves** and which products/capabilities it demonstrates.

---

## 16. Partner route

Partners are a first-class buyer type.

The partner route must speak to:

- web/digital agencies;
- software studios;
- CRM/ERP/POS integrators;
- payment/POS vendors;
- AI automation agencies;
- enterprise/telecom vendors.

Partner presentation uses the same Products but different buyer language:

- capacity without hiring;
- white-label delivery;
- specialist engineering;
- reusable modules/products;
- reseller/revenue-share opportunities where supported.

Do not show partners the whole internal catalogue. Show the relevant gap and proof.

---

## 17. Enterprise / technical route

Enterprise depth is part of the same VIIVERSION brand but has a different buyer and vocabulary.

Technical pages may surface:

- API/webhooks;
- ETL/data pipelines;
- database migration;
- Oracle/PLSQL;
- RBAC/internal systems;
- managed engineering/L2-L3;
- telecom RA/FM.

These capabilities should not dominate the SMB homepage.

For enterprise work, entry can be a paid diagnostic, technical sprint, discovery or PoC, consistent with Sales OS.

---

## 18. Navigation rules

Navigation follows **visitor intent**, not the internal database schema.

Stable intent routes are:

- what VIIVERSION can build / products & solutions;
- industries / use cases;
- cases / proof;
- partners;
- engineering / enterprise depth;
- company/about;
- owned software when publicly meaningful.

The exact public labels may change with copy testing. The underlying intent routes stay stable.

Do not create top-level navigation for every Layer, Public family, Product ID or launch wave.

---

## 19. Price and status rules

Commercial Matrix is the operational source for current status and price hypotheses.

Website rules:

- never copy a stale price from old proposals or code when Matrix has newer data;
- internal price bands are not automatically public prices;
- public price must specify enough scope to be meaningful;
- beta/prototype/demo status must remain explicit;
- `Build / package`, `Package before scale`, `Beta sell` and similar statuses require deliberate public treatment;
- future products do not appear as finished products.

---

## 20. Website data model / presentation adapter

Website code should maintain a **presentation layer** between Commercial Matrix entities and rendered pages.

A public page record should be traceable to source IDs, for example:

```
public_page
  source_product_ids: [P07, P14]
  source_offer_ids: [O001]
  source_vertical_ids: [TOURISM]
  source_asset_ids: [A01, A02]
  audience: end_business
  public_title_ru: ...
  public_title_en: ...
  buyer_job: ...
  outcome: ...
  maturity: ...
  primary_cta: ...
```

The site may curate copy and layout, but source relationships must remain traceable.

### Never derive public titles automatically from:

- `Layer`;
- `Commercial type`;
- `Public family`;
- `Launch wave`;
- repository names;
- channel/platform tags.

Those fields may inform routing and organisation, not public language.

---

## 21. Growth rule for future products

When P37+ or a new Offer/Vertical/Asset is created:

1. add/update it in Commercial Matrix first;
2. classify its role and status;
3. decide whether it needs a public page, an existing product page, a vertical package, a partner page, a campaign landing or no public exposure yet;
4. attach relevant proof;
5. create buyer-language copy;
6. add the website mapping;
7. run QA.

The site should grow by **mapping new source entities into a stable presentation system**, not by adding a new navigation category for every new internal entity.

---

## 22. QA gates for every website change

A website change fails review if any of these are true:

- different entity types are flattened into one unexplained list;
- an internal architecture label is used as buyer copy without translation;
- the RU page contains avoidable English internal terminology;
- a case/demo is presented as the product itself;
- a vertical is presented as a separate technical platform;
- a standalone entry product is made to look like a mandatory part of a large system;
- a large-system diagram is presented as the only way to buy from VIIVERSION;
- CRM copy implies VIIVERSION sells a proprietary replacement CRM;
- technology is presented as the value before the buyer job/outcome;
- a future/internal product is presented as publicly available without a real external path;
- public price/status contradicts Commercial Matrix;
- the page has no traceable Product/Offer/Asset relationship;
- the page has multiple competing primary CTAs;
- the buyer cannot answer “what can I get?” after one read.

---

## 23. Current-site migration implications

The current website implementation predates these rules in several places.

Therefore:

- `scripts/product_catalog.py` is a **site presentation cache/model**, not the corporate Source of Truth;
- the README must not describe the local Python catalogue as the canonical company catalogue;
- the current `FAMILIES → SELLABLE_PRODUCTS → PACKAGES...` model may remain an implementation mechanism, but it cannot redefine the Google Drive product architecture;
- the current four-contour system diagram may remain as an explanatory architecture visual, but it is not the top-level commercial taxonomy;
- `/products/crm/` requires semantic reconciliation with the current CRM rule;
- site product/industry labels must be reviewed against Products + Offers + Verticals + Assets rather than maintained as an independent list;
- owned software should expand on the public site only as real external product paths become ready.

---

## 24. Core principle

**The VIIVERSION system is the source. The website is its buyer-facing view.**

Internal structure must remain rigorous and multi-dimensional.

Public presentation must remain simple, concrete and understandable.

The site should preserve the relationships between products, modules, offers, verticals, proof and distribution without forcing the visitor to learn that internal model.
