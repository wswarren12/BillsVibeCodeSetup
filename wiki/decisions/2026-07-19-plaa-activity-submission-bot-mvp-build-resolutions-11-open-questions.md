# ADR: PLAA Activity Submission Bot — MVP build resolutions (§11 open questions)

**Date:** 2026-07-19
**Status:** accepted

## Context
Building the PLAA Activity Submission Bot MVP (ActivityBotv2) from PRD v1.0 (2026-07-19): vanilla-JS chat modal widget + n8n Cloud workflow (Claude Haiku 4.5 intake, Sonnet 4.6 review escalation) + Google Sheets store. The PRD's §11 open questions carried bolded answers from the product lead that override earlier text in the doc (notably Appendix D's exclusion of activity #23).

## Decision
1) "Speak at an Event" (#23) is included as a 13th bot-intake activity (id speak_at_event, fields event_name + event_url); its points_value (500) and category (Brand) are placeholders pending PLAA WG confirmation. 2) Every activity submission always asks for an activity_date field (parseable date), added to the structural field whitelist. 3) Snapshot number is computed, not configured: July 2026 = 18, incrementing by 1 each month. 4) Google Sheets is the MVP destination; Airtable documented as a drop-in alternative only. 5) Only Thoughtful Responder (250 pts, manual review) exists as the forum activity — no automatic 100-pt forum activity in the FAQ corpus. 6) n8n Cloud tier/cost planning deferred.

## Consequences
Positive: single consistent interpretation baked into config, prompts, workflow, and tests via one source (activities.json); date field enables future snapshot date-gates; computed snapshot number removes a manual env-var chore. Negative: speak_at_event ships with unverified points/category (must confirm with WG before production embed); adding activity_date to all whitelists diverges from Appendix D as literally written, so the sheet schema and whitelist tests must treat Appendix D + activity_date as the authoritative set.

## Related
