import test from "node:test";
import assert from "node:assert/strict";
import {D1BrainRepository} from "../src/d1-repository.ts";
import {ensureRunQueued} from "../src/run-queue.ts";
import type {Run} from "../src/contracts.ts";

function harness(){
 const rows=new Map<string,Run>();
 const db={prepare(sql:string){let params:any[]=[];
   return {bind(...args:any[]){params=args;return this;},
    async run(){
     if(!sql.startsWith("INSERT OR IGNORE INTO runs"))throw Error("unexpected SQL");
     const [runId,key]=params;
     if(rows.has(key))return {meta:{changes:0}};
     rows.set(key,{...(JSON.parse(params[4])),runId,idempotencyKey:key});
     return {meta:{changes:1}};
    },
    async first(){const key=params[0];const r=rows.get(key);return r?{snapshot_json:JSON.stringify(r)}:null;}
   };
 }};
 return {db,rows};
}
const proposed=(id:string):Run=>({runId:id,stage:"audit",status:"running",idempotencyKey:"request:hello",startedAt:"2026-10-26T00:00:00Z",updatedAt:"2026-10-26T00:00:00Z"});
test("racing claims reuse the same durable run ID",async()=>{
 const h=harness(),repo=new D1BrainRepository(h.db as any);
 const results=await Promise.all([repo.claimRunRequest("hello",proposed("r1")),repo.claimRunRequest("hello",proposed("r2"))]);
 assert.equal(h.rows.size,1);
 assert.deepEqual(results.map(x=>x.run.runId),["r1","r1"]);
 assert.deepEqual(results.map(x=>x.replayed),[false,true]);
});
test("duplicate workflow instances do not run twice; retry can recover transient dispatch error",async()=>{
 const seen=new Set<string>();let failOnce=true;let created=0;
 const queue={async createBatch({instances}:any){
  const id=instances[0].id;
  if(failOnce){failOnce=false;throw Error("temporary outage");}
  if(seen.has(id))return {created:[],errors:[{code:10405,message:"exists"}]};
  seen.add(id);created++;return {created:[{id}],errors:[]};
 }};
 await assert.rejects(()=>ensureRunQueued(queue,proposed("r1")),/temporary outage/);
 await ensureRunQueued(queue,proposed("r1"));
 await ensureRunQueued(queue,proposed("r1"));
 assert.equal(created,1);
 await ensureRunQueued(queue,{...proposed("r1"),status:"blocked"});
 assert.equal(created,1);
});
test("unrecognized Workflow error fails closed",async()=>{
 const queue={async createBatch(){return {created:[],errors:[{code:10999,message:"unavailable"}]}}};
 await assert.rejects(()=>ensureRunQueued(queue,proposed("r1")),/WORKFLOW_ENQUEUE_FAILED/);
});
