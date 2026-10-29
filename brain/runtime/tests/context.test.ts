import test from "node:test";
import assert from "node:assert/strict";
import {loadUnifiedContext} from "../src/context.ts";
import {day0State} from "../src/day0.ts";

const example=(id: string,project: string, key: string, status: "approved"|"canceled"="approved")=>({
 id,project,key,revision:1,status,statement:"Synthetic source-attested company event",
 approvedBy:"Test Founder",effectiveAt:"2026-10-20",
 source:{type:"founder_confirmation" as const,ref:"test:synthetic",observedAt:"2026-10-20"},
 actions:status==="canceled"?[]:[{id:"prepare",description:"Approved next action",order:1,status:"open" as const}],
});
test("unified context includes both legacy decisions and all committed client decisions",async()=>{
 const records=[example("SYN-1","SyntheticAuto","development"),example("SYN-2","SyntheticTravel","offer"),example("SYN-3","SyntheticAuto","canceled","canceled")];
 const result=await loadUnifiedContext({
   loadState:async()=>day0State("2026-10-20T00:00:00Z"),
   loadCheckpoint:async()=>({runId:"R1",stage:"diagnose",stateVersion:1,at:"2026-10-20",openLoopIds:[],pendingApprovals:[]}),
 } as any,{
   loadDecisions:async()=>[{id:"DJ-001",at:"2026-10-20",question:"?",decision:"yes",rationale:"test",evidenceClass:"verified_fact"}],
   loadApprovedCommitments:async()=>records as any,
 });
 assert.equal(result.decisions.length,1);
 assert.equal(result.approvedCommitments.length,3);
 assert.equal(result.executionPlan.commitments.length,2);
 assert.deepEqual(result.executionPlan.actions.map(a=>a.project).sort(),["SyntheticAuto","SyntheticTravel"]);
 assert.equal(result.readiness.ready,false,"storing a few commitments cannot make Brain CEO-ready");
 assert.ok(result.readiness.blockedBy.includes("company_registry_not_hydrated"));
 assert.equal(result.readiness.checks.checkpointPersisted,true);
});
test("unified context with no company knowledge never reports readiness",async()=>{
 const result=await loadUnifiedContext({
   loadState:async()=>null,loadCheckpoint:async()=>null,
 } as any,{
   loadDecisions:async()=>[],loadApprovedCommitments:async()=>[],
 });
 assert.equal(result.state,null);
 assert.equal(result.readiness.checks.checkpointPersisted,false);
 assert.equal(result.readiness.ready,false);
 assert.deepEqual(result.executionPlan.actions,[]);
});
test("approved decision backend failure is not silently treated as empty memory",async()=>{
 await assert.rejects(()=>loadUnifiedContext({
   loadState:async()=>day0State(),loadCheckpoint:async()=>null,
 } as any,{
   loadDecisions:async()=>[],loadApprovedCommitments:async()=>{throw Error("D1 unavailable");},
 }),/D1 unavailable/);
});

test("unified Mark context hydrates durable invocation receipts when supplied",async()=>{
 const sample = [{
   invocationId:"demo-chat-called-Mark",projectKey:"viiversion",sourceChatRef:"caller-claimed-chat-A",
   captureKind:"model_summary" as const,coverage:"unknown" as const,
   contextText:"Synthetic discussion: decision to test readback; actual platform window unknown.",
   declaredWindow:null,payloadSha256:"a".repeat(64),receivedAt:"2026-10-27T13:35:00Z",
 }];
 const result=await loadUnifiedContext({
   loadState:async()=>day0State("2026-10-27T13:35:00Z"),
   loadCheckpoint:async()=>null,
 } as any,{
   loadDecisions:async()=>[],loadApprovedCommitments:async()=>[],
   loadInvocationContexts:async()=>sample,
 });
 assert.deepEqual(result.invocationContexts,sample);
 assert.equal(result.invocationContexts[0].coverage,"unknown");
 assert.equal(result.readiness.checks.chatStartupHydrationIntegrated,false,
   "backend hydration is not evidence of ChatGPT tool invocation");
});
