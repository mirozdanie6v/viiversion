# ADR-0001 — Unified Mark Architecture (draft)

**Status:** PROPOSED — Founder review required
**Date:** 2026-10-27
**Decision owner:** Founders VIIVERSION
**Scope:** VIIVERSION Brain; does not alter other product production runtimes.

## Context

Previous Brain work concentrated on D1, HTTP auth, deployment, run persistence, private commitments and restoration. Scoped v0.1 verification was successful, but did **not** build the intended autonomous Mark capable of keeping a shared live work context across connected ChatGPT chats and authoritative internal sources.

Several existing documents already describe the CEO mandate, cognitive memory types, registry, decision journal and operating loop. They are not a single approved implementation contract and contain assumptions about the runtime that have not been proven, in particular active chat integration and global checkpoint isolation.

## Decision proposed

Adopt [MARK_ARCHITECTURE_PROPOSAL.md](MARK_ARCHITECTURE_PROPOSAL.md) and [MARK_ROADMAP_PROPOSAL.md](MARK_ROADMAP_PROPOSAL.md) as the canonical *proposed* unified Mark target. Architecture is one modular system with five functional parts: long-term memory including Mark identity; working context; cognition/processing/learning/action; internal sources and living registry; external sources including explicitly connected chats and the internet.

Reuse currently deployed Brain Worker/D1; introduce no independent new platform, database or queue without a demonstrated gap. Protect core identity and explicit founder authority; allow Mark to revise evidence-backed knowledge. Maintain provenance and ordered, recoverable changes. Detailed source information is queried on demand, not bulk mirrored to permanent memory.

M0 proves whether automatic context intake from **ordinary selected ChatGPT chats** is technically supported before promising functionality or scaling data ingestion. No manual inventory or one-off import substitutes for a verified live intake mechanism.

## Alternatives

- **Periodic wholesale registry import** — REJECT as primary method: stale immediately and does not solve context intake.
- **Many autonomous agents, services and databases** — NOT JUSTIFIED: more coordination, deployment and state-consistency failure modes.
- **Only a tool-enabled chatbot with no independent memory** — REJECT: fails cross-session identity and memory continuity.
- **Claim existing MCP plugin grants passive full-chat access** — REJECT until live product proof: tool availability does not imply observing every message.

## Consequences / risks

Advantages: single ownership of state, interpretable evidence and permissions, one cognitive flow, minimal new failure surfaces. Trade-offs: modularity and migrations must be disciplined; genuine chat integration feasibility is a blocking external dependency. Historical stage-1 acceptance remains valid only for verified v0.1 scope.

## Approval protocol

This ADR does not become **ACCEPTED** merely because the PR is merged or a build passes. Required:
1. Founder explicitly accepts the five-part architecture and scope.
2. Founder accepts controlled identity change and action authority principles.
3. M0 feasibility evidence for automatic intake in ordinary selected chats is recorded; if still unresolved, mark the specific capability blocked, without making false claims.
4. Founder approves phased acceptance contract and target integration path into the GitHub canonical branch.
5. Decision entered into `../DECISION_JOURNAL.md` and links added to the Brain entrypoint.

Upon approval, change status to ACCEPTED with dated approval reference, without deleting pre-existing records. Historical assumptions superseded by this ADR must be identified explicitly. Until then, this PR is documentation for review only, **not a deployment authorization**.
