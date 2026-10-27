import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const workflow=readFileSync(new URL("../../../.github/workflows/deploy-brain.yml",import.meta.url),"utf8");

test("Brain deployment never rotates or replaces existing Cloudflare Worker secrets",()=>{
  assert.doesNotMatch(workflow,/\bwrangler\s+secret\s+(?:put|bulk|delete)\b/i);
  assert.doesNotMatch(workflow,/\bopenssl\s+rand\b/i);
  assert.match(workflow,/wrangler secret list --config wrangler\.jsonc --format json/);
  assert.match(workflow,/\["BRAIN_API_TOKEN","BRAIN_APPROVAL_TOKEN"\]/);
});

test("Cloudflare is checked before any D1 mutation or deployment",()=>{
  const check=workflow.indexOf("Verify Cloudflare-managed Worker secrets");
  const migrations=workflow.indexOf("wrangler d1 migrations apply");
  const deploy=workflow.indexOf("wrangler deploy --config wrangler.jsonc");
  assert.ok(check>=0 && migrations>check && deploy>migrations);
  assert.match(workflow,/Cloudflare-managed Worker secrets without reading or rotating values/);
});

test("GitHub-only smoke credentials are optional, not production deployment prerequisites",()=>{
  assert.match(workflow,/BRAIN_AUTH_SMOKE=false/);
  assert.match(workflow,/if: \$\{\{ env\.BRAIN_AUTH_SMOKE == 'true' \}\}/);
  assert.match(workflow,/Verify deployed revision and protected endpoints deny anonymous requests/);
  assert.ok(workflow.indexOf("Deploy Worker and Workflow")<workflow.indexOf("Remote fresh-session checkpoint E2E"));
});
