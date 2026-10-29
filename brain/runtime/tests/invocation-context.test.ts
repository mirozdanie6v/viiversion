import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { InvocationContextStore, readBoundedJson, validateHandoff } from "../src/invocation-context.ts";

function memory() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/0003_invocation_contexts.sql", import.meta.url), "utf8"));
  const db = {
    prepare(sql: string) {
      const statement = sqlite.prepare(sql);
      let args: any[] = [];
      return {
        bind(...values: unknown[]) { args = values; return this; },
        async first() { return statement.get(...args) ?? null; },
        async all() { return {results:statement.all(...args)}; },
        async run() { const result = statement.run(...args); return {meta:{changes:Number(result.changes)}}; },
      };
    },
  };
  return {sqlite, db};
}

const invocation = (id = "demo-invocation-0001") => ({
  invocationId:id, projectKey:"viiversion", sourceChatRef:"sample-chat-A",
  captureKind:"model_summary" as const,
  declaredWindow:"caller supplied excerpt; unverified range",
  contextText:"Test fact: Alpha. Test fact: Beta. Proposal: Gamma. Approved decision: Delta. Open question: Epsilon.",
});

test("M0B D1: durable receipt, exact payload recovery and replay after new process", async()=>{
  const {sqlite,db}=memory();
  try {
    const first=new InvocationContextStore(db as any);
    const initial=await first.ingest(invocation());
    assert.equal(initial.replayed,false);
    assert.equal(initial.receipt.coverage,"unknown","caller cannot self-certify complete ChatGPT transcript");
    assert.equal(initial.receipt.captureKind,"model_summary");
    assert.equal(initial.receipt.contextText,invocation().contextText);
    assert.match(initial.receipt.payloadSha256,/^[a-f0-9]{64}$/);
    const again=await first.ingest(invocation());
    assert.equal(again.replayed,true);
    assert.equal(again.receipt.receivedAt,initial.receipt.receivedAt);
    const independent=new InvocationContextStore(db as any);
    const stored=await independent.get(invocation().invocationId);
    assert.deepEqual(stored,initial.receipt);
    assert.deepEqual((await independent.recent("viiversion")).map(x=>x.invocationId),[invocation().invocationId]);
    assert.equal((await independent.recent("unrelated_project")).length,0);
    assert.equal((await independent.recent()).length,1);
  } finally { sqlite.close(); }
});

test("M0B D1: duplicate invocation ID never overwrites earlier payload", async()=>{
  const {sqlite,db}=memory();
  try {
    const store=new InvocationContextStore(db as any);
    await store.ingest(invocation());
    await assert.rejects(
      store.ingest({...invocation(),contextText:"A different or malicious decision"}),
      /INVOCATION_ID_CONFLICT/);
    assert.equal((await store.get(invocation().invocationId))?.contextText,invocation().contextText);
    assert.equal((await store.recent()).length,1);
  } finally { sqlite.close(); }
});

test("M0B D1: two chat invocations merge by company project; unconnected chats not ingested by default",async()=>{
  const {sqlite,db}=memory();
  try {
    const store=new InvocationContextStore(db as any);
    await store.ingest(invocation("chat-A-called-Mark"));
    await store.ingest({...invocation("chat-B-called-Mark"),sourceChatRef:"sample-chat-B"});
    const secondReader=new InvocationContextStore(db as any);
    const recent=await secondReader.recent("viiversion");
    assert.equal(recent.length,2);
    assert.deepEqual(new Set(recent.map(r=>r.sourceChatRef)),new Set(["sample-chat-A","sample-chat-B"]));
    assert.equal(recent.some(r=>r.sourceChatRef==="never-invoked-chat"),false);
  } finally {sqlite.close();}
});

test("M0B validates scope, kinds and refuses oversized and extra fields",()=>{
  assert.throws(()=>validateHandoff({...invocation(),invocationId:".."}),/INVALID_INVOCATION_ID/);
  assert.throws(()=>validateHandoff({...invocation(),contextText:"  "}),/INVALID_CONTEXT_TEXT/);
  assert.throws(()=>validateHandoff({...invocation(),contextText:"Б".repeat(13_000)}),/INVALID_CONTEXT_TEXT/);
  assert.throws(()=>validateHandoff({...invocation(),captureKind:"guaranteed_full_transcript"}),/INVALID_CAPTURE_KIND/);
  assert.throws(()=>validateHandoff({...invocation(),coverage:"verified_complete_for_declared_scope"}),/INVALID_CONTEXT_FIELDS/);
  assert.throws(()=>validateHandoff({...invocation(),projectKey:"../hack"}),/INVALID_PROJECT_KEY/);
});

test("M0B request reader bounds actual streamed bytes without Content-Length",async()=>{
  const good=new Request("https://brain.example.test/invocation-context",{
    method:"POST",body:JSON.stringify(invocation()),headers:{"content-type":"application/json"},
  });
  assert.deepEqual(await readBoundedJson(good),invocation());
  const huge=new Request("https://brain.example.test/invocation-context",{
    method:"POST",body:JSON.stringify({...invocation(),contextText:"Z".repeat(40000)}),
  });
  await assert.rejects(()=>readBoundedJson(huge),/CONTEXT_PAYLOAD_TOO_LARGE/);
  const broken=new Request("https://brain.example.test/invocation-context",{
    method:"POST",body:"not-json",
  });
  await assert.rejects(()=>readBoundedJson(broken),/INVALID_JSON/);
});
