# Wiki Index

Master catalog of all wiki pages. Use this to navigate the knowledge base.

---

## Principles

The constitution. Every other page defers to these.

- [[principles/mvp-philosophy]] — Ship the core loop, monolith-first, cut scope not corners
- [[principles/anti-patterns]] — Premature microservices, over-abstraction, gold-plating, and other traps to avoid
- [[principles/dependency-selection]] — When to add a dependency, pre-approved libraries, red flags

## Stacks

- [[stacks/web]] — Next.js App Router, Server Components, TypeScript, Tailwind (production tier); Gotchas incl. hydration, middleware matcher
- [[stacks/mobile]] — React Native + Expo managed workflow
- [[stacks/agents]] — Python 3.12+ AI agent stack
- [[stacks/web3]] — Scaffold-ETH 2, Solidity, Hardhat

## Architecture

- [[architecture/database]] — **Tiered:** Supabase (MVP) or Neon + Drizzle (production)
- [[architecture/api-design]] — **Tiered:** Supabase client direct (MVP) or Server Actions (production)
- [[architecture/state-management]] — **Tiered:** TanStack Query + Zustand (MVP) or Server Components + Server Actions (production)
- [[architecture/auth]] — Authentication: Supabase Auth or Privy
- [[architecture/security]] — Minimum security baseline: env vars, RLS, CORS, validation
- [[architecture/security-findings]] — Catalog of vulnerabilities found in reviews: class, fix, prevention, detection; includes definer pg_temp precedence and review audit actor attribution — read before security-sensitive work
- [[architecture/testing]] — Inverted pyramid, BDD + Playwright, evidence/focus/overflow, authoritative-state progression, mutation-vs-refresh recovery, branch-specific visual proof, same-URL navigation/generated-type provenance, real-wire Host-spoof and tab-open HMR shutdown, fullscreen scrollback/resize, emitted-production direction regressions and eval-only public browser isolation from incidental private inbox reads
- [[architecture/styling]] — CSS/styling approach decision tree
- [[architecture/payments]] — Stripe integration: webhook handler, redirect URL hygiene, mode-scoping, production-learned gotchas; locally verified billing-customer access independent of current paid entitlement
- [[architecture/hosting]] — Hosting and deployment decision tree
- [[architecture/docker]] — Container configuration and orchestration
- [[architecture/monorepo]] — Monorepo structure and tooling
- [[architecture/embedding-models]] — When to consider a small embedding model vs. an API or large model (descriptive, per-project)
- [[architecture/Onion Architecture — MOC]] — Map of Content for onion architecture: the one rule, paths through the material, related notes
- [[architecture/Onion Architecture — Project Template Block]] — Ready-to-commit starter: filled-in `CLAUDE.md`, `dependency-cruiser` config, verify scripts

## Patterns

