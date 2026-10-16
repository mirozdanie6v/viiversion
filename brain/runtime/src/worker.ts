import { D1BrainRepository, type D1 } from "./d1-repository.ts";
import { day0State } from "./day0.ts";
import { canonicalDecision001 } from "./decision-seed.ts";
import { resume } from "./loop.ts";
import { isAuthorized } from "./auth.ts";
import { CommitmentStore } from "./commitment-store.ts";
import type { Run } from "./contracts.ts";

interface Env {
  BRAIN_DB: D1;
  BRAIN_API_TOKEN?: string;
  BRAIN_APPROVAL_TOKEN?: string;
  CEO_WORKFLOW?: { create(o: { id: string; params: { runId: string } }): Promise<unknown> };
}
const json = (x: unknown, status = 200) =>
  new Response(JSON.stringify(x), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") return json({ status: "ok" });
    // State, bootstrap and run endpoints all handle company state: never expose them publicly.
    // Models and read-only clients must never acquire founder-approval privileges.
    // Approval writes require an independently configured bearer secret.
    const approvalWrite = req.method === "POST" && url.pathname === "/approved-commitments";
    if (!(await isAuthorized(req, approvalWrite ? env.BRAIN_APPROVAL_TOKEN : env.BRAIN_API_TOKEN)))
      return json({ error: "unauthorized" }, 401);

    const repo = new D1BrainRepository(env.BRAIN_DB);
    if (req.method === "POST" && url.pathname === "/bootstrap") {
      await repo.seedState(day0State());
      await repo.appendDecision(canonicalDecision001());
      return json(await resume(repo), 201);
    }
    if (req.method === "GET" && url.pathname === "/state") return json(await resume(repo));
    if (req.method === "GET" && url.pathname === "/context") return json({ ...(await resume(repo)), decisions: await repo.loadDecisions() });
    const commitments = new CommitmentStore(env.BRAIN_DB);
    if (req.method === "GET" && url.pathname === "/approved-commitments") {
      return json({records: await commitments.list()});
    }
    if (req.method === "POST" && url.pathname === "/approved-commitments") {
      if (Number(req.headers.get("content-length") || 0) > 16384) return json({error:"payload_too_large"},413);
      let payload: unknown;
      try { payload = await req.json(); } catch { return json({error:"invalid_json"},400); }
      try {
        const result = await commitments.append(payload);
        return json(result, result.replayed ? 200 : 201);
      } catch (err) {
        const cause = err instanceof Error ? err.message : "RECORD_REJECTED";
        return json({error:cause}, cause.startsWith("INVALID") ? 400 : 409);
      }
    }
    if (req.method === "POST" && url.pathname === "/execution-plans") {
      try {
        const result = await commitments.createPlan();
        return json(result, result.replayed ? 200 : 201);
      } catch (err) {
        return json({error:err instanceof Error ? err.message : "PLAN_FAILED"},422);
      }
    }
    if (req.method === "GET" && url.pathname === "/execution-plans") {
      const id = url.searchParams.get("id");
      if (!id) return json({error:"plan_id_required"},400);
      try {
        const plan = await commitments.loadPlan(id);
        return plan ? json({id,plan}) : json({error:"not_found"},404);
      } catch { return json({error:"invalid_plan_id"},400); }
    }
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
