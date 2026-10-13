# VIIVERSION website recovery / 2026-10-13
Base: viiversion @ 11fc28cca4ab36dbb9c82873c263c3199bc3a2af. Work: fix/website-directions-canonical-20261013.
**Production and Google Drive have not been modified by this branch.**

## Verified source precedence
1. L1: [Corporate Strategy](https://docs.google.com/document/d/1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4/edit), revision 22 (2026-10-06).
2. L2: [Commercial Matrix](https://docs.google.com/spreadsheets/d/14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4/edit), Entity_Registry, Product_Architecture_AF, Products and category models.
3. L4: [Website Channel Strategy](https://docs.google.com/document/d/1WsVbntOo8tN9qN2Q-GW60MnY3eBhHFWOn6YO7PsUMlI/edit), revision 25 (2026-10-07).
4. L5: [Homepage Architecture](https://docs.google.com/document/d/1xBxcPm41TJ_wMBSxPWx-Wol8SeyXhcFkh6sEa_2rSuo/edit), revision 15 (2026-10-07).
5. GitHub scripts and marketing copy are downstream implementations, not the corporate source of truth.

## Confirmed defects before work
- Direction buttons changed their active style only; they did not show any modules/services or link to cluster pages.
- Public product catalog was a shortened sales presentation rather than the full canonical A–F mapping.
- Six dedicated direction pages did not exist.
- Current homepage and approved marketing architecture differ in section order and proof coverage. This issue is not fixed in this tightly scoped change.
- September approved short hero text in Drive conflicts with the October 7 direct approved edit reflected in live-branch site_content.py. Preserve current Hero until separate explicit review.
- Drive revisions 24 -> 25 for Website Channel Strategy and 14 -> 15 for Homepage Architecture update website-only direction names to the six current labels. Do not restore older names.

## Authoritative six routes and ID accounting
| Cluster | Approved website label | Included canonical IDs |
| --- | --- | --- |
| ENG-A | Продажи и обслуживание клиентов | P01 P02 P03 P04 P05 P06 P07 P08 P09 P12 P31 P33 P37 |
| ENG-B | Управление заявками и работой команды | P38 P39 P40 P41 |
| ENG-C | Автоматизация бизнес-процессов | P14 P15 P34 P42 P43 |
| ENG-D | AI для клиентов и сотрудников | P16 P17 P44 P45 P46 |
| ENG-E | Интеграция систем и платежей | P10 P19 P20 P21 |
| ENG-F | Данные, аналитика и корпоративные системы | P18 P22 P23 P24 P25 P26 P30 P35 |
Total: 39 active Engineering entries. P11/P13 are superseded; P27/P28/P29/P36/P47/P48 belong to a separate Software direction, P32 is archived.

## Entity boundaries to preserve
- P01/P04/P05/P06 represent customer-site or messenger delivery implementations, not core booking/order data modules.
- P10/P21 are services; P19/P20 are integration products.
- P23/P24/P30/P35 are engineering services; P26 is a custom system outcome.
- API, OAuth, webhooks and cloud providers are implementation mechanisms, not new canonical products.
- Website subgroup headings and buyer-facing descriptions in scripts/site_directions.py are WEBSITE PRESENTATION only. They do not create new L1/L2 entities.
- Custom engineering is a cross-cutting ability: a customer project may combine units across clusters or require new components beyond this registry.
- CASES labels are demo/prototype status from existing site_content.py, not newly independently verified deployment claims.

## Isolated implementation
- scripts/site_directions.py: 39 exact IDs, RU/EN names and benefits, subdivision groups, service separation, readiness flags.
- scripts/build-product-site.py: click-to-reveal panels with real contents and six detailed solution pages, both Russian and English.
- .github/workflows/viiversion-build.yml: checks 12 pages, toggles/panels, Python syntax, and registry validation.

## Must verify before any deploy
- CI builds and QA pass.
- Browser click/keyboard/mobile interactions and links pass.
- Buyer-facing proof claims and case statuses are correct.
- Google Drive remains canonical; no direct Drive write is part of this repair.
- Full homepage architecture/proof rework and historical document cleanup require a separate bounded change.

Rollback: discard the isolated branch or close its pull request. No changes to production yet.
