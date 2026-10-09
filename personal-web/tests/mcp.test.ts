import { describe, expect, it } from "vitest";
import { handleMcp } from "../src/mcp";

const request = (method: string, params: Record<string, unknown> = {}) =>
  new Request("https://personal.example.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
const mock = async (_path: string, args: Record<string, unknown>) => Response.json({ ok: true, args });

describe("stateless MCP facade", () => {
  it("initializes and advertises tools", async () => {
    const init = await handleMcp(request("initialize"), mock);
    expect((await init.json() as any).result.serverInfo.name).toBe("viiversion-personal-web");
    const list = await handleMcp(request("tools/list"), mock);
    expect((await list.json() as any).result.tools.length).toBeGreaterThan(3);
  });
  it("runs a scrape through its protected API adapter", async () => {
    const response = await handleMcp(request("tools/call", { name: "web_scrape", arguments: { url: "https://example.com" } }), mock);
    const result = await response.json() as any;
    expect(result.result.isError).toBe(false);
    expect(result.result.content[0].text).toContain("example.com");
  });
  it("refuses unsupported tools", async () => {
    const response = await handleMcp(request("tools/call", { name: "run_shell", arguments: {} }), mock);
    expect((await response.json() as any).error.code).toBe(-32602);
  });
});
