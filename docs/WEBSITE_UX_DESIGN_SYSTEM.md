# VIIVERSION Website UX & Design — Implementation Rules

**Canonical UX/UI Source of Truth:**  
Google Doc: **VIIVERSION — Website UX & Design System**  
Document ID: `1nWOpqPFpTYG1N8OCPcc0GLwvN5ed3gl5NmeIqECRcNE`  
https://docs.google.com/document/d/1nWOpqPFpTYG1N8OCPcc0GLwvN5ed3gl5NmeIqECRcNE/edit

This file is an implementation contract. It does not redefine the UX strategy. If it conflicts with the Google Doc, the Google Doc wins.

## Source hierarchy

1. Corporate Strategy & Positioning
2. Commercial Matrix
3. Sales Playbook
4. Website Marketing & Communication Strategy
5. Website UX & Design System
6. Website Presentation / implementation docs
7. Code and rendered pages

## Core experience

- Simple at first contact, deeper as the buyer intentionally explores.
- Real proof carries more visual weight than decoration.
- Small buyers see a finished entry point; enterprise buyers see engineering ceiling.
- Buyer intent drives UI. Internal taxonomy does not.
- Existing client systems are treated as integration targets, not presumed replacement targets.

## Layout

- Desktop content container: roughly 1160–1240px.
- Wider proof/architecture layouts may extend to 1360–1440px.
- Reading column: roughly 620–760px.
- Use a 12-column desktop grid, 6–8 tablet, responsive single/two-column mobile layouts.
- Base spacing scale: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 120.
- Typical major section: 72–104px vertical padding desktop, 48–72px mobile.
- A semantic section has one dominant UX job. Do not force 100vh.

## Typography

- H1: about 52–76px desktop, 36–48px mobile.
- H2: about 36–52px desktop, 28–38px mobile.
- Body: 16–18px, line-height 1.5–1.7.
- Main reading line length: about 45–75 characters.
- All-caps only for short status/eyebrow labels.

## Baseline tokens

Current website palette remains a working baseline until a separate visual-brand revision:

- ink: #071524
- navy: #06111F
- primary blue: #145DFF
- muted: ~#5A6878
- line: ~#DFE6EE
- soft surface: ~#F5F7FA
- white: #FFFFFF

Use one dominant action accent. Status colors are functional.

## Card rule

Use cards only for peer objects users compare: cases, equivalent products, industries, entry options, team, comparable pricing.

Do not automatically card:
- architecture;
- sequential process;
- major proof;
- every feature;
- every paragraph;
- internal layers.

Avoid nested cards, repeated 4–5 column card walls and heavy hover shadows.

Prefer editorial splits, full-width proof, timelines, flows, comparisons, diagrams, structured lists and annotated screenshots.

## Hero

Must contain:
- one H1;
- one lead;
- one primary CTA;
- at most one secondary CTA;
- real/traceable product proof where useful.

Do not put in hero:
- architecture map;
- four internal layers;
- technology stack;
- capability dump;
- industry catalogue;
- more than two CTAs.

## Proof

Homepage proof follows hero.

Every proof surface shows:
- business context;
- what can actually be inspected;
- truthful maturity status;
- useful CTA.

Prefer meaningful app states (booking, order, dashboard, status, analytics) over empty home screens.

## Scale-fit pattern

Use a non-pricing progression:
**one task → connected processes → custom company system**

Each stage must look complete. Never style it as Basic / Pro / Enterprise.

## Navigation

- 5–7 main desktop routes maximum.
- Contact CTA separate.
- Language control separate.
- Mobile menu works without hover.
- Navigation labels use visitor intent, not Layers, Public Families or internal IDs.

## CTA

One primary CTA per local section.

Preferred labels describe the result:
- Open demo
- View case
- View solution
- Check scenario
- Discuss a task
- View engineering capabilities

Avoid generic "Learn more" when a specific action exists.

Primary controls should target at least 44x44 CSS px.

