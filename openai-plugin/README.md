# VIIVERSION Brand Architect — OpenAI submission package

This directory is the public OpenAI Plugin package. It is intentionally separate
from the internal Brand Architect package and the internal MCP surface.

Submission endpoint:
`https://agent.viiversion.com/openai/mcp`

The public surface exposes only user-facing tools and does not expose internal
run-control, artifact-control, audit-log or debugging tools.

## Public behavior

- stable VIIVERSION identity and guardrails are available from a dated snapshot;
- current/final claims require relevant source evidence supplied with the task;
- missing evidence produces an evidence request instead of a guessed current fact;
- audits keep observed current state and canonical target separate;
- proof maturity is preserved;
- canonical changes are proposals until separately approved.

## Submission materials

The `submission/` folder contains listing copy, test cases, release notes,
tool-annotation notes, a recording outline, and a portal checklist.
