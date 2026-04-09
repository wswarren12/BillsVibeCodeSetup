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

## [2026-04-09] project-stubs | Active project CLAUDE.md + wiki stubs

**Context:** Adopting the Option D tiered framework across in-flight Claude Code projects. Step 1 (per-project CLAUDE.md) declares each project's tier + deviations for future Claude sessions; Step 2 (wiki stubs) indexes them in the knowledge base.

**Projects addressed:** AgentForge, Rootstock, NewsBreef, Cairn.

**Per-project CLAUDE.md created:**
- `~/Desktop/Vibes/AgentForge/CLAUDE.md` — MVP tier (Supabase), Next.js 16 + React 19 + Tailwind 4; notes canvas/spatial UI paradigm, no shadcn, deep Claude Code filesystem coupling
- `~/Desktop/Vibes/Rootstock/CLAUDE.md` — MVP tier (Supabase), Next.js 14 + React 18 + Tailwind 3; preserves garden/village metaphor vocabulary and calm-tech dependency on Framer Motion
- `~/Desktop/Summon/prototypes/NewsBreef/CLAUDE.md` — ⚠️ DEVIATION tier; documents Cloudflare D1 + KV + custom JWT via `jose` and the n8n Cloud workflow that is the actual product; includes a deviation table with "when to reconsider" criteria
- *Cairn skipped* — no code directory exists yet, only a PRD

**New wiki project stubs:**
- `wiki/projects/agentforge.md` — stack, architectural patterns (canvas + SSE + agent soul), tier reasoning
- `wiki/projects/rootstock.md` — stack, metaphor-first domain language, calm-tech patterns
- `wiki/projects/newsbreef.md` — explicitly-documented deviation from Supabase/Neon defaults with comparison table
- `wiki/projects/cairn.md` — PRD-stage stub mapping planned stack to ADRs 001-004 (which were originally derived from Cairn's requirements)

**Index updates:**
- `index.md` — added Projects section listing all four

**Why this matters:** Without per-project CLAUDE.md, Claude sessions inside each project directory won't know which tier applies or when deviations are intentional. The NewsBreef case is especially important — its Cloudflare D1 stack would otherwise look like a mistake to auto-correct toward Supabase.
