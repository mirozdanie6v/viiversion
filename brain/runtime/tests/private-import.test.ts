import test from "node:test";
import assert from "node:assert/strict";
import {parsePayload} from "./import-private-commitments.mjs";
const record=(v:Record<string,unknown>={})=>({
 id:"DEMO-TEST-1",project:"Synthetic",key:"demo",revision:1,
 status:"approved",statement:"Already approved test scope",
 approvedBy:"Synthetic Founder",effectiveAt:"2026-10-16",
 source:{type:"founder_confirmation",ref:"private:synthetic",observedAt:"2026-10-16"},
 actions:[{id:"demo-start",description:"Already approved first action",order:1,status:"open"}],...v
});
const serialize=(records:unknown[])=>Buffer.from(JSON.stringify({schemaVersion:1,records}),"utf8").toString("base64");
test("private payload accepts valid founder-attested records and contains no real customer fixture",()=>{
 const r=parsePayload(serialize([record()]));
 assert.equal(r.length,1);
 assert.equal(r[0].source.ref,"private:synthetic");
});
test("rejects malformed encodings, duplicate ids and repeated decision keys",()=>{
 assert.throws(()=>parsePayload("improper"),/INVALID_PRIVATE_IMPORT_ENCODING/);
 assert.throws(()=>parsePayload(serialize([record(),record()])),/INVALID_PRIVATE_IMPORT_REVISIONS/);
 assert.throws(()=>parsePayload(serialize([record(),record({id:"DEMO-TEST-2"})])),/INVALID_PRIVATE_IMPORT_REVISIONS/);
});
test("private import refuses unapproved assertions and missing dependencies before network access",()=>{
 assert.throws(()=>parsePayload(serialize([record({status:"proposal"})])),/INVALID_COMMITMENT/);
 assert.throws(()=>parsePayload(serialize([record({actions:[{id:"demo-start",description:"Start",order:1,status:"open",dependsOn:["not-verified"]}]})])),/MISSING_APPROVED_DEPENDENCY/);
});

test("canceled decisions cannot be imported with executable actions",()=>{
 assert.throws(()=>parsePayload(serialize([record({status:"canceled"})])),/INVALID_ACTIONS/);
});
test("private batch rejects oversized data before any network write",()=>{
 assert.throws(()=>parsePayload("A".repeat(64000)),/INVALID_PRIVATE_IMPORT_ENCODING/);
});
