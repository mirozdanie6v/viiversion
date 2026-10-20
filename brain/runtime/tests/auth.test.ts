import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorized } from "../src/auth.ts";

const token = "v".repeat(64);
test("Brain state routes require a configured bearer token", async () => {
  assert.equal(await isAuthorized(new Request("https://example.test/state"), token), false);
  assert.equal(await isAuthorized(new Request("https://example.test/state", { headers: { authorization: "Bearer " + token } }), undefined), false);
  assert.equal(await isAuthorized(new Request("https://example.test/state", { headers: { authorization: "Bearer wrong" } }), token), false);
  assert.equal(await isAuthorized(new Request("https://example.test/state", { headers: { authorization: "Bearer " + token } }), token), true);
  assert.equal(await isAuthorized(new Request("https://example.test/state", { headers: { authorization: "Bearer " + token } }), "weak"), false);
});
