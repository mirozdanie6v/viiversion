import type {BrainRepository} from "./repository.ts";
import type {Checkpoint,LoopStage,Run} from "./contracts.ts";
import {advance} from "./lifecycle.ts";
export const FIRST_STAGE:LoopStage="audit";
export async function resume(repo:BrainRepository){return {state:await repo.loadState(),checkpoint:await repo.loadCheckpoint()}}
export async function checkpoint(repo:BrainRepository,run:Run,next:LoopStage,stateVersion:number,openLoopIds:string[]=[]){
 advance(run.stage,next);
 const cp:Checkpoint={runId:run.runId,stage:next,stateVersion,at:new Date().toISOString(),openLoopIds,pendingApprovals:[]};
 await repo.saveCheckpoint(cp,stateVersion);
 const updated={...run,stage:next,updatedAt:cp.at}; await repo.saveRun(updated); return updated;
}
