# Operations Log

Chronological record of all wiki operations. Append-only.

---

## [2026-06-02] update | Payments page — production-learned rules + gotchas

**Source:** NewsBreef production incident, 2026-05-31. A 500 error on `/api/stripe/create-checkout` on `newsbreef.billsai.club` traced to a trailing newline embedded in the `NEXT_PUBLIC_APP_URL` Vercel env var, which corrupted Stripe's `success_url` and triggered `StripeInvalidRequestError | code: url_invalid`.

**Page updated:**
- `wiki/architecture/payments.md` — added three new **Rules** (sanitize redirect URLs via `new URL().origin`; surface Stripe `error.code`/`error.param`/`error.type` in logs; treat stored Stripe IDs as mode-scoped between test/live keys) and a new **Gotchas (production-learned)** section covering `NEXT_PUBLIC_*` build-time inlining, `echo`-vs-`printf` when piping into `vercel env add`, the local-works-prod-fails diagnostic heuristic, and the trap of over-sanitizing in your own debug repro.

**Why this matters:** The incident was diagnosable only after capturing live Vercel logs — the catch-all in the route handler hid the real Stripe error behind a generic 500. Three of the new rules are designed to prevent that diagnostic blindness from recurring on any future payment integration (NewsBreef or otherwise). The gotchas section captures lessons that don't live anywhere in code: they're about the dev-platform workflow around Stripe, not Stripe itself.

**Fix landed:** Commit `6616ae6` on `saas` branch, `wswarren12/NewsBreef`. Adds `web/lib/app-url.ts` helper, wires it into 5 call sites, ships 5 regression tests.

## [2026-06-01] add | New-project workflow + Onion/Hexagonal as default architecture

**Trigger:** User asked that whenever a new project is spun up, Claude push for Onion Architecture with Hexagonal adapters, ask clarifying questions to identify the domain, and especially identify the core. Decided: hard gate with explicit escape hatch, scoped to all four stacks (Web / Mobile / Agents / Web3).

**New pages:**
- `wiki/workflows/new-project.md` — 8-step project initialization workflow. Hard gate on Step 2 (Domain Discovery: 10-question battery covering purpose, vocabulary, invariants, boundaries) and Step 3 (Core Identification via the substitution test). Escape hatch for throwaway spikes requires explicit user "yes" and is logged in the project `CLAUDE.md`. Steps 4–8 cover ports/adapters mapping, stack selection, scaffolding from the Onion Project Template Block, dependency-cruiser canary test, and recording.
- `wiki/decisions/adr-005-onion-hexagonal-default.md` — ADR formalizing Onion + Hexagonal as default for every new project. Options considered: keep optional / soft recommendation / hard gate with escape hatch (chosen). Captures the reasoning that the conversation step makes boundaries conceptually correct while dependency-cruiser keeps them structurally enforced.

**Pages updated:**
- `CLAUDE.md` (vault root) — added two new sections: **"Default Architecture (every project)"** stating the single rule and pointing to the canonical onion notes, and **"New Project Initialization (hard gate)"** specifying the triggers, the must-stop behavior, and the escape-hatch wording. Also added the new-project workflow to the **Workflows** section.
- `wiki/index.md` — Workflows: added `new-project` as first entry. Decisions: added `adr-005`.

**Why this matters:** The vault already had the *what* (Onion MOC, Project Template Block with working `dependency-cruiser` gate) but no *when* — no mechanism to fire the workflow at project birth. A new project's structure is decided in the first few minutes; without a trigger in the vault `CLAUDE.md`, the agent's default to run `npx create-next-app` outruns the user's discipline. This change makes the workflow mechanical: future sessions read the vault `CLAUDE.md`, detect new-project signals, stop, run Domain Discovery, identify the core, and only then scaffold.

**Follow-up still deferred** (carried from 2026-06-01 onion-notes entry):
- `Onion Architecture — Overview.md`
- `Onion Architecture — Rules & Conventions.md`
- `Onion Architecture — Agent Rules (CLAUDE.md).md`
- `Onion Architecture — Stack Mapping.md`

The MOC and Project Template Block both reference these. They're not blockers for the new-project workflow (which links to the MOC and Template Block directly) but they will become navigation gaps as the new-project workflow gets used.

---

## [2026-06-01] add | Onion Architecture notes (MOC + Project Template Block)

**Source:** Two pre-authored canonical Obsidian notes from `~/Desktop/`, moved (not copied) into the vault.

**New pages:**
- `wiki/architecture/Onion Architecture — MOC.md` — Map of Content: the one rule (all deps point inward), paths through the material (new product / review / agent onboarding), reference implementation pointer
- `wiki/architecture/Onion Architecture — Project Template Block.md` — Filled-in starter kit: `CLAUDE.md` block, `.dependency-cruiser.cjs`, `package.json` verify scripts for a Next.js + Supabase single-package app

**Pages updated:**
- `wiki/index.md` — Architecture section: added both Onion entries

**Placement rationale:** Notes shipped with canonical frontmatter (`status: canonical`, `type: moc`/`template`) and Obsidian wikilinks — already finished material, so bypassed `raw/` and landed directly under `wiki/architecture/`.

**⚠️ Broken wikilinks (deferred):** Both notes reference four siblings that do not yet exist in the vault:
- `[[Onion Architecture — Overview]]`
- `[[Onion Architecture — Rules & Conventions]]`
- `[[Onion Architecture — Agent Rules (CLAUDE.md)]]`
- `[[Onion Architecture — Stack Mapping]]`

Until those are added, the MOC's table and "Paths through the material" callouts will have unresolved links. Plan: add them in a follow-up so the MOC becomes navigable.

**Why this matters:** Onion is positioned to become the default architecture for new projects (`CLAUDE.md` block + dependency-cruiser gate make it mechanical, not aspirational). Lives under `architecture/` alongside the tiered decision pages so future Claude sessions surface it during project bootstrap.

---

## [2026-05-15] ingest | Small Embedding Models Field Guide

**Source added:** `raw/articles/small-embedding-models-field-guide.md` (May 2026 field guide on when to use small embedding models for on-device, high-volume, agent memory, and "good enough" semantic search use cases).

**Motivation:** Make small-model trade-offs discoverable to future agents and scripts so embedding decisions are deliberate per-project, not a reflex reach for the OpenAI API.

**Framing:** Descriptive, decide per project (not prescriptive/tiered like `database.md`). The decision is too project-specific and the landscape shifts too fast for a single default.

**New pages:**
- `wiki/architecture/embedding-models.md` — Decision framework, candidate models (May 2026 snapshot), why-it-works vocabulary (distillation / MRL / quantization), trade-offs table, architecture-review checklist
- `wiki/summaries/small-embedding-models-field-guide.md` — Source summary with key takeaways, concepts, entities, and project application notes

**Pages updated:**
- `wiki/index.md` — Architecture section + Summaries section
- `wiki/architecture/database.md` — Cross-link from `pgvector` mention to `architecture/embedding-models`

**Project application surfaced:** Cairn (on-device geo-anchored memory recall via EmbeddingGemma-300M is an obvious spike), Hermes-style agent infra, and personal min-RAG knowledge bases.

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
