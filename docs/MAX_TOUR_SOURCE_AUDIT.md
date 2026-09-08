# MAX TOUR — Verified Source Audit

Audit date: 2026-09-09
Official source: https://maxtourvietnam.com/
Branch: `backend-max-tour`

## Grounding rule

For a tour-specific field, the official tour detail page is the source of truth when it conflicts with a catalog teaser/card.

No unpublished live availability, payment-provider integration, payment commission, promotion, or schedule is promoted into the verified baseline.

All verified DB records keep `data_status = verified_site` and a `source_url`.

## Verified directions

The official navigation exposes these top-level excursion directions used by the Mini App:

- Нячанг
- Дананг
- Фукуок
- Муйне/Фантьет
- Ханой

Source: https://maxtourvietnam.com/

## Verified demo tour set

### Экскурсия в провинцию Фуйен

Source: https://maxtourvietnam.com/ekskursiya-v-fuyen-iz-nyachanga

Verified detail-page facts used in seed:
- adult group: $40;
- child up to 120 cm: $30;
- child under 2 years: free;
- private: 1–5 $400, 6 $450, 7 $500, 8 $550;
- pickup 05:00–05:30;
- return around 18:30.

### Экскурсия в Далат «Премиум»

Source: https://maxtourvietnam.com/ekskursiya-v-dalat-iz-nyachanga-premium

Verified detail-page facts used in seed:
- adult group: $52;
- child up to 120 cm: $38;
- child up to 100 cm: free;
- private: 1–2 $420, 3 $450, 4 $480, 5 $510, 6 $540;
- full name and date of birth are required for all Dalat participants;
- pickup 05:00–05:30;
- return around 20:00.

Known official-site conflict:
- Nha Trang catalog teaser currently shows adult $52 / child $43;
- detail page currently shows adult $52 / child $38.

Resolution: detail page wins; backend verified seed stores $52 / $38.

### Экскурсия в Далат «ВИП»

Source: https://maxtourvietnam.com/vip-ekskursiya-v-dalat-iz-nyachanga

Verified detail-page facts used in seed:
- adult group: $45;
- child up to 120 cm: $32;
- child under 2 years: free;
- private: 1–2 $350, 3 $400, 4 $450, 5 $480, 6 $510;
- full name and date of birth are required for all Dalat participants.

Known official-site conflict:
- Nha Trang catalog teaser currently shows adult $45 / child $35;
- detail page currently shows adult $45 / child $32.

Resolution: detail page wins; backend verified seed stores $45 / $32.

### Экскурсия в Далат «Стеклянный мост»

Source: https://maxtourvietnam.com/ekskursiya-v-dalat-so-steklyannym-mostom-iz-nyachanga

Verified detail-page facts used in seed:
- adult group: $60;
- child up to 120 cm: $42;
- child up to 100 cm: free;
- private: 1–2 $450, 3 $490, 4 $530, 5 $570, 6 $610;
- full name and date of birth are required for all Dalat participants.

### Дневная обзорная экскурсия по Нячангу

Source: https://maxtourvietnam.com/dnevnaya-obzornaya-ekskursiya-po-nyachangu

Verified detail-page facts used in seed:
- adult group: $35;
- child up to 120 cm: $25;
- child under 2 years: free;
- private: 1–2 $180; 3–4 $60/person; 5–7 $50/person; 7–13 $45/person;
- pickup 09:00;
- return 14:00.

The overlapping boundary at 7 people is preserved as published and must be resolved with MAX TOUR before a real private-tour quote engine uses this rule in production.

### Вечерняя обзорная экскурсия по Нячангу

Source: https://maxtourvietnam.com/vechernyaya-obzornaya-ekskursiya-po-nyachangu

Verified detail-page facts used in seed:
- adult group: $48;
- child up to 120 cm: $35;
- child under 2 years: free;
- private: 1–2 $200, 3 $280, 4 $320, 5 $350, 6 $420;
- pickup 14:00;
- return 20:30.

### Экскурсия в Далат на 2 дня

Source: https://maxtourvietnam.com/ekskursiya-v-dalat-na-2-dnya-iz-nyachanga

Verified detail-page facts used in seed:
- Standard: adult single $125, adult double $110, child <=120 cm $79, child <=100 cm free;
- +Glass Bridge: adult single $145, adult double $130, child <=120 cm $100, child <=100 cm free;
- private: 1–2 $700, 3 $800, 4 $900, 6 $1000;
- full name and date of birth are required for all Dalat participants.

Important: the detail page does not publish a 5-person private price in the captured verified source. The backend does not infer one.

### Ханой и бухта Халонг на самолёте — 2 дня / 1 ночь

Source: https://maxtourvietnam.com/hanoj-halong-iz-nyachanga-2-dnya

Verified facts used in seed:
- private program for 2 people: from $1000 for two;
- child under 2 years: free;
- price may change with season and airfare;
- current price therefore requires a fresh quote and is not represented as a fixed per-person price.

## Verified global booking/payment rules

Source: https://maxtourvietnam.com/

- deposit: 30–100% of excursion cost;
- remaining amount is paid on excursion day to the guide in VND;
- payment methods published by MAX TOUR: cash, bank card, SBP, Kaspi, bank transfer in RUB/KZT, international transfers;
- free reschedule until 17:00 on the day before the excursion;
- after that: 30% retention;
- cancellation more than 48h before departure: free;
- cancellation until 17:00 the day before: 30% retention;
- departure day/no-show: 100% retention;
- refund: within 7 business days; bank commissions may apply.

The backend does not claim a real automated payment provider or commission until MAX TOUR selects and configures one.

## Verified transfer surcharge rules

Source: https://maxtourvietnam.com/

Per car:
- Cam Ranh: $30 for 1–6 people / $50 for 7–14;
- Diamond Bay, Amiana, Alibu, DO Theatre: $20 for 1–6 / $30 for 7–14;
- Doc Let, GM Resort, Paradise: $60 for 1–6 / $90 for 7–14.

These rules are stored server-side in `app_settings` and will be used by the quote engine.

## Open business-rule questions before real paid production

1. Resolve the Nha Trang day-city private-price overlap at exactly 7 people.
2. Confirm whether current catalog teaser child prices or detail-page child prices are intended for Dalat Premium and Dalat VIP; until then detail page remains authoritative.
3. Confirm the missing 5-person private price for the 2-day Dalat program if real private booking must support five people.
4. Select the real payment provider(s), webhook contract and commission rules.
5. Provide a real source of live availability/capacity if MAX TOUR wants availability presented as operational rather than DEMO AVAILABILITY.
