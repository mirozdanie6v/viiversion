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
const initialized = await call("/bootstrap", "POST");
assert.equal(initialized.status, 201, "bootstrap");
const first = await call("/state");
assert.equal(first.status, 200, "authorized state fetch");
assert.equal(first.data.state.activeObjectiveId, "OBJ-MARK-BOOTSTRAP");
assert.deepEqual(first.data.state.openLoops.map(x => x.id).sort(), ["OL-CLOSURE", "OL-COMPANY-STATE"]);

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
console.log("PASS: protected Brain API, durable objective, idempotent run, and fresh-session D1 checkpoint resume");