- [[patterns/file-structure]] — Canonical folder layouts for RN+Expo, Next.js, Supabase, agents
- [[patterns/data-modeling]] — JSONB, enums, UUIDs, TIMESTAMPTZ, RLS, PostGIS; exact NUMERIC/NaN and empty-child-set validation gotchas
- [[patterns/data-flow]] — Supabase client IS the API, Edge Functions, error handling, realtime
- [[patterns/agent-automation]] — Plan-execute-validate loop, tool schema design, MCP integration; Gotchas incl. binary relay corruption, stale OAuth registration, TTY-less sudo, sandbox-temp deletion structured/file-only output contracts and workflow quoting/native preflight
- [[patterns/dev-environment]] — macOS toolchain gotchas: stale /usr/local Node shadowing nvm's npm, npm engine-check patch bumps, nested TMPDIR overflow of PostgreSQL Unix socket paths
- [[patterns/n8n-llm-workflows]] — n8n for LLM/chatbot workflows: execution billing, $env/$vars Cloud split, webhook-over-chat-trigger, local-testing CORS gotchas (no wildcard ports; localhost ≠ 127.0.0.1; curl can't reproduce), headless CLI import, generate-don't-hand-edit
- [[patterns/llm-bot-structural-defense]] — Code-layer guarantees vs prompt-layer persuasion for LLM bots; deterministic-first testing with zero live API calls; semantic validation windows, actionable drafts, durable question subsets, omission/crash regressions, phase-correct native citations, exact fence normalization, provider-owned sources, exact frozen-context reference allowlists, combined shape-safe diagnostics, capability-gated constrained JSON with local validation, archive-before-eval-restart, dimensionally consistent experiment thresholds, lossless duplicate-alias budgets and bounded legacy/structured retry keys
- [[patterns/design-references]] — Design inspiration library: one file, four-line entries (Mode/Steal/Tags), pasted into `.impeccable/DESIGN.md` per project; why not a vault or saved HTML
- [[patterns/pln-ai-apps]] — PLN AI App Starter Kit: deploy contract, agent-callable APIs, member context, LLM timeout/thinking-budget gotchas, private buffered structured streams under hard operation deadlines, design-system alias + overlay composition, external-SSO test-identity shim, sticky headers need both scroll axes on one element

## Workflows

- [[workflows/new-project]] — 8-step project initialization with hard gate: Domain Discovery + Core Identification before any scaffolding
- [[workflows/feature-dev]] — 8-step feature development pipeline with BDD scenarios
- [[workflows/bug-fix]] — 5-step bug fix workflow: reproduce, diagnose, fix, test, record
- [[workflows/lesson-capture]] — Mandatory 6-step capture of errors, workarounds, and surprises into wiki Gotchas/Rules: resolve, locate, dedup, record, index, log
- [[workflows/ingest]] — Source ingestion pipeline for adding external knowledge
- [[workflows/tips-ingest]] — Lightweight capture flow for video tips, TikToks, and short-form resources

## Decisions (ADRs)

- [[decisions/TEMPLATE]] — ADR template for recording architectural decisions
- [[decisions/adr-001-supabase-postgis]] — Supabase + PostGIS over Firebase (Cairn)
- [[decisions/adr-002-privy-web3-auth]] — Privy for invisible Web3 auth (Cairn)
- [[decisions/adr-003-storacha-decentralized-storage]] — Storacha for decentralized storage (Cairn) — superseded by ADR-006
- [[decisions/adr-004-react-native-expo]] — React Native + Expo over Flutter or native (Cairn)
- [[decisions/adr-005-onion-hexagonal-default]] — Onion + Hexagonal as default architecture for every new project, enforced via the new-project workflow
- [[decisions/adr-006-pinata-hot-ipfs]] — Pinata for hot IPFS storage, supersedes ADR-003 after Storacha wind-down (Cairn)
- [[decisions/2026-09-09-terminally-product-labos]] — LabOS/Postgres/PL, bounded Messages SDK, user-authorized persistent loopback-live exception and unchanged production denial
- [[decisions/2026-09-08-plaa-schema-sql]] — PRD-required SQL-only PostgreSQL 16 migrations and numeric participant identity; no unrelated app scaffolding (PLAA Schemas)

## Projects

Active and planned projects, each with a per-project `CLAUDE.md` where a code directory exists.

- [[projects/terminally-product]] — Approved 60-note/eight-stage app; Proof Terminal, retained-response recovery and fixed public paid evaluation completed (5/5 eight-stage completions with exports, independent `ship` at 4/5 on the quality bar) after isolating the optional-parameter chairman grammar timeout, adding numeric entailment, and closing the review findings as independence/company-voice gates; RESULTS.md and SDK/PG/browser evidence retained; production identity/sync/deployment and five-case acceptance remain gated
- [[projects/agentforge]] — Canvas-based AI agent command center (MVP tier, Next.js 16 + Supabase)
- [[projects/rootstock]] — Calm-tech community Q&A with garden/village metaphor (MVP tier, Next.js 14 + Supabase)
- [[projects/newsbreef]] — Next.js + Vercel Workflow daily briefings (⚠️ D1 + KV + JWT); editorial/pricing/sign-in refinement deployed at fdf378f, audited 16/20 with one P2 and fresh-browser limit; live-provider gates and save-contract gotchas
- [[projects/cairn]] — Presence-verified geo-anchored memory app (PRD stage, MVP tier planned, React Native + Expo + Supabase + PostGIS)
- [[projects/plaa-activity-bot]] — Conversational activity-submission bot (MVP built; ⚠️ Deviation: vanilla-JS widget + n8n + Claude + Google Sheets, per PRD)
- [[projects/plaa-static-prototype]] — Exact, dependency-free Alignment Asset Design Composer prototype hosted as a Netlify static site
- [[projects/plaa-schemas]] — Private `protocol/PLAA_Schemas` repo: PostgreSQL 16.10 schema contract, synthetic examples, 33 local tests and PR/runbook docs; production policy/export approvals remain gated

## Summaries

- [[summaries/small-embedding-models-field-guide]] — Distilled takeaways from the May 2026 small-embedding-models field guide

## Entities

<!-- Populated via ingest workflow -->

## Syntheses

<!-- Populated via ingest workflow -->
