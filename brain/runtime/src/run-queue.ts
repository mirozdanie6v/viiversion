import type {Run} from "./contracts.ts";

// A retained Workflow ID may belong to a failed instance, not only a healthy duplicate.
export interface BrainWorkflowQueue {
  createBatch(options:{instances:Array<{id:string;params:{runId:string}}> }):
    Promise<{created:Array<{id:string}>;errors:Array<{code:number;message:string}>}>;
  get(id:string):Promise<{status():Promise<{status:string}>}>;
}
export async function ensureRunQueued(workflow:BrainWorkflowQueue,run:Run):Promise<void> {
  if(run.status!=="running")return;
  const result=await workflow.createBatch({instances:[{id:run.runId,params:{runId:run.runId}}]});
  const created=result.created.length===1 && result.errors.length===0;
  const existing=result.created.length===0 && result.errors.length===1 && result.errors[0].code===10405;
  if(!created && !existing)throw Error("WORKFLOW_ENQUEUE_FAILED");
  if(existing){
    // A duplicate ID is NOT proof that the underlying run is healthy.
    const instance=await workflow.get(run.runId);
    const {status}=await instance.status();
    if(status==="errored" || status==="terminated" || status==="complete" || status==="unknown")
      throw Error("WORKFLOW_TERMINAL_REQUIRES_RECONCILIATION");
    if(!["queued","running","waiting","paused","waitingForPause"].includes(status))
      throw Error("WORKFLOW_UNEXPECTED_STATUS");
  }
}

/**
 * A duplicate Workflow may have completed while this HTTP request still holds
 * an old "running" snapshot. Re-read D1 before treating the replay as failed.
 * Never infer successful completion from Workflow status alone.
 */
export async function waitForPersistedNonrunningRun(
 load:()=>Promise<Run|null>, expectedRunId:string,
 attempts=6, delayMs=150,
):Promise<Run|null>{
 for(let i=0;i<attempts;i++){
  const saved=await load();
  if(saved && saved.runId===expectedRunId && saved.status!=="running")return saved;
  if(i+1<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
 }
 return null;
}
