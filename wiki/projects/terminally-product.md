---
title: Terminally Product
tags: [project, product-discovery, agents, labos]
status: locally-implemented-production-blocked
---

# Terminally Product

- **Project:** `~/Desktop/TerminallyProduct/`
- **Specification:** `PLAN-ProductDecisionTerminal-v1.md` (unchanged)
- **Checkpoint:** `BUILD-STATUS.md`
- **Status (2026-09-09):** Bill approved domain/core and all 60 notes. Eight-stage app, HTTP/local official MCP, SQL knowledge, private learning and synthetic evaluation implemented on local `main`. Independent security review: zero issues. Correctness/UI F2–F5 passed recheck; an initially incomplete F1 fix was corrected at `d7c230e` and independently accepted in its focused repair/blast-radius scope with no findings. Not deployed, not live judgment, not complete-to-spec while external/human gates remain.

## Approved core

A resumable, evidence-tagged eight-stage product review that produces a complete PRFAQ and a premortem with every risk mitigated, accepted or explicitly open. Database, UI, model vendors and hosting are replaceable adapters. No PRD generation, custom auth/billing or automatic learning promotion.

## Direction

User selected LabOS build kit v1.11 (`~/Desktop/ai-app-starter-kit-v1.11.zip`, extracted to project `.build-kit/`) and managed Postgres. App-internal roles use Sonnet for routine stages/research/auditor/panelists, Opus for chairman synthesis and senior judgment. API IDs remain unverified. Deployable root is project `app/`; no nested `.build-kit/app/` deployment fork. Kit requires Next.js, Tailwind v4, PL components, baseline analytics, `/health`, iframe support, and self-contained Docker deployment.

Implemented capability boundaries: owned review persistence, approved knowledge retrieval, model calls, verified principal, clock. Onion enforcement, canary and accepted LabOS stack ADR are implemented. Production verifier denies; no auth workaround exists.

## Research

`knowledge/README.md` indexes 60 original source-attributed notes, all explicitly approved by Bill in local git. Parent structural checks found all required frontmatter fields, source URLs, question headings, eight-stage coverage and 158–177 body words per note. Not a full YAML or semantic/source audit. Source access limits and corrections to Cherny/ChatPRD claims are recorded there. Checked local main-snapshot import and approved-only SQL retrieval are tested; local import is not live CI sync. Approval does not remove the disclosed source-access limits.

## Unresolved platform contracts

The v1.11 member-context skill explicitly says personalization only, not authentication—even for server-side forwarding. Confidential per-user review access needs a supported verified-principal contract; no custom auth or client-supplied ownership shortcut is authorized. Treat this as a deployment blocker, not a reason to invent authorization. Confidential production routes and remote MCP remain denied.

Database credentials are runtime-only; direct CI-to-Postgres connectivity is undocumented, not proven impossible. Live knowledge-sync transport remains undecided. Kit TLS example disables certificate verification; obtain the platform's supported CA/hostname-verification posture before confidential deployment. Remote MCP likewise needs owner-scoped delegation. See project `BUILD-STATUS.md` for the exact handoff.

## Local verification and review repair

App path: `cd ~/Desktop/TerminallyProduct/app && npm ci && npm run db:local`. Only disposable synthetic ideas; Ctrl+C destroys the owned fixture database. `app/README.md` and `BUILD-STATUS.md` contain exact commands and the full requirement ledger.

Final post-fix checks: verify 16 tests, PG 14, surface 7, official MCP 2, browser cleanup 1 + complete flow 1, boundary canary, three full synthetic trace evaluations, 60-note validation/main import replay, build, fresh production root/health/TLS/denial smoke and audit (0 vulnerabilities). Parent independently reran verify at `d7c230e` with all 16 passing and clean Git state. No live provider or judge, remote publication/connect/deploy, customer data or container-fit measurement.

Confirmed review repairs: chairman disagreements require targeted answers even with unanimous signals, and all accepted concerns persist separately across question batches/model omission/crash recovery (nine concerns per framing, three questions at a time; overflow pauses, never truncates); suggested reframes validate nonempty changed canonical intake before offering acceptance; clarification/risk evidence links resolve and transfer focus; `/status` uses newly fetched revision; terminal-invalid learning attempts advance a durable bounded key while transport repairs resume. Evidence screenshots also exposed escaped PL screen-reader labels; positioned transcript contains them without changing PL. Canonical lessons: [[../patterns/llm-bot-structural-defense]] and [[../architecture/testing]]. The independent security review found no vulnerability; no speculative security catalog entry added.

