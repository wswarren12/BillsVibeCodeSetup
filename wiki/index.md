# Wiki Index

Master catalog of all wiki pages. Use this to navigate the knowledge base.

---

## Principles

The constitution. Every other page defers to these.

- [[principles/mvp-philosophy]] — Ship the core loop, monolith-first, cut scope not corners
- [[principles/anti-patterns]] — Premature microservices, over-abstraction, gold-plating, `git checkout` as an editing undo in a dirty checkout, and other traps to avoid
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
- [[architecture/security-findings]] — Catalog of vulnerabilities found in reviews: class, fix, prevention, detection; secondary download routes leaking soft-deleted content; includes definer pg_temp precedence, review actor attribution, public-archive publication-provenance failures, unbound per-turn identity resolution, identity-by-claim documented as verified, development static-server exposure of private repo files and teardown that deletes a cloud resource while leaving its one-off token in a local env file — read before security-sensitive work
- [[architecture/testing]] — Inverted pyramid, BDD + Playwright, evidence/focus/overflow, authoritative-state progression, mutation-vs-refresh recovery, branch-specific visual proof, same-URL navigation/generated-type provenance, real-wire Host-spoof and tab-open HMR shutdown, fullscreen scrollback/resize, emitted-production direction regressions and eval-only public browser isolation from incidental private inbox reads; actual-Node preload enforcement, owned-listener readiness, Next SWC lockfile auto-patch diagnostics and redirecting a spawned real server's side-effect files and clearing its production-mode credentials per test run; untested diagnostic branches degrading to "unknown", generated-string regexes needing assertions against the emitted code, persisting an instrument's raw sanitized output instead of a prose summary, and awaiting complete transcript appends before restart tests
- [[architecture/styling]] — CSS/styling approach decision tree; existing styled-jsx/Next Link scope mismatches require scoped-parent/global-child selectors and computed-style verification
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
- [[patterns/n8n-llm-workflows]] — n8n for LLM/chatbot workflows: execution billing, $env/$vars Cloud split, webhook-over-chat-trigger, local-testing CORS gotchas (no wildcard ports; localhost ≠ 127.0.0.1; curl can't reproduce), headless CLI import, generate-don't-hand-edit; importing ≠ publishing (`activeVersion` vs the editor draft), never Publish a freshly imported placeholder-bearing draft, and deactivate-before-delete for provisioned test workflows
- [[patterns/llm-bot-structural-defense]] — Code-layer guarantees vs prompt-layer persuasion for LLM bots; deterministic-first testing with zero live API calls; semantic validation windows, actionable drafts, durable question subsets, omission/crash regressions, phase-correct native citations, exact fence normalization, provider-owned sources, exact frozen-context reference allowlists, combined shape-safe diagnostics, capability-gated constrained JSON with local validation, archive-before-eval-restart, dimensionally consistent experiment thresholds, lossless duplicate-alias budgets and bounded legacy/structured retry keys; placeholder answers vs empty, enforce-don't-just-record confirmations, single-program-timezone date anchoring, enforcing new hard invariants on every routing path, and re-deriving retry/placement/copy/fail-closed/fixture/availability decisions when an external lookup flips from enrichment to required gate; identity-shape collisions when a new required field looks like an identity claim, prohibition reversals that must be traced through every layer that repeats them, and never mapping a write to an unconfirmed column; possessive-only self-attribution, advertised phrasings needing a deterministic path, test benches enforcing what production enforces, and re-asserting code verdicts on the normal routing branch
- [[patterns/ai-output-evals]] — **House rule:** every project with an AI element captures local-test output and conversations to an `evals/` folder graded Pass/Fail + Why; `eval.md` explainer, failure taxonomy over bare scores, append-only capture at an owned transport boundary, per-boot run ids, fenced quoting of user text, gitignored `0700`/`0600` and never served; not a judge, not a CI gate, not a substitute for structural defense
- [[patterns/design-references]] — Design inspiration library: one file, four-line entries (Mode/Steal/Tags), pasted into `.impeccable/DESIGN.md` per project; newsletter archive chronology/signup references; why not a vault or saved HTML
- [[patterns/pln-ai-apps]] — PLN AI App Starter Kit: deploy contract, direct deploy with a LabOS deployment key (no connect flow/draft, verified with stored secrets + db), agent-callable APIs, member context, LLM timeout/thinking-budget gotchas, private buffered structured streams under hard operation deadlines, design-system alias + overlay composition, clipboard-denial fallback with real clipboard readback, external-SSO test-identity shim, sticky headers need both scroll axes on one element

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
- [[decisions/2026-10-14-plaa-bot-qa-mode-lexical-kb-in-workflow]] — PLAA bot Q&A mode: BM25 over a build-time chunk index embedded in the n8n workflow (no embeddings vendor); off-topic strikes counted in code

## Projects

Active and planned projects, each with a per-project `CLAUDE.md` where a code directory exists.

- [[projects/terminally-product]] — Approved 60-note/eight-stage app; Proof Terminal, retained-response recovery and fixed public paid evaluation completed (5/5 eight-stage completions with exports, independent `ship` at 4/5 on the quality bar) after isolating the optional-parameter chairman grammar timeout, adding numeric entailment, and closing the review findings as independence/company-voice gates; RESULTS.md and SDK/PG/browser evidence retained; production identity/sync/deployment and five-case acceptance remain gated
- [[projects/agentforge]] — Canvas-based AI agent command center (MVP tier, Next.js 16 + Supabase)
- [[projects/rootstock]] — Calm-tech community Q&A with garden/village metaphor (MVP tier, Next.js 14 + Supabase)
- [[projects/newsbreef]] — Next.js + Vercel Workflow daily briefings (⚠️ D1 + KV + JWT); acknowledged-only 14-edition AI archive deployed at 9a28277, production desktop/mobile smoke passed (initially zero copies), UI audit18/20 and safety recheckOK; top-nav archive text link deployed at 29a687a, guest 1440/390/320px production checks passed; AI legal/BCI weekly dispatch caps deployed at37c8016 with migration0011, initial cooldown until2026-10-02 19:05UTC; atomic quotas, source-link review evidence and stale execution-vs-workflow queue lessons; SDK acknowledgement, exact-copy metadata, archive-failure bookkeeping and signup/save-contract gotchas
- [[projects/cairn]] — Presence-verified geo-anchored memory app (PRD stage, MVP tier planned, React Native + Expo + Supabase + PostGIS)
- [[projects/plaa-activity-bot]] — Conversational activity-submission bot (MVP built, Airtable base of record; updated 64-node build owner-published and token restored; referral ID-Sequence blocker still current; real production UI unknown-email retry and Markdown capture verified, registered-email persistence still unverified; local append-only turn capture for manual rating, one file per conversation under `tests/evals/`; ⚠️ Deviation: vanilla-JS widget + n8n + Claude + Airtable, per PRD)
- [[projects/plaa-website]] — Directory PLAA website at `~/Sites/pln-directory-portal-v2`; commit `488c2ad16`, draft PR#3221 from owner-approved `wswarren12:BW-edits` fork into `memser-spaceport:stream/plaa-overview`; preview/image/auth-bypass code removed before commit, safety stashes retained; Node22 + UAT on localhost4200 with normal auth; PLAA-scoped teal branding, eligible catalog suggestions, refreshed copy, overlapping circulation chart and aligned tables;244 focused tests pass,4528 full-suite passes, baseline-only test/lint/type failures documented; authenticated UAT chart verification pending
- [[projects/plaa-static-prototype]] — Exact, dependency-free Alignment Asset Design Composer prototype hosted as a Netlify static site
- [[projects/plaa-schemas]] — Private `protocol/PLAA_Schemas` repo: PostgreSQL 16.10 schema contract, synthetic examples, 33 local tests and PR/runbook docs; production policy/export approvals remain gated

## Summaries

- [[summaries/small-embedding-models-field-guide]] — Distilled takeaways from the May 2026 small-embedding-models field guide

## Entities

<!-- Populated via ingest workflow -->

## Syntheses

<!-- Populated via ingest workflow -->
