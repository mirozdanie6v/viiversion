import { DurableObject } from "cloudflare:workers";
import { buildRolePlan, BRAND_ROLE } from "./roles.js";
import { BRAND_ROLE_MODEL, BrandRoleError, executeBrandRole, assembleBrandResult } from "./brand-role-runtime.js";
import { validateLiveContext } from "./live-source.js";

const RUN_KEY = "brand-run-v1";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function clean(value, max = 5000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function safeId(value, label, max = 96) {
  const text = clean(value, max);
  if (!new RegExp(`^[A-Za-z0-9][A-Za-z0-9._-]{0,${max - 1}}$`).test(text)) {
    throw new BrandRoleError("INVALID_IDENTIFIER", `${label} must be a safe identifier`, 400);
  }
  return text;
}

function publicRun(run) {
  if (!run) return null;
  return structuredClone({
    runId: run.runId,
    task: run.task,
    surface: run.surface,
    flags: run.flags,
    route: run.route,
    reasons: run.reasons,
    status: run.status,
    nextRoleIndex: run.nextRoleIndex,
    nextRole: run.route[run.nextRoleIndex] ?? null,
    pendingArtifact: run.pendingArtifact,
    acceptedArtifacts: run.acceptedArtifacts,
    rejectedArtifacts: run.rejectedArtifacts,
    finalResult: run.finalResult ?? null,
    reworkCycle: run.reworkCycle ?? 0,
    audit: run.audit,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt
  });
}

export class BrandRunCoordinator extends DurableObject {
  async readRun() {
    return await this.ctx.storage.get(RUN_KEY);
  }

  async writeRun(run) {
    run.updatedAt = new Date().toISOString();
    await this.ctx.storage.put(RUN_KEY, run);
    return publicRun(run);
  }

  async createRun(command) {
    const existing = await this.readRun();
    if (existing) {
      const same = existing.task === command.task &&
        JSON.stringify(existing.flags) === JSON.stringify(command.flags ?? {}) &&
        existing.surface === (command.surface ?? existing.surface);
      if (same) return publicRun(existing);
      throw new BrandRoleError("RUN_ALREADY_EXISTS", "A different run already exists for this Durable Object id", 409);
    }

    const task = clean(command.task, 5000);
    if (!task) throw new BrandRoleError("TASK_REQUIRED", "task is required", 400);
    const plan = buildRolePlan({
      task,
      surface: command.surface,
      current_state: Boolean(command.flags?.current_state),
      final_public: Boolean(command.flags?.final_public),
      implementation: Boolean(command.flags?.implementation)
    });
    const now = new Date().toISOString();
    const run = {
      schemaVersion: "1.0",
      runId: safeId(command.runId, "runId"),
      task,
      surface: plan.surface,
      flags: plan.flags,
      route: plan.route,
      reasons: plan.reasons,
      status: "ACTIVE",
      nextRoleIndex: 0,
      pendingArtifact: null,
      pendingExecution: null,
      acceptedArtifacts: [],
      rejectedArtifacts: [],
      invocationIds: [],
      finalResult: null,
      reworkCycle: 0,
      audit: [{ event: "RUN_CREATED", at: now, route: plan.route }],
      createdAt: now,
      updatedAt: now
    };
    await this.ctx.storage.put(RUN_KEY, run);
    return publicRun(run);
  }

  async executeRole(command) {
    const run = await this.readRun();
    if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run does not exist", 404);
    if (run.status !== "ACTIVE") throw new BrandRoleError("RUN_NOT_ACTIVE", `Run is ${run.status}`, 409);

    const role = safeId(command.role, "role", 64);
    const invocationId = safeId(command.invocationId, "invocationId", 64);
    const expected = run.route[run.nextRoleIndex];
    if (role !== expected) throw new BrandRoleError("ROLE_ORDER_VIOLATION", `Expected role ${expected ?? "none"}, got ${role}`, 409);

    if (run.pendingArtifact) {
      if (run.pendingExecution?.role === role && run.pendingExecution?.invocationId === invocationId) {
        return structuredClone({ ...run.pendingExecution, artifact: run.pendingArtifact, replayed: true });
      }
      throw new BrandRoleError("PENDING_ARTIFACT_EXISTS", "Accept or reject the pending artifact before another role execution", 409);
    }
    if (run.invocationIds.includes(invocationId)) throw new BrandRoleError("INVOCATION_CONFLICT", "invocationId was already used in this run", 409);

    let result;
    try {
      result = await executeBrandRole({
        ai: this.env.AI,
        run,
        role,
        invocationId,
        evidence: command.evidence ?? []
      });
    } catch (error) {
      run.audit.push({
        event: "ROLE_EXECUTION_FAILED",
        at: new Date().toISOString(),
        role,
        invocationId,
        code: error?.code ?? "ROLE_EXECUTION_ERROR",
        message: String(error?.message ?? error).slice(0, 500)
      });
      await this.writeRun(run);
      if (error instanceof BrandRoleError) {
        throw new BrandRoleError(error.code, `${role}: ${error.message}`, error.status);
      }
      throw error;
    }

    run.pendingArtifact = { ...result.artifact, status: "PENDING" };
    run.pendingExecution = {
      invocationId: result.invocationId,
      role: result.role,
      model: result.model,
      contextManifest: result.contextManifest,
      evidenceManifest: result.evidenceManifest
    };
    run.invocationIds.push(invocationId);
    run.audit.push({
      event: "ROLE_EXECUTED",
      at: new Date().toISOString(),
      role,
      invocationId,
      artifactId: result.artifact.artifactId,
      type: result.artifact.type,
      model: BRAND_ROLE_MODEL
    });
    await this.writeRun(run);
    return structuredClone({ ...run.pendingExecution, artifact: run.pendingArtifact, replayed: false });
  }

  async acceptArtifact(command) {
    const run = await this.readRun();
    if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run does not exist", 404);
    if (!run.pendingArtifact) throw new BrandRoleError("NO_PENDING_ARTIFACT", "There is no pending artifact to accept", 409);
    const artifactId = safeId(command.artifactId, "artifactId", 160);
    if (run.pendingArtifact.artifactId !== artifactId) throw new BrandRoleError("STALE_ARTIFACT", "artifactId does not match the current pending artifact", 409);

    const accepted = { ...run.pendingArtifact, status: "ACCEPTED" };
    run.acceptedArtifacts.push(accepted);
    run.pendingArtifact = null;
    run.pendingExecution = null;
    run.audit.push({
      event: "ARTIFACT_ACCEPTED",
      at: new Date().toISOString(),
      artifactId: accepted.artifactId,
      type: accepted.type,
      producer: accepted.producer,
      revision: accepted.revision
    });

    if (accepted.producer === BRAND_ROLE.BRAND_QA && accepted.payload?.decision === "FAIL") {
      run.status = "REWORK_REQUIRED";
      run.audit.push({
        event: "QA_REWORK_REQUIRED",
        at: new Date().toISOString(),
        targets: accepted.payload?.rework_targets ?? [],
        criticalFailures: accepted.payload?.critical_failures ?? []
      });
    } else {
      run.nextRoleIndex += 1;
      if (run.nextRoleIndex >= run.route.length) {
        run.status = "COMPLETED";
        run.audit.push({ event: "RUN_COMPLETED", at: new Date().toISOString() });
      } else {
        run.audit.push({ event: "HANDOFF_READY", at: new Date().toISOString(), nextRole: run.route[run.nextRoleIndex] });
      }
    }

    return await this.writeRun(run);
  }

  async prepareRework(maxReworkCycles = 2) {
    const run = await this.readRun();
    if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run does not exist", 404);
    if (run.status !== "REWORK_REQUIRED") return publicRun(run);

    const qa = [...run.acceptedArtifacts].reverse().find((artifact) =>
      artifact.type === "qa-report" && artifact.payload?.decision === "FAIL"
    );
    if (!qa) throw new BrandRoleError("QA_FAIL_ARTIFACT_REQUIRED", "REWORK_REQUIRED has no failed QA artifact", 409);

    const nextCycle = Number(run.reworkCycle ?? 0) + 1;
    if (nextCycle > maxReworkCycles) {
      run.status = "BLOCKED";
      run.audit.push({
        event: "REWORK_LIMIT_REACHED",
        at: new Date().toISOString(),
        cycle: nextCycle - 1,
        maxReworkCycles
      });
      return await this.writeRun(run);
    }

    const targets = Array.isArray(qa.payload?.rework_targets) ? qa.payload.rework_targets : [];
    const targetIndexes = targets
      .map((role) => run.route.indexOf(role))
      .filter((index) => index >= 0 && run.route[index] !== BRAND_ROLE.BRAND_QA);
    if (targetIndexes.length === 0) {
      throw new BrandRoleError("QA_REWORK_ROUTE_INVALID", "Brand QA FAIL did not identify a routed specialist target", 502);
    }

    const targetIndex = Math.min(...targetIndexes);
    run.reworkCycle = nextCycle;
    run.nextRoleIndex = targetIndex;
    run.status = "ACTIVE";
    run.finalResult = null;
    run.audit.push({
      event: "REWORK_STARTED",
      at: new Date().toISOString(),
      cycle: nextCycle,
      targetRole: run.route[targetIndex],
      requestedTargets: targets
    });
    return await this.writeRun(run);
  }

  async runAutonomous(command) {
    let run = await this.readRun();
    if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run does not exist", 404);
    const maxReworkCycles = Math.max(0, Math.min(3, Number(command.maxReworkCycles ?? 2)));
    const evidence = Array.isArray(command.evidence) ? command.evidence : [];
    const maxSteps = Math.max(8, run.route.length * (maxReworkCycles + 2) + 4);
    let steps = 0;

    while (steps < maxSteps) {
      run = await this.readRun();
      if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run disappeared", 500);

      if (run.status === "REWORK_REQUIRED") {
        await this.prepareRework(maxReworkCycles);
        run = await this.readRun();
        if (run.status === "BLOCKED") return publicRun(run);
      }

      if (run.status === "COMPLETED") {
        if (!run.finalResult) {
          run.finalResult = await assembleBrandResult({ ai: this.env.AI, run });
          run.audit.push({ event: "FINAL_RESULT_ASSEMBLED", at: new Date().toISOString(), model: BRAND_ROLE_MODEL });
          await this.writeRun(run);
        }
        return publicRun(await this.readRun());
      }

      if (run.status !== "ACTIVE") return publicRun(run);

      const role = run.route[run.nextRoleIndex];
      if (!role) throw new BrandRoleError("ROUTE_EXHAUSTED", "Active run has no next role", 500);
      const invocationId = `auto-${run.reworkCycle ?? 0}-${run.nextRoleIndex}-${role}`;
      const roleEvidence = role === BRAND_ROLE.SOURCE_TRUTH ? evidence : [];

      const execution = await this.executeRole({
        role,
        invocationId,
        evidence: roleEvidence
      });
      await this.acceptArtifact({ artifactId: execution.artifact.artifactId });
      steps += 1;
    }

    run = await this.readRun();
    run.status = "BLOCKED";
    run.audit.push({ event: "AUTONOMOUS_STEP_LIMIT_REACHED", at: new Date().toISOString(), steps, maxSteps });
    await this.writeRun(run);
    return publicRun(run);
  }

  async rejectArtifact(command) {
    const run = await this.readRun();
    if (!run) throw new BrandRoleError("RUN_NOT_FOUND", "Brand run does not exist", 404);
    if (!run.pendingArtifact) throw new BrandRoleError("NO_PENDING_ARTIFACT", "There is no pending artifact to reject", 409);
    const artifactId = safeId(command.artifactId, "artifactId", 160);
    if (run.pendingArtifact.artifactId !== artifactId) throw new BrandRoleError("STALE_ARTIFACT", "artifactId does not match the current pending artifact", 409);

    const reason = clean(command.reason, 500) || "orchestrator rejected specialist artifact";
    const rejected = { ...run.pendingArtifact, status: "REJECTED", rejectionReason: reason };
    run.rejectedArtifacts.push(rejected);
    run.pendingArtifact = null;
    run.pendingExecution = null;
    run.audit.push({
      event: "ARTIFACT_REJECTED",
      at: new Date().toISOString(),
      artifactId: rejected.artifactId,
      producer: rejected.producer,
      reason
    });
    return await this.writeRun(run);
  }

  async fetch(request) {
    try {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/run") return json(publicRun(await this.readRun()) ?? { error: "not_found" }, (await this.readRun()) ? 200 : 404);
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const body = await request.json();
      if (url.pathname === "/create") return json(await this.createRun(body), 201);
      if (url.pathname === "/execute") return json(await this.executeRole(body));
      if (url.pathname === "/accept") return json(await this.acceptArtifact(body));
      if (url.pathname === "/reject") return json(await this.rejectArtifact(body));
      if (url.pathname === "/auto") return json(await this.runAutonomous(body));
      return json({ error: "not_found" }, 404);
    } catch (error) {
      if (error instanceof BrandRoleError) return json({ error: error.code, message: error.message }, error.status);
      return json({ error: "INTERNAL_ERROR", message: String(error?.message ?? error) }, 500);
    }
  }
}

export const AGENT_RUNTIME_TOOLS = Object.freeze([
  {
    name: "run_brand_task",
    title: "Run VIIVERSION Brand Architect autonomously",
    description: "Run the complete routed Brand Architect workflow: specialist Workers AI executions, automatic artifact acceptance, Brand QA, bounded rework, and final result assembly. Live/current tasks must include brokered Source of Truth evidence gathered through the user's connected Google Drive app.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string", minLength: 1, maxLength: 5000 },
        run_id: { type: "string" },
        surface: { type: "string" },
        current_state: { type: "boolean" },
        final_public: { type: "boolean" },
        implementation: { type: "boolean" },
        max_rework_cycles: { type: "integer", minimum: 0, maximum: 3 },
        observed_at: { type: "string" },
        source_classes: { type: "array", items: { type: "string" } },
        tabs_read: { type: "array", items: { type: "string" } },
        source_evidence: {
          type: "array",
          items: {
            type: "object",
            required: ["evidenceId", "source", "content"],
            properties: {
              evidenceId: { type: "string" },
              source: { type: "string" },
              content: {}
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true }
  },

  {
    name: "create_agent_run",
    title: "Create VIIVERSION Brand Architect run",
    description: "Create a persistent Brand Architect run in a Durable Object and freeze its specialist-role route.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string", minLength: 1, maxLength: 5000 },
        run_id: { type: "string" },
        surface: { type: "string" },
        current_state: { type: "boolean" },
        final_public: { type: "boolean" },
        implementation: { type: "boolean" }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "execute_agent_role",
    title: "Execute next Brand Architect specialist",
    description: "Execute the next routed specialist as an isolated Workers AI call. The generated artifact remains PENDING until the Orchestrator accepts it.",
    inputSchema: {
      type: "object",
      required: ["run_id", "role", "invocation_id"],
      properties: {
        run_id: { type: "string" },
        role: { type: "string" },
        invocation_id: { type: "string" },
        evidence: {
          type: "array",
          items: {
            type: "object",
            required: ["evidenceId", "source", "content"],
            properties: {
              evidenceId: { type: "string" },
              source: { type: "string" },
              content: {}
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true }
  },
  {
    name: "accept_agent_artifact",
    title: "Accept Brand Architect specialist artifact",
    description: "Accept the current PENDING specialist artifact and hand the run to the next routed role.",
    inputSchema: {
      type: "object",
      required: ["run_id", "artifact_id"],
      properties: {
        run_id: { type: "string" },
        artifact_id: { type: "string" }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "reject_agent_artifact",
    title: "Reject Brand Architect specialist artifact",
    description: "Reject the current PENDING artifact, keep the run on the same specialist role, and record the reason.",
    inputSchema: {
      type: "object",
      required: ["run_id", "artifact_id", "reason"],
      properties: {
        run_id: { type: "string" },
        artifact_id: { type: "string" },
        reason: { type: "string" }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false }
  },
  {
    name: "get_agent_run",
    title: "Get Brand Architect run state",
    description: "Read persistent role route, accepted/pending artifacts, handoff state and audit trail for one Brand Architect run.",
    inputSchema: {
      type: "object",
      required: ["run_id"],
      properties: { run_id: { type: "string" } },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }
]);

async function callStub(env, runId, path, method = "POST", body = null) {
  if (!env?.BRAND_RUNS) throw new BrandRoleError("RUN_BINDING_MISSING", "BRAND_RUNS Durable Object binding is required", 503);
  const safeRunId = safeId(runId, "run_id");
  const id = env.BRAND_RUNS.idFromName(safeRunId);
  const requestInit = {
    method,
    headers: { "content-type": "application/json" },
    body: body === null ? undefined : JSON.stringify(body)
  };

  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const stub = env.BRAND_RUNS.get(id);
      const response = await stub.fetch(`https://brand-run.internal${path}`, requestInit);
      const payload = await response.json();
      if (!response.ok) throw new BrandRoleError(payload.error ?? "RUN_ERROR", payload.message ?? "Brand run operation failed", response.status);
      return payload;
    } catch (error) {
      lastError = error;
      const message = String(error?.message ?? error);
      const transientReset = /Durable Object reset because its code was updated/i.test(message);
      if (!transientReset || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
  throw lastError;
}

export async function executeAgentRuntimeTool(env, name, args = {}) {
  if (name === "run_brand_task") {
    const liveGate = validateLiveContext({
      task: args.task,
      surface: args.surface,
      current_state: Boolean(args.current_state),
      final_public: Boolean(args.final_public),
      implementation: Boolean(args.implementation),
      observed_at: args.observed_at,
      source_classes: args.source_classes ?? [],
      tabs_read: args.tabs_read ?? []
    });
    if (liveGate.strict && !liveGate.pass) {
      throw new BrandRoleError(
        "LIVE_CONTEXT_REQUIRED",
        `Live Source of Truth gate failed; missing classes: ${liveGate.missingSourceClasses.join(", ") || "none"}; missing tabs: ${liveGate.missingTabs.join(", ") || "none"}`,
        422
      );
    }
    const runId = clean(args.run_id, 96) || `brand-${crypto.randomUUID()}`;
    await callStub(env, runId, "/create", "POST", {
      runId,
      task: args.task,
      surface: args.surface,
      flags: {
        current_state: Boolean(args.current_state),
        final_public: Boolean(args.final_public),
        implementation: Boolean(args.implementation)
      }
    });
    return await callStub(env, runId, "/auto", "POST", {
      evidence: args.source_evidence ?? [],
      maxReworkCycles: args.max_rework_cycles ?? 2
    });
  }
  if (name === "create_agent_run") {
    const runId = clean(args.run_id, 96) || `brand-${crypto.randomUUID()}`;
    return await callStub(env, runId, "/create", "POST", {
      runId,
      task: args.task,
      surface: args.surface,
      flags: {
        current_state: Boolean(args.current_state),
        final_public: Boolean(args.final_public),
        implementation: Boolean(args.implementation)
      }
    });
  }
  if (name === "execute_agent_role") {
    return await callStub(env, args.run_id, "/execute", "POST", {
      role: args.role,
      invocationId: args.invocation_id,
      evidence: args.evidence ?? []
    });
  }
  if (name === "accept_agent_artifact") {
    return await callStub(env, args.run_id, "/accept", "POST", { artifactId: args.artifact_id });
  }
  if (name === "reject_agent_artifact") {
    return await callStub(env, args.run_id, "/reject", "POST", { artifactId: args.artifact_id, reason: args.reason });
  }
  if (name === "get_agent_run") {
    return await callStub(env, args.run_id, "/run", "GET");
  }
  return null;
}
