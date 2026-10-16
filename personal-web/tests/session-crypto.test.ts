import { describe, it, expect } from "vitest";
import { sealSession, openSession, filterStorageState } from "../src/session-crypto";

describe("encrypted browser session", () => {
  const key = "21".repeat(32);
  it("encrypts, decrypts and binds payload to an origin", async () => {
    const encrypted = await sealSession('{"cookies":[]}', "https://example.com", key);
    expect(encrypted.ciphertext).not.toContain("cookies");
    expect(await openSession(encrypted, "https://example.com", key)).toBe('{"cookies":[]}');
    await expect(openSession(encrypted, "https://other.com", key)).rejects.toThrow();
  });
  it("keeps only cookies belonging to the requested site", () => {
    const value = filterStorageState({
      cookies: [
        { domain: ".example.com", value: "valid" },
        { domain: "login.evil.com", value: "bad" },
        { domain: "example.com.evil.com", value: "bad" }
      ],
      origins: [{ origin: "https://example.com" }, { origin: "https://other.com" }]
    }, "https://example.com");
    expect(value.cookies).toHaveLength(1);
    expect(value.origins).toHaveLength(1);
  });
});
