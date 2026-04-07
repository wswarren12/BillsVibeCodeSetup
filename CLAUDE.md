# VibeCoding Knowledge Base Schema

## Identity

This is a persistent knowledge base located at `~/Obsidian/VibeCoding/`.
It stores architectural decisions, stack preferences, workflow patterns, and project learnings across all coding projects. Every Claude Code session should read this file to understand conventions and constraints before doing work.

## Stack Preferences

### Web
Next.js App Router + Vercel + Drizzle + Neon Postgres + Tailwind + shadcn/ui

### Mobile
React Native + Expo + Expo Router + EAS Build

### Agents
Python + Claude Agent SDK + FastAPI + Pydantic

### Web3
Scaffold-ETH 2: wagmi + viem + Hardhat/Foundry + monorepo

### Infrastructure
Everything dockerized.

## Decision Trees

### Auth
- **Web** → Supabase Auth
- **Web3** → Privy
- **Mobile** → Supabase Auth Expo adapter

### State Management
- **Server** → Server Components / React Query
- **Client** → Zustand
- **Forms** → React Hook Form

### Database
Neon Postgres + Drizzle (always)

### Styling
- **Web** → Tailwind + shadcn/ui
- **Mobile** → NativeWind

### API Layer
- **Mutations** → Server Actions
- **Webhooks / External** → Route Handlers

### Payments
- **Web** → Stripe
- **Web3** → Native tokens

### Hosting
- **Web** → Vercel
- **Mobile** → EAS
- **Agents** → Docker

## Workflows

### Feature Development (8 steps)
1. **Brainstorm** — explore the problem space, gather context from the knowledge base
2. **Specify** — write BDD scenarios (Given / When / Then)
3. **Plan** — break into tasks, identify affected files and components
4. **Implement** — use subagents for parallel work where possible
5. **Test** — write Playwright e2e tests derived from BDD scenarios
6. **Debug** — loop until all tests are green
7. **Review** — self-review against architecture decisions and patterns
8. **Record** — update wiki, log decisions, append to log.md

### Bug Fix (5 steps)
1. **Reproduce** — write a BDD scenario + Playwright test that exposes the bug
2. **Diagnose** — trace root cause
3. **Fix** — apply minimal change
4. **Test** — loop until reproduction test and full suite are green
5. **Record** — update wiki and log.md

## Testing Philosophy

- **Playwright e2e is the primary testing strategy.** Write e2e tests first.
- **BDD scenarios come before implementation.** Given/When/Then specs define acceptance criteria before code is written.
- **Unit tests only for pure logic.** Use unit tests for utility functions, transformers, and business logic that has no side effects. Do not unit-test UI components or integration points.

## Operations

The knowledge base supports three core operations via the MCP server:

- **Ingest** — process raw material (articles, docs, project snapshots) from `raw/` into structured wiki entries
- **Query** — semantic search across the wiki for decisions, patterns, and prior art
- **Lint** — validate wiki structure, check for orphaned entries, ensure index.md is current

## ADR Format

Architecture Decision Records live at:
```
wiki/decisions/YYYY-MM-DD-<topic>.md
```

Status values: `proposed` | `accepted` | `deprecated` | `superseded`

Each ADR should include: title, date, status, context, decision, consequences.

## Rules

1. **Never modify `raw/`** — raw material is immutable input. Process it into wiki entries via Ingest.
2. **Always update `index.md`** — any wiki change must be reflected in the index.
3. **Always append to `log.md`** — every significant action (ingest, decision, refactor) gets a timestamped log entry.
4. **Check architecture and decisions before proposing patterns** — search `wiki/decisions/` and `wiki/architecture/` before introducing new patterns or tools. Reuse what exists.
