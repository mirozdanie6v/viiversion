import type {BrainRepository} from "./repository.ts";import type {BrainEvent,Checkpoint,CompanyState,Decision,Run} from "./contracts.ts";
type Row=Record<string,unknown>;export interface D1Stmt{bind(...v:unknown[]):D1Stmt;first<T=Row>():Promise<T|null>;all<T=Row>():Promise<{results:T[]}>;run():Promise<{meta?:{changes?:number}}>}export interface D1{prepare(sql:string):D1Stmt}
export class D1BrainRepository implements BrainRepository{private db:D1;constructor(db:D1){this.db=db}
async loadState(){const r=await this.db.prepare("SELECT snapshot_json FROM company_state WHERE id=1").first<{snapshot_json:string}>();return r?JSON.parse(r.snapshot_json):null}
async saveState(n:CompanyState,e:number){const r=await this.db.prepare("UPDATE company_state SET version=?,snapshot_json=?,updated_at=? WHERE id=1 AND version=?").bind(n.version,JSON.stringify(n),n.updatedAt,e).run();if(!r.meta?.changes)throw new Error("STATE_VERSION_CONFLICT")}
async seedState(n:CompanyState){await this.db.prepare("INSERT OR IGNORE INTO company_state(id,version,snapshot_json,updated_at) VALUES(1,?,?,?)").bind(n.version,JSON.stringify(n),n.updatedAt).run()}
async appendEvent(e:BrainEvent){await this.db.prepare("INSERT OR IGNORE INTO brain_events(id,at,type,source,payload_json) VALUES(?,?,?,?,?)").bind(e.id,e.at,e.type,e.source,JSON.stringify(e.payload)).run()}
async appendDecision(d:Decision){await this.db.prepare("INSERT OR IGNORE INTO decisions(id,at,record_json) VALUES(?,?,?)").bind(d.id,d.at,JSON.stringify(d)).run()}
async loadDecisions():Promise<Decision[]>{const r=await this.db.prepare("SELECT record_json FROM decisions ORDER BY at, id LIMIT 100").all<{record_json:string}>();return r.results.map(row=>JSON.parse(row.record_json) as Decision)}
async loadCheckpoint(){const r=await this.db.prepare("SELECT snapshot_json FROM checkpoints WHERE id=1").first<{snapshot_json:string}>();return r?JSON.parse(r.snapshot_json):null}
async saveCheckpoint(c:Checkpoint,e:number){
 const result=await this.db.prepare("INSERT INTO checkpoints(id,run_id,stage,state_version,snapshot_json,at) SELECT 1,?,?,?,?,? FROM company_state WHERE id=1 AND version=? ON CONFLICT(id) DO UPDATE SET run_id=excluded.run_id,stage=excluded.stage,state_version=excluded.state_version,snapshot_json=excluded.snapshot_json,at=excluded.at")
  .bind(c.runId,c.stage,c.stateVersion,JSON.stringify(c),c.at,e).run();
 if(result.meta?.changes!==1)throw Error("CHECKPOINT_STATE_VERSION_CONFLICT");
}
async claimRunRequest(requestKey:string,proposed:Run):Promise<{run:Run;replayed:boolean}>{
 const idempotencyKey="request:"+requestKey;
 const result=await this.db.prepare("INSERT OR IGNORE INTO runs(run_id,idempotency_key,stage,status,snapshot_json,started_at,updated_at) VALUES(?,?,?,?,?,?,?)")
  .bind(proposed.runId,idempotencyKey,proposed.stage,proposed.status,JSON.stringify({...proposed,idempotencyKey}),proposed.startedAt,proposed.updatedAt).run();
 const run=await this.findRunByIdempotencyKey(idempotencyKey);
 if(!run)throw Error("RUN_REQUEST_CLAIM_CONFLICT");
 return {run,replayed:result.meta?.changes!==1};
}
async findRunById(runId:string){
 const row=await this.db.prepare("SELECT snapshot_json FROM runs WHERE run_id=?").bind(runId).first<{snapshot_json:string}>();
 return row?JSON.parse(row.snapshot_json) as Run:null;
}
async findRunByIdempotencyKey(k:string){const r=await this.db.prepare("SELECT snapshot_json FROM runs WHERE idempotency_key=?").bind(k).first<{snapshot_json:string}>();return r?JSON.parse(r.snapshot_json):null}
async saveRun(r:Run){await this.db.prepare("INSERT INTO runs(run_id,idempotency_key,stage,status,snapshot_json,started_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(run_id) DO UPDATE SET stage=excluded.stage,status=excluded.status,snapshot_json=excluded.snapshot_json,updated_at=excluded.updated_at").bind(r.runId,r.idempotencyKey,r.stage,r.status,JSON.stringify(r),r.startedAt,r.updatedAt).run()}
}