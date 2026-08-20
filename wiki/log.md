# Operations Log

Chronological record of all wiki operations. Append-only.

---

## [2026-07-20] add | Security Findings catalog + Security Review Capture flow

**Trigger:** User asked that whenever a security review or security-reviewer agent runs, the lessons, vulnerabilities, and fixes be captured in a dedicated part of the knowledge base so future analogous projects avoid the same vulnerabilities.

**New pages:**
- `wiki/architecture/security-findings.md` — empirical companion to the security baseline: catalog of vulnerabilities actually found in reviews, organized into eight categories (auth/session, authorization/RLS, injection, secrets/config, client-side exposure, API/webhook, supply chain, Web3). Per-finding format: class, found-in, severity, vulnerability, fix, prevention rule, detection hint. Rules: confirmed findings only (dismissed false positives go in the review's log entry), Lesson Capture dedup gate applies, no live secrets or working exploit payloads in the vault, every review logged even at zero findings.

**Pages updated:**
- `CLAUDE.md` (vault root) — added **Security Review Capture** to Workflows: read the findings page *before* every review (check known classes first), record confirmed findings *after*, log every review.
- `wiki/workflows/lesson-capture.md` — Step 2 now routes security-relevant lessons to the findings page instead of scattering them across topic pages.
- `wiki/index.md` — added `architecture/security-findings` entry.

**Enforcement (outside the vault):**
- `hooks/security-review-capture.sh` (new) — wired to Claude Code's `PostToolUse` event (matcher `Agent|Task|Skill`) in `~/.claude/settings.json`; when a spawned agent's or invoked skill's input matches security signals (security / vulnerab / pentest / threat model), injects the capture protocol into context. Verified firing live against a probe agent.
- `hooks/workflow-enforcement.sh` — new security branch (checked before feature/bugfix signals): prompts mentioning security review/audit/scan get the before-and-after capture reminder.
- `~/.claude/CLAUDE.md` — Lesson Capture section extended with the security-review special case.

**Why this matters:** Review findings previously evaporated when the session ended — the next project could ship the same IDOR or RLS gap and pay for the same discovery twice. The findings page makes each vulnerability class a one-time cost: recorded once with a detection hint, then mechanically checked at the start of every future review via the pre-review read mandate.

## [2026-07-20] add | Lesson Capture workflow — automated error/workaround/surprise recording

**Trigger:** User asked that whenever Claude discovers an error in its work, needs a workaround, hits a surprising lesson, or the user reports something broken, the knowledge base be updated automatically with the lesson and how to navigate around it.

**New pages:**
- `wiki/workflows/lesson-capture.md` — 6-step workflow (resolve → locate → dedup → record → index → log). Defines four triggers (self-discovered error, required workaround, surprising behavior, user-reported breakage), a non-trigger clause for trivial slips, a dedup hard gate (search the symptom/error before writing; skip exact duplicates, refine incomplete entries in place, one canonical entry per lesson), a four-part lesson format (symptom / root cause / resolution / prevention rule), and the prefer-update-over-create rule modeled on the payments-page Gotchas precedent.

**Pages updated:**
- `CLAUDE.md` (vault root) — added Lesson Capture to the Workflows section as a mandatory workflow.
- `wiki/index.md` — added `workflows/lesson-capture` entry.

**Enforcement (outside the vault):**
- `hooks/lesson-capture.sh` (new) — wired to Claude Code's `PostToolUseFailure` event (Bash matcher) in `~/.claude/settings.json`; injects a lesson-capture reminder into context whenever a command Claude runs fails.
- `hooks/workflow-enforcement.sh` — bugfix branch extended so user-reported-error prompts also mandate lesson capture after the fix.
- `~/.claude/CLAUDE.md` — added a global Lesson Capture protocol section pointing at the workflow.

**Why this matters:** Lessons were previously captured ad hoc (the 2026-06-02 payments entry required deliberate effort). This makes capture mechanical: hooks fire on the observable proxies of "something went wrong" (failed tool calls, error-language prompts), and the workflow defines exactly where the lesson lands so it is findable next time the topic comes up.

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

## [2026-06-24] decision | Syncing large Claude Design (.dc.html) files past the MCP 256 KiB cap
- ADR: wiki/decisions/2026-06-24-syncing-large-claude-design-dc-html-files-past-the-mcp-256-kib-cap.md

## [2026-07-19] decision | PLAA Activity Submission Bot — MVP build resolutions (§11 open questions)
- ADR: wiki/decisions/2026-07-19-plaa-activity-submission-bot-mvp-build-resolutions-11-open-questions.md

## [2026-07-20] ingest | PLAA Activity Submission Bot build learnings
- New pattern: wiki/patterns/n8n-llm-workflows.md (execution billing → in-workflow chains; $env vs $vars Cloud split; webhook node over Chat Trigger; activation/error-workflow/re-import gotchas; disabled-by-default optional-credential nodes; generate workflow JSON from source modules)
- New pattern: wiki/patterns/llm-bot-structural-defense.md (structural whitelist row builder, config-sourced metadata, code-gated confirmation, delimiter-wrapped review input; 481 deterministic tests / zero live API calls; not-testable-locally grading → post-deploy smoke checklist)
- New project page: wiki/projects/plaa-activity-bot.md (repo: github.com/wswarren12/ActivityBotv2, private)
- Index updated (Patterns, Projects)

## [2026-07-20] bug-fix | PLAA bot: URL location checks were host-only
- The whole LabOS app shares directory.plnetwork.io; forum lives at /forum, events directory at /events/irl. Host-only "expected domain" checks (and the prompt's "LabOS Forum domain" wording) rejected valid forum links. Fixed with host + whole-segment path-prefix checks (EXPECTED_URL_LOCATIONS) in constraint-checks.mjs + config validation notes; reproducing test uses the reported URL verbatim.

## [2026-07-20] update | n8n local-testing CORS section added to patterns/n8n-llm-workflows
- Dedicated section from the PLAA local-testing debug: exact-origin-only allow-lists (wildcard ports match nothing), localhost vs 127.0.0.1 as distinct origins, why curl can't reproduce preflight failures (no Origin header; blocked POST never creates an execution), terminal preflight-testing recipe, preflight caching after a fix, and the headless CLI import path (id field required; pre-wire settings.errorWorkflow).

## [2026-07-20] bug-fix | PLAA bot: n8n Code-node sandbox lacks the URL global; 2-digit years rejected
- URL validation threw inside n8n (no URL global in the 2.x task-runner sandbox) while passing in plain Node — every URL read as malformed at the confirm gate. Validators rewritten regex-only + sandbox-safety source test. isParseableDate now maps 2-digit years to 20xx. Intake model bumped to claude-sonnet-4-6 (product decision; review chain unchanged). Pattern page gained "The Code-node sandbox is not Node" section.

## [2026-07-20] update | PLAA bot: near-answer normalization + pre-summary validation gate
- Dates canonicalized to ISO from any common format (code + prompt); URL checks loosened to keyword plausibility (forum/event) since the WG reviews rows anyway; draft now validated when the summary is generated so members never confirm a summary that would bounce. Pattern added to llm-bot-structural-defense (validate at draft time; normalize near-answers; plausibility over exact-match when a human reviewer is downstream).

## [2026-07-20] lesson | PLAA bot security review — record-layer injection, PII retention, public-token cost bound
- Three gotchas added to patterns/llm-bot-structural-defense.md: (1) spreadsheet formula/CSV injection is a surface DOWNSTREAM of the model's structural defenses — neutralize every string cell (leading apostrophe on =+-@) + write RAW; primary vector was the email cell, not the wrapped answer; (2) n8n saveDataSuccessExecution:'all' persists PII outside the sanctioned store — set 'none' for PII workflows; (3) a public shared-secret needs an in-workflow global rate limit before the model node to bound LLM cost. Fixes shipped in commit ab2859b (780 tests green).

## [2026-07-21] ingest | PLAA bot security review fixes #1-#4 (commit ab2859b). Recorded 3 security gotchas in patterns/llm-bot-structural-defense.md: spreadsheet formula/CSV injection downstream of model defenses (neutralize every string cell + RAW mode; email cell was the real vector); n8n saveDataSuccessExecution:'all' persists PII outside the sanctioned store (set 'none'); public shared-secret needs in-workflow global rate limit before the model node to bound LLM cost. All four findings fixed and enforced by validate-workflow.mjs; 780 tests green.

- 2026-07-22 — ActivityBotv2: lesson captured in patterns/agent-automation — hand-relayed base64 MCP tool output corrupts binaries; verify with container checksums and use CRC32-guided single-byte repair before re-fetching.

## [2026-07-22] ingest | Lesson capture (ActivityBotv2, 2026-07-22): added Gotcha to patterns/agent-automation — hand-relaying base64/binary MCP tool output into files is lossy (single-char transcription errors corrupt the archive); verify decoded binaries against container checksums immediately, and use CRC32-guided single-byte brute-force repair of zip entries before re-fetching. Index already covered the page; appended to wiki/log.md.

## [2026-07-22] ingest | Lesson capture (NewsBreef, 2026-07-22): added Gotcha to architecture/security (Environment Variables) — shell-`source`ing `.env.local` breaks when values contain apostrophes/metacharacters (zsh `unmatched '`); dotenv files are data, not shell syntax — parse with a dotenv parser (Node regex one-liner / dotenv-cli) instead. Index unchanged (page already listed).

## [2026-07-22] ingest | Lesson capture (NewsBreef): added Gotcha to architecture/security — never shell-source .env files (values with apostrophes break zsh sourcing); use a dotenv parser for ad-hoc scripts. Trigger: one-off D1 admin query against NewsBreef prod.

## [2026-07-22] ingest | Lesson capture (Roadmapper, 2026-07-22): two new Gotchas. (1) stacks/web — nested <a> from passing a Next Link into a design-system NavBar logo slot that already renders an anchor caused app-wide React #418/#423 hydration failures with intermittently empty <main>; use the slot's href prop, check slot internals before wrapping in Link. (2) architecture/testing — Playwright reuseExistingServer adopted a stale manually-started server on the test port, running the whole E2E suite against an outdated build; verify port ownership / use different ports for ad-hoc probes. Index descriptions updated for both pages.

## [2026-07-22] ingest | Lesson capture (Roadmapper, 2026-07-22): added Gotchas to stacks/web (nested <a> via design-system NavBar logo slot → React #418/#423 hydration failure, empty <main>; use slot's href prop) and architecture/testing (Playwright reuseExistingServer adopts stale servers on the test port → suite runs against outdated build; verify port ownership, separate ports for probes). Updated index.md descriptions and appended to wiki/log.md.

## [2026-07-22] ingest | Lesson capture (Roadmapper, follow-up sweep): created patterns/pln-ai-apps — PLN AI App Starter Kit v1.4 knowledge: (1) member-context API returns NO email, so email-keyed features (whitelists/sharing) must be challenged at design time and built with a null-email identity seam; (2) pl-design-system's internal @components/* alias must be mapped in the consumer app's tsconfig paths (exclude doesn't skip type-checking of imported files); (3) env-gated dev-identity shim (DEV_AUTH=1 + dev_user cookie) makes the full authorization matrix testable locally for external-SSO apps — cross-linked as a Rule on architecture/testing. Added to index.md.

## [2026-07-22] ingest | Lesson capture (Roadmapper follow-up): created patterns/pln-ai-apps (PLN starter-kit v1.4: no-email member context + null-email identity seam; @components/* tsconfig alias mapping; DEV_AUTH test-identity shim pattern), cross-linked from architecture/testing Rules, indexed in index.md, appended to wiki/log.md.

## [2026-07-23] ingest | Lesson capture (roadmap-builder.4): added Gotcha to patterns/agent-automation — OAuth-based MCP server auth failing with "Unrecognized client_id": Dynamic Client Registration client_id cached in macOS keychain (Claude Code-credentials → mcpOAuth) outlives the provider-side registration; restarts/retries never clear it. Fix: back up blob to a separate keychain item, delete only that server's mcpOAuth entry, re-run auth flow, verify a fresh client_id in the authorize URL. Also: PKCE/state/localhost-callback are per-attempt, so pre-restart auth URLs are always dead.

## [2026-07-23] ingest | patterns/agent-automation: added Gotcha "stale MCP OAuth client registration survives restarts" — Symptom: Unrecognized client_id on MCP OAuth authorize despite restarts/URL re-paste; Root cause: Dynamic Client Registration client_id cached in keychain (Claude Code-credentials → mcpOAuth) after provider pruned the registration; Resolution: back up blob to separate keychain item, delete that server's cache entry, re-auth (fresh client_id); Prevention: suspect stale cached registration on invalid_client/Unrecognized client_id, grep credentials store for the failing client_id, verify new authorize URL has a different client_id, never reuse pre-restart auth URLs (per-attempt PKCE/state/localhost listener).

## [2026-07-23] security-review | roadmap-builder.4 (Roadmapper) — full-app review, 5 findings recorded
- Scope: entire `app/` (Next.js 14 App Router, Supabase service-role store, LabOS cookie auth, invite/share flows, PDF export). Confirmed findings recorded in architecture/security-findings: Next.js 14 EOL with unpatched advisories (medium); live service_role key inside deploy-zip root as process risk (medium); DEV_AUTH shim not NODE_ENV-guarded (low); no CSRF/Origin check on cookie-authed mutations (low); no length caps on free-text fields (low); unbounded token→identity cache (low). Nothing fixed yet — review-only, fixes await owner decision.
- Checked and dismissed (not re-litigating next time): IDOR — every route resolves role via `authorizeRoadmap`/`roleForRoadmap` server-side, cross-parent checks on initiative/item/sprint moves are correct; invite tokens — `crypto.randomBytes(18)` base64url (144-bit), rotatable, owner-only management, 404 on dead tokens; XSS — zero `dangerouslySetInnerHTML`/innerHTML/eval, React escaping throughout, PDF export is vector drawing (no HTML path, so jspdf's bundled old DOMPurify is unreachable); SQL injection — all queries via supabase-js parameterized builders; RLS — enabled on all 6 tables with no policies, closing the anon Data API while the server uses service role; secrets hygiene — no secrets in client bundle, repo config, or .mcp.json; token never logged/persisted (memory-only 5-min cache); CSP frame-ancestors matches the PLN iframe contract, no X-Frame-Options.

## [2026-07-23] ingest | Security review (roadmap-builder.4 / Roadmapper, 2026-07-23): full-app review of app/ (Next.js 14, Supabase service-role store, LabOS cookie auth, invite links). 5 confirmed findings recorded in architecture/security-findings.md: Next.js 14 EOL unpatched advisories (medium, unused surfaces so low practical risk); live service_role key inside deploy-zip root (medium process risk); DEV_AUTH shim lacks NODE_ENV guard (low); no CSRF/Origin validation on cookie-authed mutations (low, conditional on LabOS SameSite); no free-text length caps (low); unbounded auth cache (low). Dismissed after check: IDOR (consistent server-side authorizeRoadmap), invite-token strength (144-bit crypto-random), XSS (no sinks; PDF is vector-only), SQLi (parameterized supabase-js), RLS (enabled, no policies, anon API closed), client-side secret exposure (none). Review-only; no fixes applied. Logged in wiki/log.md.

## [2026-07-24] ingest | Lesson (roadmap-builder.4 / Roadmapper, 2026-07-24): Radix Dialog/Drawer exit-animation reopen race → flaky Playwright. A share-drawer E2E pressed Escape then re-opened the drawer within its 200ms slideOutRight close animation and asserted on reopened content; failed ~50-65% without retries ("element(s) not found") even though the reopen's data fetch returned 200. Radix keeps content mounted during the exit animation and swallows a reopen dispatched inside that window, so data-state never returns to open. Fix: wait for the drawer body testid to be hidden before reopening (await expect(getByTestId('share-panel')).toBeHidden()) — 25/25 green with --repeat-each=5 --retries=0. Recorded under architecture/testing.md Gotchas. Diagnosis tell: fetch 200 + element not found + error-context snapshot shows drawer closed = animation race, not data path.

## [2026-07-28] ingest | Lesson (ActivityBotv2 / PLAA bot, 2026-07-28): user field-testing surfaced two validator classes and reversed one rule. (1) Syntactic vs semantic validity: isParseableDate passed 1999-11-11 (and the two-digit-year fix passed 31.12.99 as 2099) — added a code-layer date-eligibility window (now±12mo, per-question allow_future:false for past-only questions, `now` passed explicitly for deterministic tests) plus prompt-side "today is X / reject >12mo" instructions and relative-date resolution (today/yesterday/last Friday). (2) Entity-extraction contract: the model stored "I introduced Jane Doe to John Smith" verbatim in contact_a_name — fixed with an explicit prompt extraction example + ask-if-unsure, backed by a nameShapedViolation code heuristic. (3) Rule reversal: the 2026-07-20 keyword-anywhere URL check admitted wrong-domain links; product now mandates host === directory.plnetwork.io + /forum|/events as a path segment (parseUrlParts, no URL global in the n8n sandbox). Recorded/refined in patterns/llm-bot-structural-defense.md (Gotchas + move 5); index.md summary updated.

## [2026-07-28] ingest | Lesson capture (ActivityBotv2 / PLAA bot, 2026-07-28): field-testing lessons recorded in patterns/llm-bot-structural-defense.md — (1) new gotcha: syntactic validity ≠ semantic validity (parseable dates like 1999-11-11 need code-layer eligibility windows; structured name fields need explicit prompt extraction contracts + code backstops); (2) refined move #5 in place: keyword-anywhere URL checks reversed by product to strict host + path-segment matching ("normalize formats loosely, match destinations structurally"). index.md summary updated; wiki/log.md appended. Implementation: config/prompt-assembly.mjs (dateEligibilityViolation, relative-date normalizeDateInput), workflow/lib/constraint-checks.mjs (EXPECTED_URL_DESTINATIONS, nameShapedViolation, groupNomineeViolation), widget ack-status/quick-actions, blog_post disabled; 833 vitest + 17 Playwright green.

## [2026-07-28] ingest | Lesson (roadmap-builder.4 / Roadmapper, 2026-07-28): two E2E gotchas from the editor/viewer invite-link feature. (1) New gotcha in architecture/testing.md: an open Radix modal Drawer sets aria-hidden on the page background, and Playwright getByRole queries the accessibility tree — so a by-role click on background chrome (nav avatar "Dev One") can never resolve and times out in a deadlock; a testid/[aria-label] locator finds the same element (count 1 vs 0 = the tell). Pre-existing broken test (failed on pristine baseline too); fix = close the drawer (Escape + expect hidden) before touching background elements by role. (2) Refined the reuseExistingServer stale-build gotcha with a new variant: git stash → build → stash pop leaves .next compiled from the stashed tree, so a fresh Playwright webServer serves the old UI and exactly the new-testid tests fail — rebuild after any stash/checkout dance before rerunning E2E.

## [2026-07-29] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): architecture/testing.md Gotchas updated — new entry "Open Radix modal makes background elements invisible to getByRole" (modal Drawer aria-hides page background; Playwright role locators query the a11y tree → by-role click on nav chrome deadlocks; close overlay first; tell = getByRole count 0 but testid/aria-label count 1), plus refined the reuseExistingServer stale-build entry with the git-stash variant (stash→build→pop leaves stale .next; fresh webServer serves old UI; rebuild after any stash/checkout dance). Context: implementing role-based (editor/viewer) invite links; discovered the dev-user-switcher e2e test was broken on pristine baseline too. wiki/log.md appended.

## [2026-07-29] ingest | Lesson (roadmap-builder.4 / Roadmapper, 2026-07-29): PLN connect-flow approval links repeatedly expired unapproved (7 sessions) because the agent posted the connectUrl mid-turn and then ran a blocking foreground poll — harness hides text between tool calls, so the member never saw any link. Fix: background the poll+upload watcher, put the link as the turn's final message, and sync with the member before starting the 10-minute window. Recorded as a new Gotcha in patterns/pln-ai-apps.md.

## [2026-07-29] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): patterns/pln-ai-apps.md gained Gotcha "Connect-flow approval links never seen: don't sandwich user-action links between tool calls" — time-limited connectUrl posted mid-turn before a blocking poll is invisible to the member (harness renders only the turn's final text reliably); run the watcher as a background task and end the turn with the link; sync user presence before starting the 10-min window. wiki/log.md appended.

## [2026-08-04] ingest | Lesson capture (local machine, 2026-08-04): "can't update npm" root-caused to a stale root-owned Node 14 install in /usr/local shadowing nvm's npm — the executed binary was /usr/local/bin/npm (9.8.1) under nvm's node 22, so updates either hit EACCES on the root-owned tree or landed in nvm's prefix while the shadowing binary kept reporting 9.8.1. Removed the /usr/local install (node, npm, npx, node_modules incl. old yarn/truffle/near-cli/graph-cli + dangling symlinks), bumped Node 22.22.1→22.23.2 via nvm (npm@12.0.2 engine-required ^22.22.2), npm now 12.0.2, all 8 nvm globals migrated. Two lessons recorded: new page patterns/dev-environment.md (shadowed-install gotcha with which -a / npm debug-log line-0 diagnosis, npm engine patch-bump gotcha); new gotcha in patterns/agent-automation.md (sudo has no TTY in agent shells incl. `!` passthrough — use osascript "with administrator privileges" for the native macOS password dialog). index.md updated for both.

## [2026-08-04] ingest | Lesson capture (local machine, 2026-08-04): "can't update npm" root-caused to stale root-owned Node 14 in /usr/local shadowing nvm's npm (executed binary /usr/local/bin/npm 9.8.1 under nvm node 22; updates hit EACCES or landed in nvm's prefix while the shadow kept reporting 9.8.1). Removed /usr/local install, Node 22.22.1→22.23.2 (npm@12 engine requires ^22.22.2), npm now 12.0.2, globals migrated. Recorded: new page patterns/dev-environment.md (shadowed-install gotcha, which -a + npm debug-log line-0 diagnosis, engine patch-bump gotcha); new gotcha in patterns/agent-automation.md (sudo TTY-less in agent shells incl. `!` passthrough → osascript "with administrator privileges"). index.md + wiki/log.md updated.

## [2026-08-04] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): architecture/testing.md gained Gotcha "Vitest run from the wrong cwd: Cannot find package '@/…' looks like broken aliases" — shell cwd drifted to repo root, vitest still ran the nested app's tests but resolve.alias never applied; diagnostic tell is unexpected path prefix on FAIL lines + a previously-green suite failing identically; fix is cd into the package dir. wiki/log.md appended.

## [2026-08-05] ingest | Lesson capture (roadmap-builder.4): testing.md Gotcha added — vitest run from drifted cwd yields "Cannot find package '@/…'" (alias never applied) while still executing tests; diagnose via FAIL-line path prefix and control-run of a previously-green suite; re-run from the package dir.

## [2026-08-05] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): patterns/pln-ai-apps.md gained Gotcha "LabOS Deploy click 'blocked by CORS' is usually a masked gateway timeout" — deploy endpoint's slow build times out at a gateway that omits CORS headers, browser mislabels it; API preflight is actually correct and the build completes. Verify via deployed-artifact marker grep (curl --globoff the Next.js page chunk) before retrying; then hard-refresh the iframe. wiki/log.md appended.

## [2026-08-05] ingest | Lesson capture (roadmap-builder.4): pln-ai-apps.md Gotcha added — LabOS Deploy click CORS error masks a gateway timeout while the build succeeds; API CORS verified correct via OPTIONS probe; resolution is marker-grep of the served Next.js chunk (curl --globoff) + hard refresh, not re-clicking.

## [2026-08-11] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): stacks/web.md gained Gotcha "Middleware matcher with a bare dynamic segment silently never matches (Next 14)" — `matcher: '/agent/:token'` compiles to a regexp with the param dropped (verify in .next/server/middleware-manifest.json); fix is a `:path*` wildcard matcher + exact-path check in code. Found while implementing agent-links content negotiation.

## [2026-08-11] ingest | Lesson capture (roadmap-builder.4 / Roadmapper agent-links): stacks/web.md Gotcha added — Next 14 middleware `matcher: '/agent/:token'` compiles with the dynamic param dropped (middleware-manifest.json regexp only matches /agent and _next/data .json forms), so the middleware silently never runs on token URLs; fix = wildcard matcher '/agent/:path*' + exact-path regex check in code; prevention = verify compiled matchers[].regexp after any matcher change. wiki/index.md + wiki/log.md updated.

- 2026-08-12 14:14 — Created `~/Desktop/local-weather` (static HTML/JS + Open-Meteo). Onion gate: skipped — throwaway spike, user confirmed explicitly.

- 2026-08-12 14:33 — Pushed `local-weather` to GitHub as public repo https://github.com/wswarren12/local-weather; consolidated README.

- 2026-08-12 14:34 — new-project | `plaa-static-prototype`: created the exact, dependency-free Alignment Asset static prototype at `~/Desktop/PLAA_Web_Design`; Netlify static hosting accepted as a deliberate Vercel-default deviation. [[projects/plaa-static-prototype]] [[decisions/2026-08-12-plaa-static-prototype-netlify]]

## [2026-08-12] decision | Roadmapper V2: LabOS provisioned Postgres over Supabase
- ADR: wiki/decisions/2026-08-12-roadmapper-v2-labos-provisioned-postgres-over-supabase.md

## [2026-08-12] ingest | Lesson Capture (Roadmapper V2 migration, 2026-08-12): added 2 gotchas to patterns/pln-ai-apps — (1) merging an app over the kit scaffold leaves placeholder files and can copy .env secrets in (caught stray server.js + .env.local with service-role key in RoadmapperV2/app before first zip); (2) Supabase REST → raw pg port silently changes DATE columns from 'YYYY-MM-DD' strings to local-midnight JS Dates (fix: setTypeParser(1082)); header updated for kit v1.7 provisioned-Postgres contract. ADR recorded: Roadmapper V2 LabOS provisioned Postgres over Supabase.

## [2026-08-12] ingest | Lesson Capture (Roadmapper V2, 2026-08-12): added gotcha to patterns/pln-ai-apps — LabOS v1.7 provisioned-db credentials are injected runtime-only (never member-visible; no DATABASE_URL in Deployment settings), so data migrations must run inside the app. Resolution: seed-on-boot module (empty-db guard + PostgREST fetch + single transaction), e2e-verified 189/189 rows against real Supabase + local Postgres 16 before deploy. Corrected RoadmapperV2/migration/README.md accordingly.

## [2026-08-14] decision | Security review (roadmap-builder.4 / Roadmapper, automated commit review on 909e04b): confirmed HIGH — cross-roadmap item import (F-15b) allowed link creation with only read access on the source, making sync propagation a read→write escalation channel. Fixed in 382c106 (import now requires owner/editor on source; invariant documented in lib/sync.ts; regression test added). Recorded in architecture/security-findings.md under Authorization & Access Control.

## [2026-08-15] decision | Security review capture (roadmap-builder.4 / Roadmapper): automated commit review of 909e04b confirmed HIGH authz finding — F-15b cross-roadmap import created sync links with only read access on the source roadmap, so edit propagation in lib/sync.ts became a read→write privilege-escalation channel into the source. Fixed in 382c106: import requires owner/editor on BOTH roadmaps (viewer 403, invisible 404); invariant documented in lib/sync.ts; regression test asserts viewer import is rejected and source stays unlinked. Recorded in architecture/security-findings.md (Authorization & Access Control) with prevention rule: link/mirror creation must be authorized at the strictest tier of any write it later enables.

## [2026-08-15] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): patterns/pln-ai-apps.md gained Gotcha "Deploy-window container without injected secrets silently serves an in-memory app" — LabOS container booted without Supabase env, memory-store fallback served an amnesiac app, member's created roadmap/items evaporated and follow-up requests 400'd. Fix: /health 503s when memory fallback would engage outside dev (2d75910). Diagnosis pattern: DB API logs show GETs for uuids never INSERTed.

## [2026-08-15] ingest | Lesson capture (roadmap-builder.4 / Roadmapper): LabOS deploy-window container served without injected Supabase secrets → silent MemoryStore fallback → member "created" a roadmap/initiative that existed only in RAM; Supabase-backed container 400'd those ids ("can't create roadmap items"). DB verified healthy; local instance against prod Supabase created items fine. Fix 2d75910: /health returns 503 when memory fallback would engage outside dev so the sandbox rejects misconfigured deploys. Recorded in patterns/pln-ai-apps.md Gotchas + wiki/log.md.

## [2026-08-15] decision | Security review (roadmap-builder.4): 2 MEDIUM TLS-verification findings on the new PLN Postgres layer — accepted per kit contract (no CA distributed) with PGSSLROOTCERT strict-verify escape hatch shipped (commit for TLS hardening after bb61c65). Recorded in architecture/security-findings.md under Secrets & Configuration.

## [2026-08-15] decision | Security review capture (roadmap-builder.4): automated review flagged rejectUnauthorized:false on the new PLN Postgres pools (postgres.ts, db/migrate.js). Accepted as the kit-documented platform contract (PLN distributes no CA bundle; strict verify risks failing the first-boot data migration), mitigated by shipping a PGSSLROOTCERT escape hatch that turns on strict CA verification without code changes; no runtime downgrade path. Recorded in architecture/security-findings.md; draft re-registered with the hardened build.

## [2026-08-17] ingest | Lesson capture (roadmap-builder.4): architecture/testing.md Gotcha — calendar-rot in today-line e2e (hard-coded 2026-08 item dates expired over a weekend); fix = clock-relative seeds; rule = date-dependent assertions must derive fixtures from the current date.

## [2026-08-17] ingest | Lesson capture (roadmap-builder.4): calendar-rot gotcha added to architecture/testing.md — today-line e2e seeded hard-coded 2026-08 dates that the wall clock crossed over a weekend, failing with no code change; fixed with clock-relative fixtures (today ±14d); prevention rule: date-dependent assertions derive fixtures from new Date() or freeze the clock.

## [2026-08-17] ingest | Lesson capture (Decision Council / LabOS deploy): deployed the WRONG source tree — `ai-app-starter-kit-AI-Council/app` (July build) instead of the actively-developed `ai-app-starter-kit-v1.3-LLMCouncil.3/app` (edited same day). Root cause: both `pln-app.config.json` files carry `appId: decision-council`, so the deploy API accepted the stale tree into the live slot; name-based discovery found the stale dir first. Compounding: the pre-deploy local smoke test hit the OTHER project's already-running process on :3000 (`EADDRINUSE` swallowed in a background log) and returned health 200 + matching CSP — a false confirmation. Tell: `/api/config` response shape didn't match the source under test. Resolution: hash-verified zip provenance (`unzip -p app.zip server.js | shasum` vs each candidate), re-registered the correct tree via draftEndpoint (`requiredEnvVars=["ANTHROPIC_API_KEY"]`, `DEV_MEMBER` deliberately excluded — it fakes identity for cookie-less requests), 75/75 vitest green, member clicked Deploy, new pod verified booting clean. Recorded as a new Gotcha in patterns/pln-ai-apps.md ("Two kit copies sharing one appId").
- 2026-08-18 16:01 — roadmap-builder.4: added roadmap color palettes (PL Blues default, Sunset, Orchid; chosen at creation) and item/sprint completion (completedAt date → palette-green bar). New migration 009, palette+completedAt across memory/postgres/supabase stores, sync propagation, forms, PDF export. Full test suite green (242 vitest + 54 e2e).

## [2026-08-20] ingest | Lesson capture (Decision Council): background polling fixed the LabOS idle timeout but still allowed an endless “Drafting the decision table” state because the Anthropic worker fetch and browser poll loop had no application deadlines. Fixed with a faster table model, 3-minute upstream request deadline (retry once), 10-second member-context deadline, 15-second poll deadline, and 7-minute total draft deadline. DOCX review also hardened XML output against forbidden control characters and added a real download-endpoint regression test. Recorded in patterns/pln-ai-apps.md.

## [2026-08-20] feature | Decision Council failures now include “Copy error to report”: copies a privacy-safe support report with timestamp, phase, deliberation ID, and bounded raw error; falls back to a selectable native prompt when iframe clipboard permission is unavailable. Added coverage to the deploy-contract suite; 78/78 tests green.
- 2026-08-20 — refined pln-ai-apps gotcha: env-file zip-exclusion patterns miss suffix-style names (`local.env`); post-zip secret grep is the catch (Decision Council redeploy)
