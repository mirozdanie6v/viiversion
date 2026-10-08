# Mark Brain Runtime v0.1

Minimal Brain-owned bootstrap runtime. It intentionally does not import or modify Mini App Factory, AI Engineer, Demo Studio, Proposal Studio or ZL Web Agent.

v0.1 scope: persistent company state contract, objective/open-loop state, decision/event history, checkpoint/resume contract, deterministic CEO-loop lifecycle, idempotency key and founder-approval boundary.

Deployment target: a dedicated Cloudflare Worker with its own D1 database and one Workflow. Cloud resources are not provisioned by this commit.

Acceptance path: load Day-0 state -> create/resume run -> execute one CEO stage at a time -> persist checkpoint -> start a fresh session -> resume from checkpoint.

Deployment trigger refreshed after Cloudflare credentials provisioning.
