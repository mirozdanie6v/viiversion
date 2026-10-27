// Cloudflare-admin controlled synthetic production smoke for the deployed MCP.
// Neither the random token nor context body is logged or committed.
// An admin credential mints one 5-minute test access token directly in Brain D1,
// verifies the real protected HTTPS MCP read/write path, then always removes it.
import assert from "node:assert/strict";
import {randomBytes,createHash,randomUUID} from "node:crypto";

const accountId=process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken=process.env.CLOUDFLARE_API_TOKEN;
const base=process.env.BRAIN_TEST_BASE||"https://viiversion-brain.viiversion.workers.dev";
const databaseId="212041bd-f38f-476c-a204-a484ce24a303";
if(!accountId||!apiToken||!accountId.match(/^[0-9a-f]{32}$/))throw Error("MCP_SMOKE_CLOUDFLARE_ADMIN_UNAVAILABLE");
if(base!=="https://viiversion-brain.viiversion.workers.dev")throw Error("MCP_SMOKE_INVALID_TARGET");
const queryUrl=`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
async function db(sql,params=[]){
 const r=await fetch(queryUrl,{method:"POST",headers:{
  "authorization":"Bearer "+apiToken,"content-type":"application/json"
 },body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("CLOUDFLARE_D1_HTTP_"+r.status);
 const b=await r.json();
 if(!b.success||b.result?.[0]?.success===false)throw Error("CLOUDFLARE_D1_QUERY_FAILED");
 return b.result?.[0]?.results||[];
}
const token=randomBytes(32).toString("hex");
const hash=createHash("sha256").update(token).digest("hex");
const id="m0b-https-"+randomUUID(),client="m0b-admin-probe";
const context="SYNTHETIC_ONLY: Fact Alpha. Fact Beta. Proposal Gamma. Test-only decision Delta. Open question Epsilon.";
const rpc=async(id,name,args,auth=token)=>{
 const request={jsonrpc:"2.0",id,method:name==="initialize"?"initialize":name==="tools/list"?"tools/list":"tools/call",
  ...(name==="initialize"||name==="tools/list"?{}:{params:{name,arguments:args}})};
 const r=await fetch(base+"/mcp",{method:"POST",redirect:"manual",headers:{"content-type":"application/json","authorization":"Bearer "+auth},
  body:JSON.stringify(request),signal:AbortSignal.timeout(12000)});
 assert.equal(r.status,200,"MCP returned HTTP "+r.status);
 return r.json();
};
try{
 await db("INSERT INTO mark_oauth_tokens(token_hash,client_id,token_kind,resource,scope,expires_at) VALUES (?,?,?,?,?,?)",
  [hash,client,"access",base+"/mcp","brain:memory",Math.floor(Date.now()/1000)+300]);
 const init=await rpc(1,"initialize");
 assert.equal(init.result.serverInfo.name,"viiversion-mark-brain");
 const tools=await rpc(2,"tools/list");
 assert.deepEqual(tools.result.tools.map(t=>t.name),["mark_capture_context","mark_recall_context"]);
 const missing=await fetch(base+"/mcp",{method:"POST",headers:{"content-type":"application/json"},
 body:JSON.stringify({jsonrpc:"2.0",id:3,method:"tools/list"}),signal:AbortSignal.timeout(12000)});
 assert.equal(missing.status,401,"public access to Mark memory rejected");
 const input={invocationId:id,projectKey:"synthetic",contextText:context,captureKind:"model_summary",
  sourceChatRef:"synthetic-chat-A",declaredWindow:"Synthetic fixture only; ChatGPT message coverage unknown"};
 const captured=await rpc(4,"mark_capture_context",input);
 assert.equal(captured.result.isError,false);
 const receipt=JSON.parse(captured.result.content[0].text).receipt;
 assert.equal(receipt.invocationId,id);
 assert.equal(receipt.coverage,"unknown");
 assert.equal(receipt.contextText,undefined);
 const duplicate=await rpc(5,"mark_capture_context",input);
 assert.equal(JSON.parse(duplicate.result.content[0].text).replayed,true);
 const recalled=await rpc(6,"mark_recall_context",{projectKey:"synthetic",limit:5});
 const records=JSON.parse(recalled.result.content[0].text).receipts;
 assert.equal(records.find(x=>x.invocationId===id)?.contextText,context);
 console.log("PASS: actual deployed OAuth-scoped MCP initialization, tool discovery, synthetic write, replay and readback");
 console.log("LIMIT: synthetic request does not prove native ChatGPT context propagation");
}finally{
 try {await db("DELETE FROM invocation_context_receipts WHERE invocation_id=?",[id]);}
 catch(e){console.error("MCP_SMOKE_CLEANUP_RECEIPT_FAILED");process.exitCode=1;}
 try {await db("DELETE FROM mark_oauth_tokens WHERE token_hash=?",[hash]);}
 catch(e){console.error("MCP_SMOKE_CLEANUP_TOKEN_FAILED");process.exitCode=1;}
}
