# VIIVERSION Brand Agent Worker

Standalone Cloudflare Worker for the VIIVERSION Brand Architect MCP.

Public target after deployment:

- https://agent.viiversion.com/
- https://agent.viiversion.com/mcp

Worker name: `viiversion-brand-agent`

This Worker is intentionally separate from the public website Worker `landing`.

## Deploy

```bash
cd brand-agent-worker
npm install
npx wrangler deploy
```

The custom domain is declared in `wrangler.jsonc`; Cloudflare creates/manages the DNS record and certificate when deployment is authorized.

## MCP tools

- `get_brand_context`
- `get_priority_entities`
- `get_proof`
- `plan_brand_task`
- `validate_brand_output`
- `get_market_context`
- `get_distribution_routes`
- `plan_market_projection`
- `plan_gtm_motion`
- `plan_productization`
- `evaluate_market_signal`
- `get_live_source_plan`
- `validate_live_context`

The Worker contains a compact Brand Kernel snapshot. Live Google Drive Source of Truth remains authoritative for final public status, readiness, price, proof maturity and approved decisions.


v0.3.0 adds the Market/GTM/Distribution branch: market projection, channel and
motion selection, partner/platform distribution, software/plugin productization
and controlled market-feedback evaluation.


v0.3.0 adds live Source of Truth orchestration via the connected Google Drive app. The MCP plans required reads and validates that final/current claims are grounded in live sources rather than snapshots.


## v0.9.0 — VIIVERSION Core

The Worker now routes the Brand Architect as the reasoning layer of one company core.

Closed loop:

```text
Strategy → Commercial Reality → Market Projection → Revenue Execution → Delivery
→ Revenue Learning → Commercial Economics → Portfolio Intelligence
→ Strategic Review → governed propagation
```

New specialist roles:
- `commercial-economics`
- `revenue-intelligence`
- `portfolio-intelligence`

Brand QA is G1–G18. G16 protects economics integrity, G17 protects revenue-learning integrity, and G18 protects portfolio decisions.

For these tasks the Worker requires brokered live Commercial Matrix evidence from:
- `Commercial_Economics`
- `Revenue_Intelligence`
- `Portfolio_Intelligence`

The Worker never stores Google credentials. Missing economics remain unknown; one sales event remains an observation; portfolio recommendations cannot silently mutate canon.
