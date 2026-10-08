import {WorkflowEntrypoint,WorkflowEvent,WorkflowStep} from "cloudflare:workers";import {D1BrainRepository,type D1} from "./d1-repository.ts";import {checkpoint} from "./loop.ts";
interface Env{BRAIN_DB:D1}
export class CeoWorkflow extends WorkflowEntrypoint<Env,{runId:string}>{async run(event:Readonly<WorkflowEvent<{runId:string}>>,step:WorkflowStep){const repo=new D1BrainRepository(this.env.BRAIN_DB),runId=event.payload.runId;
const loaded=await step.do("load-state",async()=>{const state=await repo.loadState();if(!state)throw new Error("BRAIN_NOT_BOOTSTRAPPED");return {state,cp:await repo.loadCheckpoint()}});
let record=await repo.findRunByIdempotencyKey("ceo:"+runId);if(!record)throw new Error("RUN_NOT_FOUND");
if(record.stage==="audit")record=await step.do("checkpoint-diagnose",()=>checkpoint(repo,record!,"diagnose",loaded.state.version,loaded.state.openLoops.filter(x=>x.status!=="closed").map(x=>x.id)));
return {runId,stage:record.stage,resumedFrom:loaded.cp?.stage??null,stateVersion:loaded.state.version}}}