Remaining gates: supported confidential principal and remote MCP delegation, authorized live knowledge-sync/scheduler transport, secure runtime DB/provider configuration and live availability/source truth, live ordinary/senior judgment and strong/weak discrimination, Bill's human scores and PRFAQ→prd-writer ≤2 clarifications, learned-note semantic improvement, calibrated judge before enabling it, metadata/deploy authorization and measured 384Mi runtime/2Gi build fit. Completed artifacts remain immutable by approved surface scope, not a hidden document-editor claim.

## Authorized local live runner — 2026-09-10

Bill approved a separate loopback-only real-provider entrypoint after `23b355f`. Run `cd ~/Desktop/TerminallyProduct/app && npm run dev:live`; first startup exclusively creates a blank private `.env.local` template if absent and refuses until the user supplies `ANTHROPIC_API_KEY`, `SONNET_MODEL`, `OPUS_MODEL`. `npm run models:list` is the documented user-run Models API listing command; it was not called during implementation. No invented live model IDs, remote DB setup or new auth stack.

Persistent PG16 lives at ignored/private `app/.data/local-live`, with generated SCRAM authentication and hostname/certificate-verified loopback TLS. Startup checks ownership/system identity, migrations and committed approved-note import; duplicate/foreign/stale clusters refuse rather than being killed/adopted. Ctrl+C drains bounded in-flight checkpoints and **keeps** reviews. Read `app/README.md` for exact precedence, storage/recovery and PG_BIN override. The machine's local programs/users are trusted. Plain Next and remote MCP remain denied; this is not production identity approval.

The live composition reuses the real Anthropic SDK adapter, provider SQL checkpoints and all eight existing stages/gates/private learning. Existing PL layout now explicitly warns about paid calls and transmission to Anthropic/web search. Synthetic preview remains isolated/provider-incapable, skips `.env.local` via native test-mode dotenv semantics, and explicitly blanks provider names against `.env`/`.env.test*`. `npm run test:production` runs true production build/smoke in an owned source copy excluding dotenv/data.

Evidence: verify **19**; focused actual loopback HTTP+PG+SDK transport-mock completion/export/ownership/restart/import/shutdown/failure checks; Chromium real-entrypoint start-to-export with live notice/streaming/mobile overflow check; existing PG **14** plus three fixture traces, surface **7**, MCP **2**, browser cleanup/workflow, canary, 60-note validation/import replay, isolated production build/smoke and audit **0 vulnerabilities**. No real key access, live provider calls/judgment, customer data, publication/connect/deploy or container-fit claim. Independent review of this new exception remains required. Prior `d7c230e` acceptance remains scoped to its earlier repairs.

## Related

- [[../decisions/adr-005-onion-hexagonal-default]]
- [[../patterns/pln-ai-apps]]
- [[../workflows/new-project]]


## Citation-safe terminal conversation — 2026-09-11

User explicitly selected one in-terminal composer/question and automatic intervening work after deliberate submissions. Parent structurally diagnosed a real saved research pause: observed web results but no native citations under a conflicting global JSON-only prompt. The fix separates cited prose from strict extraction and retains native evidence gates/checkpoints, safe pause categories and explicit old-state retry. No actual paid retry was made during implementation; live citation success is still unverified.

