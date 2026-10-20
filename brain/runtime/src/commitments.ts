export type CommitmentStatus = "approved" | "canceled";
export type ActionStatus = "open" | "blocked" | "done";
export type EvidenceType = "founder_confirmation" | "client_correspondence" | "approved_document" | "engineering_record";

export interface CommitmentAction {
  id: string;
  description: string;
  order: number;
  status: ActionStatus;
  dependsOn?: string[];
}

export interface ApprovedCommitment {
  id: string;
  project: string;
  key: string;
  revision: number;
  status: CommitmentStatus;
  statement: string;
  approvedBy: string;
  effectiveAt: string;
  source: { type: EvidenceType; ref: string; observedAt: string };
  supersedes?: string;
  actions: CommitmentAction[];
}

const ID = /^[A-Za-z0-9_.:-]{3,100}$/;
const DATE = /^\d{4}-\d\d-\d\d(?:T\d\d:\d\d:\d\d(?:\.\d+)?Z)?$/;
const validText = (v: unknown, max = 2000): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const sorted = <T>(xs: T[], compare: (a: T, b: T) => number) => [...xs].sort(compare);

export function validateCommitment(value: unknown): ApprovedCommitment {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("INVALID_COMMITMENT");
  const v = value as Record<string, unknown>;
  if (!validText(v.id, 100) || !ID.test(v.id) ||
      !validText(v.project, 100) || !ID.test(v.project) ||
      !validText(v.key, 100) || !ID.test(v.key) ||
      !Number.isSafeInteger(v.revision) || Number(v.revision) < 1 ||
      !["approved", "canceled"].includes(String(v.status)) ||
      !validText(v.statement) || !validText(v.approvedBy, 120) ||
      !validText(v.effectiveAt, 35) || !DATE.test(v.effectiveAt)) throw Error("INVALID_COMMITMENT");
  const source = v.source as Record<string, unknown> | undefined;
  if (!source || !["founder_confirmation", "client_correspondence", "approved_document", "engineering_record"].includes(String(source.type)) ||
      !validText(source.ref, 1024) || !validText(source.observedAt, 35) || !DATE.test(source.observedAt))
    throw Error("INVALID_SOURCE");
  if (v.supersedes !== undefined && (!validText(v.supersedes, 100) || !ID.test(v.supersedes)))
    throw Error("INVALID_SUPERSEDES");
  if (!Array.isArray(v.actions) || v.actions.length > 40 || (v.status === "canceled" && v.actions.length))
    throw Error("INVALID_ACTIONS");
  const ids = new Set<string>();
  const actions: CommitmentAction[] = v.actions.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw Error("INVALID_ACTION");
    const a = item as Record<string, unknown>;
    if (!validText(a.id, 100) || !ID.test(a.id) || ids.has(a.id) ||
        !validText(a.description) || !Number.isSafeInteger(a.order) || Number(a.order) < 1 ||
        !["open", "blocked", "done"].includes(String(a.status)))
      throw Error("INVALID_ACTION");
    ids.add(a.id);
    if (a.dependsOn !== undefined &&
        (!Array.isArray(a.dependsOn) || a.dependsOn.length > 20 ||
         !a.dependsOn.every((x: unknown) => typeof x === "string" && ID.test(x))))
      throw Error("INVALID_DEPENDENCIES");
    return {
      id: a.id as string, description: a.description as string, order: a.order as number,
      status: a.status as ActionStatus,
      ...(a.dependsOn ? {dependsOn: [...new Set(a.dependsOn as string[])]} : {}),
    };
  });
  return {
    id: v.id as string, project: v.project as string, key: v.key as string,
    revision: v.revision as number, status: v.status as CommitmentStatus,
    statement: v.statement as string, approvedBy: v.approvedBy as string,
    effectiveAt: v.effectiveAt as string,
    source: {type: source.type as EvidenceType, ref: source.ref as string, observedAt: source.observedAt as string},
    ...(v.supersedes ? {supersedes: v.supersedes as string} : {}),
    actions,
  };
}

export function verifyRevision(next: ApprovedCommitment, previous: ApprovedCommitment | null) {
  if (!previous) {
    if (next.revision !== 1 || next.supersedes !== undefined) throw Error("INITIAL_REVISION_REQUIRED");
  } else {
    if (next.revision !== previous.revision + 1 || next.supersedes !== previous.id ||
        next.project !== previous.project || next.key !== previous.key) throw Error("SUPERSESSION_REQUIRED");
  }
}

export interface ExecutionPlan {
  schemaVersion: 1;
  commitments: Array<{id: string; project: string; key: string; revision: number; statement: string; sourceRef: string}>;
  actions: Array<{id: string; project: string; description: string; status: "ready" | "blocked";
    blockers: string[]; order: number; commitmentId: string}>;
}

// This is deliberately a deterministic execution plan, NOT an AI-generated recommendation.
// It only reproduces founder-approved next steps and NEVER infers new prices, promises or schedules.
export function buildExecutionPlan(records: ApprovedCommitment[]): ExecutionPlan {
  const latest = new Map<string, ApprovedCommitment>();
  for (const record of records) {
    const k = record.project + ":" + record.key;
    const prior = latest.get(k);
    if (!prior || record.revision > prior.revision) latest.set(k, record);
  }
  const active = sorted([...latest.values()].filter(r => r.status === "approved"),
    (a, b) => a.project.localeCompare(b.project) || a.key.localeCompare(b.key));
  const actions = active.flatMap(r => r.actions.map(action => ({...action, project: r.project, commitmentId: r.id})));
  const byId = new Map<string, typeof actions[number]>();
  for (const action of actions) {
    const key = action.project + ":" + action.id;
    if (byId.has(key)) throw Error("DUPLICATE_ACTIVE_ACTION");
    byId.set(key, action);
  }
  const remaining = actions.filter(x => x.status !== "done").map(action => {
    const blockers = [...(action.dependsOn || []).map(id => {
      const dependency = byId.get(action.project + ":" + id);
      if (!dependency) throw Error("MISSING_APPROVED_DEPENDENCY");
      return dependency.status === "done" ? null : id;
    }).filter((x): x is string => x !== null)];
    if (action.status === "blocked") blockers.push("explicitly_blocked");
    return {
      id: action.id, project: action.project, description: action.description,
      status: blockers.length ? "blocked" as const : "ready" as const,
      blockers, order: action.order, commitmentId: action.commitmentId,
    };
  });
  return {
    schemaVersion: 1,
    commitments: active.map(r => ({id: r.id, project: r.project, key: r.key,
      revision: r.revision, statement: r.statement, sourceRef: r.source.ref})),
    actions: sorted(remaining, (a, b) => a.order - b.order || a.project.localeCompare(b.project) || a.id.localeCompare(b.id)),
  };
}
