import { InvocationContextStore } from "./invocation-context.ts";
import type { D1 } from "./d1-repository.ts";
import { readBoundedJson } from "./invocation-context.ts";

// The external ChatGPT app may send only model-available context in a tool call.
// A tool call is NOT a transcript subscription and client-supplied chat refs
// are not platform-attested conversation IDs.
export const brainTools = [
  {
    name: "mark_capture_context",
    title: "Передать доступный контекст Марку",
    description: "When the user explicitly invokes Mark, send the facts, unresolved questions, proposals and decisions ACTUALLY available from this ChatGPT conversation. Do not assert that the entire transcript was captured. This stores operational memory in VIIVERSION Brain, not GitHub. Call only when the user requests Mark. Never include credentials, unrelated chats or private unrelated data.",
    inputSchema: {
      type: "object",
      properties: {
        invocationId: {type:"string", minLength:3, maxLength:128, description:"Stable unique value for retry of this invocation; same invocation must reuse same ID."},
        projectKey: {type:"string", minLength:2, maxLength:128, description:"VIIVERSION project scope; use 'viiversion' if project is not specified."},
        contextText: {type:"string", minLength:1, maxLength:24000, description:"Explicit context accessible to the current model call, including provenance and separation of confirmed facts, decisions, proposals and open questions. Do not invent unavailable history."},
        captureKind: {type:"string", enum:["verbatim","structured_excerpt","model_summary","unknown"], description:"Describe the type of context actually passed; model-generated summaries are 'model_summary'."},
        sourceChatRef: {type:"string", description:"Optional user-supplied chat handle; do not invent a platform-issued conversation ID."},
        declaredWindow: {type:"string", maxLength:256, description:"Describe the known window or state 'unknown'."},
      },
      required: ["invocationId","projectKey","contextText","captureKind"],
      additionalProperties:false,
    },
    annotations: {readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},
    securitySchemes:[{type:"oauth2",scopes:["brain:memory"]}],
  },
  {
    name:"mark_recall_context",
    title:"Восстановить оперативную память Марка",
    description:"Retrieve the latest stored invocation context for the authorized VIIVERSION company or requested project. Records are from explicit Mark invocations only; 'unknown' coverage never proves complete chat history.",
    inputSchema:{
      type:"object",
      properties:{
        projectKey:{type:"string",description:"Optional project scope. Defaults to all authorized company receipts."},
        limit:{type:"integer",minimum:1,maximum:10,description:"Number of most recent receipts, default 5."},
      },
      additionalProperties:false,
    },
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
    securitySchemes:[{type:"oauth2",scopes:["brain:memory"]}],
  }
] as const;

const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const rpc=(id:unknown,result:unknown,status=200)=>new Response(JSON.stringify({jsonrpc:"2.0",id,result}),{status,headers});
const failure=(id:unknown,code:number,message:string,status=200)=>new Response(JSON.stringify({jsonrpc:"2.0",id,error:{code,message}}),{status,headers});

export async function handleBrainMcp(req: Request, db:D1):Promise<Response> {
  if (req.method!=="POST") return new Response("POST required",{status:405,headers:{"allow":"POST","cache-control":"no-store"}});
  let input:unknown;
  try { input=await readBoundedJson(req,32_768); }
  catch { return failure(null,-32700,"Invalid JSON or oversized payload",400); }
  if (!input||typeof input!=="object"||Array.isArray(input))return failure(null,-32600,"Invalid JSON-RPC request",400);
  const msg=input as Record<string,unknown>;
  if (msg.jsonrpc!=="2.0"||typeof msg.method!=="string")return failure(msg.id??null,-32600,"Invalid JSON-RPC request",400);
  if(msg.method.startsWith("notifications/"))return new Response(null,{status:202,headers:{"cache-control":"no-store"}});
  if(msg.method==="initialize") return rpc(msg.id??null,{
    protocolVersion:"2025-06-18",capabilities:{tools:{listChanged:false}},
    serverInfo:{name:"viiversion-mark-brain",version:"0.1.0"},
  });
  if(msg.method==="ping")return rpc(msg.id??null,{});
  if(msg.method==="tools/list")return rpc(msg.id??null,{tools:brainTools});
  if(msg.method!=="tools/call")return failure(msg.id??null,-32601,"Method not found");
  const params=msg.params;
  if(!params||typeof params!=="object"||Array.isArray(params))return failure(msg.id??null,-32602,"Invalid parameters");
  const p=params as Record<string,unknown>;
  const args=p.arguments??{};
  if(!args||typeof args!=="object"||Array.isArray(args))return failure(msg.id??null,-32602,"Invalid arguments");
  const store=new InvocationContextStore(db);
  try {
    if(p.name==="mark_capture_context"){
      const result=await store.ingest(args);
      const {contextText:_private,...receipt}=result.receipt;
      return rpc(msg.id??null,{content:[{type:"text",text:JSON.stringify({replayed:result.replayed,receipt})}],isError:false});
    }
    if(p.name==="mark_recall_context"){
      const a=args as Record<string,unknown>;
      if(Object.keys(a).some(k=>k!=="projectKey"&&k!=="limit"))return failure(msg.id??null,-32602,"Unknown recall field");
      if(a.projectKey!==undefined&&typeof a.projectKey!=="string")return failure(msg.id??null,-32602,"Invalid projectKey");
      if(a.limit!==undefined&&typeof a.limit!=="number")return failure(msg.id??null,-32602,"Invalid limit");
      const receipts=await store.recent(a.projectKey as string|undefined,(a.limit as number|undefined)??5);
      return rpc(msg.id??null,{content:[{type:"text",text:JSON.stringify({receipts,warning:"Only context actually received at previous invocations; full ChatGPT chat history not verified."})}],isError:false});
    }
    return failure(msg.id??null,-32602,"Unknown tool");
  }catch(err){
    const reason=err instanceof Error?err.message:"MCP_TOOL_FAILED";
    const safe=reason.startsWith("INVALID_")||reason==="INVOCATION_ID_CONFLICT"?reason:"MCP_TOOL_FAILED";
    return rpc(msg.id??null,{content:[{type:"text",text:JSON.stringify({error:safe})}],isError:true});
  }
}
