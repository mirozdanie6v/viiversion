import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { brainOAuthRoutes,verifyBrainOAuth,oauthChallenge } from "../src/mcp-oauth.ts";
import { handleBrainMcp } from "../src/mcp.ts";

const base="https://viiversion-brain.viiversion.workers.dev";
const callback="https://chatgpt.com/connector_platform_oauth_redirect";
const secret="OWNER_TEST_SYNTHETIC_".repeat(4);
const now=()=>Math.floor(Date.now()/1000);
function harness(){
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec(readFileSync(new URL("../migrations/0003_invocation_contexts.sql",import.meta.url),"utf8"));
 sqlite.exec(readFileSync(new URL("../migrations/0004_mark_oauth.sql",import.meta.url),"utf8"));
 sqlite.exec(readFileSync(new URL("../migrations/0005_owner_pairing.sql",import.meta.url),"utf8"));
 const db={prepare(sql:string){
   const stmt=sqlite.prepare(sql);let args:any[]=[];
   return {bind(...values:unknown[]){args=values;return this;},
    async first(){return stmt.get(...args)??null;},
    async all(){return {results:stmt.all(...args)};},
    async run(){const r=stmt.run(...args);return {meta:{changes:Number(r.changes)}};}
   };
 }};
 const env={BRAIN_DB:db as any,BRAIN_API_TOKEN:secret};
 const send=async(path:string,method="GET",data?:object|string,auth?:string)=>{
   const body=typeof data==="string"?data:data?JSON.stringify(data):undefined;
   const req=new Request(base+path,{method,body,
     headers:{"content-type":typeof data==="string"?"application/x-www-form-urlencoded":"application/json",
       ...(auth?{authorization:"Bearer "+auth}:{})}});
   if(path.startsWith("/oauth/")||path.startsWith("/.well-known/oauth-"))return (await brainOAuthRoutes(req,env))!;
   if(path==="/mcp"){
     if(!await verifyBrainOAuth(req,db as any))return oauthChallenge();
     return handleBrainMcp(req,db as any);
   }
   throw Error("unknown test path");
 };
 return {sqlite,db,env,send};
}
const verifier="A".repeat(64);
async function challenge(){
 const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier)));
 let bin="";for(const v of hash)bin+=String.fromCharCode(v);
 return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
const form=(obj:Record<string,string>)=>new URLSearchParams(obj).toString();
async function authenticate(send:ReturnType<typeof harness>["send"],db:ReturnType<typeof harness>["db"]){
 const response=await send("/oauth/register","POST",{redirect_uris:[callback],token_endpoint_auth_method:"none"});
 assert.equal(response.status,201);
 const {client_id}=await response.json() as {client_id:string};
 const u=new URLSearchParams({client_id,redirect_uri:callback,response_type:"code",scope:"brain:memory",
   resource:base+"/mcp",state:"synthetic-state",code_challenge:await challenge(),code_challenge_method:"S256"});
 const consent=await send("/oauth/authorize?"+u.toString());
 assert.equal(consent.status,200);
 const page=await consent.text();
 assert.match(page,/Подключение Марка/);
 assert.doesNotMatch(page,/type="password"|Секрет владельца Brain|BRAIN_API_TOKEN/);
 assert.match(page,/http-equiv="refresh" content="3"/,"pending OAuth page must poll automatically");
 const wrong=await send("/oauth/authorize","POST",form({...Object.fromEntries(u),owner_token:"wrong"}));
 assert.equal(wrong.status,400,"old password entry must be disabled");
 const unapproved=await send("/oauth/authorize","POST",form(Object.fromEntries(u)));
 assert.equal(unapproved.status,403,"public visitor cannot approve their own OAuth request");
 assert.equal((await unapproved.json() as any).error,"owner_pairing_approval_required");
 const pair=await db.prepare("SELECT pairing_id FROM mark_oauth_pairing WHERE client_id=?")
   .bind(client_id).first() as {pairing_id:string}|null;
 assert.match(pair?.pairing_id??"",/^pair_[a-f0-9]{64}$/);
 // Simulate owner verification by a separately authorized Cloudflare admin,
 // not by a form field, public URL or other untrusted client data.
 await db.prepare("UPDATE mark_oauth_pairing SET approved_at=? WHERE pairing_id=?")
   .bind(now(),pair!.pairing_id).run();
 const grant=await send("/oauth/authorize?"+u.toString(),"GET");
 assert.equal(grant.status,302,"approved pairing must finish from automatic page refresh");
 assert.equal((await send("/oauth/authorize?"+u.toString(),"GET")).status,403,
   "owner grant is one-use only");
 const redirect=new URL(grant.headers.get("location")!);
 assert.equal(redirect.origin,"https://chatgpt.com");
 assert.equal(redirect.searchParams.get("state"),"synthetic-state");
 const code=redirect.searchParams.get("code")!;
 const data={grant_type:"authorization_code",client_id,redirect_uri:callback,code,code_verifier:verifier};
 const token=await send("/oauth/token","POST",form(data));
 assert.equal(token.status,200);
 const result=await token.json() as {access_token:string,refresh_token:string,token_type:string};
 assert.match(result.access_token,/^[0-9a-f]{64}$/);
 assert.equal(result.token_type,"Bearer");
 assert.equal((await send("/oauth/token","POST",form(data))).status,400,"code must be single use");
 return {...result,client_id};
}

