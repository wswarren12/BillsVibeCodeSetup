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
- [[architecture/testing]] — Inverted pyramid, BDD + Playwright, what NOT to test
- [[architecture/styling]] — CSS/styling approach decision tree
- [[architecture/payments]] — Payment processing integration
- [[architecture/hosting]] — Hosting and deployment decision tree
- [[architecture/docker]] — Container configuration and orchestration
- [[architecture/monorepo]] — Monorepo structure and tooling

## Patterns

- [[patterns/file-structure]] — Canonical folder layouts for RN+Expo, Next.js, Supabase, agents
- [[patterns/data-modeling]] — JSONB, enums, UUIDs, TIMESTAMPTZ, RLS, PostGIS
- [[patterns/data-flow]] — Supabase client IS the API, Edge Functions, error handling, realtime
- [[patterns/agent-automation]] — Plan-execute-validate loop, tool schema design, MCP integration

## Workflows

- [[workflows/feature-dev]] — 8-step feature development pipeline with BDD scenarios
- [[workflows/bug-fix]] — 5-step bug fix workflow: reproduce, diagnose, fix, test, record
- [[workflows/ingest]] — Source ingestion pipeline for adding external knowledge

## Decisions (ADRs)

- [[decisions/TEMPLATE]] — ADR template for recording architectural decisions
- [[decisions/adr-001-supabase-postgis]] — Supabase + PostGIS over Firebase (Cairn)
- [[decisions/adr-002-privy-web3-auth]] — Privy for invisible Web3 auth (Cairn)
- [[decisions/adr-003-storacha-decentralized-storage]] — Storacha for decentralized storage (Cairn)
- [[decisions/adr-004-react-native-expo]] — React Native + Expo over Flutter or native (Cairn)

## Projects

Active and planned projects, each with a per-project `CLAUDE.md` where a code directory exists.

- [[projects/agentforge]] — Canvas-based AI agent command center (MVP tier, Next.js 16 + Supabase)
- [[projects/rootstock]] — Calm-tech community Q&A with garden/village metaphor (MVP tier, Next.js 14 + Supabase)
- [[projects/newsbreef]] — n8n-driven daily news briefing with Next.js companion (⚠️ Deviation: Cloudflare D1 + KV + JWT)
- [[projects/cairn]] — Presence-verified geo-anchored memory app (PRD stage, MVP tier planned, React Native + Expo + Supabase + PostGIS)

## Summaries

<!-- Populated via ingest workflow -->

## Entities

<!-- Populated via ingest workflow -->

## Syntheses

<!-- Populated via ingest workflow -->
