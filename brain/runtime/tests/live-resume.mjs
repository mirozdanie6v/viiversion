import assert from "node:assert/strict";
const { BRAIN_TEST_BASE: base, BRAIN_TEST_TOKEN: token, BRAIN_EXPECTED_RUN_ID: runId, BRAIN_EXPECTED_PLAN_ID: planId } = process.env;
if (!base || !token || !runId || !planId) throw Error("Independent-process context check missing configuration");
const r = await fetch(new URL("/context", base), {
  headers: { authorization: "Bearer " + token },
});
assert.equal(r.status, 200);
const data = await r.json();
assert.equal(data.state.activeObjectiveId, "OBJ-MARK-BOOTSTRAP");
assert.deepEqual(data.state.openLoops.map(x => x.id).sort(), ["OL-CLOSURE", "OL-COMPANY-STATE"]);
assert.ok(data.decisions.some(x => x.id === "DJ-001" && x.evidenceClass === "verified_fact"));
const commitmentsResponse=await fetch(new URL("/approved-commitments",base),{
 headers:{authorization:"Bearer "+token},
});
assert.equal(commitmentsResponse.status,200);
const approved=await commitmentsResponse.json();
assert.deepEqual(data.approvedCommitments,approved.records,
  "independent session must restore entire persisted commercial memory in normal CEO context");
assert.equal(data.readiness.ready,false,
  "independent process cannot claim complete Brain when source refresh and CEO loop are absent");
assert.equal(data.checkpoint?.runId, runId);
assert.equal(data.checkpoint?.stage, "diagnose");
assert.equal(data.readiness.ready,false);
const planRes = await fetch(new URL("/execution-plans?id=" + planId, base), {
  headers: {authorization: "Bearer " + token},
});
assert.equal(planRes.status, 200);
const plan = await planRes.json();
assert.equal(plan.id, planId);
assert.equal(plan.plan.schemaVersion, 1);
assert.ok(Array.isArray(plan.plan.actions));
assert.ok(Array.isArray(plan.plan.commitments));
console.log("PASS: fresh independent Node process recovered persisted execution-plan snapshot from D1");
console.log("PASS: independent Node process restored Brain objective, open loops, canonical decision, and checkpoint directly from remote D1");
