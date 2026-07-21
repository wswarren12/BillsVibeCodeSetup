# Wiki Index

Master catalog of all wiki pages. Use this to navigate the knowledge base.

---

## Principles

The constitution. Every other page defers to these.

- [[principles/mvp-philosophy]] — Ship the core loop, monolith-first, cut scope not corners
- [[principles/anti-patterns]] — Premature microservices, over-abstraction, gold-plating, and other traps to avoid
- [[principles/dependency-selection]] — When to add a dependency, pre-approved libraries, red flags

## Stacks

- [[stacks/web]] — Next.js App Router, Server Components, TypeScript, Tailwind (production tier)
- [[stacks/mobile]] — React Native + Expo managed workflow
- [[stacks/agents]] — Python 3.12+ AI agent stack
- [[stacks/web3]] — Scaffold-ETH 2, Solidity, Hardhat

## Architecture

- [[architecture/database]] — **Tiered:** Supabase (MVP) or Neon + Drizzle (production)
- [[architecture/api-design]] — **Tiered:** Supabase client direct (MVP) or Server Actions (production)
- [[architecture/state-management]] — **Tiered:** TanStack Query + Zustand (MVP) or Server Components + Server Actions (production)
- [[architecture/auth]] — Authentication: Supabase Auth or Privy
- [[architecture/security]] — Minimum security baseline: env vars, RLS, CORS, validation
- [[architecture/security-findings]] — Catalog of vulnerabilities found in security reviews: class, fix, prevention rule, detection hint — read before any review or security-sensitive feature
- [[architecture/testing]] — Inverted pyramid, BDD + Playwright, what NOT to test
- [[architecture/styling]] — CSS/styling approach decision tree
- [[architecture/payments]] — Stripe integration: webhook handler, redirect URL hygiene, mode-scoping, production-learned gotchas
- [[architecture/hosting]] — Hosting and deployment decision tree
- [[architecture/docker]] — Container configuration and orchestration
- [[architecture/monorepo]] — Monorepo structure and tooling
- [[architecture/embedding-models]] — When to consider a small embedding model vs. an API or large model (descriptive, per-project)
- [[architecture/Onion Architecture — MOC]] — Map of Content for onion architecture: the one rule, paths through the material, related notes
- [[architecture/Onion Architecture — Project Template Block]] — Ready-to-commit starter: filled-in `CLAUDE.md`, `dependency-cruiser` config, verify scripts

## Patterns

- [[patterns/file-structure]] — Canonical folder layouts for RN+Expo, Next.js, Supabase, agents
- [[patterns/data-modeling]] — JSONB, enums, UUIDs, TIMESTAMPTZ, RLS, PostGIS
- [[patterns/data-flow]] — Supabase client IS the API, Edge Functions, error handling, realtime
- [[patterns/agent-automation]] — Plan-execute-validate loop, tool schema design, MCP integration
- [[patterns/n8n-llm-workflows]] — n8n for LLM/chatbot workflows: execution billing, $env/$vars Cloud split, webhook-over-chat-trigger, local-testing CORS gotchas (no wildcard ports; localhost ≠ 127.0.0.1; curl can't reproduce), headless CLI import, generate-don't-hand-edit
- [[patterns/llm-bot-structural-defense]] — Code-layer guarantees vs prompt-layer persuasion for LLM bots; deterministic-first testing with zero live API calls

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
- [[decisions/adr-003-storacha-decentralized-storage]] — Storacha for decentralized storage (Cairn)
- [[decisions/adr-004-react-native-expo]] — React Native + Expo over Flutter or native (Cairn)
- [[decisions/adr-005-onion-hexagonal-default]] — Onion + Hexagonal as default architecture for every new project, enforced via the new-project workflow

## Projects

Active and planned projects, each with a per-project `CLAUDE.md` where a code directory exists.

- [[projects/agentforge]] — Canvas-based AI agent command center (MVP tier, Next.js 16 + Supabase)
- [[projects/rootstock]] — Calm-tech community Q&A with garden/village metaphor (MVP tier, Next.js 14 + Supabase)
- [[projects/newsbreef]] — n8n-driven daily news briefing with Next.js companion (⚠️ Deviation: Cloudflare D1 + KV + JWT)
- [[projects/cairn]] — Presence-verified geo-anchored memory app (PRD stage, MVP tier planned, React Native + Expo + Supabase + PostGIS)
- [[projects/plaa-activity-bot]] — Conversational activity-submission bot (MVP built; ⚠️ Deviation: vanilla-JS widget + n8n + Claude + Google Sheets, per PRD)

## Summaries

- [[summaries/small-embedding-models-field-guide]] — Distilled takeaways from the May 2026 small-embedding-models field guide

## Entities

<!-- Populated via ingest workflow -->

## Syntheses

<!-- Populated via ingest workflow -->
