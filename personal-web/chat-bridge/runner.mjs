/**
 * Read-only ChatGPT/GitHub bridge.
 * IMPORTANT: viiversion is a PUBLIC repository. This runner is intentionally
 * restricted to unauthenticated, public pages. NEVER request /v1/session/*
 * or include credentials/private URLs. Results are printed to PUBLIC CI logs.
 */
import fs from "node:fs/promises";

const endpoint = "https://viiversion-personal-web-staging.viiversion.workers.dev";
const tools = {
  scrape: "web_scrape",
  map: "web_map",
  crawl: "web_crawl",
  extract: "web_extract"
};

function checkRequest(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Request must be an object");
  }
  if (typeof data.id !== "string" || !/^[A-Za-z0-9_-]{1,48}$/.test(data.id)) {
    throw new Error("Invalid request id");
  }
  const toolName = tools[data.operation];
  if (!toolName) throw new Error("Operation must be scrape/map/crawl/extract");
  if (typeof data.url !== "string" || data.url.length > 1024) {
    throw new Error("Missing/oversized URL");
  }
  const target = new URL(data.url);
  if (target.protocol !== "https:" || target.username || target.password ||
      target.port || target.hash || target.search) {
    throw new Error("Only public HTTPS URLs without query/fragment/credentials are accepted");
  }
  // Read only anonymous pages on public DNS names.
  const host = target.hostname.toLowerCase();
  const labels = host.split(".");
  const reserved = new Set(["local","internal","localhost","test","invalid","onion","lan"]);
  if (labels.length < 2 || labels.some(x=>!x || x.length>63) ||
      reserved.has(labels[labels.length-1]) ||
      !/^[a-z0-9.-]+$/.test(host) || /^[0-9.]+$/.test(host)) {
    throw new Error("A valid public HTTPS hostname is required");
  }
  const accountSections = new Set(["login","signin","account","dashboard","admin","billing","inbox","oauth"]);
  if (target.pathname.toLowerCase().split("/").some(section=>accountSections.has(section))) {
    throw new Error("Private account pages are excluded from public logs");
  }
  const payload = { url: target.href };
  if (data.operation === "map" || data.operation === "crawl") {
    const limit = data.limit ?? 2, depth = data.depth ?? 1;
    if (!Number.isInteger(limit) || limit < 1 || limit > 5 ||
        !Number.isInteger(depth) || depth < 0 || depth > 2) {
      throw new Error("Invalid limits for public browsing");
    }
    payload.limit = limit;
    payload.depth = depth;
  }
  if (data.operation === "extract") {
    const fields = data.fields;
    if (!fields || typeof fields !== "object" || Array.isArray(fields) ||
        !Object.keys(fields).length || Object.keys(fields).length > 10 ||
        Object.entries(fields).some(([k,v]) => !/^[A-Za-z_][A-Za-z0-9_]{0,39}$/.test(k) ||
          typeof v !== "string" || !v || v.length > 120)) {
      throw new Error("Invalid CSS extraction fields");
    }
    payload.fields = fields;
  }
  return { id: data.id, operation: data.operation, toolName, payload };
}

async function main() {
  const token = process.env.PERSONAL_WEB_API_TOKEN;
  if (!token || token.length < 32) throw new Error("Missing GitHub Actions PERSONAL_WEB_API_TOKEN secret");
  const request = checkRequest(JSON.parse(
    await fs.readFile(new URL("./request.json", import.meta.url), "utf8")
  ));
  const response = await fetch(endpoint + "/mcp", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: request.id, method: "tools/call",
      params: { name: request.toolName, arguments: request.payload }
    }),
    signal: AbortSignal.timeout(95000),
    redirect: "error"
  });
  if (!response.ok) throw new Error("Personal Web returned HTTP " + response.status);
  const rpc = await response.json();
  if (rpc.error || rpc.result?.isError || !Array.isArray(rpc.result?.content)) {
    throw new Error("Personal Web MCP tool call was unsuccessful");
  }
  const text = rpc.result.content.find(part => part.type === "text")?.text;
  if (typeof text !== "string") throw new Error("MCP returned no readable output");
  const data = JSON.parse(text);
  if (!data.ok) throw new Error("Personal Web MCP tool reported an unsuccessful operation");
  const safe = JSON.stringify({ id: request.id, operation: request.operation,
    url: request.payload.url, transport: "mcp-tools-call", response: data });
  console.log("PERSONAL_WEB_BRIDGE_RESULT_BEGIN");
  console.log(safe.slice(0, 27000));
  console.log("PERSONAL_WEB_BRIDGE_RESULT_END");
  if (safe.length > 27000) console.log("RESULT_TRUNCATED: true");
}
main().catch(error => {
  console.error("PERSONAL_WEB_BRIDGE_ERROR: " + (error?.message ?? "Unknown error"));
  process.exitCode = 1;
});
