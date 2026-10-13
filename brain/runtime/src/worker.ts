import { D1BrainRepository, type D1 } from "./d1-repository.ts";
import { day0State } from "./day0.ts";
import { canonicalDecision001 } from "./decision-seed.ts";
import { resume } from "./loop.ts";
import { isAuthorized } from "./auth.ts";
import type { Run } from "./contracts.ts";

interface Env {
  BRAIN_DB: D1;
  BRAIN_API_TOKEN?: string;
  CEO_WORKFLOW?: { create(o: { id: string; params: { runId: string } }): Promise<unknown> };
}
const json = (x: unknown, status = 200) =>
  new Response(JSON.stringify(x), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") return json({ status: "ok" });
    // State, bootstrap and run endpoints all handle company state: never expose them publicly.
    if (!(await isAuthorized(req, env.BRAIN_API_TOKEN))) return json({ error: "unauthorized" }, 401);

    const repo = new D1BrainRepository(env.BRAIN_DB);
    if (req.method === "POST" && url.pathname === "/bootstrap") {
      await repo.seedState(day0State());
      await repo.appendDecision(canonicalDecision001());
      return json(await resume(repo), 201);
    }
    if (req.method === "GET" && url.pathname === "/state") return json(await resume(repo));
    if (req.method === "GET" && url.pathname === "/context") return json({ ...(await resume(repo)), decisions: await repo.loadDecisions() });
    if (req.method === "POST" && url.pathname === "/runs") {
      let body: { idempotencyKey?: string };
      try {
        body = await req.json() as { idempotencyKey?: string };
      } catch {
        return json({ error: "invalid json" }, 400);
      }
      if (typeof body?.idempotencyKey !== "string" || !/^[A-Za-z0-9:_-]{1,128}$/.test(body.idempotencyKey))
        return json({ error: "invalid idempotencyKey" }, 400);

      const receiptId = "request:" + body.idempotencyKey;
      const receipt = await env.BRAIN_DB.prepare("SELECT payload_json FROM brain_events WHERE id=?")
        .bind(receiptId).first<{ payload_json: string }>();
      if (receipt) {
        const { runId } = JSON.parse(receipt.payload_json);
        const old = await repo.findRunByIdempotencyKey("ceo:" + runId);
        if (old) return json({ replayed: true, run: old });
        return json({ error: "run_pending_recovery" }, 409);
      }
      const now = new Date().toISOString();
      const runId = crypto.randomUUID();
      const run: Run = {
        runId, stage: "audit", status: "running", idempotencyKey: "ceo:" + runId,
        startedAt: now, updatedAt: now,
      };
      await repo.saveRun(run);
      await repo.appendEvent({
        id: receiptId, at: now, type: "run_requested", source: "brain-api",
        payload: { runId, idempotencyKey: body.idempotencyKey },
      });
      if (env.CEO_WORKFLOW) await env.CEO_WORKFLOW.create({ id: runId, params: { runId } });
      return json({ replayed: false, run }, 202);
    }
    return json({ error: "not found" }, 404);
  },
};
export { CeoWorkflow } from "./workflow.ts";
