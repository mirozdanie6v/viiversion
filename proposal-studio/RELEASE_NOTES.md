# Proposal Studio public infrastructure

Added to the existing VIIVERSION site, deployment branch `viiversion`. No new site, worker, domain, backend, MCP or authentication was created.

Routes: `/proposal-studio/`, `/proposal-studio/support/`, `/proposal-studio/privacy/`, `/proposal-studio/terms/`.

Pages use the existing brand logo, Russian and English copy, the monitored `info@viiversion.com` support route, and the existing public Telegram contact. The VIIVERSION analytics tracker is not added to these pages. Cloudflare may still add its infrastructure script; the privacy page now states that explicitly. Existing site pages and analytics remain unchanged except for product footer links.

## Remaining owner checks before plugin submission

- `info@viiversion.com` is an active Cloudflare Email Routing address. On 2026-09-21 the routing log showed a successful `Forwarded` event for that exact address; no message was sent during this work.
- Review and approve the publisher identity and legal texts for the publisher's jurisdiction, contact requirements, actual support retention practice and distribution countries. These texts are not a legal compliance certification.
- Confirm the final OpenAI listing, upload the tested bundle, and complete the separate product audit and publication stages.

The plugin is described as preparing for publication, not already approved or installable from the directory.
