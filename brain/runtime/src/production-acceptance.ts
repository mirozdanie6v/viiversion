/**
 * Owner-initiated production E2E. Only callable by a Cloudflare account admin
 * creating an instance of the existing Workflow through Cloudflare's control-plane.
 * The public Brain API does not expose any path that sets the acceptance flag.
 *
 * Never return or log a bearer, response body, or approved client details.
 */
interface ProbeEnv {
  BRAIN_API_TOKEN?: string;
  BRAIN_APPROVAL_TOKEN?: string;
  BRAIN_DB: {prepare(sql:string): {bind(...args:unknown[]): {first<T>(): Promise<T|null>}}};
}
const base="https://viiversion-brain.viiversion.workers.dev";
const check=(condition:unknown,label:string):void=>{
  if(!condition)throw Error("BRAIN_ACCEPTANCE_FAILED: "+label);
};
async function call(path:string,method:"GET"|"POST",token?:string,body?:unknown) {
  const headers:Record<string,string>={};
  if(token) headers.authorization="Bearer "+token;
  if(body!==undefined)headers["content-type"]="application/json";
  const response=await fetch(new URL(path,base),{
    method,headers,cache:"no-store",
    ...(body!==undefined?{body:JSON.stringify(body)}:{}),
  });
  let data:any=null;
  try{data=await response.json();}catch{ /* status still authoritative */ }
  return {status:response.status,data};
}
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function runProductionAcceptance(env:ProbeEnv,acceptanceId:string){
  const readToken=env.BRAIN_API_TOKEN,approvalToken=env.BRAIN_APPROVAL_TOKEN;
  check(typeof readToken==="string"&&readToken.length>=32,"read token binding unavailable");
  check(typeof approvalToken==="string"&&approvalToken.length>=32,"approval token binding unavailable");
  check(readToken!==approvalToken,"token separation");
  const anon=await call("/context","GET");
  check(anon.status===401,"unauthenticated context denied");
  const wrong=await call("/context","GET","bogus-value");
  check(wrong.status===401,"wrong bearer denied");
  const state=await call("/state","GET",readToken);
  check(state.status===200&&state.data?.state,"authorized state restores");
  const context=await call("/context","GET",readToken);
  check(context.status===200&&Array.isArray(context.data?.decisions)&&Array.isArray(context.data?.approvedCommitments),"authorized context restores");
  check(context.data.decisions.length>=1&&context.data.approvedCommitments.length>=4,"existing records readable");
  const wrongApproval=await call("/approved-commitments","POST",readToken,{invalid:true});
  check(wrongApproval.status===401,"read token cannot approve");
  const validation=await call("/approved-commitments","POST",approvalToken,{invalid:true});
  check(validation.status===400,"approval token enforces validation without writing");
  const key="acceptance_"+acceptanceId;
  const first=await call("/runs","POST",readToken,{idempotencyKey:key});
  check([200,202].includes(first.status)&&first.data?.run?.runId,"unique authenticated run is durable and replayable");
  const runId=first.data.run.runId as string;
  const replay=await call("/runs","POST",readToken,{idempotencyKey:key});
  check(replay.status===200&&replay.data?.replayed===true&&replay.data?.run?.runId===runId,"replay references original run");
  const parallel=await Promise.all(Array.from({length:5},()=>call("/runs","POST",readToken,{idempotencyKey:key})));
  check(parallel.every(x=>x.status===200&&x.data?.run?.runId===runId),"parallel requests are idempotent; response statuses: "+parallel.map(x=>x.status).join(","));
  const stored=await env.BRAIN_DB.prepare("SELECT COUNT(*) as n FROM runs WHERE idempotency_key=?").bind("request:"+key).first<{n:number}>();
  check(stored?.n===1,"only one durable D1 run");
  let stage:string|undefined, blockedReason:string|undefined, restored=false;
  for(let i=0;i<35;i++){
    const lookup=await call("/runs?idempotencyKey="+encodeURIComponent(key),"GET",readToken);
    if(lookup.status===200&&lookup.data?.run?.status==="blocked"){
      stage=lookup.data.run.stage;
      blockedReason=lookup.data.run.blockedReason;
      const fresh=await call("/state","GET",readToken);
      restored=fresh.status===200&&fresh.data?.checkpoint?.runId===runId&&fresh.data?.state?.version===state.data.state.version;
      if(restored)break;
    }
    await sleep(900);
  }
  check(stage==="diagnose"&&blockedReason==="CEO_LOOP_NOT_IMPLEMENTED","workflow reports truthful partial status");
  check(restored,"independent HTTP process restores D1 checkpoint");
  const again=await call("/context","GET",readToken);
  check(again.status===200&&again.data?.approvedCommitments?.length===context.data.approvedCommitments.length,"client commitments preserved");
  return {
    ok:true,runId,
    tests:{anonymousDenied:true,wrongBearerDenied:true,authorizedState:true,authorizedContext:true,
      readApprovalSeparation:true,approvalValidation:true,runCreated:true,idempotentReplay:true,
      concurrentReplay:true,d1Uniqueness:true,terminalBlocked:true,checkpointRestored:true,
      approvedCommitmentsPreserved:true},
    contextCounts:{decisions:context.data.decisions.length,approvedCommitments:context.data.approvedCommitments.length},
  };
}
