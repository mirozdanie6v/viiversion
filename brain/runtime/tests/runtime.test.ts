import test from "node:test";import assert from "node:assert/strict";import {advance} from "../src/lifecycle.ts";import {requestKey} from "../src/idempotency.ts";import {requiresFounderApproval} from "../src/policy.ts";
test("CEO loop rejects skipped stages",()=>{assert.throws(()=>advance("audit","decide"));assert.equal(advance("audit","diagnose"),"diagnose")});
test("idempotency key ignores object key order",()=>assert.equal(requestKey("run",{a:1,b:2}),requestKey("run",{b:2,a:1})));
test("only consequential actions require founder approval in minimal policy",()=>{assert.equal(requiresFounderApproval("reversible_action"),false);assert.equal(requiresFounderApproval("consequential_action"),true)});
