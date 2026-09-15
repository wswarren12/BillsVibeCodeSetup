# ADR: PLAA schema specification uses plain PostgreSQL migrations

**Date:** 2026-09-08
**Status:** accepted

## Context

The user requested implementation of the existing PLAA schema PRD in `~/Desktop/PLAA_Schemas/`. The supplied specification explicitly requires a PostgreSQL migration repository, PostgreSQL 16 compatibility, numeric generated participant keys, and three schemas (`plaa`, `ingest`, `export`). The directory contains no application, existing migration framework, Git checkout or plaa-sync implementation.

## Decision

Implement the supplied database contract with ordered SQL migrations and disposable PostgreSQL tests, not a newly scaffolded web/agent application. Follow the PRD's generated bigint `aa_id` plus external UUID and temporal typed identities instead of the vault's generic UUID-only advice. Do not add Drizzle, a hosted database, frontend, application-layer scaffolding or dependency-cruiser to a SQL-only schema deliverable. Future consuming applications remain subject to the normal Onion/Hexagonal workflow; this decision does not waive their domain discovery.

The core is the PRD's immutable, source-backed participant points/holdings history and controlled corrections, with temporal identity/configuration and governed access. Source ingestion, Directory authentication, admin workflows and warehouse delivery are external integration boundaries. Their production implementation and owner approval are not established by schema construction.

## Consequences

### Positive

- Matches the user's existing explicit schema specification without an unrelated application stack.
- Native PostgreSQL constraints and transactions enforce the database contract directly.
- Local synthetic validation needs no cloud service or production credentials.

### Negative

- No generated application types or ORM migration tooling; consumers must add their own adapters and compatibility tests.
- Database owner/superuser remains a trusted authority; SQL cannot verify a browser session or approve economic/export policies.

### Neutral

- This is not production backfill, an existing-database upgrade, GitHub publication, or operational cutover authorization.
- Unapproved economic/privacy policies stay fail-closed.

## Related

- [[architecture/database]]
- [[decisions/adr-005-onion-hexagonal-default]]
