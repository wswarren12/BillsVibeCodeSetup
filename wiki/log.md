# Operations Log

Chronological record of all wiki operations. Append-only.

---

## [2026-04-06] init | Knowledge Base Created

- Created vault structure
- Wrote schema layer (CLAUDE.md)
- Wrote stack pages: web, mobile, agents, web3
- Wrote architecture decision trees (10 pages)
- Wrote workflow templates: feature-dev, bug-fix, ingest
- Created ADR template and index

## [2026-04-09] ingest | Vibes Knowledge Base (14 articles)

**Sources added:** `raw/articles/vibes-knowledge-base/` (14 files: INDEX, CLAUDE, 01-mvp-philosophy through 12-anti-patterns)

**Conflict resolution:** Source material defaulted to Supabase + RLS, while the existing wiki defaulted to Vercel + Next.js + Neon + Drizzle. Resolved with **Option D — tiered defaults**: Supabase as MVP tier, Neon + Drizzle as production tier. Every architectural page now documents both tiers with explicit "use when" criteria.

**New pages created:**
- `principles/mvp-philosophy.md` — The constitution
- `principles/anti-patterns.md` — 10 traps to avoid
- `principles/dependency-selection.md` — When to add a dependency
- `patterns/file-structure.md` — RN+Expo, Next.js, Supabase, agent layouts
- `patterns/data-modeling.md` — JSONB, UUIDs, RLS, PostGIS
- `patterns/data-flow.md` — Supabase client IS the API
- `patterns/agent-automation.md` — Plan-execute-validate loop
- `architecture/security.md` — Env vars, RLS, CORS, rate limiting, validation
- `decisions/adr-001-supabase-postgis.md`
- `decisions/adr-002-privy-web3-auth.md`
- `decisions/adr-003-storacha-decentralized-storage.md`
- `decisions/adr-004-react-native-expo.md`

**Pages rewritten with Option D tiered framing:**
- `architecture/database.md` — Supabase MVP tier / Neon + Drizzle production tier
- `architecture/api-design.md` — Supabase client direct / Server Actions
- `architecture/state-management.md` — TanStack Query + Zustand / Server Components + Server Actions
- `architecture/auth.md` — Added Privy decision criteria, cross-links to security.md
- `architecture/testing.md` — Merged BDD/Playwright workflow with inverted pyramid philosophy

**Pages updated with cross-links:**
- `stacks/web.md`, `stacks/mobile.md`, `stacks/agents.md` — linked to patterns/file-structure, tier notes added
- `index.md` — added Principles, Patterns, and ADR sections
