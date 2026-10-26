import { describe, expect, it, vi } from "vitest";
import { batchReadPublic } from "../src/batch";
vi.mock("../src/extract", () => ({
  readRenderedPage: vi.fn(async (page: any) => ({
    title: "Example", description: "Example page",
    markdown: "Some useful content", links: [page.url()]
  }))
}));
function makePage() {
  let url = "";
  return {
    goto: vi.fn(async (next: string) => { url = next; return { status: () => 200 }; }),
    url: () => url,
    waitForTimeout: vi.fn(async () => {})
  };
}
describe("bounded independent public-page batch", () => {
  it("visits three public sites in one context", async () => {
    const page = makePage();
    const result = await batchReadPublic(page, [
      "https://example.com/", "https://www.python.org/", "https://react.dev/"
    ]);
    expect(result.completed).toBe(3);
    expect((result.documents as any[]).map(d => d.title)).toEqual(["Example", "Example", "Example"]);
    expect(page.goto).toHaveBeenCalledTimes(3);
  });
  it("blocks IP literals and oversized batches before browser launch", async () => {
    const page = makePage();
    await expect(batchReadPublic(page, ["https://127.0.0.1/"])).rejects.toThrow();
    await expect(batchReadPublic(page, Array(5).fill("https://example.com/"))).rejects.toThrow();
    expect(page.goto).not.toHaveBeenCalled();
  });
});
