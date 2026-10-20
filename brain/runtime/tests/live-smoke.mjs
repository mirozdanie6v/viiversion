import assert from "node:assert/strict";
const base = process.env.BRAIN_TEST_BASE;
const token = process.env.BRAIN_TEST_TOKEN;
if (!base || !token || token.length < 32) throw Error("Missing remote smoke configuration");

async function call(path, method = "GET", body) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: { authorization: "Bearer " + token, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  return { status: response.status, data };
}
// A new Worker version may take a short time to propagate to all edges.
let healthy = false;
for (let i = 0; i < 30; i++) {
  try {
    const health = await fetch(new URL("/health", base));
    if (health.status === 200) { healthy = true; break; }
  } catch { /* retry during deployment propagation */ }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
assert.ok(healthy, "new Worker version must serve /health before state tests");
const unauthorized = await fetch(new URL("/state", base));
assert.equal(unauthorized.status, 401, "unauthorized state must be denied");
const deniedCommitments = await fetch(new URL("/approved-commitments", base));
assert.equal(deniedCommitments.status, 401, "client commitment history must not be public");
const deniedPlans = await fetch(new URL("/execution-plans", base), {method:"POST"});
assert.equal(deniedPlans.status, 401, "creating execution plans requires authorization");
const deniedContext = await fetch(new URL("/context", base));
assert.equal(deniedContext.status, 401, "unauthorized decision context must be denied");
// Health might be served from the previous deployed version after credential rotation.
// Continue only once the version accepting this run's protected credential is live.
let authenticated = false;
for (let i = 0; i < 30; i++) {
  try {
    const state = await call("/state");
    if (state.status === 200) { authenticated = true; break; }
  } catch { /* retry until protected version has propagated */ }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
assert.ok(authenticated, "new Worker must accept the current deploy credential");
// An ordinary Brain read/run credential must never be able to assert founder approval.
const deniedWithNormalToken = await call("/approved-commitments", "POST", {anything:"unapproved"});
assert.equal(deniedWithNormalToken.status, 401, "ordinary token must not approve commitments");
const approvalToken = process.env.BRAIN_TEST_APPROVAL_TOKEN;
assert.ok(approvalToken && approvalToken.length >= 32, "independent approval token is configured");
const rejectedInvalidPayload = await fetch(new URL("/approved-commitments", base), {
  method: "POST",
  headers: {
    authorization: "Bearer " + approvalToken,
    "content-type": "application/json",
  },
  body: JSON.stringify({notAnApprovedDecision:true}),
});
assert.equal(rejectedInvalidPayload.status, 400, "separate approval token must reach validated write endpoint without writing data");

const initialized = await call("/bootstrap", "POST");
assert.equal(initialized.status, 201, "bootstrap");
const first = await call("/state");
assert.equal(first.status, 200, "authorized state fetch");
assert.equal(first.data.state.activeObjectiveId, "OBJ-MARK-BOOTSTRAP");
assert.deepEqual(first.data.state.openLoops.map(x => x.id).sort(), ["OL-CLOSURE", "OL-COMPANY-STATE"]);
const context = await call("/context");
assert.equal(context.status, 200);
assert.ok(context.data.decisions.some(d => d.id === "DJ-001" && d.evidenceClass === "verified_fact"), "canonical decision persisted");

// Persist a safe content-addressed snapshot of approved commitments only.
 // No sensitive client agreements are seeded from this public test.
const approved = await call("/approved-commitments");
assert.equal(approved.status, 200);
assert.ok(Array.isArray(approved.data.records));
const unified = await call("/context");
assert.equal(unified.status,200);
assert.deepEqual(unified.data.approvedCommitments,approved.data.records, "CEO context must include all stored commitments");
assert.ok(Array.isArray(unified.data.executionPlan.commitments));
assert.ok(Array.isArray(unified.data.executionPlan.actions));
assert.equal(unified.data.readiness.ready,false, "bootstrap MUST NOT claim full AI CEO readiness");
assert.ok(unified.data.readiness.blockedBy.includes("company_registry_not_hydrated"));
const readiness = await call("/readiness");
assert.equal(readiness.status,200);
assert.equal(readiness.data.counts.approvedCommitments,approved.data.records.length);
assert.equal(readiness.data.readiness.ready,false);
const planned = await call("/execution-plans", "POST");
assert.ok([200, 201].includes(planned.status));
assert.ok(planned.data.id.startsWith("PLAN-"));
const reread = await call("/execution-plans?id=" + planned.data.id);
assert.equal(reread.status, 200);
assert.deepEqual(reread.data.plan, planned.data.plan);
if (process.env.GITHUB_ENV) {
  const {appendFileSync} = await import("node:fs");
  appendFileSync(process.env.GITHUB_ENV, "BRAIN_EXPECTED_PLAN_ID=" + planned.data.id + "\n");
}

const key = "live-smoke-" + process.env.GITHUB_RUN_ID + "-" + process.env.GITHUB_RUN_ATTEMPT;
const started = await call("/runs", "POST", { idempotencyKey: key });
assert.equal(started.status, 202, "run accepted");
assert.equal(started.data.replayed, false);
const runId = started.data.run.runId;
const replay = await call("/runs", "POST", { idempotencyKey: key });
assert.equal(replay.status, 200, "same request replayed");
assert.equal(replay.data.replayed, true);
assert.equal(replay.data.run.runId, runId);

let persisted;
for (let i = 0; i < 20; i++) {
  // This is a fresh HTTP request without cookies or chat history: state must come from D1.
  const restored = await call("/state");
  if (restored.data.checkpoint?.runId === runId && restored.data.checkpoint.stage === "diagnose") {
    persisted = restored.data;
    break;
  }
  await new Promise(resolve => setTimeout(resolve, 1500));
}
assert.ok(persisted, "Workflow must checkpoint audit->diagnose and fresh request must restore it");
assert.equal(persisted.state.activeObjectiveId, "OBJ-MARK-BOOTSTRAP");
assert.equal(persisted.checkpoint.stateVersion, persisted.state.version);
assert.deepEqual(persisted.checkpoint.openLoopIds.sort(), ["OL-CLOSURE", "OL-COMPANY-STATE"]);
if (process.env.GITHUB_ENV) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_ENV, "BRAIN_EXPECTED_RUN_ID=" + runId + "\n");
}
console.log("PASS: protected Brain API, persistent canonical decision, durable objective, idempotent run, and D1 checkpoint resume");
