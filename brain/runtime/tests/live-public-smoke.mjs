import assert from "node:assert/strict";

const base=process.env.BRAIN_TEST_BASE;
if(!base)throw Error("BRAIN_TEST_BASE required");
const expectedRevision="brain-stage1-secure-retention-20261027";
let revisionSeen=false;
for(let attempt=0;attempt<30;attempt++){
  try {
    const response=await fetch(new URL("/health",base),{cache:"no-store"});
    const health=response.status===200?await response.json():{};
    if(response.status===200 && health.status==="ok" && health.revision===expectedRevision){revisionSeen=true;break;}
  }catch{ /* Worker edge propagation may be transient */ }
  await new Promise(resolve=>setTimeout(resolve,2000));
}
assert.ok(revisionSeen,"new Worker revision must be served before testing access control");
const protectedPaths=["/state","/context","/readiness","/approved-commitments","/execution-plans?id=TEST","/runs?idempotencyKey=TEST"];
for(const path of protectedPaths){
  const response=await fetch(new URL(path,base),{cache:"no-store"});
  assert.equal(response.status,401,"anonymous access refused: "+path);
}
const attempted=await fetch(new URL("/runs",base),{
  method:"POST",headers:{"content-type":"application/json",authorization:"Bearer untrusted"},
  body:JSON.stringify({idempotencyKey:"should-not-run"}),
});
assert.equal(attempted.status,401,"invalid bearer must not create run");
const approval=await fetch(new URL("/approved-commitments",base),{
  method:"POST",headers:{"content-type":"application/json",authorization:"Bearer untrusted"},
  body:JSON.stringify({}),
});
assert.equal(approval.status,401,"invalid bearer must not write approvals");
console.log("PASS: deployed revision "+expectedRevision+" responds; protected routes reject anonymous and invalid credentials");
console.log("LIMITATION: authenticated read/run/commitment writes and workflow persistence remain unverified without a valid test credential");
