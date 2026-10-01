export type WorkflowId = "sales" | "website" | "proposal" | "brand_governance";

const WORKFLOW_STEPS: Record<WorkflowId, readonly string[]> = {
  sales: [
    "lead_discovery",
    "qualification",
    "routing",
    "proof_selection",
    "messaging",
    "human_approval",
    "send_or_record",
    "reply_classification",
    "proposal",
    "follow_up",
    "result_record",
  ],
  website: [
    "source_check",
    "projection",
    "website_strategy",
    "copy_and_ia",
    "governance_gate",
    "implementation",
    "qa",
    "decision_update",
  ],
  proposal: [
    "context_load",
    "source_check",
    "diagnosis",
    "solution_routing",
    "proof_selection",
    "commercial_design",
    "proposal_build",
    "proposal_qa",
    "release_gate",
    "record_result",
  ],
  brand_governance: [
    "source_check",
    "classify_change",
    "evidence_review",
    "change_request",
    "strategic_review",
    "approval_gate",
    "canonical_update",
    "propagation_plan",
    "decision_record",
  ],
};

const APPROVAL_STEPS: Partial<Record<WorkflowId, string>> = {
  sales: "human_approval",
  website: "governance_gate",
  proposal: "release_gate",
  brand_governance: "approval_gate",
};

export function isWorkflowId(value: unknown): value is WorkflowId {
  return typeof value === "string" && value in WORKFLOW_STEPS;
}

export function firstStep(workflowId: WorkflowId): string {
  return WORKFLOW_STEPS[workflowId][0];
}

export function nextStep(workflowId: WorkflowId, currentStep: string): string | null {
  const steps = WORKFLOW_STEPS[workflowId];
  const index = steps.indexOf(currentStep);
  if (index < 0 || index === steps.length - 1) return null;
  return steps[index + 1];
}

export function isApprovalStep(workflowId: WorkflowId, step: string): boolean {
  return APPROVAL_STEPS[workflowId] === step;
}
