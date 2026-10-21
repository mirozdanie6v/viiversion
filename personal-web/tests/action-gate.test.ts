import { describe, expect, it } from "vitest";
import { digestPlan, normalizeActionPlan, summaryPlan } from "../src/action-gate";
describe("one-time owner action proposals", () => {
  it("normalizes and fingerprints a user-reviewed action sequence", async () => {
    const p = normalizeActionPlan({ url:"https://viiversion.com/",
      actions:[{ type:"scroll",pixels:200 },{ type:"fill",selector:"input[name=topic]",value:"hello" }]
    }, "viiversion.com");
    expect((await digestPlan(p)).length).toBe(64);
    expect(JSON.stringify(summaryPlan(p))).not.toContain("hello");
    const changed = normalizeActionPlan({url:p.url,actions:[{type:"scroll",pixels:201},p.actions[1]]}, "viiversion.com");
    expect(await digestPlan(changed)).not.toBe(await digestPlan(p));
  });
  it("blocks unapproved domains, arbitrary code and unbounded actions", () => {
    expect(() => normalizeActionPlan({ url:"https://other.example/",
      actions:[{ type:"click",selector:"button" }] }, "viiversion.com")).toThrow();
    for (const type of ["javascript","evaluate","screenshot","navigate"]) {
      expect(() => normalizeActionPlan({url:"https://viiversion.com/",
        actions:[{type}]}, "viiversion.com")).toThrow();
    }
    expect(() => normalizeActionPlan({url:"https://viiversion.com/",
      actions:Array(6).fill({type:"scroll",pixels:50})}, "viiversion.com")).toThrow();
  });
});
