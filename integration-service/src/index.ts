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
