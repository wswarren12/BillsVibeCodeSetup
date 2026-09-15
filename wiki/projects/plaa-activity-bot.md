# PLAA Activity Submission Bot

Status: Airtable migration deployed to n8n Cloud; all-activity production smoke passed (2026-08-24)
Repo: https://github.com/wswarren12/ActivityBotv2 (private)
Stack: vanilla-JS web component widget + n8n Cloud workflow + Claude Sonnet 4.6 intake / Haiku 4.5 review / Sonnet 4.6 escalation + Airtable Pending Activities base

## What it is

Conversational activity-submission intake for the PLAA program: a chat modal opens from an activity card's Submit button already knowing the activity, asks that activity's exact question set, runs an automated completeness review, then writes an idempotent hub Submission plus a linked per-activity detail record to the WG-owned Pending Activities Airtable base. Also answers program FAQs from an injected corpus; declines everything else (tax/legal always).

⚠️ Deviation from house stack (deliberate, per PRD): no Next.js/Supabase — the frontend must embed in a third-party site as one dependency-free bundle, and the team runs orchestration on n8n. Onion instincts still applied: pure logic modules (`workflow/lib/`, `config/prompt-assembly.mjs`) are framework-free and shared between tests and the workflow's Code nodes.

## Key facts

- `activities.json` is the single source of truth for UI/prompts; only Airtable catalog activities marked Bot Intake are visible.
- Compliance vocabulary is load-bearing: "collect" never "earn" — enforced by tests, not convention.
- Review chain: deterministic constraints → Haiku verdict JSON → Sonnet escalation only on `borderline` → pass / follow-up / write-as-flagged. Never lose a confirmed submission (malformed verdict → flagged Raw Payload, not a drop).
- Airtable contract: serial IDs from ID Sequences, exact-email Participant/AAID registry match, idempotency dedupe, reviewer-owned fields structurally unwritable, verbatim participant detail text.
- The PLAA Cloud plan has no Variables feature (`403 feat:variables`): generated exports use one client-token placeholder + the public fixed base id, while Airtable/Anthropic secrets stay in n8n Credentials.
- `npm run test:cloud` drives every enabled activity twice through the deployed webhook and verifies linked Airtable hub/detail rows or the expected referral block; it cleans up by default, while `SMOKE_KEEP_RECORDS=1` retains review fixtures. Hidden/refusal scope is also supported.
- Production all-activity smoke: 14 required linked writes, 2/2 expected referral blocks, 10/10 hidden-activity refusals; all rows cleaned. A retained-record follow-up left six requested `test@plaa.com` / `Testy McTesterson` hub/detail pairs for review; referral and outstanding-contribution correctly wrote zero rows because that synthetic identity violates their distinct-person rules. Case-study one-shot extraction remains model-nondeterministic and safely asks follow-ups without writing.
- Smoke fixtures must satisfy cross-field identity rules: `test@plaa.com` + nominee `Testy…` trips the self-nomination local-part heuristic, and using the same email for submitter/referee trips self-referral. Do not bypass these guards for test convenience; use distinct approved test identities when those write paths must be exercised.
- 687 deterministic tests plus 13 Playwright checks; direct live Airtable push/dedupe/cleanup smoke also passed.
- Built via multi-agent workflow (config barrier → parallel widget/workflow/tests → integrator → independent AC validator).

## Where the learnings live

- [[patterns/n8n-llm-workflows]] — execution billing, `$env`/`$vars` split, webhook-over-chat-trigger, import gotchas, generate-don't-hand-edit
- [[patterns/llm-bot-structural-defense]] — code-layer guarantees vs prompt-layer persuasion; deterministic-first testing
- ADR: [[decisions/2026-07-19-plaa-activity-submission-bot-mvp-build-resolutions-11-open-questions]] — the §11 open-question resolutions baked into the build

## Open items

- `speak_at_event` category (Brand) pending WG confirmation (points confirmed 500).
- Legal review (Camille/Javier) of privacy notice, FAQ corpus, refusal copy — production-embed gate.
- Phase 2: Directory-auth identity (`username`/`member_id`), email question removed; LabOS-mirrored DB cutover replaces the sheet.
