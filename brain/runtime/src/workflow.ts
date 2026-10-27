import {WorkflowEntrypoint,WorkflowEvent,WorkflowStep} from "cloudflare:workers";
import {D1BrainRepository,type D1} from "./d1-repository.ts";
import {checkpoint} from "./loop.ts";
import type {Run} from "./contracts.ts";
import {runProductionAcceptance} from "./production-acceptance.ts";
interface Env{BRAIN_DB:D1;BRAIN_API_TOKEN?:string;BRAIN_APPROVAL_TOKEN?:string}
export class CeoWorkflow extends WorkflowEntrypoint<Env,{runId:string;kind?:"owner_production_acceptance"}>{
 async run(event:Readonly<WorkflowEvent<{runId:string;kind?:"owner_production_acceptance"}>>,step:WorkflowStep){
  const repo=new D1BrainRepository(this.env.BRAIN_DB),runId=event.payload.runId;
  // This control-plane-only mode cannot be reached through the public HTTP API:
  // /runs constructs Workflow params with only runId.
  if(event.payload.kind==="owner_production_acceptance"){
   if(!/^acceptance-20261027-[A-Za-z0-9_-]{1,50}$/.test(runId)) throw Error("INVALID_ACCEPTANCE_INSTANCE_ID");
   const recovered=await step.do("test-transient-failure-and-durable-workflow-retry",
    {retries:{limit:2,delay:"1 second"}},async()=>{
     const now=new Date().toISOString();
     const claim=await this.env.BRAIN_DB.prepare(
      "INSERT OR IGNORE INTO brain_events(id,at,type,source,payload_json) VALUES(?,?,?,?,?)")
      .bind("acceptance-retry:"+runId,now,"acceptance_retry_probe","cloudflare-admin-workflow",
       JSON.stringify({runId,classification:"isolated_test"})).run();
     if(claim.meta?.changes===1)throw Error("EXPECTED_ONCE_TRANSIENT_ACCEPTANCE_TEST");
     return true;
    });
   const result=await step.do("test-real-authorized-http-operations",()=>runProductionAcceptance(this.env,runId));
   return {...result,recoveredAfterInjectedTransientFailure:recovered};
  }
  const loaded=await step.do("load-state",async()=>{
   const state=await repo.loadState();
   if(!state)throw Error("BRAIN_NOT_BOOTSTRAPPED");
   return {state,cp:await repo.loadCheckpoint()};
  });
  let record=await repo.findRunById(runId);
  if(!record)throw Error("RUN_NOT_FOUND");
  if(record.stage==="audit"){
   record=await step.do("checkpoint-diagnose",()=>checkpoint(repo,record!,"diagnose",loaded.state.version,
    loaded.state.openLoops.filter(x=>x.status!=="closed").map(x=>x.id)));
  }
  // The remaining CEO stages are NOT implemented. Persist this truth rather than leave a zombie "running" run.
  if(record.stage==="diagnose" && record.status==="running"){
   const partial:Run={...record,status:"blocked",blockedReason:"CEO_LOOP_NOT_IMPLEMENTED",updatedAt:new Date().toISOString()};
   await step.do("mark-partial-run-blocked",()=>repo.saveRun(partial));
   record=partial;
  }
  return {runId,stage:record.stage,status:record.status,resumedFrom:loaded.cp?.stage??null,stateVersion:loaded.state.version};
 }
}
