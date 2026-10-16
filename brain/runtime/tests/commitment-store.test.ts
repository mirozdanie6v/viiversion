import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {CommitmentStore} from "../src/commitment-store.ts";

function isolatedDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/0002_commitments.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    d1: {
      prepare(sql: string) {
        const stmt = sqlite.prepare(sql);
        let args: any[] = [];
        return {
          bind(...values: unknown[]) { args = values; return this; },
          async first() { return stmt.get(...args) ?? null; },
          async all() { return {results: stmt.all(...args)}; },
          async run() { const result = stmt.run(...args); return {meta: {changes: Number(result.changes)}}; },
        };
      },
    },
  };
}
function fixture(overrides: Record<string,unknown> = {}) {
  return {
    id:"DEMO-DEC-1",project:"SyntheticDemo",key:"delivery",
    revision:1,status:"approved",statement:"Complete development first",
    approvedBy:"Test Founder",effectiveAt:"2026-10-10",
    source:{type:"founder_confirmation",ref:"private:synthetic-example",observedAt:"2026-10-10"},
    actions:[{id:"verify-delivery",description:"Check the client journey",status:"open",order:1},
      {id:"start-marketing",description:"Start approved campaign",status:"open",order:2,dependsOn:["verify-delivery"]}],
    ...overrides,
  };
}
test("SQLite/D1 contract: import, replay, replacement and independent store readback",async()=>{
  const {sqlite,d1}=isolatedDatabase();
  try {
    const firstStore=new CommitmentStore(d1 as any);
    const first=await firstStore.append(fixture());
    assert.equal(first.replayed,false);
    assert.equal((await firstStore.append(fixture())).replayed,true);
    await assert.rejects(()=>firstStore.append(fixture({statement:"Unauthorized rewrite"})),/COMMITMENT_ID_CONFLICT/);
    const plan1=await firstStore.createPlan();
    assert.equal(plan1.plan.actions.length,2);
    assert.equal(plan1.plan.actions.find(x=>x.id==="start-marketing")?.status,"blocked");
    // A distinct consumer with no original request context reads durable SQLite state.
    const secondStore=new CommitmentStore(d1 as any);
    assert.deepEqual(await secondStore.loadPlan(plan1.id),plan1.plan);
    assert.equal((await secondStore.createPlan()).replayed,true);
    assert.equal((await secondStore.list()).length,1);
    const updated=fixture({
      id:"DEMO-DEC-2",revision:2,supersedes:"DEMO-DEC-1",
      statement:"Delivery verified; approved marketing next",
      actions:[{id:"verify-delivery",description:"Check the client journey",status:"done",order:1},
        {id:"start-marketing",description:"Start approved campaign",status:"open",order:2,dependsOn:["verify-delivery"]}],
    });
    await secondStore.append(updated);
    const freshStore=new CommitmentStore(d1 as any);
    const plan2=await freshStore.createPlan();
    assert.notEqual(plan2.id,plan1.id);
    assert.deepEqual(plan2.plan.actions.map(x=>[x.id,x.status]),[["start-marketing","ready"]]);
    assert.equal((await freshStore.list()).length,2);
    await assert.rejects(()=>freshStore.append(fixture({id:"DEMO-BAD-3",revision:3,supersedes:"DEMO-DEC-1"})),/SUPERSESSION_REQUIRED/);
    await freshStore.append(fixture({id:"DEMO-DEC-3",revision:3,supersedes:"DEMO-DEC-2",status:"canceled",actions:[]}));
    assert.equal((await new CommitmentStore(d1 as any).createPlan()).plan.actions.length,0);
    assert.equal((await new CommitmentStore(d1 as any).list()).length,3);
  } finally { sqlite.close(); }
});
