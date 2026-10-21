import { describe, expect, it, vi } from "vitest";
import { explorePublicPage } from "../src/explore";
import { readRenderedPage } from "../src/extract";

vi.mock("../src/extract", () => ({
  readRenderedPage: vi.fn(async (page: any) => ({
    url: page.url(), title: "Demo", description: "", markdown: "# Demo",
    links: ["https://example.com/about"]
  }))
}));
function pageMock(linkAllowed = true) {
  let current = "about:blank";
  return {
    goto: vi.fn(async (url: string) => { current = url; return { status: () => 200 }; }),
    url: () => current, title: vi.fn(async () => "Demo"),
    locator: vi.fn(() => ({ evaluateAll: vi.fn(async () => linkAllowed) })),
    mouse: { wheel: vi.fn() },
    waitForTimeout: vi.fn(async () => {}),
    evaluate: vi.fn(async () => ({ links: [{ text: "About", href: "https://example.com/about" }],
      controls: [{ tag: "button", type: "submit", label: "Send", disabled: false }],
      forms: [{ method: "post", action: "https://example.com/submit", inputs: 2 }] }))
  };
}
describe("public read-only browser exploration", () => {
  it("follows a real HTTPS anchor, scrolls, and captures a safe read", async () => {
    const page = pageMock();
    const result = await explorePublicPage(page, {
      url: "https://example.com/",
      steps: [{ type: "follow", href: "https://example.com/about" },
        { type: "scroll", pixels: 400 }, { type: "read" }]
    });
    expect(page.goto).toHaveBeenCalledTimes(2);
    expect((result.document as any).url).toBe("https://example.com/about");
    expect((result.pageControls as any).controls[0].label).toBe("Send");
    expect((result.readings as any[]).length).toBe(1);
    expect(readRenderedPage).toHaveBeenCalled();
  });
  it("refuses a link that does not exist on the live page", async () => {
    const page = pageMock(false);
    await expect(explorePublicPage(page, {
      url: "https://example.com/", steps: [{ type: "follow", href: "https://example.com/other" }]
    })).rejects.toThrow("not a link");
    expect(page.goto).toHaveBeenCalledTimes(1);
  });
  it("rejects clicks, fills, form submission and arbitrary JS", async () => {
    for (const type of ["click", "fill", "submit", "script", "select"]) {
      const page = pageMock();
      await expect(explorePublicPage(page, {
        url: "https://example.com/", steps: [{ type, selector: "#submit", value: "secret" }]
      })).rejects.toThrow();
      expect(page.goto).not.toHaveBeenCalled();
    }
  });
  it("rejects excessive scroll or unsafe navigation target", async () => {
    await expect(explorePublicPage(pageMock(), {
      url: "https://example.com/", steps: [{ type: "scroll", pixels: 999999 }]
    })).rejects.toThrow();
    await expect(explorePublicPage(pageMock(), {
      url: "https://example.com/", steps: [{ type: "follow", href: "https://localhost" }]
    })).rejects.toThrow();
  });
});
