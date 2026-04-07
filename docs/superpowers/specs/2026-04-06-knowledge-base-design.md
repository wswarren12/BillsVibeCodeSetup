# VibeCoding Knowledge Base — Design Spec

**Date:** 2026-04-06
**Status:** Approved
**Author:** William Warren + Claude

## Overview

A persistent, Obsidian-based knowledge base that acts as long-term memory across all vibe coding projects. Based on [Karpathy's LLM Knowledge Base architecture](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — structured markdown files maintained by an LLM, bypassing traditional RAG in favor of an evolving wiki with summaries, cross-references, and index-based navigation.

The system goes beyond Karpathy's original design by adding:
- **Enforcement** of architectural decisions and best practices via hooks
- **Multi-agent workflow templates** with BDD and Playwright-driven test/debug loops
- **Decision trees** that Claude follows when making technology choices
- **Three-layer defense** (CLAUDE.md + MCP server + hooks) for resilience

## Goals

1. Claude Code remembers decisions and best practices across all projects
2. Architectural best practices are enforced, not just suggested
3. Multi-agent workflows follow a disciplined BDD → implement → test → debug cycle
4. External knowledge (articles, docs, tutorials) gets compiled into actionable wiki pages
5. Everything is plain markdown — vendor-agnostic, git-tracked, human-readable

## Non-Goals

- Not a replacement for project-level CLAUDE.md files (those override wiki defaults)
- Not a full RAG pipeline with embeddings/vector DB (index.md + search is sufficient at target scale)
- Not a rigid system — warns and recommends, doesn't block commits

---

## Architecture

### Vault Location

```
~/Obsidian/VibeCoding/
```

Git-tracked. Obsidian is the browsing/editing interface. Claude Code is the primary writer.

### Directory Structure

```
~/Obsidian/VibeCoding/
├── CLAUDE.md                    # Schema layer — the rules (loaded every session)
├── raw/                         # Immutable source material
│   ├── articles/                # Web clips, blog posts, tutorials
│   ├── docs/                    # Framework docs, API references
│   ├── project-snapshots/       # Auto-extracted from existing projects
│   └── assets/                  # Images downloaded by Obsidian Web Clipper
├── wiki/                        # LLM-generated and maintained
│   ├── index.md                 # Master catalog with one-line summaries
│   ├── log.md                   # Chronological record of all operations
│   ├── stacks/                  # Stack preferences by app type
│   │   ├── web.md
│   │   ├── mobile.md
│   │   ├── agents.md
│   │   └── web3.md
│   ├── architecture/            # Opinionated defaults & decision trees
│   │   ├── auth.md
│   │   ├── state-management.md
│   │   ├── database.md
│   │   ├── styling.md
│   │   ├── api-design.md
│   │   ├── payments.md
│   │   ├── hosting.md
│   │   ├── docker.md
│   │   ├── monorepo.md
│   │   └── testing.md
│   ├── decisions/               # Architecture Decision Records
│   │   └── TEMPLATE.md
│   ├── workflows/               # Multi-agent workflow templates
│   │   ├── feature-dev.md
│   │   ├── bug-fix.md
│   │   └── ingest.md
│   ├── entities/                # Concept & entity pages
│   ├── summaries/               # Source summaries
│   └── syntheses/               # Cross-source analysis pages
├── docs/                        # Meta-docs about the system itself
│   └── superpowers/specs/       # Design specs
├── .obsidian/                   # Obsidian config
└── .git/                        # Version history
```

### Three-Layer System

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: CLAUDE.md (Schema)                            │
│  Loaded every session. Contains rules, stack prefs,     │
│  workflow definitions. Baseline knowledge guaranteed.   │
├─────────────────────────────────────────────────────────┤
│  Layer 2: MCP Server (Operations)                       │
│  Stateless TypeScript server. Structured access to      │
│  search, ingest, query, lint, record decisions.         │
│  Rich context-aware checks.                             │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Hooks (Guardrails)                            │
│  Session start: load relevant context.                  │
│  Prompt submit: enforce workflows.                      │
│  Pre-commit: architecture checks.                       │
│  Warn, don't block.                                     │
└─────────────────────────────────────────────────────────┘
```

Defense in depth: if any layer fails, the others catch it.

---

## Schema Layer (CLAUDE.md)

Lives at `~/Obsidian/VibeCoding/CLAUDE.md`. Referenced from global `~/.claude/CLAUDE.md`.

### Contents

```markdown
# VibeCoding Knowledge Base Schema

## Identity
You have access to a persistent knowledge base at ~/Obsidian/VibeCoding/.
This is your long-term memory across all projects. Use it.

## Stack Preferences
- Web apps: Next.js (App Router) + Vercel + Drizzle + Neon Postgres + Tailwind + shadcn/ui
- Mobile apps: React Native + Expo + Expo Router + EAS Build
- Agent automations: Python + Claude Agent SDK + FastAPI + Pydantic
- Web3: Scaffold-ETH 2 patterns (wagmi + viem + Hardhat/Foundry + monorepo)
- Everything gets a Dockerfile + docker-compose.yml (multi-stage builds)

## Decision Trees
Consult wiki/architecture/ for detailed decision trees. Key defaults:
- Auth: Web → Supabase Auth, Web3 → Privy, Mobile → Supabase Auth (Expo adapter)
- State: Server state → Server Components/React Query, client → Zustand, form → React Hook Form
- Database: Neon Postgres + Drizzle (off-chain), on-chain via wagmi/viem
- Styling: Tailwind + shadcn/ui, Mobile → NativeWind
- API: Server Actions for mutations, Route Handlers for webhooks/external
- Payments: Stripe (Web), native token flows (Web3)
- Hosting: Vercel (Web), EAS (Mobile), Docker (Agents)

## Workflow: Feature Development
1. Brainstorm — explore idea, propose approaches, get approval
2. Specify — write BDD scenarios (Given/When/Then) for each feature
3. Plan — write implementation plan with discrete steps derived from scenarios
4. Implement — execute plan, use subagents for independent tasks
5. Test — write Playwright e2e tests from BDD scenarios, run them
6. Debug — if tests fail: diagnose → fix → re-test (loop until green)
7. Review — code review against wiki patterns and ADRs
8. Record — update wiki with any new decisions or patterns learned

## Workflow: Bug Fix
1. Reproduce — write a BDD scenario describing the bug, confirm with Playwright
2. Diagnose — trace root cause, check wiki for known patterns
3. Fix — minimal targeted fix
4. Test — run Playwright test to confirm fix, run full suite, loop with debug
5. Record — if the bug revealed a pattern worth remembering, add to wiki

## Testing Philosophy
- Primary: Playwright e2e tests that simulate real user behavior
- BDD scenarios are the source of truth for what "done" means
- Write scenarios BEFORE implementation, tests AFTER
- Format: Given [context] / When [action] / Then [expected outcome]
- Every feature needs at least one happy-path and one error-path scenario
- Unit tests only for pure logic (data transformations, complex functions, SDK logic)

## Operations
### Ingest
When told to ingest a source: read raw/ file → discuss key findings →
write summary to wiki/summaries/ → update entity/concept pages →
update index.md → append to log.md

### Query
When asked a question: check index.md → read relevant wiki pages →
synthesize answer with citations → optionally create new wiki page
from good answers

### Lint
Periodically or on request: check for contradictions, stale claims,
orphan pages, missing cross-references, concepts without pages.
Report findings and fix with approval.

## Architecture Decision Records
When a significant architectural choice is made, record it:
- wiki/decisions/YYYY-MM-DD-<topic>.md
- Template: Context → Decision → Consequences → Status
- Status values: proposed | accepted | deprecated | superseded

## Rules
- Never modify files in raw/
- Always update index.md after creating/modifying wiki pages
- Always append to log.md with timestamps
- Check wiki/architecture/ before proposing patterns that might conflict
- Check wiki/decisions/ before making choices that were previously decided
- Prefer existing project conventions over wiki defaults when in a project
- When deviating from wiki defaults, record an ADR explaining why
```

### Global Config Integration

`~/.claude/CLAUDE.md`:
```markdown
# Global Claude Code Config

## Knowledge Base
Read and follow the schema at ~/Obsidian/VibeCoding/CLAUDE.md.
Use the knowledge-base MCP server tools for search, ingest, and lint operations.
When starting work in any project, check the wiki for relevant decisions and patterns.
```

Project-level `CLAUDE.md` files can override specific defaults without conflict.

---

## MCP Server

### Overview

Stateless TypeScript MCP server. All state lives in the vault's markdown files. If the server goes down, Claude can still read the vault directly.

### Tech Stack

- TypeScript
- `@modelcontextprotocol/sdk`
- Runs locally via `npx` or persistent process
- Registered in `~/.claude/settings.json` under `mcpServers`

### Tools

| Tool | Input | Output | Description |
|------|-------|--------|-------------|
| `kb_search` | `query: string` | Matching wiki page paths + excerpts | Search wiki via index.md, then content scan. At scale, upgrade to BM25/vector hybrid. |
| `kb_ingest` | `source_path: string` | Summary + list of updated pages | Process a raw/ source. Generate summary, update entities/concepts, update index, append log. |
| `kb_query` | `question: string` | Synthesized answer with citations | Ask a question against the wiki. Returns answer citing specific wiki pages. |
| `kb_lint` | `scope?: string` | Report of issues found | Health check: contradictions, stale claims, orphans, missing cross-refs. Optional scope filter. |
| `kb_record_decision` | `context, decision, consequences: string` | Created ADR path | Create new ADR in wiki/decisions/. Updates index. |
| `kb_check_architecture` | `proposal: string` | Conflicts, relevant ADRs, recommendations | Check a proposed approach against wiki/architecture/ and wiki/decisions/. |
| `kb_get_workflow` | `type: "feature" \| "bugfix" \| "ingest"` | Workflow template markdown | Retrieve the appropriate workflow with BDD format. |
| `kb_log` | `operation, details: string` | Confirmation | Append timestamped entry to log.md. |

### Server Location

```
~/Obsidian/VibeCoding/mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools/            # One file per tool
│   │   ├── search.ts
│   │   ├── ingest.ts
│   │   ├── query.ts
│   │   ├── lint.ts
│   │   ├── record-decision.ts
│   │   ├── check-architecture.ts
│   │   ├── get-workflow.ts
│   │   └── log.ts
│   └── utils/
│       ├── vault.ts      # File read/write helpers
│       └── index-parser.ts  # Parse index.md for navigation
├── Dockerfile
└── docker-compose.yml
```

### Registration

In `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "npx",
      "args": ["tsx", "~/Obsidian/VibeCoding/mcp-server/src/index.ts"],
      "env": {
        "VAULT_PATH": "~/Obsidian/VibeCoding"
      }
    }
  }
}
```

---

## Hooks

### Hook 1: Session Start — Load Context

**Trigger:** Claude Code `SessionStart` hook event
**Behavior:**
1. Detect current project directory
2. Read `~/Obsidian/VibeCoding/wiki/index.md`
3. Identify relevant wiki pages based on project type (web, mobile, agent, web3)
4. Read relevant stack, architecture, and decision pages
5. Inject summary into session context

**Implementation:** Shell script that reads markdown files and outputs context.

### Hook 2: Prompt Submit — Workflow Enforcement

**Trigger:** Claude Code `UserPromptSubmit` hook event
**Behavior:**
1. Detect if the prompt requests a new feature or bug fix
2. Check if BDD scenarios have been discussed in the current session
3. If not, remind Claude to follow the workflow (specify scenarios first)
4. Lightweight — only checks for workflow keywords, doesn't block

**Implementation:** Shell script that greps the prompt for intent signals.

### Hook 3: Pre-Commit — Architecture Check

**Trigger:** Claude Code `PreToolUse` hook event (filtered to `Bash` commands matching `git commit`)
**Behavior:**
1. Scan staged files for new dependencies, config changes, architectural patterns
2. Check against wiki/architecture/ decision trees
3. Check for missing Dockerfile if this is a new project
4. Warn if changes conflict with recorded ADRs
5. Suggest recording a new ADR if deviating from defaults

**Implementation:** Shell script that reads staged diff + wiki files, outputs warnings.

### Enforcement Philosophy

- **Warn, don't block.** Hooks surface information and reminders.
- **User is the boss.** Claude follows the rules; the user can override.
- **Graceful degradation.** If hooks fail, CLAUDE.md + MCP server still work.

---

## Bootstrapping

### Phase 1: Manual Canon

Write foundational wiki pages by hand. These are opinionated truths:

| Page | Content |
|------|---------|
| `wiki/stacks/web.md` | Next.js + Vercel + Drizzle + Neon + Tailwind + shadcn/ui |
| `wiki/stacks/mobile.md` | React Native + Expo + Expo Router + EAS Build |
| `wiki/stacks/agents.md` | Python + Claude Agent SDK + FastAPI + Pydantic |
| `wiki/stacks/web3.md` | Scaffold-ETH 2 patterns from SpeedRunEthereum-v2 |
| `wiki/architecture/auth.md` | Web → Supabase Auth, Web3 → Privy |
| `wiki/architecture/state-management.md` | Server Components, Zustand, React Hook Form |
| `wiki/architecture/database.md` | Neon Postgres + Drizzle |
| `wiki/architecture/styling.md` | Tailwind + shadcn/ui, NativeWind for mobile |
| `wiki/architecture/api-design.md` | Server Actions + Route Handlers |
| `wiki/architecture/payments.md` | Stripe (Web), native tokens (Web3) |
| `wiki/architecture/hosting.md` | Vercel, EAS, Docker |
| `wiki/architecture/docker.md` | Multi-stage builds, docker-compose for local dev |
| `wiki/architecture/testing.md` | BDD scenarios → Playwright e2e, unit tests for pure logic |
| `wiki/architecture/monorepo.md` | When/how to use monorepos (Web3 always, others case-by-case) |
| `wiki/workflows/feature-dev.md` | 8-step workflow with BDD + Playwright |
| `wiki/workflows/bug-fix.md` | 5-step workflow |
| `wiki/workflows/ingest.md` | Source ingestion process |
| `wiki/decisions/TEMPLATE.md` | ADR template |
| `wiki/index.md` | Master catalog |
| `wiki/log.md` | Empty, ready for first entry |

Each architecture page follows the decision tree format:
```markdown
# [Topic]

