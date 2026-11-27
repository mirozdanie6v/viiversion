# RU website deployment — preflight (2026-11-27)

Status: preparation only; no production cutover or cloud spending authorized by this document.

## Observed baseline
- Production branch: `viiversion`; baseline commit 4cabddf87e88eb358e66deaf0608abfce3fdbcd6.
- Cloudflare Worker `landing` serves the generated `public/` assets; npm run build restores legacy proof and generates current RU/EN routes.
- Main DNS and www are proxied. No exact ru.viiversion.com record in the DNS inventory observed on 2026-11-27. Existing auto-sale-demo hostname already uses a DNS-only Yandex API Gateway CNAME.
- /api/leads POST, GET and health depend on Cloudflare LeadStore; the site expects a relative API path.
- scripts/add-analytics.py injects telegram.org and dashboard.viiversion.com scripts; the product-site JS posts analytics to dashboard.viiversion.com. External proof links and embedded resources need classification after build.
- No authenticated Yandex Cloud inventory was available during this preflight.

## Proposed topology
One production source, two independently published artifacts. Keep existing Cloudflare deployment intact. For the RU launch candidate, prefer a Yandex Compute Cloud VM with reserved public IPv4, HTTPS reverse proxy (Caddy or Nginx), local static releases and a same-origin lead API backed by a durable RU database. This is a provisional choice, subject to account inventory, cost approval, and comparison with Object Storage + API Gateway. No HTTP redirect to the global site. Keep DNS-only A record (or DNS-only CNAME for an approved managed endpoint); create it only once the endpoint is controlled and ready. Never point a production hostname at an unverified endpoint. Check authoritative DNS accessibility from Russian networks separately. DNS-only does not guarantee availability.

## Build and QA
Run npm install and npm run build from the production source. Run python3 scripts/ru-site-preflight.py public --output /tmp/ru-site-inventory.json. Report hosts and usage counts (including embedded scripts, styles, images, fetch endpoints, and navigation); inventory is heuristic, not proof of availability. Inspect generated artifacts and ensure no secrets/internal pages are packaged. Retain existing site content, brand and route conventions. Stage-only release should carry X-Robots-Tag: noindex until SEO decision. Define canonical/hreflang strategy before indexing; avoid blanket replacement of global URLs and distinguish navigation from required resources.

## API and privacy gates
Port existing same-origin /api/leads contract and response codes; validate size, fields, origin, bot abuse, rate limits, idempotency/retries and admin authorization. Persist before reporting success. Do not forward personal data to Cloudflare/third-party webhook by default. Establish Russian primary storage, access, retention/deletion, backup and lawful privacy notice/consent with legal owner before collection; review cross-border notification separately. Synthetic QA must not generate real lead notifications. Until verified, staging must not accept genuine submissions. Preserve existing global store. No production cutover with a nonfunctional form or false success.

## Rollout and acceptance
1. Inventory existing Yandex cloud/folders, billing, IAM roles, endpoints and resource tags; choose isolated RU resources and approve budget. Use narrowly scoped deploy identity (OIDC where supported) and protected GitHub environment, no secrets in repo or chat.
2. Build same commit and upload versioned release to staging; serve index.html per directory, 404 on missing paths, correct MIME, HTTPS, security headers. Document immutable releases, atomic switch and rollback. Check both RU and EN, product/case routes, PDFs, demo links, form errors and storage.
3. Validate using controlled endpoint, then issue certificate and add DNS-only ru hostname; no changes to apex/www. Verify DNS, TLS, full resource waterfall, no mandatory Cloudflare HTTP requests, mobile/desktop, successful synthetic leads and analytics privacy. Test multiple actual Russian networks without VPN, including wired/mobile; record operators and timestamps. Test existing international site as regression.
4. Review/approve PR and publish; automate release builds on production branch and protected RU deploy (with failure alerts and rollback). Do not claim launch until all checks pass.

## Rollback
Remove or restore only the new ru DNS record if required, or switch RU host to the previous validated release; retain/backup leads independently of code rollback. Never change global apex or www as part of RU rollback.

## Official references
- https://developers.cloudflare.com/dns/proxy-status/
- https://yandex.cloud/ru/docs/tutorials/web/static/console
- https://yandex.cloud/ru/docs/iam/tutorials/ci-cd-github-functions
- https://yandex.cloud/ru/docs/security/tutorials/network-security/virtual-hosting
