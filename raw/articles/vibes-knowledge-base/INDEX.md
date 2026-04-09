# Knowledge Base Index

This is the master index of all wiki articles. Read this file first to understand what's available, then drill into specific articles as needed.

## Tier 1 — Always Read First

- [MVP Philosophy](01-mvp-philosophy.md) — Core principles: monolith-first, ship the core loop, cut scope not corners, deploy from day one.
- [Decision Trees](02-decision-trees.md) — Opinionated routing for platform, database, auth, hosting, storage, styling, state, payments, and email decisions.
- [File Structure Conventions](03-file-structure-conventions.md) — Golden path folder layouts for React Native + Expo, Next.js, Supabase, and agent projects.

## Tier 2 — Read When Relevant

- [Data Modeling Patterns](04-data-modeling-patterns.md) — Schema design for Supabase/Postgres MVPs: fewer tables, JSONB, UUIDs, RLS patterns, PostGIS spatial queries.
- [State Management](05-state-management.md) — When to use useState, URL params, TanStack Query, or Zustand. Rules for what goes where.
- [API & Data Flow](06-api-data-flow.md) — Supabase client as API, Edge Functions for server-only logic, error handling, optimistic updates, realtime.
- [Agent Automation Patterns](07-agent-automation-patterns.md) — Plan-execute-validate loop, tool schema design, MCP integration, state between turns, prompt structure.
- [Security & Auth Baseline](08-security-auth-baseline.md) — Env vars, Supabase Auth, RLS, CORS, rate limiting, input validation. The minimum floor.
- [Testing Philosophy](09-testing-philosophy.md) — Test the critical path E2E, test data mutations, test tricky logic. Skip component rendering tests.
- [Dependency Selection Heuristic](10-dependency-selection.md) — When to add a dependency, pre-approved libraries, red flags, vendoring vs. installing.

## Tier 3 — Reference

- [Reference ADRs](11-reference-adrs.md) — Architecture Decision Records from Cairn: Supabase+PostGIS, Privy, Storacha, React Native+Expo. Includes ADR template.
- [Anti-Patterns](12-anti-patterns.md) — Premature microservices, over-abstraction, auth before core loop, admin panels, gold-plated error handling, and other traps.
