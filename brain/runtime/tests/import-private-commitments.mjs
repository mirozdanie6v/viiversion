// Private import input comes ONLY from the masked GitHub Actions secret.
// Never put real contracts in this public repository or log HTTP response bodies.
import {createHash} from "node:crypto";
import {appendFileSync} from "node:fs";
import {validateCommitment, buildExecutionPlan} from "../src/commitments.ts";

const digest = (v) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const canonical = (x) => validateCommitment(x);
const byId = (a,b) => a.id.localeCompare(b.id);
export function parsePayload(base64) {
  if(typeof base64!=="string" || base64.length<12 || base64.length>60000 ||
     !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))
    throw Error("INVALID_PRIVATE_IMPORT_ENCODING");
  const raw=Buffer.from(base64,"base64");
  if(raw.toString("base64")!==base64 || raw.byteLength>45000)
    throw Error("INVALID_PRIVATE_IMPORT_ENCODING");
  let payload;
  try{payload=JSON.parse(raw.toString("utf8"))}catch{throw Error("INVALID_PRIVATE_IMPORT_JSON")}
  if(payload?.schemaVersion!==1 || !Array.isArray(payload.records) ||
     payload.records.length<1 || payload.records.length>40)
    throw Error("INVALID_PRIVATE_IMPORT_SCHEMA");
  const records=payload.records.map(canonical);
  if(new Set(records.map(x=>x.id)).size!==records.length ||
     new Set(records.map(x=>x.project+":"+x.key)).size!==records.length ||
     records.some(x=>x.revision!==1 || x.supersedes!==undefined))
    throw Error("INVALID_PRIVATE_IMPORT_REVISIONS");
  // Fail BEFORE network mutation if action dependencies or a record shape are inconsistent.
  buildExecutionPlan(records);
  return records.sort(byId);
}

const BASE=process.env.BRAIN_TEST_BASE;
const TOKEN=process.env.BRAIN_TEST_TOKEN;
const APPROVAL=process.env.BRAIN_TEST_APPROVAL_TOKEN;
const EXPECTED_INPUT=process.env.BRAIN_COMMITMENTS_IMPORT_B64;
async function request(path,{method="GET",token=TOKEN,body}={}){
  const response=await fetch(new URL(path,BASE),{
    method,headers:{authorization:"Bearer "+token,
       ...(body===undefined?{}:{"content-type":"application/json"})},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
  });
  // Deliberately never print server response bodies or commercial records.
  if(!response.ok) throw Error("PRIVATE_IMPORT_API_ERROR_"+response.status);
  return response.json();
}
function check(condition,code) {if(!condition) throw Error(code)}
export async function importApproved(){
  check(typeof BASE==="string" && BASE.startsWith("https://"),"IMPORT_BASE_MISSING");
  check(typeof TOKEN==="string" && TOKEN.length>=32,"IMPORT_READ_AUTH_MISSING");
  check(typeof APPROVAL==="string" && APPROVAL.length>=32 && TOKEN!==APPROVAL,"IMPORT_APPROVAL_AUTH_MISSING");
  const incoming=parsePayload(EXPECTED_INPUT);
  const existing=await request("/approved-commitments");
  check(Array.isArray(existing.records),"IMPORT_READBACK_FORMAT_ERROR");
  const seen=new Map(existing.records.map(x=>[x.id,canonical(x)]));
  const seenKeys=new Map(existing.records.map(x=>[x.project+":"+x.key,x]));
  for(const record of incoming){
    const sameId=seen.get(record.id);
    if(sameId){
      check(digest(sameId)===digest(record),"PRIVATE_IMPORT_EXISTING_ID_CONFLICT");
    }else{
      const other=seenKeys.get(record.project+":"+record.key);
      check(!other,"PRIVATE_IMPORT_EXISTING_DECISION_CONFLICT");
    }
  }
  let newCount=0;
  for(const record of incoming){
    if(seen.has(record.id)) continue;
    const receipt=await request("/approved-commitments",{method:"POST",token:APPROVAL,body:record});
    check(receipt?.commitment?.id===record.id,"PRIVATE_IMPORT_RECEIPT_MISMATCH");
    newCount++;
  }
  const after=await request("/approved-commitments");
  check(Array.isArray(after.records),"PRIVATE_IMPORT_NO_READBACK");
  const expectedIds=new Set(incoming.map(x=>x.id));
  const selected=after.records.filter(x=>expectedIds.has(x.id)).map(canonical).sort(byId);
  check(selected.length===incoming.length,"PRIVATE_IMPORT_MISSING_RECORDS");
  const expectedHash=digest(incoming);
  check(digest(selected)===expectedHash,"PRIVATE_IMPORT_RECORD_DIGEST_MISMATCH");
  const output=await request("/execution-plans",{method:"POST"});
  check(/^PLAN-[a-f0-9]{64}$/.test(output?.id||""),"PRIVATE_IMPORT_PLAN_ID_ERROR");
  const saved=await request("/execution-plans?id="+output.id);
  check(saved?.id===output.id && saved?.plan?.schemaVersion===1,"PRIVATE_IMPORT_PLAN_READBACK");
  // Compare approved actions using *all* current D1 records, while allowing other
  // unrelated, previously verified company decisions to remain in D1.
  const expectedPlan=buildExecutionPlan(after.records.map(canonical));
  check(digest(saved.plan)===digest(expectedPlan),"PRIVATE_IMPORT_PLAN_MISMATCH");
  const expectedPlanHash=digest(saved.plan);
  const env=process.env.GITHUB_ENV;
  check(typeof env==="string" && env.length>0,"PRIVATE_IMPORT_ENV_MISSING");
  appendFileSync(env,[
    "BRAIN_PRIVATE_IMPORT_DONE=true",
    "BRAIN_PRIVATE_IMPORT_IDS="+incoming.map(x=>x.id).join(","),
    "BRAIN_PRIVATE_IMPORT_DIGEST="+expectedHash,
    "BRAIN_PRIVATE_IMPORT_COUNT="+incoming.length,
    "BRAIN_PRIVATE_IMPORT_PLAN_ID="+output.id,
    "BRAIN_PRIVATE_IMPORT_PLAN_DIGEST="+expectedPlanHash,
    "",
  ].join("\n"));
  console.log("PASS: imported and independently read back "+incoming.length+" approved-decision records (new: "+newCount+"); no client data written to logs.");
}
if(process.env.BRAIN_COMMITMENTS_IMPORT_B64!==undefined){
  importApproved().catch(e=>{
    console.error("PRIVATE_COMMITMENTS_IMPORT_FAILED: "+(e instanceof Error?e.message:"UNKNOWN_ERROR"));
    process.exitCode=1;
  });
}
