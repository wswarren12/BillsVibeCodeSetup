# ADR: Terminally Product uses the selected LabOS kit and bounded Messages orchestration

**Date:** 2026-09-09
**Status:** accepted

## Context

Bill requested the Product Decision Terminal PRD implemented on LabOS build kit v1.11 with managed Postgres. He explicitly approved the domain/core and all 60 research notes. The PRD permits a Messages API fallback to the Claude Agent SDK. The kit prescribes Next.js/Tailwind v4 and its own PL components, with 384Mi runtime memory and no documented authorization contract for confidential reviews. Standard vault defaults (Vercel/Neon/Drizzle/shadcn/Supabase Auth) do not match this selected platform.

## Decision

- Keep Onion/Hexagonal dependencies and a tested dependency-cruiser gate. Use project-root `app/src/` for the domain/application/infrastructure layers and Next route adapters; `app/` is independently deployable.
- Use Next.js, TypeScript, Tailwind v4 and vendored PL components from the kit, not another primitive UI library.
- Use platform Postgres through parameterized `pg` queries and numbered SQL migrations rather than adding Neon or a BaaS/ORM. The PRD's persistence is small, SQL-centric and one database serves all three jobs.
- Use the official Anthropic Messages SDK behind a model port for the bounded state machine. User-selected Sonnet serves ordinary roles; Opus serves senior judgment and chairman synthesis. This is a fit choice, not evidence the Agent SDK cannot run. Verify model IDs/capabilities before live calls and keep them configurable.
- Use shared application use cases for HTTP and MCP, not Server Actions duplicating the externally callable workflow. React local state covers the single-screen composer; do not add Zustand/React Hook Form without demonstrated need.
- Do not replace the missing platform authorization with custom auth or treat personalization as a verified principal. Production confidential endpoints deny access until the platform contract is established; deterministic synthetic/test adapters are local-only and cannot activate in production.
- Live knowledge-sync transport, deployment identity and MCP delegation remain open. A local import tool/test fixture is not claimed as automatic live git sync.

## User-authorized loopback-live exception — 2026-09-10

After local baseline `23b355f`, Bill explicitly approved the updates needed to run the full existing app locally with real Sonnet/Opus. This replaces only the former synthetic-only **local** restriction. `npm run dev:live` supplies a stable single-local-user principal in a separate explicit process composition, never a header/environment-selected production bypass. It binds `127.0.0.1` on an owned ephemeral port, checks the actual socket/exact Host/Origin, rejects forwarded routing and client owner selection, and retains production and remote MCP denial. Local programs/users on the machine are trusted; this is not multi-user authentication.

The user fills only their API key and account-supported exact Sonnet/Opus IDs in ignored 0600 `app/.env.local`; a tracked blank `.env.example`, native dotenv precedence and sanitized startup diagnostics replace ad-hoc secret handling. No key values are read-print or overwritten by implementation. The fixed owner-private `app/.data/local-live` PG16 cluster uses generated SCRAM credentials and verified loopback TLS, validates ownership/system identity, refuses duplicate/foreign/stale clusters, automatically migrates/imports the approved committed 60 notes and persists through stop/restart. No remote DB, host/port or mock-endpoint override is offered; PG_BIN is the executable-location override. Shutdown drains bounded request-owned checkpoints and retains data; crash recovery is explicit operator action, never automatic adoption/deletion.

The real SDK/model checkpoints, eight stages, gates, model-role routing and private default-off learning are reused. Live UI names costs and Anthropic/web-search transmission. Synthetic preview remains a separate provider-incapable disposable composition: explicit blank settings plus Next native test dotenv semantics exclude `.env.local` and prevent other files from restoring provider values. Genuine production build/smoke uses a dotenv/data-free controlled source copy rather than changing production to test mode.

Local HTTP/PG/SDK-network-mock and browser completion/export tests pass; no actual Models API, paid/live call or API key test was performed. Actual availability/judgment and human document handoff remain gates, as do production identity/MCP delegation, sync/scheduler, deployment and publication. This authorization is not deployment or live-quality acceptance.

## Consequences

### Positive

Honors the selected kit and PRD without duplicate auth/UI/storage stacks. Domain tests do not need live model keys. Bounded API calls avoid a code-execution runtime for a product interview.

### Negative

Production confidential access and automatic merge-to-database sync cannot be claimed complete until platform contracts are resolved. Docker resource fit and model quality still require actual verification. Direct SQL requires explicit ownership/concurrency tests.

### Neutral

Approved notes and local git promotion do not authorize publication or production deployment. Future learnings retain the human review gate.

## Related

- [[adr-005-onion-hexagonal-default]]
- [[../projects/terminally-product]]
- [[../patterns/pln-ai-apps]]
