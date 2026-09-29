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

The Worker contains a compact Brand Kernel snapshot. Live Google Drive Source of Truth remains authoritative for final public status, readiness, price, proof maturity and approved decisions.
