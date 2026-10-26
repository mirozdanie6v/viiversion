import {WorkflowEntrypoint,WorkflowEvent,WorkflowStep} from "cloudflare:workers";
import {D1BrainRepository,type D1} from "./d1-repository.ts";
import {checkpoint} from "./loop.ts";
import type {Run} from "./contracts.ts";
interface Env{BRAIN_DB:D1}
export class CeoWorkflow extends WorkflowEntrypoint<Env,{runId:string}>{
 async run(event:Readonly<WorkflowEvent<{runId:string}>>,step:WorkflowStep){
  const repo=new D1BrainRepository(this.env.BRAIN_DB),runId=event.payload.runId;
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