test("M0B MCP: OAuth metadata, no anonymous access, DCR redirect restrictions",async()=>{
 const h=harness();
 try{
   const meta=await h.send("/.well-known/oauth-authorization-server");
   assert.equal((await meta.json() as any).code_challenge_methods_supported[0],"S256");
   const protectedResp=await h.send("/mcp","POST",{jsonrpc:"2.0",id:1,method:"tools/list"});
   assert.equal(protectedResp.status,401);
   assert.match(protectedResp.headers.get("www-authenticate")! , /oauth-protected-resource/);
   const evil=await h.send("/oauth/register","POST",{redirect_uris:["https://malicious.example/callback"]});
   assert.equal(evil.status,400);
 }finally{h.sqlite.close();}
});

test("M0B OAuth: consent, PKCE, scoped access, refresh rotation, revoked access",async()=>{
 const h=harness();
 try{
   const result=await authenticate(h.send,h.db);
   const req=new Request(base+"/mcp",{headers:{authorization:"Bearer "+result.access_token}});
   assert.equal(await verifyBrainOAuth(req,h.db as any),true);
   const refresh=await h.send("/oauth/token","POST",form({
     grant_type:"refresh_token",client_id:result.client_id,refresh_token:result.refresh_token}));
   assert.equal(refresh.status,200);
   const next=await refresh.json() as {access_token:string,refresh_token:string};
   assert.notEqual(next.access_token,result.access_token);
   assert.equal((await h.send("/oauth/token","POST",form({
     grant_type:"refresh_token",client_id:result.client_id,refresh_token:result.refresh_token}))).status,400);
   const revoke=await h.send("/oauth/revoke","POST",form({
     client_id:result.client_id,token:result.access_token}));
   assert.equal(revoke.status,200);
   assert.equal(await verifyBrainOAuth(req,h.db as any),false);
 }finally{h.sqlite.close();}
});

test("M0B MCP E2E: synthetic chat A capture, independent chat B recall via issued OAuth bearer",async()=>{
 const h=harness();
 try{
   const auth=await authenticate(h.send,h.db);
   const invoke=async(id:number,name:string,args:Record<string,unknown>)=>{
    const r=await h.send("/mcp","POST",{jsonrpc:"2.0",id,method:"tools/call",params:{name,arguments:args}},auth.access_token);
    assert.equal(r.status,200);
    return await r.json() as any;
   };
   const init=await h.send("/mcp","POST",{jsonrpc:"2.0",id:1,method:"initialize"},auth.access_token);
   assert.equal((await init.json() as any).result.serverInfo.name,"viiversion-mark-brain");
   const descriptors=await h.send("/mcp","POST",{jsonrpc:"2.0",id:2,method:"tools/list"},auth.access_token);
   assert.deepEqual((await descriptors.json() as any).result.tools.map((t:any)=>t.name),
     ["mark_capture_context","mark_recall_context"]);
   const context="Synthetic only: fact Alpha, fact Beta, proposal Gamma, decision Delta, unresolved Epsilon";
   const payload={invocationId:"synthetic-chat-A-0001",projectKey:"viiversion",contextText:context,
      sourceChatRef:"synthetic_chat_a",captureKind:"model_summary",declaredWindow:"known test fixture; actual ChatGPT transcript unknown"};
   const captured=await invoke(3,"mark_capture_context",payload);
   const ack=JSON.parse(captured.result.content[0].text);
   assert.equal(ack.receipt.coverage,"unknown");
   assert.equal(ack.receipt.contextText,undefined,"ack must not echo private text");
   assert.equal(JSON.parse((await invoke(4,"mark_capture_context",payload)).result.content[0].text).replayed,true);
   const conflict=await invoke(5,"mark_capture_context",{...payload,contextText:"modified"});
   assert.equal(conflict.result.isError,true);
   const recalled=await invoke(6,"mark_recall_context",{projectKey:"viiversion",limit:5});
   assert.equal(JSON.parse(recalled.result.content[0].text).receipts[0].contextText,context);
   const other=await invoke(7,"mark_recall_context",{projectKey:"unrelated",limit:5});
   assert.equal(JSON.parse(other.result.content[0].text).receipts.length,0);
   const b=new Request(base+"/mcp",{headers:{authorization:"Bearer unrelated-token"}});
   assert.equal(await verifyBrainOAuth(b,h.db as any),false);
 }finally{h.sqlite.close();}
});
