/**
 * Minimal stateless MCP Streamable HTTP facade, backed by the *same* authenticated
 * API operations. POST /mcp accepts JSON-RPC requests and returns application/json.
 * No cookies, sessions, event streams, or unauthenticated tool calls are exposed.
 */
const descriptors = [
  { name: "web_scrape", description: "Render one public HTTPS page with Chromium; return title, links and clean Markdown.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"], additionalProperties: false } },
  { name: "web_map", description: "Discover same-origin links and return URLs; follows robots.txt with bounded page count.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 8 }, depth: { type: "integer", minimum: 0, maximum: 2 } }, required: ["url"], additionalProperties: false } },
  { name: "web_crawl", description: "Visit up to eight same-origin pages; return rendered Markdown per page, observing robots.txt.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 8 }, depth: { type: "integer", minimum: 0, maximum: 2 } }, required: ["url"], additionalProperties: false } },
  { name: "web_extract", description: "Extract structured fields from a rendered page using named CSS selectors.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, fields: { type: "object", additionalProperties: { type: "string" } } }, required: ["url", "fields"], additionalProperties: false } },
  { name: "web_screenshot", description: "Capture the rendered page as a PNG image.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, fullPage: { type: "boolean" } }, required: ["url"], additionalProperties: false } },
  { name: "web_session_scrape", description: "Render a URL using a previously saved, encrypted owner-only browser login. The site must match the saved session's origin.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"], additionalProperties: false } },
  { name: "web_interact", description: "Run explicitly requested browser clicks, fills, selects, scrolling or waits; server owner must enable this tool.",
    inputSchema: { type: "object", properties: { url: { type: "string" }, actions: { type: "array", maxItems: 10, items: { type: "object" } } }, required: ["url", "actions"], additionalProperties: false } }
] as const;

const tools = new Map<string, string>([
  ["web_scrape", "/v1/scrape"],
  ["web_map", "/v1/map"],
  ["web_crawl", "/v1/crawl"],
  ["web_extract", "/v1/extract"],
  ["web_screenshot", "/v1/screenshot"],
  ["web_session_scrape", "/v1/session/scrape"],
  ["web_interact", "/v1/interact"]
]);

type Runner = (path: string, params: Record<string, unknown>) => Promise<Response>;

function rpc(id: unknown, value: Record<string, unknown>, status = 200): Response {
  return Response.json({ jsonrpc: "2.0", id, ...value }, { status, headers: {
    "content-type": "application/json", "cache-control": "no-store"
  } });
}

export async function handleMcp(request: Request, runner: Runner): Promise<Response> {
  if (request.method !== "POST") return new Response("POST required", { status: 405, headers: { allow: "POST" } });
  let message: Record<string, any>;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return rpc(null, { error: { code: -32600, message: "Oversized request" } }, 400);
    message = JSON.parse(raw);
    if (!message || Array.isArray(message) || typeof message !== "object") throw new Error("Invalid request");
  } catch {
    return rpc(null, { error: { code: -32700, message: "Invalid JSON" } }, 400);
  }
  const id = message.id ?? null;
  const method = message.method;
  if (message.jsonrpc !== "2.0" || typeof method !== "string") {
    return rpc(id, { error: { code: -32600, message: "Invalid JSON-RPC request" } }, 400);
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return new Response(null, { status: 202, headers: { "cache-control": "no-store" } });
  }
  if (method === "initialize") {
    return rpc(id, { result: {
      protocolVersion: "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "viiversion-personal-web", version: "0.1.0" }
    } });
  }
  if (method === "ping") return rpc(id, { result: {} });
  if (method === "tools/list") return rpc(id, { result: { tools: descriptors } });
  if (method === "tools/call") {
    const name = message.params?.name;
    const target = tools.get(name);
    if (!target) return rpc(id, { error: { code: -32602, message: "Unknown tool" } });
    const args = message.params?.arguments ?? {};
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      return rpc(id, { error: { code: -32602, message: "Invalid tool arguments" } });
    }
    try {
      const response = await runner(target, args);
      if (response.ok && response.headers.get("content-type")?.includes("image/png")) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.length > 3_000_000) {
          return rpc(id, { result: { content: [{ type: "text", text: "Screenshot exceeds 3 MB MCP limit" }], isError: true } });
        }
        let binary = "";
        for (let i = 0; i < bytes.length; i += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return rpc(id, { result: {
          content: [{ type: "image", data: btoa(binary), mimeType: "image/png" }],
          isError: false
        } });
      }
      const body = await response.text();
      return rpc(id, { result: {
        content: [{ type: "text", text: body }],
        isError: !response.ok
      } });
    } catch {
      return rpc(id, { result: {
        content: [{ type: "text", text: "Browser operation failed" }],
        isError: true
      } });
    }
  }
  return rpc(id, { error: { code: -32601, message: "Method not found" } });
}
