# Public MCP tool annotations

Submission endpoint: `https://agent.viiversion.com/openai/mcp`

| Tool | readOnly | destructive | openWorld | Rationale |
|---|---:|---:|---:|---|
| get_brand_context | true | false | false | Reads a bounded VIIVERSION snapshot; no state changes or external fetches. |
| get_priority_entities | true | false | false | Reads bounded snapshot entities only. |
| get_proof | true | false | false | Reads bounded proof records only. |
| validate_brand_output | true | false | false | Computes validation from supplied text; does not persist or send data externally. |
| plan_productization | true | false | false | Computes a planning contract from supplied concept and bounded snapshot data. |
| get_required_evidence | true | false | false | Computes evidence requirements; does not access third-party accounts. |
| run_brand_task | false | false | false | Creates temporary persistent run state and executes Workers AI analysis. It does not delete/overwrite user data or access the public internet/open-ended external entities. |

The public surface intentionally does not expose internal debug tools such as
create/execute/accept/reject/get-run.
