import {D1BrainRepository,type D1} from "./d1-repository.ts";import {day0State} from "./day0.ts";import {resume} from "./loop.ts";import type {Run} from "./contracts.ts";
interface Env{BRAIN_DB:D1;CEO_WORKFLOW?:{create(o:{id:string;params:{runId:string}}):Promise<unknown>}}
const json=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json"}});
export default{async fetch(req:Request,env:Env){const repo=new D1BrainRepository(env.BRAIN_DB),u=new URL(req.url);
if(req.method==="POST"&&u.pathname==="/bootstrap"){await repo.seedState(day0State());return json(await resume(repo),201)}
if(req.method==="GET"&&u.pathname==="/state")return json(await resume(repo));
if(req.method==="POST"&&u.pathname==="/runs"){const body=await req.json() as {idempotencyKey?:string};if(!body.idempotencyKey)return json({error:"idempotencyKey required"},400);const old=await repo.findRunByIdempotencyKey(body.idempotencyKey);if(old)return json({replayed:true,run:old});const now=new Date().toISOString(),runId=crypto.randomUUID();const run:Run={runId,stage:"audit",status:"running",idempotencyKey:body.idempotencyKey,startedAt:now,updatedAt:now};await repo.saveRun(run);if(env.CEO_WORKFLOW)await env.CEO_WORKFLOW.create({id:runId,params:{runId}});return json({replayed:false,run},202)}
return json({error:"not found"},404)}}