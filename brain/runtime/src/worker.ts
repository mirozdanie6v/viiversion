import { D1BrainRepository, type D1 } from "./d1-repository.ts";
import { day0State } from "./day0.ts";
import { canonicalDecision001 } from "./decision-seed.ts";
import { resume } from "./loop.ts";
import { isAuthorized } from "./auth.ts";
import { CommitmentStore } from "./commitment-store.ts";
import { loadUnifiedContext } from "./context.ts";
import { InvocationContextStore, readBoundedJson } from "./invocation-context.ts";
import type { Run } from "./contracts.ts";
import { ensureRunQueued, waitForPersistedNonrunningRun, type BrainWorkflowQueue } from "./run-queue.ts";

interface Env {
  BRAIN_DB: D1;
  BRAIN_API_TOKEN?: string;
  BRAIN_APPROVAL_TOKEN?: string;
  CEO_WORKFLOW?: BrainWorkflowQueue;
}
const json = (x: unknown, status = 200) =>
  new Response(JSON.stringify(x), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") return json({ status: "ok", revision: "brain-stage1-secure-retention-20261027" });
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
    const commitments = new CommitmentStore(env.BRAIN_DB);
    if (req.method === "GET" && (url.pathname === "/context" || url.pathname === "/readiness")) {
      const full = await loadUnifiedContext(repo, {
        loadDecisions: () => repo.loadDecisions(),
        loadApprovedCommitments: () => commitments.list(),
        // One protected Mark context endpoint now includes invocation-time
        // working-memory receipts. This remains raw/unprocessed context, NOT
        // a claim of full ChatGPT history or of autonomous semantic memory.
        ...(url.pathname === "/context"
          ? { loadInvocationContexts: () => new InvocationContextStore(env.BRAIN_DB).recent(undefined, 10) }
          : {}),
      });
      return url.pathname === "/context" ? json(full) : json({
        readiness: full.readiness,
        counts: {
          decisions: full.decisions.length,
          approvedCommitments: full.approvedCommitments.length,
          activeCommitments: full.executionPlan.commitments.length,
        },
      });
    }
    // M0B: explicitly invoked ChatGPT adapter can persist only the context
    // actually sent by the caller. This endpoint does NOT read other chat turns
    // or automatically verify the source conversation ID / transcript coverage.
    if (url.pathname === "/invocation-context" && req.method === "POST") {
      let body: unknown;
      try { body = await readBoundedJson(req); }
      catch (err) {
        const reason = err instanceof Error ? err.message : "INVALID_JSON";
        return json({error:reason}, reason === "CONTEXT_PAYLOAD_TOO_LARGE" ? 413 : 400);
      }
      try {
        const result = await new InvocationContextStore(env.BRAIN_DB).ingest(body);
        // Do not echo raw context text in HTTP success responses or deployment logs.
        const { contextText: _redacted, ...receipt } = result.receipt;
        return json({replayed:result.replayed,receipt},result.replayed ? 200 : 201);
      } catch (err) {
        const reason = err instanceof Error ? err.message : "CONTEXT_WRITE_FAILED";
        if (reason.startsWith("INVALID_")) return json({error:reason},400);
        if (reason === "INVOCATION_ID_CONFLICT") return json({error:reason},409);
        // Never expose SQL or private payload in unexpected errors.
        return json({error:"CONTEXT_WRITE_FAILED"},503);
      }
    }
    if (url.pathname === "/invocation-context" && req.method === "GET") {
      const store = new InvocationContextStore(env.BRAIN_DB);
      try {
        const invocationId = url.searchParams.get("invocationId");
        if (invocationId) {
          const receipt = await store.get(invocationId);
          return receipt ? json({receipt}) : json({error:"not_found"},404);
        }
        const projectKey = url.searchParams.get("projectKey") ?? undefined;
        const count = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : 10;
        return json({records:await store.recent(projectKey,count)});
      } catch (err) {
        const reason = err instanceof Error ? err.message : "CONTEXT_READ_FAILED";
        return json({error:reason.startsWith("INVALID_") ? reason : "CONTEXT_READ_FAILED"},
          reason.startsWith("INVALID_") ? 400 : 503);
      }
    }
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
    if (req.method === "GET" && url.pathname === "/runs") {
      const key = url.searchParams.get("idempotencyKey");
      if (!key || !/^[A-Za-z0-9:_-]{1,128}$/.test(key)) return json({error:"invalid idempotencyKey"},400);
      let run = await repo.findRunByIdempotencyKey("request:" + key);
      if (!run) {
        const legacy = await env.BRAIN_DB.prepare("SELECT payload_json FROM brain_events WHERE id=?")
          .bind("request:" + key).first<{payload_json:string}>();
        if (legacy) run = await repo.findRunById(JSON.parse(legacy.payload_json).runId);
      }
      return run ? json({run}) : json({error:"not_found"},404);
    }
    if (req.method === "POST" && url.pathname === "/runs") {
      let body: { idempotencyKey?: string };
      try { body = await req.json() as {idempotencyKey?:string}; }
      catch { return json({error:"invalid json"},400); }
      if (typeof body?.idempotencyKey !== "string" || !/^[A-Za-z0-9:_-]{1,128}$/.test(body.idempotencyKey))
        return json({error:"invalid idempotencyKey"},400);
      if (!env.CEO_WORKFLOW) return json({error:"workflow_unavailable"},503);

      // Compatibility with requests recorded before the atomic claim protocol.
      const receiptId = "request:" + body.idempotencyKey;
      const legacy = await env.BRAIN_DB.prepare("SELECT payload_json FROM brain_events WHERE id=?")
        .bind(receiptId).first<{payload_json:string}>();
      let run: Run;
      let replayed: boolean;
      if (legacy) {
        run = await repo.findRunById(JSON.parse(legacy.payload_json).runId) as Run;
        if (!run) return json({error:"legacy_run_missing"},409);
        replayed = true;
      } else {
        const now = new Date().toISOString();
        const proposed: Run = {
          runId: crypto.randomUUID(), stage:"audit", status:"running",
          idempotencyKey:"request:" + body.idempotencyKey, startedAt:now, updatedAt:now,
        };
        // Unique D1 constraint is the linearization point; competing requests receive the same run.
        const claimed = await repo.claimRunRequest(body.idempotencyKey, proposed);
        run = claimed.run;
        replayed = claimed.replayed;
      }
      try {
        await repo.appendEvent({
          id:receiptId, at:run.startedAt, type:"run_requested", source:"brain-api",
          payload:{runId:run.runId,idempotencyKey:body.idempotencyKey},
        });
        // Replaying a request also retries dispatch after a transient enqueue failure.
        if(replayed) {
          const latest=await repo.findRunById(run.runId);
          if(latest && latest.status!=="running")return json({replayed:true,run:latest},200);
        }
        await ensureRunQueued(env.CEO_WORKFLOW, run);
      } catch {
        if(replayed) {
          const terminal=await waitForPersistedNonrunningRun(
            ()=>repo.findRunById(run.runId),run.runId);
          if(terminal)return json({replayed:true,run:terminal},200);
        }
        return json({error:"run_dispatch_retryable",runId:run.runId},503);
      }
      return json({replayed,run},replayed?200:202);
    }
    return json({ error: "not found" }, 404);
  },
};
export { CeoWorkflow } from "./workflow.ts";
