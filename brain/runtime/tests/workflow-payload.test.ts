import test from "node:test";
import assert from "node:assert/strict";
import {parseWorkflowPayload} from "../src/workflow-payload.ts";
test("Worker binding object payload and Cloudflare API JSON-string params both work",()=>{
  const p={runId:"acceptance-20261027-prod-02",kind:"owner_production_acceptance"};
  assert.deepEqual(parseWorkflowPayload(p),p);
  assert.deepEqual(parseWorkflowPayload(JSON.stringify(p)),p);
  assert.deepEqual(parseWorkflowPayload({runId:"c04cae06-9adb-4ef8-b0d6-c4a04b6282be"}),{runId:"c04cae06-9adb-4ef8-b0d6-c4a04b6282be"});
});
test("malformed and unknown Workflow control-plane payloads fail before D1 mutations",()=>{
  for(const p of [null,undefined,"{",{}, {runId:null},{runId:"hello",kind:"other"},{runId:"a b"}])
    assert.throws(()=>parseWorkflowPayload(p));
});
