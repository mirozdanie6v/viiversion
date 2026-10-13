/**
 * Read-only ChatGPT/GitHub bridge.
 * IMPORTANT: viiversion is a PUBLIC repository. This runner is intentionally
 * restricted to unauthenticated, public pages. NEVER request /v1/session/*
 * or include credentials/private URLs. Results are printed to PUBLIC CI logs.
 */
import fs from "node:fs/promises";

const endpoint = "https://viiversion-personal-web-staging.viiversion.workers.dev";
const routes = {
  scrape: "/v1/scrape",
  map: "/v1/map",
  crawl: "/v1/crawl",
  extract: "/v1/extract"
};

function checkRequest(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Request must be an object");
  }
  if (typeof data.id !== "string" || !/^[A-Za-z0-9_-]{1,48}$/.test(data.id)) {
    throw new Error("Invalid request id");
  }
  const route = routes[data.operation];
  if (!route) throw new Error("Operation must be scrape/map/crawl/extract");
  if (typeof data.url !== "string" || data.url.length > 1024) {
    throw new Error("Missing/oversized URL");
  }
  const target = new URL(data.url);
  if (target.protocol !== "https:" || target.username || target.password ||
      target.port || target.hash || target.search) {
    throw new Error("Only public HTTPS URLs without query/fragment/credentials are accepted");
  }
  // Exact public sites only: do not put client dashboards, credentials,
  // unpublished staging content or authenticated sessions in GitHub logs.
  if (target.hostname !== "viiversion.com" &&
      !(target.hostname === "github.com" && /^\/mirozdanie6v(?:\/|$)/.test(target.pathname))) {
    throw new Error("Only public viiversion.com and github.com/mirozdanie6v pages are enabled");
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
  return { id: data.id, operation: data.operation, route, payload };
}

async function main() {
  const token = process.env.PERSONAL_WEB_API_TOKEN;
  if (!token || token.length < 32) throw new Error("Missing GitHub Actions PERSONAL_WEB_API_TOKEN secret");
  const request = checkRequest(JSON.parse(
    await fs.readFile(new URL("./request.json", import.meta.url), "utf8")
  ));
  const response = await fetch(endpoint + request.route, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "content-type": "application/json"
    },
    body: JSON.stringify(request.payload),
    signal: AbortSignal.timeout(95000),
    redirect: "error"
  });
  if (!response.ok) throw new Error("Personal Web returned HTTP " + response.status);
  const data = await response.json();
  if (!data.ok) throw new Error("Personal Web reported an unsuccessful operation");
  const safe = JSON.stringify({ id: request.id, operation: request.operation,
    url: request.payload.url, response: data });
  console.log("PERSONAL_WEB_BRIDGE_RESULT_BEGIN");
  console.log(safe.slice(0, 27000));
  console.log("PERSONAL_WEB_BRIDGE_RESULT_END");
  if (safe.length > 27000) console.log("RESULT_TRUNCATED: true");
}
main().catch(error => {
  console.error("PERSONAL_WEB_BRIDGE_ERROR: " + (error?.message ?? "Unknown error"));
  process.exitCode = 1;
});
