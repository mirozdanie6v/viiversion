export interface WorkflowPayload { runId: string; kind?: "owner_production_acceptance" }
export function parseWorkflowPayload(raw: unknown): WorkflowPayload {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try { value = JSON.parse(raw); } catch { throw Error("INVALID_WORKFLOW_JSON_PAYLOAD"); }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("INVALID_WORKFLOW_PAYLOAD");
  const p = value as Record<string, unknown>;
  if (typeof p.runId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(p.runId)) throw Error("INVALID_WORKFLOW_RUN_ID");
  if (p.kind !== undefined && p.kind !== "owner_production_acceptance") throw Error("UNKNOWN_WORKFLOW_MODE");
  return { runId: p.runId, ...(p.kind !== undefined ? { kind: "owner_production_acceptance" as const } : {}) };
}