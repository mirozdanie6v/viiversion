import type { BrainRepository } from "./repository.ts";
import type { Decision } from "./contracts.ts";
import type { ApprovedCommitment } from "./commitments.ts";
import { buildExecutionPlan } from "./commitments.ts";

// Read-only snapshot: never promotes source observations into founder approval,
// and never claims that persisted records represent the whole company.
export interface UnifiedContextSources {
  loadDecisions(): Promise<Decision[]>;
  loadApprovedCommitments(): Promise<ApprovedCommitment[]>;
}

export async function loadUnifiedContext(repo: BrainRepository, sources: UnifiedContextSources) {
  const [state, checkpoint, decisions, approvedCommitments] = await Promise.all([
    repo.loadState(), repo.loadCheckpoint(), sources.loadDecisions(), sources.loadApprovedCommitments(),
  ]);
  const executionPlan = buildExecutionPlan(approvedCommitments);
  const readiness = {
    ready: false,
    checks: {
      checkpointPersisted: checkpoint !== null && state !== null,
      decisionsReadable: true,
      approvedCommitmentsReadable: true,
      companyRegistryHydrated: false,
      sourceReconciliationLive: false,
      executiveOperatingLoopImplemented: false,
      chatStartupHydrationIntegrated: false,
    },
    blockedBy: [
      "company_registry_not_hydrated",
      "authoritative_source_refresh_not_connected",
      "executive_operating_loop_incomplete",
      "chat_startup_hydration_not_integrated",
    ],
    scope: "partial_verified_memory_only" as const,
  };
  return {
    state, checkpoint, decisions, approvedCommitments, executionPlan, readiness,
  };
}
