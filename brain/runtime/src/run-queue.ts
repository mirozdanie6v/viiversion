import type {Run} from "./contracts.ts";

// Cloudflare Workflows createBatch reports duplicate deterministic IDs as code 10405.
// Never treat an arbitrary enqueue error as success.
export interface BrainWorkflowQueue {
  createBatch(options:{instances:Array<{id:string;params:{runId:string}}> }):
    Promise<{created:Array<{id:string}>;errors:Array<{code:number;message:string}>}>;
}
export async function ensureRunQueued(workflow:BrainWorkflowQueue,run:Run):Promise<void> {
  if(run.status!=="running")return;
  const result=await workflow.createBatch({instances:[{id:run.runId,params:{runId:run.runId}}]});
  const created=result.created.length===1 && result.errors.length===0;
  const existing=result.created.length===0 && result.errors.length===1 && result.errors[0].code===10405;
  if(!created && !existing)throw Error("WORKFLOW_ENQUEUE_FAILED");
}
