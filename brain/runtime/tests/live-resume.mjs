import assert from "node:assert/strict";
const { BRAIN_TEST_BASE: base, BRAIN_TEST_TOKEN: token, BRAIN_EXPECTED_RUN_ID: runId } = process.env;
if (!base || !token || !runId) throw Error("Independent-process context check missing configuration");
const r = await fetch(new URL("/context", base), {
  headers: { authorization: "Bearer " + token },
});
assert.equal(r.status, 200);
const data = await r.json();
assert.equal(data.state.activeObjectiveId, "OBJ-MARK-BOOTSTRAP");
assert.deepEqual(data.state.openLoops.map(x => x.id).sort(), ["OL-CLOSURE", "OL-COMPANY-STATE"]);
assert.ok(data.decisions.some(x => x.id === "DJ-001" && x.evidenceClass === "verified_fact"));
assert.equal(data.checkpoint?.runId, runId);
assert.equal(data.checkpoint?.stage, "diagnose");
console.log("PASS: independent Node process restored Brain objective, open loops, canonical decision, and checkpoint directly from remote D1");
