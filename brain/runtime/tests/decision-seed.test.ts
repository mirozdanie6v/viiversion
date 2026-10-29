import test from "node:test";
import assert from "node:assert/strict";
import { canonicalDecision001 } from "../src/decision-seed.ts";
test("canonical DJ-001 decision import has stable ID and provenance semantics", () => {
  const decision = canonicalDecision001("2026-10-13T00:00:00Z");
  assert.equal(decision.id, "DJ-001");
  assert.equal(decision.evidenceClass, "verified_fact");
  assert.equal(decision.at, "2026-10-13T00:00:00Z");
});
