import { describe, expect, it, vi } from "vitest";
import { checkDraftFields, draftTarget, fillWithoutSubmit } from "../src/draft";

function fakePage(type = "text", matches = 1) {
  const fill = vi.fn(async () => {});
  const p = { url: () => "https://viiversion.com/",
    locator: () => ({
      count: async () => matches,
      evaluate: async () => ({ tag: "input", type, auto: "", editable: null,
        disabled: false, readOnly: false, formAction: "" }),
      fill
    })
  };
  return { p, fill };
}
describe("draft handoff: fill without any Save click", () => {
  it("accepts bounded plain text and leaves Save untouched", async () => {
    const { p, fill } = fakePage();
    const result = await fillWithoutSubmit(p, [{ selector: "input[name=name]", value: "Preview only" }], "https://viiversion.com");
    expect(result.filled).toBe(1);
    expect(fill).toHaveBeenCalledWith("Preview only", { timeout: 7000 });
    expect("click" in p).toBe(false);
  });
  it("blocks passwords, ambiguous selectors, IPs, and non-allowed hosts", async () => {
    await expect(fillWithoutSubmit(fakePage("password").p, [{ selector: "#password", value: "secret" }], "https://viiversion.com")).rejects.toThrow();
    await expect(fillWithoutSubmit(fakePage("text",2).p, [{ selector: "input", value: "test" }], "https://viiversion.com")).rejects.toThrow();
    expect(() => draftTarget("https://other-site.com/", "viiversion.com")).toThrow();
    expect(() => draftTarget("https://viiversion.com/", "")).toThrow();
    const approved = "viiversion.com,*.viiversion.com,github.com,dash.cloudflare.com,linkedin.com,www.linkedin.com";
    expect(draftTarget("https://www.linkedin.com/", approved)).toBe("https://www.linkedin.com/");
    expect(draftTarget("https://linkedin.com/", approved)).toBe("https://linkedin.com/");
    expect(() => draftTarget("https://evil-linkedin.com/", approved)).toThrow();
    expect(() => draftTarget("https://www.linkedin.com.evil.com/", approved)).toThrow();
    expect(() => checkDraftFields(Array(6).fill({ selector: "#name", value: "x" }))).toThrow();
  });
  it("does not accept duplicate selectors or a different page origin", async () => {
    const page = fakePage().p;
    await expect(fillWithoutSubmit(page, [
      { selector: "#name", value: "a" }, { selector: "#name", value: "b" }
    ], "https://viiversion.com")).rejects.toThrow();
    await expect(fillWithoutSubmit(page, [
      { selector: "#name", value: "a" }
    ], "https://other-site.com")).rejects.toThrow();
  });
});
