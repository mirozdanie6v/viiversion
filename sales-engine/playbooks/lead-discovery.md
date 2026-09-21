# VIIVERSION Lead Discovery Playbook v1.1

## Corporate positioning contract

Before prospecting, Lead Discovery must use the Google Doc **VIIVERSION — Corporate Strategy & Positioning** as the highest semantic source of truth. VIIVERSION is an engineering product company: it builds digital systems for businesses and also develops its own software products. Vertical packages are market packaging; cases are proof; Vietnam is a market of presence, not the brand identity.

If any discovery, product naming or outreach rule conflicts with that positioning, the positioning wins. Live prices, statuses, experiments and operational catalog data remain governed by the Commercial Matrix.

## Purpose

Lead Discovery is not a company-finding bot. Its job is to find businesses that have a **credible commercial reason to buy one concrete VIIVERSION product**.

The system must prefer five strong leads over fifty businesses for which we have merely invented something to sell.

## The core rule

**Business → evidence → meaningful buyer job/problem → concrete VIIVERSION product → buyer → proof → offer → outreach.**

Never reverse this into:

**Business → missing feature → invent offer.**

The fact that a business has no website, AI, CRM, app, bot or automation is not, by itself, a sales problem.

## Concrete-product test

Before a lead is allowed into Ready, answer:

> What exactly are we offering this company?

The answer must be understandable to the buyer without VIIVERSION vocabulary.

Good:
- online table-booking system;
- school enrollment and student-operations system;
- tour booking system;
- rental booking system;
- clinic booking + CRM;
- AI sales consultant connected to the real catalog;
- payment module;
- integration module.

Bad:
- mobile layer;
- structured flow;
- digital customer journey;
- smart ecosystem;
- operations module;
- owned brand layer.

Internal codes can stay internal. Client-facing language must name a recognizable product/category.

## Outcome test

A candidate is rejected if our proposal does not create a materially different result.

Bad example:

**Before:** customer messages a manager to book.  
**After:** customer fills a form and the manager receives a booking request.

That can be useful UX, but it is not automatically a strong product or sales reason.

A meaningful online-booking product might instead produce:

**Before:** customer asks a manager whether a slot/table/vehicle is available.  
**After:** customer sees real availability, selects date/time, confirms the booking, optionally pays a deposit, receives status/confirmation, and staff sees the booking in one operating view.

That is a different capability.

## Evidence hierarchy

Strong evidence includes an explicit project/request, expansion, a new branch/service, active hiring related to the workflow, a migration/integration initiative, or a clearly visible transactional process with material friction.

Medium evidence includes manual booking/quoting, multi-channel intake, chat-based catalog sales, or a repeated customer action that can credibly become self-service.

Weak evidence includes industry fit, “no website,” “no AI,” “no CRM,” “uses Instagram,” or “looks like another client.”

Weak evidence alone does not qualify a lead.

## Discovery workflow

1. Select an active experiment lane.
2. Find a candidate business from current public sources.
3. Verify the business and check duplicates.
4. Record observable evidence only.
5. Validate a commercially meaningful job/problem.
6. Run the outcome test.
7. Map one existing concrete VIIVERSION product.
8. Apply `routing.yaml` to choose the entry offer.
9. Choose proof that demonstrates that product.
10. Identify the buyer responsible for the job.
11. Generate outreach through `messaging.yaml`.
12. Pass the Lead Discovery and Messaging quality gates.
13. Write the lead to Sales_Router and the message to Outreach_Queue.

## Identity in first contact

Cold outreach must not leave the recipient asking who we are.

Use a short identity line appropriate to the channel, for example:

> Мы VIIVERSION — инженерная команда, создаём цифровые системы для бизнеса и собственные программные продукты.

Then name the concrete product. For local outreach, Nha Trang can be added as context (for example, «работаем в Нячанге»), but not as the definition of the company.

The first message does **not** need to explain the entire VIIVERSION stack. But after reading it, the recipient must be able to answer:

1. Who is contacting me?
2. What exact product are they offering?
3. Why is it relevant to my business?
4. What will work differently from today?
5. What do they want me to do next?

If any of these is unclear, the message is not Ready.

## Product before abstraction

Do not hide a real product behind “low-friction” wording.

If we are proposing online table booking, say **online table-booking system**.

If we are proposing an AI catalog consultant, say **AI consultant that recommends from your actual catalog and moves the customer into booking/order**.

If we are proposing a clinic CRM, say **clinic booking and CRM system**.

Short outreach is not vague outreach.

## Existing tools

Do not sell replacement for the sake of replacement.

If a barbershop already has a working booking system, do not invent an “owned mobile layer” merely because we can build one. Find a meaningful adjacent job with evidence, or reject the lead.

Likewise, a business that successfully uses Instagram/Maps and has no need for a website is not automatically a website lead.

## AI rule

AI can be the first product when the buyer has a large catalog, many pre-purchase questions, recommendation complexity or a clearly conversational sales job.

It still must be concrete:

> AI consultant connected to your real catalog that answers product questions, recommends options and moves the customer into booking.

Not:

> AI-powered digital solution.

## Lead statuses

**Ready** — meaningful job is evidenced, concrete product is clear, relevant proof exists, copy passes Messaging System.

**Needs signal** — product fit is plausible but the actual job/problem is not sufficiently evidenced.

**Needs localization** — commercial fit passes but channel-native language still needs work.

**Reject** — only a missing-feature observation exists, there is no meaningful outcome, no concrete product, no relevant proof, or an existing tool already solves the job with no evidenced adjacent gap.

Rejected candidates should not be forced into Sales_Router merely to increase activity.

## Metrics

Lead Discovery is judged by downstream quality, not database volume:

- qualified leads created;
- share with a current business trigger;
- share with a concrete product;
- share with relevant proof;
- positive replies;
- demos accepted;
- qualified conversations;
- paid entries.

Track weak-fit candidates rejected as a quality signal.

**Do not optimize for number of leads added.**

## Governance

Lead Discovery consumes canonical products, offers, routing, scoring and messaging rules. It does not silently change them.

If repeated market evidence shows that VIIVERSION needs a new product or offer, create a separate product/offer review. Do not invent a new canonical offer inside one prospect record.
