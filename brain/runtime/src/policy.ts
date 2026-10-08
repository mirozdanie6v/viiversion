export type DecisionRight="observe"|"recommend"|"plan"|"reversible_action"|"consequential_action";
export function requiresFounderApproval(right:DecisionRight){return right==="consequential_action"}
