# Cloudflare production settings

Target URL: `https://landing.viiversion.workers.dev`

## Workers Builds

- Repository: `mirozdanie6v/viiversion`
- Production branch: `viiversion`
- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Worker name: `landing` (defined in `wrangler.jsonc`)

The build command restores the complete static site into `public/` and validates the main page, prototypes page and all case pages before deployment.

## Required account setting

The Cloudflare Workers.dev account subdomain must be `viiversion`. The Cloudflare account display name alone does not control the workers.dev subdomain.

With subdomain `viiversion` + Worker name `landing`, the production address is:

`https://landing.viiversion.workers.dev`
