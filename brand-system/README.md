# VIIVERSION Brand System

Machine-readable contracts for the VIIVERSION canonical brand, market and projection architecture.

## Authority

These files are **not an independent Source of Truth**. They implement and mirror canonical Google Drive sources.

1. **L1 Corporate Canon** — Google Doc `VIIVERSION — Corporate Strategy & Positioning`
   - document id: `1nfRAgnSiEv13XUOcqgRostFYdUlbFo83eOLRLQNLnN4`
2. **Structured L1 registry + L2 Commercial System** — Google Sheet `VIIVERSION Commercial Matrix`
   - spreadsheet id: `14i9E4WGazfwwsGl2mP_0TtZa9URBI-zeKj-qromAl-4`
   - canonical entity records: `Entity_Registry`
   - proof registry: `Assets`
   - market learning: `Market_Signals`
   - global change log: `Decision_Log`
   - channel rules: `Channel_Profiles`
   - projections: `Projection_Index`
3. **L3 Global Market & Brand System** — Google Doc `VIIVERSION — Global Brand & Market Strategy`
   - document id: `1Mhl1tJqaE8xyviEO9FQGKxA26c-_Mo6UE3J1ZCugKPI`
4. **L4 Channel Projection** — channel-specific strategies and projections.
5. **L5 Implementation** — website/code/listings/profiles/campaigns.

## Core flow

```text
L1 Corporate Canon
  ↓
L2 Commercial System + Proof + Economics
  ↓
L3 Global Brand & Market System
  ↓
L4 Projection Engine
  Entity × Market × Audience × Channel × Language × Goal
  ↓
Revenue + Delivery Execution
  ↓
Revenue Intelligence + Market Signals
  ↓
Portfolio Intelligence
  ↓
Strategic Review / Decision Log
  ↺ governed propagation
```

Downward flow carries definitions and approved decisions.
Upward flow carries observed sales outcomes, economics, delivery patterns, market signals and validated learning.

The binding closed-loop machine contract is `core-loop.yaml`.

## Rules

- Stable IDs are immutable and never reused.
- A channel may create `display_name`, `headline`, `CTA` and other projection fields, but it must not overwrite `canonical_name`.
- Website, Sales Engine and marketplace code are consumers of the canonical system, not ontology owners.
- Sales is also a sensor: structured outcomes and objections flow through Revenue_Intelligence.
- Commercial profitability/scalability evidence lives in Commercial_Economics, not in invented narrative.
- Cross-portfolio priority and productization recommendations live in Portfolio_Intelligence and remain non-canonical until governance approves a canonical change.
- P01–P36 remain valid stable IDs.
- Engineering Solutions has six canonical upper categories: ENG-A through ENG-F.
- Conflicting downstream data must be escalated to the appropriate Source of Truth instead of silently normalized in code.
