// Standalone process proving imported private records/plan came from remote D1,
// not the preceding Node process memory, runtime fixture, or a chat session.
import {createHash} from "node:crypto";
const {BRAIN_TEST_BASE:base,BRAIN_TEST_TOKEN:token,
 BRAIN_PRIVATE_IMPORT_IDS:joined,BRAIN_PRIVATE_IMPORT_DIGEST:expectedHash,
 BRAIN_PRIVATE_IMPORT_COUNT:count,BRAIN_PRIVATE_IMPORT_PLAN_ID:planId,
 BRAIN_PRIVATE_IMPORT_PLAN_DIGEST:planDigest}=process.env;
const check=(v,msg)=>{if(!v)throw Error(msg)};
check(typeof base==="string"&&base.startsWith("https://"),"PRIVATE_RESUME_BASE");
check(typeof token==="string"&&token.length>=32,"PRIVATE_RESUME_TOKEN");
check(typeof joined==="string"&&typeof expectedHash==="string"&&
 typeof planId==="string"&&typeof planDigest==="string","PRIVATE_RESUME_METADATA");
const digest=v=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
const ids=new Set(joined.split(","));
check(ids.size===Number(count),"PRIVATE_RESUME_COUNT");
async function get(path){
  const r=await fetch(new URL(path,base),{headers:{authorization:"Bearer "+token}});
  check(r.status===200,"PRIVATE_RESUME_HTTP_"+r.status);
  return r.json();
}
const records=await get("/approved-commitments");
check(Array.isArray(records.records),"PRIVATE_RESUME_RECORD_FORMAT");
const selected=records.records.filter(x=>ids.has(x.id)).sort((a,b)=>a.id.localeCompare(b.id));
check(selected.length===ids.size,"PRIVATE_RESUME_RECORDS_ABSENT");
check(digest(selected)===expectedHash,"PRIVATE_RESUME_DIGEST_MISMATCH");
const snap=await get("/execution-plans?id="+encodeURIComponent(planId));
check(snap.id===planId&&snap.plan?.schemaVersion===1,"PRIVATE_RESUME_PLAN_ABSENT");
check(digest(snap.plan)===planDigest,"PRIVATE_RESUME_PLAN_CHANGED");
console.log("PASS: separate Node process independently restored "+ids.size+" private decisions and the exact saved execution plan from live Cloudflare D1.");
