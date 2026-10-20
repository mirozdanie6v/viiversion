import type { Decision } from "./contracts.ts";

// Canonical seed from brain/DECISION_JOURNAL.md, DJ-001.
// Timestamp denotes import into D1, not the original decision date.
export function canonicalDecision001(importedAt = new Date().toISOString()): Decision {
  return {
    id: "DJ-001",
    at: importedAt,
    question: "What should VIIVERSION establish before staffing AI departments?",
    decision: "Create VIIVERSION Brain as the canonical AI CEO, define governance and registries, then perform a factual Day-0 audit before deciding which roles or departments to instantiate.",
    rationale: "Organization design must follow verified company bottlenecks and state, not an assumed conventional organization chart.",
    evidenceClass: "verified_fact",
    expectedOutcome: "A canonical management layer, reliable Day-0 company map, and evidence-based first hiring/agent plan.",
  };
}
