# Database

> **Tiered defaults (Option D):** Supabase is the MVP default. Neon + Drizzle is the production-tier alternative when you need serverless-first Next.js or specific Drizzle/Server Actions workflows. Default to Supabase unless you have an articulable reason.

## Tier 1: MVP Default — Supabase

**Use when:** Starting a new project, validating a core loop, or building any app that needs Postgres + auth + storage + realtime in one place.

- **Database:** Supabase (managed Postgres)
- **Schema access:** Supabase client directly (RLS enforces authorization)
- **Migrations:** `supabase migration new` → SQL files → commit
- **Need spatial/geo?** Enable PostGIS extension. See [[decisions/adr-001-supabase-postgis]].
- **Need full-text search?** Postgres `tsvector`. Do not add Elasticsearch or Algolia.
- **Need vector search?** Supabase `pgvector` extension. Only if the core loop is semantic search.
- **Need key-value store?** A Postgres table with `key` and `value` columns. Do not add Redis for an MVP.
- **Need realtime?** Supabase Realtime (websockets). Use sparingly — most MVPs don't need it.

**Why Supabase as MVP default:** RLS lets the client call the database directly without a separate API layer. This collapses the stack: no Express server, no Server Actions boilerplate, no duplicate types between frontend and backend. Schema changes ship through SQL migrations and are version-controlled.

For data modeling patterns (JSONB, enums, UUIDs, timestamps, RLS policies), see [[patterns/data-modeling]].

## Tier 2: Production — Neon + Drizzle

**Use when:** Building a Next.js-native app that needs Server Actions + Server Components as the primary pattern, or when you specifically need type-safe migrations generated from TypeScript schemas, or when the Supabase BaaS model doesn't fit (e.g., multi-tenant with complex tenant isolation beyond RLS).

- **Database:** Neon Postgres (serverless, scales to zero, branches for preview envs)
- **ORM:** Drizzle — type-safe, SQL-like, lightweight, no query engine binary
- **Migrations:** `drizzle-kit generate` → `drizzle-kit migrate`
- **Data access:** Server Components for reads, Server Actions for writes. See [[architecture/api-design]].

**Why Neon + Drizzle for production tier:**
- Neon scales to zero (no idle cost) and has database branching for preview environments
- Drizzle has no query engine overhead (unlike Prisma) — matters for serverless cold starts
- Type-safe schemas generated from TypeScript, not from a separate schema DSL

## Decision: MVP vs. Production Tier

Choose **Supabase** (MVP tier) when any of these are true:
- Core loop needs spatial/geo queries (PostGIS)
- App has user-generated content with per-user access control (RLS is the simplest pattern)
- You want realtime subscriptions
- You want to ship the MVP without building a separate API layer
- Mobile + web share the same backend (Supabase clients exist for both)

Choose **Neon + Drizzle** (production tier) when any of these are true:
- App is Next.js-only and you want Server Actions as the primary mutation pattern
- You want types generated from your schema in TypeScript, not SQL
- You need preview-environment database branching tightly integrated with Vercel deploys
- The data model is complex enough that you want a TS-level schema and migration workflow

## Universal Rules

- **Web3 off-chain data:** Same as your current tier (Supabase or Neon). Don't spin up a separate database for Web3 data.
- **On-chain data:** Read via wagmi/viem — don't duplicate into your DB.
- **Always use migrations.** Never ad-hoc schema changes via the Supabase dashboard or a direct SQL run.
- **Always use `TIMESTAMPTZ`** (with timezone), not `TIMESTAMP`. Timezone-naive timestamps cause bugs.
- **Always use UUIDs for primary keys**, not serial integers. See [[patterns/data-modeling]].

## Anti-patterns

- Don't use Prisma — query engine overhead is real on serverless (prefer Drizzle or Supabase client).
- Don't duplicate on-chain data into Postgres — read directly via wagmi/viem.
- Don't reach for Elasticsearch/Algolia before trying Postgres `tsvector`.
- Don't introduce Redis, a separate analytics DB, or a vector store unless the core loop literally cannot function without it.
- Don't build a custom schema for role-based access control, team permissions, or org hierarchies in an MVP unless the core loop is team collaboration. See [[principles/anti-patterns]].

## Related

- [[patterns/data-modeling]] — JSONB, enums, UUIDs, RLS patterns, PostGIS
- [[decisions/adr-001-supabase-postgis]] — Why Supabase + PostGIS over Firebase
- [[architecture/api-design]] — How data flows from DB to UI
- [[principles/mvp-philosophy]] — Why "one database, one schema" is the rule

## Sources

- [[raw/articles/vibes-knowledge-base/02-decision-trees]]
- [[raw/articles/vibes-knowledge-base/04-data-modeling-patterns]]
- [[raw/articles/vibes-knowledge-base/11-reference-adrs]]
