import test from "node:test";
import assert from "node:assert/strict";
import { buildExecutionPlan, validateCommitment, verifyRevision } from "../src/commitments.ts";

const record = (overrides: Record<string, unknown> = {}) => ({
  id:"TEST-DEV-1", project:"FictionalDemo", key:"development_contract", revision:1,
  status:"approved", statement:"Complete contracted development before marketing",
  approvedBy:"Founder", effectiveAt:"2026-10-01",
  source:{type:"founder_confirmation",ref:"private:fictional-test",observedAt:"2026-10-01"},
  actions:[
    {id:"test",description:"Verify client user flow",status:"open",order:1},
    {id:"launch",description:"Start approved marketing phase",status:"open",order:2,dependsOn:["test"]},
  ],
  ...overrides
});
test("accepts explicit founder-attested facts, never guesses missing commitments", () => {
  const r=validateCommitment(record());
  const plan=buildExecutionPlan([r]);
  assert.equal(plan.commitments.length,1);
  assert.deepEqual(plan.actions.map(a=>[a.id,a.status]),[["test","ready"],["launch","blocked"]]);
  assert.ok(!JSON.stringify(plan).includes("150000"));
});
test("completed dependency releases next approved step",()=>{
  const r=validateCommitment(record({actions:[
    {id:"test",description:"Verify client user flow",status:"done",order:1},
    {id:"launch",description:"Launch advertising",status:"open",order:2,dependsOn:["test"]}]}));
  assert.deepEqual(buildExecutionPlan([r]).actions.map(a=>[a.id,a.status]),[["launch","ready"]]);
});
test("superseding approved decision replaces stale terms and actions",()=>{
  const first=validateCommitment(record());
  const next=validateCommitment(record({id:"TEST-DEV-2",revision:2,supersedes:"TEST-DEV-1",statement:"New explicitly approved agreement",actions:[]}));
  verifyRevision(next,first);
  assert.deepEqual(buildExecutionPlan([first,next]).commitments.map(x=>x.id),["TEST-DEV-2"]);
  assert.equal(buildExecutionPlan([first,next]).actions.length,0);
});
test("cannot rewrite an earlier decision or jump revision",()=>{
  const first=validateCommitment(record());
  assert.throws(()=>verifyRevision(validateCommitment(record({id:"TEST-X-2",revision:2})),first),/SUPERSESSION_REQUIRED/);
  assert.throws(()=>verifyRevision(validateCommitment(record({id:"TEST-X-3",revision:3,supersedes:"TEST-DEV-1"})),first),/SUPERSESSION_REQUIRED/);
  assert.throws(()=>verifyRevision(validateCommitment(record({id:"TEST-X-4",revision:2,supersedes:"TEST-DEV-1",project:"Other"})),first),/SUPERSESSION_REQUIRED/);
});
test("cancelled direction has no planned actions",()=>{
  const first=validateCommitment(record());
  const cancel=validateCommitment(record({id:"TEST-DEV-CANCEL",revision:2,supersedes:"TEST-DEV-1",status:"canceled",actions:[]}));
  assert.deepEqual(buildExecutionPlan([first,cancel]),{schemaVersion:1,commitments:[],actions:[]});
});
test("unapproved/invented claims cannot be imported as approved decisions",()=>{
  assert.throws(()=>validateCommitment(record({status:"proposal"})),/INVALID_COMMITMENT/);
  assert.throws(()=>validateCommitment(record({source:{type:"guess",ref:"x",observedAt:"2026-10-01"}})),/INVALID_SOURCE/);
  assert.throws(()=>validateCommitment(record({actions:[{id:"x",description:"Task",order:1,status:"invented"}]})),/INVALID_ACTION/);
});
test("unknown precondition blocks planning rather than being silently considered done",()=>{
  const r=validateCommitment(record({actions:[{id:"ad",description:"Start",status:"open",order:1,dependsOn:["not-approved"]}]}));
  assert.throws(()=>buildExecutionPlan([r]),/MISSING_APPROVED_DEPENDENCY/);
});
test("duplicate active action IDs across decisions are rejected",()=>{
  const a=validateCommitment(record());
  const b=validateCommitment(record({id:"TEST-MARKETING-1",key:"marketing",actions:[{id:"test",description:"Duplicate",status:"open",order:3}]}));
  assert.throws(()=>buildExecutionPlan([a,b]),/DUPLICATE_ACTIVE_ACTION/);
});
