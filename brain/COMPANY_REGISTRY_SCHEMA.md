# Company Registry Schema v0.1

Canonical inventory of what exists in VIIVERSION.

## Entity types
Person, Role, Department, Product, Repository, Domain, InfrastructureService, Integration, Client, Lead, Vendor, Document, FinancialObligation, CommercialOpportunity, Experiment, Project, Risk, Dependency, Decision, Asset.

## Required fields
- canonical_id
- entity_type
- name
- status
- owner
- description
- source_provenance
- confidence
- last_verified_at
- created_at
- updated_at
- relationships
- notes

## Status principle
Distinguish claimed, discovered, verified, active, dormant, deprecated, and unknown.

## Provenance principle
Important items should link where possible to GitHub, Linear, Google Drive, production URLs, contracts/invoices, client correspondence, or explicit founder confirmation.

## Relationship examples
client → product
product → repository
repository → deployment
product → domain
project → issue
decision → project
lead → commercial opportunity
role → person
risk → asset
dependency → product