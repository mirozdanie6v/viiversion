import { resolveCommand } from "./commands";
import { firstStep, isApprovalStep, isWorkflowId, nextStep, type WorkflowId } from "./workflows";

interface Env {
  ORCHESTRATION_DB: D1Database;
}

interface CreateRunBody {
  workflow_id: WorkflowId;
  input?: Record<string, unknown>;
}

interface CommandBody {
  text: string;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function now(): string {
  return new Date().toISOString();
}

async function getRun(env: Env, runId: string) {
  return env.ORCHESTRATION_DB.prepare(
    "SELECT * FROM orchestration_runs WHERE run_id = ?"
  ).bind(runId).first();
}

async function recordEvent(
  env: Env,
  runId: string,
  eventType: string,
  stepId: string | null,
  payload: Record<string, unknown> = {}
) {
  await env.ORCHESTRATION_DB.prepare(
    "INSERT INTO orchestration_events (run_id, event_type, step_id, payload_json, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(runId, eventType, stepId, JSON.stringify(payload), now()).run();
}

async function createRun(env: Env, workflowId: WorkflowId, input: Record<string, unknown>) {
  const runId = crypto.randomUUID();
  const step = firstStep(workflowId);
  const timestamp = now();

  await env.ORCHESTRATION_DB.prepare(
    `INSERT INTO orchestration_runs
    (run_id, workflow_id, status, current_step, input_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    runId,
    workflowId,
    "queued",
    step,
    JSON.stringify(input),
    timestamp,
    timestamp
  ).run();

  await recordEvent(env, runId, "run_created", step, { workflow_id: workflowId });
  return { run_id: runId, workflow_id: workflowId, status: "queued", current_step: step };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "viiversion-orchestrator", version: "0.2.0" });
    }

    if (request.method === "POST" && url.pathname === "/commands/resolve") {
      const body = (await request.json()) as CommandBody;
      const resolved = resolveCommand(body.text ?? "");
      return resolved ? json(resolved) : json({ error: "no command trigger matched" }, 404);
    }

    if (request.method === "POST" && url.pathname === "/commands/run") {
      const body = (await request.json()) as CommandBody;
      const resolved = resolveCommand(body.text ?? "");
      if (!resolved) return json({ error: "no command trigger matched" }, 404);

      const run = await createRun(env, resolved.workflow_id, {
        command_id: resolved.command_id,
        matched_trigger: resolved.matched_trigger,
        task_payload: resolved.payload
      });
      return json({ ...run, command_id: resolved.command_id, task_payload: resolved.payload }, 201);
    }

    if (request.method === "POST" && url.pathname === "/runs") {
      const body = (await request.json()) as CreateRunBody;
      if (!isWorkflowId(body.workflow_id)) {
        return json({ error: "unknown workflow_id" }, 400);
      }
      return json(await createRun(env, body.workflow_id, body.input ?? {}), 201);
    }

    const runMatch = url.pathname.match(/^\/runs\/([^/]+)$/);
    if (request.method === "GET" && runMatch) {
      const run = await getRun(env, runMatch[1]);
      return run ? json(run) : json({ error: "run not found" }, 404);
    }

    const advanceMatch = url.pathname.match(/^\/runs\/([^/]+)\/advance$/);
    if (request.method === "POST" && advanceMatch) {
      const runId = advanceMatch[1];
      const run = await getRun(env, runId) as Record<string, unknown> | null;
      if (!run) return json({ error: "run not found" }, 404);

      const workflowId = run.workflow_id as WorkflowId;
      const currentStep = String(run.current_step);

      if (isApprovalStep(workflowId, currentStep)) {
        return json({ error: "approval required", run_id: runId, current_step: currentStep }, 409);
      }

      const next = nextStep(workflowId, currentStep);
      const status = next ? "running" : "completed";
      const nextCurrent = next ?? currentStep;

      await env.ORCHESTRATION_DB.prepare(
        "UPDATE orchestration_runs SET status = ?, current_step = ?, updated_at = ? WHERE run_id = ?"
      ).bind(status, nextCurrent, now(), runId).run();

      await recordEvent(env, runId, next ? "step_advanced" : "run_completed", nextCurrent, {
        previous_step: currentStep
      });

      return json({ run_id: runId, status, current_step: nextCurrent });
    }

    const approveMatch = url.pathname.match(/^\/runs\/([^/]+)\/approve$/);
    if (request.method === "POST" && approveMatch) {
      const runId = approveMatch[1];
      const run = await getRun(env, runId) as Record<string, unknown> | null;
      if (!run) return json({ error: "run not found" }, 404);

      const workflowId = run.workflow_id as WorkflowId;
      const currentStep = String(run.current_step);
      if (!isApprovalStep(workflowId, currentStep)) {
        return json({ error: "current step is not an approval gate" }, 409);
      }

      const next = nextStep(workflowId, currentStep);
      if (!next) return json({ error: "approval gate has no next step" }, 500);

      await env.ORCHESTRATION_DB.prepare(
        "UPDATE orchestration_runs SET status = ?, current_step = ?, updated_at = ? WHERE run_id = ?"
      ).bind("running", next, now(), runId).run();

      await recordEvent(env, runId, "approved", currentStep, { next_step: next });
      return json({ run_id: runId, status: "running", current_step: next });
    }

    return json({ error: "not found" }, 404);
  },
};