## Decision Tree
- [Condition]? → [Choice]
- [Condition]? → [Choice]

## Why
[Brief rationale for each choice]

## Sources
[Links to ingested raw/ articles that informed this]
```

### Phase 1b: External Source Ingestion

Clip and ingest into `raw/articles/`, then compile into wiki:
- Vercel App Router best practices
- Scaffold-ETH 2 documentation
- Expo/React Native recommended architecture
- Claude Agent SDK documentation
- Supabase Auth guides
- Privy integration docs
- Docker multi-stage build patterns
- BDD/Playwright testing guides

### Phase 2: Auto-Ingest from Existing Projects

Scan existing projects on Desktop:

```
AgentCraft, BillsClub, Canopy, KidSpinner, NewsBreef,
Rootstock, Summon, WordCraft, and others
```

For each project:
1. Read `package.json` / `pyproject.toml` — capture stack choices
2. Read existing `CLAUDE.md`, `README` — capture conventions
3. Read `docker-compose.yml` / `Dockerfile` — capture infra patterns
4. Scan for architectural patterns (state management, API layer, auth)
5. Write project snapshot to `raw/project-snapshots/<project>.md`
6. Generate/update relevant wiki entity pages
7. Record implicit decisions as ADRs with status "legacy" or "accepted"

Where existing projects conflict with canonical stack preferences, flag as ADRs with clear status.

---

## Operations Reference

### Ingest Workflow (detailed)

1. User adds source to `raw/` (via Obsidian Web Clipper or direct file)
2. User tells Claude to ingest it
3. Claude reads the source, discusses key findings with user
4. Claude writes summary to `wiki/summaries/<source-name>.md`
5. Claude updates relevant entity/concept pages in `wiki/entities/`
6. Claude creates new concept pages if needed
7. Claude updates `wiki/index.md` with new entries
8. Claude appends to `wiki/log.md`:
   ```
   ## [2026-04-06] ingest | <Source Title>
   - Summary: wiki/summaries/<source-name>.md
   - Updated: wiki/entities/foo.md, wiki/architecture/bar.md
   - New: wiki/entities/baz.md
   ```
9. A single source typically touches 5-15 wiki pages

### Query Workflow (detailed)

1. User asks a question
2. Claude reads `wiki/index.md` to find relevant pages
3. Claude reads those pages
4. Claude synthesizes answer with citations: `[source: wiki/entities/foo.md]`
5. If the answer is substantial and reusable, Claude creates a new wiki page (synthesis or entity) and updates the index

### Lint Workflow (detailed)

1. Triggered by user request or periodic schedule
2. Claude scans wiki for:
   - **Contradictions** between pages
   - **Stale claims** superseded by newer sources
   - **Orphan pages** with no inbound links
   - **Missing cross-references** between related topics
   - **Important concepts** mentioned but lacking dedicated pages
3. Claude reports findings with severity and suggestions
4. Claude fixes with user approval
5. Claude suggests new sources to investigate for gaps

---

## Success Criteria

1. Claude Code in any project directory automatically knows stack preferences and architectural patterns
2. New features follow the BDD → implement → Playwright test → debug cycle without being reminded
3. Architectural decisions are recorded and referenced in future sessions
4. External sources get compiled into actionable, cross-referenced wiki pages
5. The system degrades gracefully — if MCP server is down, CLAUDE.md + direct file reads still work
6. The vault is browsable in Obsidian with working links and graph view

---

## Dependencies

- **Obsidian** — installed on macOS, vault opened at `~/Obsidian/VibeCoding/`
- **Obsidian Web Clipper** — browser extension for capturing articles
- **Node.js >= 22** — for running MCP server
- **Git** — for vault version history
- **Playwright** — for e2e testing (already installed as Claude Code plugin)
- **Claude Code** — with MCP server support and hooks

---

## References

- [Karpathy's LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [VentureBeat: Karpathy's LLM Knowledge Base Architecture](https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an)
- [SpeedRunEthereum-v2](https://github.com/BuidlGuidl/SpeedRunEthereum-v2) — Web3 reference architecture
