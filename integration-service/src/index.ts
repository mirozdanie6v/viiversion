import {
  type Env,
  getAvailability,
  getProduct,
  getProducts,
  getStatus,
  handleCallback,
  handleInstall,
  saveAdminRestCredentials,
} from './bokun';

export { IntegrationStore } from './store';

function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get('origin') ?? '';
  if (!origin) return '';
  if (origin === 'https://viiversion.com' || origin.endsWith(env.ALLOWED_ORIGIN_SUFFIX?.trim() || '.viiversion.com')) return origin;
  if (/^http:\/\/localhost(?::\d+)?$/.test(origin)) return origin;
  return '';
}

function json(request: Request, env: Env, data: unknown, status = 200) {
  const origin = allowedOrigin(request, env);
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  });
  if (origin) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function termsPage() {
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VIIVERSION Integration Service — Terms of Service</title>
  <meta name="robots" content="index,follow">
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #060a13; color: #eaf0ff; line-height: 1.65; }
    main { width: min(860px, calc(100% - 32px)); margin: 0 auto; padding: 64px 0 80px; }
    .brand { font-weight: 800; letter-spacing: .08em; font-size: 14px; color: #72d7ff; }
    h1 { margin: 14px 0 8px; font-size: clamp(34px, 7vw, 58px); line-height: 1.02; letter-spacing: -.035em; }
    .meta { color: #9baccc; margin-bottom: 36px; }
    section { padding: 22px 0; border-top: 1px solid #1a2740; }
    h2 { margin: 0 0 10px; font-size: 20px; }
    p, li { color: #c8d3e8; }
    ul { padding-left: 22px; }
    a { color: #72d7ff; }
    .note { margin-top: 36px; padding: 18px 20px; border: 1px solid #243654; border-radius: 14px; background: #0b1220; }
  </style>
</head>
<body>
<main>
  <div class="brand">VIIVERSION</div>
  <h1>Terms of Service</h1>
  <div class="meta">VIIVERSION Integration Service · Effective September 25, 2026</div>

  <section>
    <h2>1. Scope</h2>
    <p>These Terms govern access to and use of the VIIVERSION Integration Service, including connections between VIIVERSION applications and third-party booking, inventory, payment, CRM, communication, and related platforms.</p>
  </section>

  <section>
    <h2>2. Authorized use</h2>
    <p>The service may be used only by organizations and users who are authorized to connect the relevant third-party account. You must keep your account credentials secure and must not use the service to access data or systems without permission.</p>
  </section>

  <section>
    <h2>3. Third-party services</h2>
    <p>The service can exchange data with third-party platforms such as Bókun. Availability, pricing, product content, booking status, and other third-party data remain subject to the terms, technical limits, uptime, and policies of those platforms. VIIVERSION does not control third-party services.</p>
  </section>

  <section>
    <h2>4. Data and credentials</h2>
    <p>Integration credentials and tokens are used only to perform the authorized integration functions. Secret credentials are intended to remain server-side and must not be exposed in client applications or public repositories. The connected organization is responsible for ensuring that its use of customer and booking data complies with applicable law and its own privacy obligations.</p>
  </section>

  <section>
    <h2>5. Service changes and availability</h2>
    <p>We may update the integration, endpoints, supported features, or technical requirements to maintain security, compatibility, and reliability. Temporary interruptions can occur because of maintenance, provider outages, API changes, or other technical events.</p>
  </section>

  <section>
    <h2>6. Prohibited use</h2>
    <ul>
      <li>attempting unauthorized access to accounts, systems, or data;</li>
      <li>circumventing provider permissions, rate limits, or security controls;</li>
      <li>using the service for unlawful, fraudulent, abusive, or deceptive activity;</li>
      <li>introducing malicious code or intentionally disrupting the service.</li>
    </ul>
  </section>

  <section>
    <h2>7. Disclaimer</h2>
    <p>The service is provided on an “as is” and “as available” basis. To the extent permitted by law, VIIVERSION disclaims implied warranties regarding uninterrupted operation, third-party availability, or fitness for a particular purpose.</p>
  </section>

  <section>
    <h2>8. Limitation of liability</h2>
    <p>To the extent permitted by law, VIIVERSION is not liable for indirect, incidental, special, consequential, or third-party losses arising from use of the integration, including losses caused by third-party platform outages, data supplied by third parties, or unauthorized use of connected accounts.</p>
  </section>

  <section>
    <h2>9. Suspension and termination</h2>
    <p>Access may be suspended or terminated when necessary to protect security, comply with law or provider requirements, address misuse, or end an integration relationship. Connected organizations may also revoke the integration from the relevant third-party platform.</p>
  </section>

  <section>
    <h2>10. Changes to these Terms</h2>
    <p>These Terms may be updated as the integration service evolves. The current version will be published at this URL with its effective date.</p>
  </section>

  <section>
    <h2>11. Contact</h2>
    <p>Questions about these Terms or the VIIVERSION Integration Service can be submitted through <a href="https://viiversion.com">viiversion.com</a>.</p>
  </section>

  <div class="note">This page applies to the integration service hosted at <strong>integration.viiversion.com</strong>.</div>
</main>
</body>
</html>`;

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'x-frame-options': 'DENY',
    },
  });
}

function value(url: URL, name: string, fallback?: string) {
  return (url.searchParams.get(name) ?? fallback ?? '').trim();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const origin = allowedOrigin(request, env);
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-methods': 'GET,POST,OPTIONS',
          'access-control-allow-headers': 'content-type,authorization',
          'access-control-max-age': '600',
        },
      });
    }

    try {
      if (url.pathname === '/terms' && request.method === 'GET') return termsPage();

      if (url.pathname === '/health' && request.method === 'GET') {
        return json(request, env, {
          ok: true,
          service: 'viiversion-integration',
          bokun: {
            vendorId: env.BOKUN_DEFAULT_VENDOR_ID ?? null,
            productId: env.BOKUN_DEFAULT_PRODUCT_ID ?? null,
            productCode: env.BOKUN_DEFAULT_PRODUCT_CODE ?? null,
            productIds: (env.BOKUN_PRODUCT_IDS ?? env.BOKUN_DEFAULT_PRODUCT_ID ?? '').split(',').map(x => x.trim()).filter(Boolean),
            productCodes: (env.BOKUN_PRODUCT_CODES ?? env.BOKUN_DEFAULT_PRODUCT_CODE ?? '').split(',').map(x => x.trim()).filter(Boolean),
          },
          time: new Date().toISOString(),
        });
      }

      if (url.pathname === '/bokun/install' && request.method === 'GET') return handleInstall(request, env);
      if (url.pathname === '/bokun/callback' && request.method === 'GET') return handleCallback(request, env);

      if (url.pathname === '/api/bokun/status' && request.method === 'GET') {
        const vendorId = value(url, 'vendorId', env.BOKUN_DEFAULT_VENDOR_ID);
        return json(request, env, await getStatus(env, vendorId));
      }

      if (url.pathname === '/api/bokun/products' && request.method === 'GET') {
        const vendorId = value(url, 'vendorId', env.BOKUN_DEFAULT_VENDOR_ID);
        return json(request, env, await getProducts(env, vendorId));
      }

      if (url.pathname === '/api/bokun/product' && request.method === 'GET') {
        const vendorId = value(url, 'vendorId', env.BOKUN_DEFAULT_VENDOR_ID);
        const productId = value(url, 'productId', env.BOKUN_DEFAULT_PRODUCT_ID);
        return json(request, env, await getProduct(env, vendorId, productId));
      }

      if (url.pathname === '/api/bokun/availability' && request.method === 'GET') {
        const vendorId = value(url, 'vendorId', env.BOKUN_DEFAULT_VENDOR_ID);
        const productId = value(url, 'productId', env.BOKUN_DEFAULT_PRODUCT_ID);
        return json(request, env, await getAvailability(env, vendorId, productId, url));
      }

      if (url.pathname === '/admin/bokun/rest-credentials' && request.method === 'POST') {
        return saveAdminRestCredentials(request, env);
      }

      return json(request, env, { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, 404);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error(error instanceof Error ? error.message : 'Unknown integration error');
      return json(request, env, { error: { code: 'INTERNAL_ERROR', message: 'Integration service error' } }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
