import type {BrainEvent,Checkpoint,CompanyState,Decision,Run} from "./contracts.ts";
export interface BrainRepository{
 loadState():Promise<CompanyState|null>;
 saveState(next:CompanyState,expectedVersion:number):Promise<void>;
 appendEvent(event:BrainEvent):Promise<void>;
 appendDecision(decision:Decision):Promise<void>;
 loadCheckpoint():Promise<Checkpoint|null>;
 saveCheckpoint(checkpoint:Checkpoint,expectedStateVersion:number):Promise<void>;
 findRunByIdempotencyKey(key:string):Promise<Run|null>;
 saveRun(run:Run):Promise<void>;
}
