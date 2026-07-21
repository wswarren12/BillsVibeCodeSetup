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

## Default Architecture (every project)

**Onion Architecture with Hexagonal adapters.** The single rule: **ALL DEPENDENCIES POINT INWARD.**

- `domain/` — pure business logic. No frameworks, no SDKs, no Supabase, no React/Next/Expo, no fetch, no `process.env`. Zod is the only permitted external dep (for expressing domain rules).
- `application/` — orchestrates use cases. Imports `domain/` only.
- `infrastructure/` — all real-world code: DB adapters, HTTP, UI, vendor SDKs, env reading, composition root. This is the **hexagonal** layer: one adapter per port.

Canonical sources:
- `wiki/architecture/Onion Architecture — MOC.md`
- `wiki/architecture/Onion Architecture — Project Template Block.md` (filled-in `CLAUDE.md` block, `dependency-cruiser` config, verify scripts)
- ADR: `wiki/decisions/adr-005-onion-hexagonal-default.md`

## New Project Initialization (hard gate)

When the user says they're **starting**, **spinning up**, **scaffolding**, or **creating a new project** — or runs `git init` / `pnpm create` / `npx create-*` in an empty directory — Claude MUST follow `wiki/workflows/new-project.md`.

Specifically:
1. **STOP.** Do not pick a stack, run a scaffolder, write a README, or generate any code yet.
2. Run **Step 2: Domain Discovery** — ask the clarifying questions in the workflow's question battery before anything else. The user's words define the ubiquitous language.
3. Run **Step 3: Core Identification** — state the core in 1–3 sentences and get explicit user approval. The core is what survives the substitution test (swap DB / framework / UI / vendor and what's left).
4. Then map **ports & adapters** (Step 4), select stack (Step 5), scaffold from the Onion Project Template Block (Step 6), prove the dependency-cruiser gate bites (Step 7), and record (Step 8).

**Escape hatch:** if the project is a throwaway spike / CRUD demo / one-off script, Claude MUST ask explicitly: *"Is this a throwaway spike where we should skip the onion gate?"* Only an explicit "yes" from the user skips the workflow, and the opt-out must be logged in the project's `CLAUDE.md` as: **"Onion gate: skipped — throwaway spike."** Silence is not consent.

Applies to all four stacks: **Web**, **Mobile**, **Agents**, **Web3**.

## Workflows

### New Project (8 steps) — see `wiki/workflows/new-project.md`
1. **Trigger** — recognize new-project signals; stop and announce the workflow
2. **Domain Discovery** — clarifying questions; capture the ubiquitous language (HARD GATE)
3. **Core Identification** — state the core; substitution test; user approval (HARD GATE)
4. **Ports & Adapters** — one port per external capability; hexagonal adapter per port
5. **Stack Selection** — apply decision trees; ADR for any deviation
6. **Scaffold** — apply the Onion Project Template Block
7. **Verify Gate** — prove `pnpm verify` (dependency-cruiser) bites
8. **Record** — per-project wiki page, ADR if deviation, index, log

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

### Lesson Capture (6 steps) — see `wiki/workflows/lesson-capture.md`

Mandatory whenever a session surfaces a self-discovered error, a required workaround, surprising behavior, or a user-reported breakage. Fix first, then record — a fix without a recorded lesson is incomplete work.

1. **Resolve** — fix the problem completely first (Bug Fix workflow for user-reported errors)
2. **Locate** — `kb_search` for the wiki page that owns the topic; prefer adding to its Gotchas/Rules over creating a new page
3. **Dedup check (hard gate)** — search for the lesson itself (symptom + error message) and read existing Gotchas/Rules; skip if already recorded, refine in place if incomplete, one canonical entry per lesson
4. **Record** — symptom, root cause, resolution, prevention rule
5. **Index** — update `wiki/index.md` for new pages or materially expanded scope
6. **Log** — append to `wiki/log.md` and record via `kb_log`

### Security Review Capture — see `wiki/architecture/security-findings.md`

Mandatory around every security review (`/security-review`, `/code-review` with security scope, or any security-reviewer agent):

1. **Before the review** — read `wiki/architecture/security-findings.md`; check every recorded vulnerability class against the code under review first.
2. **After the review** — record each **confirmed** finding on that page under its category (class, found-in, severity, vulnerability, fix, prevention rule, detection hint). The Lesson Capture dedup gate applies: same class in a new context extends the existing finding, never duplicates it. Never paste live secrets or working exploit payloads into the vault.
3. **Log** — every review (even zero-findings) gets a `wiki/log.md` entry with project, scope, outcome, and dismissed false positives; record via `kb_log`.

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
