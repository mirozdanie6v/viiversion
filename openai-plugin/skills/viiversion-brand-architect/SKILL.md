---
name: viiversion-brand-architect
description: >
  Use for VIIVERSION brand, product, website, proof, GTM, distribution and
  productization tasks. The skill uses the VIIVERSION Brand Architect MCP and
  must preserve evidence boundaries: current/final claims require supplied
  evidence; otherwise the result must remain snapshot-level or explicitly
  uncertain.
---

# VIIVERSION Brand Architect

Use the Brand Architect tools for VIIVERSION-specific brand, product, website,
proof, GTM, distribution and productization work.

## Core workflow

1. For stable identity or guardrails, use `get_brand_context`.
2. For snapshot product or software entities, use `get_priority_entities`.
3. For proof maturity and claim boundaries, use `get_proof`.
4. For productization planning, use `plan_productization`.
5. For current, final-public or implementation-sensitive tasks, call
   `get_required_evidence` first.
6. If the required evidence is already present in the conversation, pass only
   the relevant excerpts to `run_brand_task`.
7. If required evidence is missing, tell the user exactly what evidence is
   needed. Do not invent current status, readiness, pricing, proof maturity or
   approved decisions.
8. Use `validate_brand_output` when the user asks to review draft public copy.

## Evidence rules

- Treat tool snapshots as dated snapshots, not guaranteed current state.
- Never upgrade a prototype or demo into a production claim.
- Never invent prices, readiness, client results, integrations or distribution
  status.
- Do not request passwords, OAuth tokens, API keys, cookies, or full account
  exports.
- Pass only the minimum source evidence needed for the user's task.
- A missing current fact becomes an uncertainty or evidence request, not a
  plausible guess.

## Audit vs redesign

First classify the task as AUDIT or REDESIGN.

AUDIT:
- OBSERVED_CURRENT — what the supplied current material actually contains.
- CANONICAL_TARGET — the approved target or governing rule.
- VERDICT — MATCH or MISMATCH.
- REQUIRED_CHANGE — the smallest concrete change needed.

REDESIGN:
- current material and approved legacy copy are observed inputs, not mandatory
  creative targets;
- preserve hard L1-L3 identity and factual/evidence boundaries;
- distinguish hard constraints from legacy presentation decisions;
- create a materially new candidate presentation when the user rejects the
  existing structure/copy;
- do not restore old approved copy merely because it is approved;
- evaluate clarity against the proposed replacement itself.

Finding that the old page is unclear is not a successful redesign. A redesign
must contain a new candidate solution.

Do not describe a target state as if it were already implemented.

## Governance

VIIVERSION identity and canonical rules are read-only unless the user explicitly
asks to propose a change. A proposal is not an approved canonical change.

## Output

Return the useful user-facing result, not internal orchestration details.

For redesign requests, never return only MISMATCH / REQUIRED_CHANGE. Return a
fresh candidate presentation and make clear how it differs from the rejected
presentation.
