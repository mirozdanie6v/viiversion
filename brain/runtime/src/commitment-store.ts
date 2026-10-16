import type { D1 } from "./d1-repository.ts";
import { buildExecutionPlan, validateCommitment, verifyRevision, type ApprovedCommitment } from "./commitments.ts";

export class CommitmentStore {
  constructor(private readonly db: D1) {}

  async list(): Promise<ApprovedCommitment[]> {
    const rows = await this.db.prepare(
      "SELECT record_json FROM approved_commitments ORDER BY project,decision_key,revision LIMIT 5000"
    ).all<{record_json: string}>();
    return rows.results.map(x => validateCommitment(JSON.parse(x.record_json)));
  }

  async append(value: unknown): Promise<{replayed: boolean; commitment: ApprovedCommitment}> {
    const record = validateCommitment(value);
    // No model output may be silently promoted to an approved agreement. Only a
    // trusted bearer-token holder may call this API, with explicit provenance.
    const oldId = await this.db.prepare("SELECT record_json FROM approved_commitments WHERE id=?")
      .bind(record.id).first<{record_json: string}>();
    if (oldId) {
      const old = validateCommitment(JSON.parse(oldId.record_json));
      if (JSON.stringify(old) === JSON.stringify(record)) return {replayed: true, commitment: old};
      throw Error("COMMITMENT_ID_CONFLICT");
    }
    const current = await this.db.prepare(
      "SELECT record_json FROM approved_commitments WHERE project=? AND decision_key=? ORDER BY revision DESC LIMIT 1"
    ).bind(record.project, record.key).first<{record_json: string}>();
    verifyRevision(record, current ? validateCommitment(JSON.parse(current.record_json)) : null);
    try {
      await this.db.prepare(
        "INSERT INTO approved_commitments(id,project,decision_key,revision,supersedes,record_json,created_at) VALUES(?,?,?,?,?,?,?)"
      ).bind(record.id, record.project, record.key, record.revision, record.supersedes ?? null,
        JSON.stringify(record), new Date().toISOString()).run();
    } catch {
      throw Error("CONCURRENT_COMMITMENT_CONFLICT");
    }
    return {replayed: false, commitment: record};
  }

  async createPlan(): Promise<{id: string; replayed: boolean; plan: ReturnType<typeof buildExecutionPlan>}> {
    const plan = buildExecutionPlan(await this.list());
    const payload = JSON.stringify(plan);
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    const hash = [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, "0")).join("");
    const id = "PLAN-" + hash;
    const old = await this.db.prepare("SELECT plan_json FROM execution_plans WHERE id=?")
      .bind(id).first<{plan_json: string}>();
    if (old) return {id, replayed: true, plan: JSON.parse(old.plan_json)};
    await this.db.prepare("INSERT OR IGNORE INTO execution_plans(id,plan_json,created_at) VALUES(?,?,?)")
      .bind(id, payload, new Date().toISOString()).run();
    return {id, replayed: false, plan};
  }

  async loadPlan(id: string): Promise<unknown | null> {
    if (!/^PLAN-[a-f0-9]{64}$/.test(id)) throw Error("INVALID_PLAN_ID");
    const row = await this.db.prepare("SELECT plan_json FROM execution_plans WHERE id=?")
      .bind(id).first<{plan_json: string}>();
    return row ? JSON.parse(row.plan_json) : null;
  }
}
