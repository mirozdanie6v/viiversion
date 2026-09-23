export type WorkflowId = "sales" | "website";

const SALES_STEPS = [
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
] as const;

const WEBSITE_STEPS = [
  "source_check",
  "projection",
  "website_strategy",
  "copy_and_ia",
  "governance_gate",
  "implementation",
  "qa",
  "decision_update",
] as const;

export function firstStep(workflowId: WorkflowId): string {
  return workflowId === "sales" ? SALES_STEPS[0] : WEBSITE_STEPS[0];
}

export function nextStep(workflowId: WorkflowId, currentStep: string): string | null {
  const steps = workflowId === "sales" ? SALES_STEPS : WEBSITE_STEPS;
  const index = steps.indexOf(currentStep as never);
  if (index < 0 || index === steps.length - 1) return null;
  return steps[index + 1];
}

export function isApprovalStep(workflowId: WorkflowId, step: string): boolean {
  return (
    (workflowId === "sales" && step === "human_approval") ||
    (workflowId === "website" && step === "governance_gate")
  );
}
