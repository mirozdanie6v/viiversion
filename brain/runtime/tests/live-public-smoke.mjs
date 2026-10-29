import assert from "node:assert/strict";

const base=process.env.BRAIN_TEST_BASE;
if(!base)throw Error("BRAIN_TEST_BASE required");
const expectedRevision="brain-m0b-mcp-oauth-20261027";
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
const protectedPaths=["/state","/context","/readiness","/approved-commitments","/execution-plans?id=TEST","/runs?idempotencyKey=TEST","/invocation-context?invocationId=TEST","/invocation-context?projectKey=viiversion"];
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
const intake=await fetch(new URL("/invocation-context",base),{
  method:"POST",headers:{"content-type":"application/json",authorization:"Bearer untrusted"},
  body:JSON.stringify({invocationId:"DEMO-intake-blocked",projectKey:"viiversion",contextText:"Synthetic test",captureKind:"model_summary"}),
});
assert.equal(intake.status,401,"invalid bearer must not write invocation contexts");
const oauthDiscovery=await fetch(new URL("/.well-known/oauth-protected-resource",base),{cache:"no-store"});
assert.equal(oauthDiscovery.status,200,"OAuth resource discovery must be available without secrets");
const metadata=await oauthDiscovery.json();
assert.equal(metadata.resource,new URL("/mcp",base).href,"OAuth resource audience must be the Mark MCP endpoint");
const rpcAttempt=await fetch(new URL("/mcp",base),{
 method:"POST",headers:{"content-type":"application/json"},
 body:JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list"}),
});
assert.equal(rpcAttempt.status,401,"private Mark MCP tool descriptions must require OAuth");
assert.match(rpcAttempt.headers.get("www-authenticate")??"",/oauth-protected-resource/);
console.log("PASS: deployed revision "+expectedRevision+" responds; protected routes reject anonymous and invalid credentials");
console.log("LIMITATION: authenticated read/run/commitment writes and workflow persistence remain unverified without a valid test credential");