The terminal now persists exact new question/answer associations, retains unanswered subsets atomically, sequences authoritative ready revisions only and stops on human gates/errors/Pause/disconnect. Native progress counts validated milestones, not time/stage labels. Page load/select never resumes spending. Canonical lessons: [[../patterns/llm-bot-structural-defense#Native-cited search prose and strict JSON are different provider phases (Terminally Product, 2026-09-11)]] and [[../architecture/testing]]. Pinned PL/Linear/Stripe world, production denial, ownership/TLS, all eight stages/approved notes/learning gates remain unchanged.

Checks pass: verify 21, PG 16, surface 7, MCP 2, synthetic browser cleanup/workflow, actual local-live entrypoint SDK-mocked browser including pause/duplicates/conflicts/unmount and tab-open checkpoint shutdown, canary, 60-note validation/import, isolated production build/smoke, audit zero. One desktop/mobile screenshot batch plus one correction/confirmation; detector once `[]`. Fresh independent source/screenshot review remains required. The verified owned user's live app was gracefully stopped before edits and remains stopped for parent acceptance/restart; its saved review/preferences and private data/env were not mutated/reset by the worker. Select the retained review and explicitly Retry only after restart; do not clear it.


## Proof Terminal replacement and actual-response recovery — 2026-09-11

Bill chose Proof Terminal, not Quiet Shell (seed a9f9e615/candidate 7/code-led), replacing the rejected dark dashboard/card world. Fullscreen paper/ink mono, provenance gutter, borderless bottom prompt, readable provisional streaming and temporary command views are implemented with unchanged PL accessibility, Onion and product/security gates. Parent owns fresh independent source/screenshot finish acceptance and user-app restart; no worker self-certification.

The second failure had valid native citations; exact JSON fences plus model-copied quote drift were separate downstream faults. Corrected shared parsing and provider-owned source assembly passed an authorized private **actual-cache-key adapter/domain replay: 17 sources, 17 findings, three usage messages, zero provider calls**, with both reviews/preferences/all four provider checkpoints hash-unchanged. Frozen research retry reuses successful search and avoids cached-invalid extraction loops through bounded format-2/legacy compatibility. App and maintenance PG remain stopped; user must explicitly Retry the retained review after parent restart, never reset/delete.

Checks: verify22, PG18, SDK-mocked live2, synthetic browser cleanup/workflow, surface7/MCP2, canary, notes60/import, three structural traces, genuine isolated production build/smoke and audit0. Twelve paired first/confirmation screenshots opened, one correction batch, detector once `[]`. Actual saved-response recovery is not fresh live judgment. Full evidence in project BUILD-STATUS and `~/.pi/agent/recovery/terminally-product/redesign-v2/`; no original payload export, keys, live calls, user-data writes, nested agents or alternate mode.

Canonical lessons are refined in [[../patterns/llm-bot-structural-defense]], [[../architecture/testing]] and [[../patterns/agent-automation]]. No raw-vault or unrelated-project edits. Earlier platform identity/MCP/sync/scheduler/deploy/container-fit and live/human judgment gates remain unchanged.


## Fixed public Product Hunt paid evaluation — 2026-09-14 (in progress)
The fixed five-case corpus is checked in under `app/evals/producthunt/2026-09-14`. Only public modelInput enters the ordinary app; votes/comments remain held out. Actual Sonnet5/Opus5 calls and a real browser journey have occurred for Hello Inbox only so far. Two original private reviews remain excluded with repeated metadata/hash equality and zero learning candidates. No completed five-case acceptance is claimed.

Live failures drove narrow repairs: explicit-only learning inbox inspection; buffered SDK streaming under unchanged120s whole-operation/30s establishment/zero SDK-retry limits; frozen reference/status guidance and domain validation within one bounded repair; exact duplicate output compaction under unchanged500k-character cap; evaluator HTTP/SSE/revision fail-stop after108 retained rejects. Unknown-cost no-ID timeouts remain unknown. Current checkpoint: verify32, PG20, canary, SDK/SQL/browser, surface7, evaluator3; final live outcome and independent review remain pending. Owning lessons: [[../patterns/llm-bot-structural-defense]], [[../patterns/pln-ai-apps]] and [[../architecture/testing]]. No raw-vault, provider-key output, original-review writes, publication or deployment.

**Pass-1 stop:** Hello Inbox revision61 paused/provider_invalid_output; no artifacts/exports. Four cases unstarted.20 retained messages749592/87942 input/output tokens plus3 unknown-cost no-ID requests. One additional repair was unauthorized because browser retry permission survived the initial ready state; preserved and now red/green fixed. Latest retained PRFAQ has one mixed provenance-class error; exact path diagnostics are code-tested, not live-confirmed. Final verify33/PG20 plus evaluator4/live/browser/surface/MCP/knowledge/notes/production/audit0 pass. Original-review hashes unchanged immediately before owned app/PG graceful stop. All further paid calls require independent harness/fix confirmation and explicit new approval; no five-case completion claim.

## Paid public evaluation pass-2 — stopped, not acceptance (2026-09-14)
Five frozen Product Hunt cases attempted; only Slashy technically completed via HTTP with four genuine exports, and its evidence/premise/present-action claims fail content quality. Hello65/OzBrain54 PRFAQ and Nimble36/AppZapper28 chairman remain paused. Browser exercised three cases but no full completed journey.88 retained messages (Sonnet5/Opus5),3,156,902 input/296,570 output tokens plus five unknown-cost no-ID requests across both passes. Two original private reviews and zero learning candidates remain hash-unchanged. Independent review and a tested general correction/new approval are required before more paid calls; no acceptance, deployment or product-failure inference from malformed output.
Code08fc361 adds common experiment time-unit/full-cycle guidance; d4233ce pinpoints audit ordering/missing-experiment paths inside the same single repair without sorting or altering scores/evidence. Verify35, PG20, canary, evaluator4, genuine Slashy artifact gate, both synthetic browser paths and isolated production build/smoke pass. General semantic gaps: source affiliation/recency, analog-product/version transfer, architecture inference and unsupported present company actions. See repo BUILD-STATUS and ignored pass-2 quality/usage/journal for exact section references; no private body or raw approved-note changes.

## Paid public evaluation pass5 — review findings closed (2026-09-15)
The reviewer's two remaining P1 classes became deterministic gates, each verified to reproduce its exact findings on the pass-4 documents before the fix: `undisclosed_independence` and `company_voice`. Narrowed against live false positives (customer/resource commitment is legitimate). OzBrain restarted from research on the same ID; the HN markdown over-read is gone. Nimble/Slashy/OzBrain/AppZapper regenerated (`dbba49b`), Hello Inbox's pass-4 browser journey retained and re-checked. All five `completed` with four exports, 8 FAQ sections, 14/19/15/16/16 risks; no independence or company-voice issues remain in any delivered document. Discovered and fixed en route: a tightened canonical schema retroactively invalidated an accepted premortem (bounds are now generation-time only), length diagnostics lost their number, and trace repair needed the computed correct section set. Smoke all green (verify44, PG20, canary, mocks, synthetic browser, isolated production build/denial, evaluator5; health200, foreign origin403, private metadata unchanged). Cumulative286 unique messages, ≥25 unknown-cost, USD unknown. Open: independent rescoring of the regenerated documents.

## Paid public evaluation pass4 — five completions, independent ship (2026-09-15)
The pass3 "unknown cause" was the schema shape: the chairman wire schema alone carried14 optional parameters (official docs: disproportionately expensive grammar compilation). Optional-free `[{field,value}]` wire form + local record conversion (`e34172c`) cleared it; eleven consecutive Opus chairman calls succeeded. Also added: numeric-entailment gate on cited-fact/user-assertion figures, class-naming/path-naming repair diagnostics, bounded PRFAQ prose, state-derived300k artifact bound, scoped repair prompt, chairman concern-retention guidance. All five fixed cases completed eight stages with Markdown+DOCX; Hello Inbox ran intake→download in a real browser. Independent reviewer (`66120762`): Hello3/3/3/3/3/3, Nimble3/2/3/2/3/3, Slashy3/2/3/2/3/2, OzBrain3/1/2/2/3/2, AppZapper3/2/3/2/3/3 →4/5 at bar, `ship`; OzBrain's evidence1 is a frozen pass2 research over-read. Cumulative190 unique messages, ≥14 unknown-cost requests, USD unknown; private reviews hash-unchanged. Record: `app/evals/producthunt/2026-09-14/RESULTS.md`, code `7863e1e`. Open: OzBrain research restart, source-affiliation domain classes, company-voice phrasing check.

## Paid public evaluation pass3 — recurrent transport stop (2026-09-14)
Runtime a6e0dc9 fixes SDK dynamic-record collapse with the same14 optional named intake fields, own-undefined/unknown-key rejection and all local gates; all15 wire schemas inventoried. Hello95 and Nimble65 nevertheless stop on recurrent30s Opus chairman stream-establishment timeouts, of unknown cause; no retry or remaining-case restart authorized after supervisor stop.0 new completions/0 complete browser journeys/0 quality acceptances. Historical Slashy exports persist but fail semantic review. New partial scores2/1/2/2/0/0 for both: useful matched-workload/full-cycle experiments, yet unsupported momentum inference and an Exa→Parallel price misattribution remain.107 cumulative messages3,747,941/336,623 tokens plus8 unknown-cost no-ID requests; failed work preserved. Private hashes/learning0 unchanged. Verify39/PG20/evaluator5, both synthetic browser paths, isolated production and historical export checks pass. Native syntax, schema compatibility, semantic truth and live availability are separate gates; see structural-defense lessons and repo recovery packet.
