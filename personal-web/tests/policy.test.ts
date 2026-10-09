import { describe, expect, it } from "vitest";
import { publicUrl, canonicalSiteLink, robotsAllows } from "../src/policy";

describe("URL safety", () => {
  it.each([
    "http://example.com", "https://localhost", "https://127.0.0.1",
    "https://169.254.169.254", "https://[::1]",
    "https://admin:pass@example.com", "https://example.com:8080",
    "file:///etc/passwd", "https://server.internal", "https://host.local",
    "https://example.com.evil.local"
  ])("rejects unsafe target %s", value => {
    expect(() => publicUrl(value)).toThrow();
  });
  it("allows public HTTPS and strips fragment", () => {
    expect(publicUrl("https://example.com/path?q=1#id")).toBe("https://example.com/path?q=1");
  });
  it("enforces exact and wildcard host allowlists", () => {
    expect(publicUrl("https://www.example.com/", "*.example.com")).toContain("www.example.com");
    expect(() => publicUrl("https://evil-example.com/", "*.example.com")).toThrow();
  });
  it("refuses cross-origin and binary crawl links", () => {
    expect(canonicalSiteLink("https://elsewhere.com/", "https://example.com")).toBeNull();
    expect(canonicalSiteLink("https://example.com/file.pdf", "https://example.com")).toBeNull();
  });
});

describe("robots rules", () => {
  const robots = "User-agent: *\nDisallow: /private\nAllow: /private/public\n";
  it("does not crawl restricted paths", () => {
    expect(robotsAllows(robots, "/private/users")).toBe(false);
    expect(robotsAllows(robots, "/private/public/info")).toBe(true);
    expect(robotsAllows(robots, "/products")).toBe(true);
  });
});
