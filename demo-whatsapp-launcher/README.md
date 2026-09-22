# demo.viiversion.com — WhatsApp Launcher

Standalone static launcher for VIIVERSION outreach.

## Purpose

Google Sheets does not reliably open `whatsapp://` links directly.  
This project provides a normal HTTPS page:

`https://demo.viiversion.com/?phone=84912345678`

The user clicks **Open WhatsApp** on that page, and only then the browser invokes:

`whatsapp://send?phone=84912345678`

No outreach message is passed in the URL. The message remains in the adjacent Google Sheets column for manual review and paste.

## Cloudflare Pages settings

- Repository: `mirozdanie6v/viiversion`
- Production branch: `demo-whatsapp-launcher`
- Root directory: `demo-whatsapp-launcher`
- Framework preset: None
- Build command: leave empty
- Build output directory: `.`
- Custom domain: `demo.viiversion.com`

The main `viiversion.com` production branch and code are not changed by this launcher.
