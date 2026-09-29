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

The Worker contains a compact Brand Kernel snapshot. Live Google Drive Source of Truth remains authoritative for final public status, readiness, price, proof maturity and approved decisions.


v0.2.0 adds the Market/GTM/Distribution branch: market projection, channel and
motion selection, partner/platform distribution, software/plugin productization
and controlled market-feedback evaluation.
