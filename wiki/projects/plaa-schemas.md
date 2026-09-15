# PLAA Schemas

**Local path:** `~/Desktop/PLAA_Schemas/`
**Repository:** https://github.com/protocol/PLAA_Schemas — private, owner-authorized creation/push on 2026-09-09; default branch `main`.
**Status:** SQL schema implementation and local synthetic verification; independent reviewer and production owner approvals outstanding.

The user requested the schemas in an existing revised PLAA PRD, examples and README/PR guidance. Seven ordered SQL migrations define 37 tables across `plaa`, `ingest` and `export`; protected runtime lifecycle APIs enforce source replay, temporal validity, compensated IA/IR settlement, Trust revision chains, audit and Directory-bound member RLS. No app or existing live database was changed. The owner subsequently authorized creation of the private Protocol Labs GitHub repository and pushing the baseline to `main`; no PR, deployment or production data operation was performed.

- **Core:** immutable source-backed participant points/holdings with controlled corrections and provenance.
- **Boundaries:** Directory backend authentication, source adapters/plaa-sync, admin UI, warehouse release builder and operational cutover are follow-on work.
- **Verification:** `make test` on PostgreSQL 16.10 Homebrew/Python 3.9.9: 7 fresh migrations, 7 checksum replays, modified-checksum rejection, 37-table introspection, 33 unittest methods passed. Docker daemon unavailable; native disposable cluster used. Local tests reran successfully before the 2026-09-09 push. GitHub CI started on the published commits; check the repository Actions tab for exact-head results, not the historical local report.
- **Examples:** `examples/synthetic.sql` fills every core/ingest table; `examples/export-preview.json` illustrates all seven release formats in temporary validation only. Real export tables stay empty and the builder rejects requests pending approved executable contracts.
- **Documentation:** README with PR workflow, schema/ERD, decision register, migration runbook and `docs/diego-review-resolution.md` findings-to-test matrix.
- **Open decisions:** production kudos/source economics, Directory integration, history/opening treatment, export privacy/utility and source-audience approvals, named owners/capacity/funding/gates, retention/replay/RPO/RTO and authorized source deletion.

## Lessons

Canonical entries: [[patterns/dev-environment]] (short private Unix socket paths), [[patterns/data-modeling]] (exact NUMERIC/NaN and empty-set validation), [[architecture/security-findings]] (explicit pg_temp ordering and audit reviewer attribution).

## Related

- [[decisions/2026-09-08-plaa-schema-sql]]
- [[projects/plaa-activity-bot]]
