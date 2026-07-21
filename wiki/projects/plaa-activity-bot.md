# PLAA Activity Submission Bot

Status: MVP built (2026-07-19), pre-deploy — local testing next
Repo: https://github.com/wswarren12/ActivityBotv2 (private)
Stack: vanilla-JS web component widget + n8n workflow (Cloud-targeted, self-host-portable) + Claude Haiku 4.5 intake / Sonnet 4.6 review escalation + Google Sheets (interim store)

## What it is

Conversational activity-submission intake for the PLAA program: a chat modal opens from an activity card's Submit button already knowing the activity, asks that activity's exact question set, runs an automated completeness review before writing, and appends a 14-column row to a WG-reviewed sheet. Also answers program FAQs from an injected corpus; declines everything else (tax/legal always).

⚠️ Deviation from house stack (deliberate, per PRD): no Next.js/Supabase — the frontend must embed in a third-party site as one dependency-free bundle, and the team runs orchestration on n8n. Onion instincts still applied: pure logic modules (`workflow/lib/`, `config/prompt-assembly.mjs`) are framework-free and shared between tests and the workflow's Code nodes.

## Key facts

- 13 activities from a single `activities.json` (source of truth for UI, prompts, and sheet schema); every activity asks `activity_date`; snapshot number computed (July 2026 = 18, +1/month).
- Compliance vocabulary is load-bearing: "collect" never "earn" — enforced by tests, not convention.
- Review chain: Haiku verdict JSON per field → Sonnet escalation only on `borderline` → pass / follow-up / append-as-flagged. Never lose a confirmed submission (malformed verdict → flagged row, not a drop).
- 481 deterministic tests, zero live API calls; live-model behavior deferred to a runbook smoke checklist.
- Built via multi-agent workflow (config barrier → parallel widget/workflow/tests → integrator → independent AC validator).

## Where the learnings live

- [[patterns/n8n-llm-workflows]] — execution billing, `$env`/`$vars` split, webhook-over-chat-trigger, import gotchas, generate-don't-hand-edit
- [[patterns/llm-bot-structural-defense]] — code-layer guarantees vs prompt-layer persuasion; deterministic-first testing
- ADR: [[decisions/2026-07-19-plaa-activity-submission-bot-mvp-build-resolutions-11-open-questions]] — the §11 open-question resolutions baked into the build

## Open items

- `speak_at_event` category (Brand) pending WG confirmation (points confirmed 500).
- Legal review (Camille/Javier) of privacy notice, FAQ corpus, refusal copy — production-embed gate.
- Phase 2: Directory-auth identity (`username`/`member_id`), email question removed; LabOS-mirrored DB cutover replaces the sheet.
