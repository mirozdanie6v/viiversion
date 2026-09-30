# VIIVERSION Brand Architect

ChatGPT-native brand and structure agent for VIIVERSION.

This package is intentionally separated from the production website. It is the first working version of a reusable brand agent that can reason across website structures, product pages, partner materials, profiles, launches, pitches, messaging, and other VIIVERSION surfaces without requiring command triggers.

## Core idea

The agent does not mechanically reproduce Google Docs and does not treat GitHub implementation as brand truth.

It works as:

\`\`\`text
user task
  → semantic task classification
  → compact Brand Kernel
  → minimal live source refresh when required
  → structure / messaging / mapping
  → Brand QA
  → requested artifact or implementation handoff
\`\`\`

## Source model

Priority:

1. Corporate Strategy & Positioning — L1 identity and ontology.
2. Commercial Matrix / Entity_Registry / Products / Assets — structured identity, commercial state and proof.
3. Global Brand & Market Strategy — L3 market, audience and messaging rules.
4. Channel-specific strategy — only when the task targets that channel.
5. GitHub / implementation — downstream implementation only.

The compact kernel is a fast cache, not a replacement for live sources.

## Current package

- \`plugin.json\` — portable plugin manifest.
- \`skills/viiversion-brand-architect/SKILL.md\` — main orchestration skill.
- \`references/brand-kernel.yaml\` — compact brand context snapshot.
- \`references/source-manifest.yaml\` — source ownership and refresh rules.
- \`references/task-architecture.md\` — adaptive structure method and surface patterns.
- \`references/qa-gates.md\` — brand and evidence validation.
- \`evals/cases.json\` — regression cases.

## Invocation

The skill is designed for implicit invocation. No \`САЙТ\`, \`БРЕНД\`, \`КП\` or other command prefix is required.

Examples:

- «Сделай структуру главной VIIVERSION».
- «Как нам показать Proposal Studio?»
- «Собери партнёрскую страницу».
- «Переделай позиционирование этого продукта под CTO».
- «Проверь, не превращает ли этот текст нас в веб-студию».
- «Сделай страницу Booking для сайта».
- «Собери структуру презентации для партнёров».

## Boundary

The agent may freely create or improve presentation-layer structures when they remain compatible with canon.

It must not silently:
- redefine VIIVERSION;
- create a new principal direction or canonical category;
- invent a product, proof, readiness, price or deployment;
- turn a prototype into a production claim;
- present VIIVERSION as a proprietary CRM vendor;
- change L1-L3 canon without explicit approval and governance.

## Runtime

v0.6.0 includes the production Brand Agent runtime at `agent.viiversion.com`.

Runtime responsibilities:
- persistent per-run state in Cloudflare Durable Objects;
- seven isolated specialist roles;
- Workers AI JSON-schema execution;
- PENDING → ACCEPT/REJECT artifact handoff;
- automatic route progression;
- independent G1–G15 Brand QA;
- bounded rework to the earliest responsible routed role;
- final result assembly;
- audit trail and transient Durable Object retry handling.

For current/final work, ChatGPT remains the credential boundary for Google Drive.
It reads only the sources selected by `get_live_source_plan`, validates source
classes/tabs, and sends only the minimal evidence bundle to Cloudflare. Google
credentials are never copied into the Worker.

## Market / GTM / Distribution

v0.6.0 includes Brand Architect beyond website/product presentation into the
operational market layer: Projection Engine, GTM motion selection, partner and
platform distribution, outreach campaign architecture, Software/plugin
productization, launch planning and controlled market feedback.

The agent remains one central VIIVERSION brand/product/market brain. Specialized
engineering, proposal and sales executors can receive implementation handoffs
without becoming independent sources of brand truth.


## Live Source of Truth

v0.6.0 keeps Google Drive as the user-authorized live Source of Truth app.
For current/final/implementation tasks the agent asks Brand MCP which Drive
sources are required, reads only those sources through Google Drive, then
validates the observed source classes/tabs before making current claims.

Google credentials are not stored in the Cloudflare Worker.
