import base from './index';

const NULL_ORIGIN_HEADERS: HeadersInit = {
  'access-control-allow-origin': 'null',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
  'vary': 'Origin',
};

function withNullOriginCors(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(NULL_ORIGIN_HEADERS)) headers.set(key, String(value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const opaqueTelegramLikeRequest = url.pathname === '/api/collect' && request.headers.get('origin') === 'null';

    if (!opaqueTelegramLikeRequest) return base.fetch(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: NULL_ORIGIN_HEADERS });

    const headers = new Headers(request.headers);
    headers.delete('origin');
    const forwarded = new Request(request, { headers });
    const response = await base.fetch(forwarded, env);
    return withNullOriginCors(response);
  },

  scheduled(controller: ScheduledController, env: any, ctx: ExecutionContext) {
    return base.scheduled(controller, env, ctx);
  },
} satisfies ExportedHandler<any>;