## Architecture visuals

Only after the buyer understands the offer.

Architecture diagrams:
- show a real flow;
- use buyer-readable labels;
- have a vertical mobile version;
- do not require horizontal panning for core understanding;
- have textual HTML equivalents.

## Page templates

### Product / solution
Outcome → audience/trigger → before/after → workflow → included scope → channels → integrations → proof → status/price context → CTA → technical depth.

### Industry
Recognisable situation → workflow/problem → 1–3 relevant solutions → outcome → proof → existing-system integration → expansion path → CTA.

### Case
Business/scenario → problem → what was built/demoed → real screenshots → flow → capabilities proved → architecture if useful → maturity boundary → CTA.

### Enterprise
Engineering job → capability → proof → integration/data/DB/Oracle/internal-system depth → delivery path.

### Partner
Partner gap → white-label/delivery capability → proof → engagement model → CTA.

## Forms

Initial contact form should stay short:
- name;
- contact;
- company/site when useful;
- task.

Do not require budget, internal product classification or tech stack at first contact.

Keep labels visible, preserve input on recoverable errors, and provide explicit success/error state.

## Motion

Use motion to explain state or flow, not as decoration.

Baseline:
- micro: 120–180ms
- small transition: 180–260ms
- panel transition: 240–360ms

Respect `prefers-reduced-motion`.

No scroll hijacking, persistent animated backgrounds or heavy hero motion.

## Mobile

QA widths: 360 / 390 / 430 CSS px. Tablet: ~768–1024px.

Mobile layouts must be designed, not merely collapsed:
- no horizontal overflow;
- vertical diagram variants;
- readable screenshot crops;
- touch-safe controls;
- sticky UI must not obscure content.

## Accessibility

Minimum target: WCAG 2.2 AA.

Required:
- normal text contrast >= 4.5:1;
- large text >= 3:1;
- non-text controls >= 3:1;
- keyboard navigation;
- visible focus;
- focus not obscured;
- semantic headings/landmarks;
- form labels;
- alt text where meaningful;
- 200% text zoom support;
- no color-only meaning;
- no drag-only essential operation.

## Performance

Core Web Vitals target at p75, mobile and desktop:
- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

Reserve image/async dimensions, use responsive images, lazy-load non-critical media, keep hero media light, avoid large JS animation systems.

## Current-site migration

1. Remove process/architecture map from hero.
2. Keep proof immediately after hero and strengthen it.
3. Reduce generic card-grid usage.
4. Remove SELL & BOOK / OPERATE / AUTOMATE / CONNECT & ENGINEER as the public homepage skeleton.
5. Put buyer jobs before internal architecture.
6. Add scale-fit UI.
7. Keep engineering depth lower than basic relevance.
8. Add an explicit existing-system integration trust pattern.
9. Turn cases into proof documents, not enlarged cards.
10. Design mobile diagrams/proof separately.
11. Replace generic "Подробнее" CTAs where a specific action exists.
12. Stop using rounded-card + shadow as the default visual grammar.

## QA blockers

A page is not ready if it fails any of:
- clarity;
- proof;
- mobile;
- accessibility;
- performance.

For full rationale and canonical rules, use the Google Doc above.


## Current visual baseline — preserve

The current viiversion.com visual language is the baseline, not something to replace by default.

Preserve unless a separate visual-brand task explicitly changes it:
- dark navy hero foundation;
- blue gradient/light treatment in hero;
- calm light page backgrounds;
- restrained ink/navy/blue/neutral palette;
- minimalist spacing and typography;
- stable multi-page corporate/product-site feel;
- responsive behavior that currently avoids overflow and layout breakage;
- current serious navigation vocabulary such as Cases / Engineering / Industries / Components where it remains understandable.

The current UX migration changes information hierarchy and section composition first.

Migration principle:
**preserve visual language → rebuild information hierarchy → recompose selected sections → retest responsive**

Do not treat the UX system as a mandate for a full visual redesign.
