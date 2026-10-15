# PLAA Activity Submission Bot

Status: **Owner has now published the updated 64-node build** (2026-09-25T19:35Z): running version includes referral fields and contact emails, no draft divergence. Restored the exported client-token placeholder from existing private configuration with backup, then activated and verified no remaining placeholders. Real production-connected browser no-match interaction was captured to Markdown; diagnostic conversation archived privately, user evals preserved. **Referral ID Sequence is still missing**, re-confirmed read-only: referral remains unavailable for successful production writes. Registered-email successful persistence remains unverified in this setup; historical all-activity smoke passed 2026-08-24.
Repo: https://github.com/protocol/ActivityBotv2 (origin/main; changes pushed as be6e066); personal mirror https://github.com/wswarren12/ActivityBotv2
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
- 876 deterministic tests plus 21 Playwright checks (2026-09-24, after independent review); direct live Airtable push/dedupe/cleanup smoke also passed. **The 2026-09-24 fixes are local only — the deployed workflow `ZyIV2rt4WO02GOC3` is still the 2026-08-31 build.**
- A retirement is a THREE-part rollout, not one flag: re-import/re-activate the workflow, re-publish the copied `/assets/activities.json` the live page loads, then ask the WG to clear `Bot Intake` + CTA on the Airtable row. Flipping `hidden` in this repo alone leaves the live Submit button rendering into a "couldn't find that activity" reply.
- Questions that invite "nothing to report" carry `allow_none: true` in config (`x_space.cohosts` — `Any co-hosts (or "none")?`). Placeholder rejection must consult it, or the bot tells a member who answered as printed to email the Working Group.
- Retiring an activity is ONE flag (`hidden: true` + a `hidden_note`): widget, site page, prompt assembly, the server config gate, the e2e gate and the cloud-smoke coverage preflight all derive from it. Never delete the entry — `ACTIVITY_KEY_MAP` / `DETAIL_FIELD_MAPS` must stay for historic rows. `highlight_contribution` retired 2026-09-24 (superseded by Community Kudos); the WG-owned Airtable row still needs `Bot Intake` cleared, which is outside the repo and harmless (the server gate refuses the id before catalog resolution).
- The dev bench (`dev/local-server.mjs`) shares the REAL validators with the workflow, so it is the cheapest place to exercise server decisions through the real widget: `tests/e2e/bench-flow.spec.mjs` forwards Playwright POSTs to a spawned bench, with `PLAA_BENCH_NOW` pinning the clock.
- Manual-test eval capture (2026-09-25): the bench appends every turn to a gitignored `evals.md` for hand rating (`Rating:`/`Why:`); `PLAA_EVAL_FILE` redirects it and `PLAA_EVAL_LOG=0` disables it. In LIVE mode capture requires the page to post through the bench's fixed-upstream proxy, which returns the production reply verbatim. See `docs/ACCEPTANCE-EVAL-CAPTURE.md`.
- Built via multi-agent workflow (config barrier → parallel widget/workflow/tests → integrator → independent AC validator).
- `member_uid` comes from an exact email lookup in the **separate** Members base `appnci3U5hQIEWMQo` / `tbl0acHycHt9KpCnc` (`Email` → `memberUid`), written to the existing `Participants.member_uid`. The bot still asks for the email; this is enrichment from a self-asserted address, **never** authentication or authorization.
- **2026-09-26 — that lookup became a REQUIRED match.** No usable `memberUid` → nothing is written and the bot replies *"Please try a different email. Use the email associated with your PLAA account."* The gate runs twice (early, on the turn the address is typed; authoritative, as the first node of the push chain), both fresh. A directory that cannot be *consulted* gets different copy ("can't check right now" + retry) and still blocks. Consequence: the two external prerequisites (PAT read scope on the Members base, `Email` column live) became **launch-blocking** — a gate is only as available as its dependency.

## Lessons (local eval capture, 2026-09-25)

Manual-test rating log: every bench turn is appended to a gitignored, `0600`,
never-served `evals.md` as one atomic *(preceding bot message → member message →
bot response)* entry with `Rating: Unrated` + `Why:` for the owner to edit.
`dev/eval-log.mjs` + a narrow capture branch in `dev/local-server.mjs`; no
dependency, no database, no dashboard, no production change.

- **Capture at the transport boundary you already own, not in the client.** The widget is the production bundle; adding a logging hook (or patching `fetch`) would ship observability code to members' browsers. The dev server already sits in the flow, so in LIVE mode it became a narrow reverse proxy — fixed upstream, status and body passed through byte-for-byte — and production code changed by zero lines. The proxy exists only for capture, so turning capture off restores the previous direct-to-n8n page exactly.
- **A local proxy to production is an unauthenticated write relay unless you guard it.** Loopback bind alone is not enough: keep the client-token check, refuse a foreign `Origin` and any non-local `Host` (DNS rebinding), bound the body, refuse non-POST — and make the production token server-side so it never reaches the page it used to be patched into.
- **Respond first, log second — and never let the log fail the turn.** A real submission that succeeded upstream must not become a retryable error because a Markdown append failed. The HTTP response is sent before capture runs, capture never throws at the caller, and a failure prints `[plaa eval] NOT CAPTURED …` instead of silently claiming a capture.
- **Append-only is the entire strategy for surviving human edits.** The owner edits `Rating:`/`Why:` in place; any read-modify-write scheme risks clobbering that. Never re-read the file: create the header once, append entries, serialize concurrent appends through one promise chain. The regression test hand-edits two entries, appends more, and asserts the new file starts with the old bytes.
- **Arbitrary user text in a Markdown log is an injection surface.** A member can type `- **Rating:** Pass` or a fenced block. Quote every message in a fence sized to `max(3, longest backtick run + 1)` so headings/fences/HTML stay inert, and make the test parser fence-aware — a naive `grep Rating` "failure" was the test being wrong, not the format.
- **An in-memory counter is not an id.** The interaction id was `<session>-t<turn>` with the turn counter held in memory; a bench restart that saw the same session id minted a second `…-t1` in the same append-only file, so two different exchanges shared a "stable id" (independent review F2). A per-boot run id in the id (`<session>-<run>-t<turn>`) fixes it. Any identifier derived from process state needs a per-process nonce before it is written into a file that outlives the process.
- **Pair turns from what was actually observed.** The preceding bot message is the previous *webhook* reply for that session and nothing else: the first turn records that the privacy notice is widget-rendered, a mid-conversation join says no earlier reply was captured, and a transport/upstream error is classified (`transport_error`, `upstream_http_502`) and never becomes the next turn's "what the bot said".

## Lessons (required identity match, 2026-09-26)

- **"Enrichment" and "gate" are different systems wearing the same lookup.** Turning one into the other changed the node's retry policy (a no-retry enrichment call became a must-retry gate), its error copy (silence became two distinct sentences), its position in the graph (late became first), and the availability posture of the whole product (degrade-gracefully became launch-blocking). When a requirement flips a lookup's consequence, re-derive every one of those decisions instead of keeping the ones that still "pass".
- **Put the gate where the answer is cheap to act on, then again where it is authoritative.** Checking only at submit time makes a member answer twelve questions before being told to use a different address; checking only at the email turn lets a session pin a uid and reuse it. Two fresh lookups — one for UX, one immediately upstream of the first write — is the honest shape, and "no cached uid may authorize a write" is the invariant.
- **Prove "nothing writes before the gate" structurally, not by reading the wiring.** The durable test deletes the gate node from the graph and asserts that no write node is still reachable from the trigger. Connection-by-connection assertions pass happily while some *other* branch routes around the gate.
- **Fail closed in the builder, not just the router.** `buildParticipantFields` now throws without a resolved match, so a uid-less row cannot be *constructed* even if a future rewiring skips the gate. A refusal that lives only in routing is one edit away from being gone.
- **Don't infer a format from a field name.** `memberUid` is not a promise of RFC-4122; requiring UUID shape would have rejected every real member. Validate "usable opaque token" (non-empty, single-line, no control characters, sane length) and record the unverified-schema question as a prerequisite.
- **A blocked-by-outage message must not accuse the user.** `no_match` and `lookup_unavailable` are the same "no" to the code and completely different to the member: one means "use another address", the other means "our check is down, retry". Same block, different sentence, plus "nothing you entered is lost".
- **A correct refusal is not automatically an honest one — and the reason has to survive the turn.** (Independent review, round 4.) The first build picked the refusal copy from the *current* turn's state: after a directory outage cleared the session identity, the very next refusal said "try a different email", blaming the member for our downtime. Persist WHY the last check failed (`{kind, email}` on the session), pick the sentence from that, and let any later lookup overwrite it.
- **If the copy tells the member to type a word, that word must be a command.** The outage copy promised "send *retry*" while the gate only fired on messages containing an address — an inert promise nobody's tests caught, because the tests re-sent the address instead of the word. Wire whole-message intent (`isRetryRequest`) to re-run the *same* lookup freshly, and deliberately make it a no-op after a genuine no-match (the directory already answered).
- **"Find the email in the message" is the wrong question; "is the member claiming this address as their own?" is the right one.** Taking the first address gated a third party's (`I referred bob@other.com — my email is me@plaa.org`) and refused the member over somebody else's address; ignoring all addresses after one resolved meant a corrected address was only caught at summary time. One shared helper (self-attribution markers, or a message that is nothing but an address) fixes both directions and is unit-testable away from the graph.
- **Gate the values your docs quote.** A generator helper silently dropped `waitBetweenTries`, so the "1.5 s retry backoff" in the runbook was 3 s in the artifact for a week — invisible because the tests only asserted `maxTries`. Anything a doc states as a number about a generated artifact should be asserted against that artifact.
- **A required identity match creates an enumeration oracle; say so instead of blurring the copy.** Telling an unmatched member to use a different address necessarily reveals directory membership to anyone with the public widget token. The honest handling is to document it, name the existing bounds (global rate limit before any model/API call, fixed PII-free sentences, codes only in logs), and escalate edge rate-limiting — not to make the copy vaguer and break the requirement.
- **Test fixtures become part of the identity surface.** Every local suite that submits had to be given a seeded Members row, and the cloud smoke test had to start refusing to report blocked submissions as successes. A gate that the test data quietly bypasses is not a gate.

## Lessons (identity-enrichment lookups, 2026-09-25)

- **`maxRecords: 1` on a lookup-by-email is a silent correctness bug, not an optimization.** It turns "this address appears twice in the directory" into a confident single match, and the wrong member's uid lands on someone else's submission. Ask for ≥2 and treat >1 as *ambiguous → assign nothing*.
- **Query the table, never a provided UI view.** A shared view link (`viw…`) is usually filtered; the hidden rows are exactly the duplicates the ambiguity check exists to find.
- **Never back-fill a new authoritative field from the old source on a miss.** When the Members lookup was unresolved, falling back to the AAID Registry's older `member_uid` would have silently produced the misattribution the new lookup was introduced to prevent. Unresolved must mean *empty*, with a fixed diagnostic code (never the address — PII).
- **Enrichment that only runs on the create path never actually rolls out.** Returning members already have a Participants row, so the uid has to be PATCHed onto existing rows too — authoritative overwrite on conflict, no destructive clear when the lookup is merely unavailable, and the retained value reported as `unconfirmed_existing_uid` rather than silently re-certified.
- **A cross-base lookup returns one usable thing: the field value.** The foreign record id is meaningless in the destination base and must never reach a linked-record column.
- **Enrichment must never be on the submission's critical path.** The lookup node runs with `onError: 'continueRegularOutput'` and has no failure branch, so an unrolled-out column (Airtable `UNKNOWN_FIELD_NAME` 422) or a missing PAT scope costs a uid, not a member's submission.
- **An unwired "safe port" built ahead of an external blocker is debt.** `workflow/lib/identity-verification.mjs` was built, tested, documented — and deleted six days later when the owner revised the requirement to the email lookup. Speculative plumbing survives exactly until the requirement moves.

## Lessons (two required contact emails, 2026-09-26)

The owner reversed a standing rule: the two introduction activities
(`network_introduction`, `high_value_connector`) must now COLLECT one email per
introduced party (`contact_a_email` / `contact_b_email`), where config, prompt
and code all previously said "names only, no emails about the parties".

- **Reversing a prohibition is a trace exercise, not an edit.** The old rule
  lived in four places that all had to move together: the activity `rules[]`,
  each question's `validation` note (both feed the review model), the
  constraint-check copy, and the intake prompt. Leaving any one of them means
  the model is being told to refuse the field the product now requires.
- **A new required field of an existing TYPE inherits that type's whole
  behaviour — check whether you want all of it.** Making the contacts `type:
  email` bought format validation and explicit pass verdicts for free, but the
  placeholder check only covered `text`/name fields, so `"Unknown"` would have
  failed with a format complaint instead of the placeholder explanation. Extend
  the shared check, don't special-case the new field.
- **Collecting third-party addresses collides with identity resolution.** The
  member-identity gate keyed on "an address the member typed", and "a message
  that is nothing but an address" was treated as an identity claim. Once a
  question asks *"email address for the first party?"*, that exact shape is the
  common ANSWER: without a fix, answering it re-ran the Members lookup on a
  third party, refused the member over somebody else's address and cleared
  their draft. Fix: a `bareAddressIsIdentity: false` mode, switched on by the
  activity's own question set — and, in that mode, only first-person markers
  (`my`/`me`/`I'm`) count, because `"use ada@example.com"` is an answer, not a
  correction.
- **Ambiguity must produce a question, not a pick.** "Take the first address in
  the message" was survivable while only the member's address appeared; with
  three addresses in one all-info-up-front message it silently gates the wrong
  person. Unattributed multi-address messages now resolve to *nothing*, and the
  bot asks which one is theirs.
- **"The submitter may be one of the parties" has to be tested, not assumed.**
  It is the case most likely to be broken by a well-meaning
  duplicate/self-reference guard; there are now unit and real-widget tests that
  a contact email equal to the submitter's address submits normally and does
  not re-trigger identity resolution.
- **The narrowed identity heuristic needed narrowing again — "me" is not a
  claim.** (Independent review F1, reproduced live.) Keeping bare `me` in the
  self-attribution markers meant "email me at ada@example.com" — an ordinary
  contact answer — ran a Members lookup on the third party and cleared the
  member's resolved identity and draft. In contact-answer mode only possessive
  first-person forms (`my`/`mine`/`myself`/`I'm`) count. Generic verbs and
  object pronouns are how people talk *about* other people.
- **A phrasing the prompt advertises needs a deterministic path.** (F2.) The
  prompt offered "that one's me, <address>" while the bench demanded a bare
  address, so the promise rested entirely on model extraction. The bench now
  extracts the single address in an email answer itself — if copy invites a
  phrasing, some layer below the model has to honour it.
- **The manual eval surface must enforce what production enforces.** (F3.) The
  dev bench validated answers with its own switch and never ran the shared
  contact-detail check, so a phone number in `intro_purpose` sailed to a written
  mock row while production would refuse it — the owner would have been rating
  behaviour that cannot happen. Shared reasons/field lists are now exported from
  `constraint-checks.mjs` and used by both.
- **Guard on the shape, not on the names you happen to know.** (F4.) The guard
  originally listed `contact_a_email`/`contact_b_email`; keying it on "any
  `email`-typed question" covers `plaa_referral.referee_email` the day it is
  un-hidden, because the submitter's own address is never a configured question.
- **Defense in depth means the SAFE path re-asserts the invariant too.** (F5.)
  Hard code failures were re-checked on the two reviewer-unavailable routes but
  trusted on the normal one — correct as wired, fail-open after any rewiring.
  Re-applying the deterministic verdicts on every path costs one line.
- **Persist into a column you can prove exists.** No authoritative local schema
  confirms contact-email columns on *Network Introductions*, so nothing new is
  mapped: both values ride in the hub row's `Raw Payload` and are reported as
  `unmappedFields`. Inventing `Contact A Email` would have made every detail
  write fail with `UNKNOWN_FIELD_NAME` — turning a data-retention nicety into a
  submission outage. Name the columns you'd need in the report and wait.

## Lessons (production readiness check for the referral activity, 2026-09-25)

Read-only session: the live workflow and the live Pending Activities base were
inspected, the ID-Sequence launch blocker was **re-verified as current** and
nothing was published.

- **Re-verify an inherited prerequisite against the live system before you
  either re-assert it or clear it.** A `launch_blocker` copied forward since
  2026-08-31 is a claim about someone else's system, and the correct move is
  neither "trust it" nor "assume it's stale because the owner is impatient" — it
  is a bounded read. Here the answer was *still blocked*, and the block now
  carries a `reverified` field naming the date, the method and the exact
  remaining gap, so the next session re-checks in one command instead of
  re-litigating.
- **A URL the owner supplies proves the thing it points at, and nothing else.**
  The Referrals table link did prove the detail target (`tblPYQw2hQJ7GGp1o`
  *is* the *PLAA Member Referrals* the catalog row names). It said nothing about
  the serial sequence, which is a different table and the actual blocker. "Here
  is the table, so we're ready" has to be decomposed into the individual
  preconditions the runtime code enforces — for this push: one catalog row,
  `Bot Intake`, a linked `ID Sequence`, a `Detail Table`. Three of four passing
  is still blocked.
- **The near-miss configuration row is the dangerous one.** The base has 24
  ID Sequences, one of which is `TR` / *Talent Referral Program*. It is a
  different programme; linking it would have minted this activity's serials into
  another programme's series and corrupted both counters, and it would have
  looked exactly like "found the already-designated sequence". When a lookup for
  "the obviously intended row" returns something merely adjacent, that is a
  question for the owner, not a match.
- **Ask what the READ can answer while you are already there.** The same probe
  that answered the blocker question also returned the detail table's live
  schema, which retired a standing "waiting on confirmation" TODO:
  `Referee Directory URL` exists and is a `url` field, so the code comment's own
  stated condition ("map this only once the column is confirmed") was met and
  the one-line mapping landed with a test. `Referee Location` still has no
  column and stays unmapped. Verification trips are expensive; collect every
  fact the same bounded read can legitimately answer.
- **Backup both sides of a versioned artifact before touching it.** Draft and
  published are two different documents; a "backup" of one is not a rollback for
  the other. Both were snapshotted `0600` before any work, and re-compared
  afterwards to prove production was byte-identical.

## Lessons (optional questions + per-conversation eval capture, 2026-09-25)

- **A refused request is an unlogged request — say so where the operator looks.**
  The owner reported "conversations aren't saved". The transcript was header-only
  and the bench log held exactly one line: `refused a turn: non-local origin
  header`. The loopback Origin/Host guard runs *before* capture (correctly — the
  endpoint forwards to production), so a stale tab or a page from another origin
  produces silence that looks like a broken logger. Any guard that sits in front
  of an observability path must refuse *loudly and actionably* ("that page was
  not served by this bench — open http://localhost:8080/"), and the docs must
  say plainly that turns which never reached the server are not recoverable.
  Diagnose from the process, the served page and the server log before theorizing.
- **One file per conversation needs a key that is already per-conversation.**
  The widget mints a fresh `sessionId` per open/restart, so the session id *is*
  the conversation — no new identifier, no grouping pass, no re-reading an
  append-only file. Derive the file name by replacing everything outside
  `[A-Za-z0-9_-]` (traversal and filename injection become impossible by
  construction rather than by blocklist), and create the file only on a real
  turn so the folder never shows conversations that did not happen.
- **In-memory turn counters break twice, not once.** A per-boot run id fixed the
  restart collision (2026-09-25); eviction from the bounded session map is the
  second path — a returning session restarts at turn 1 *within the same run*.
  Mark evicted sessions and mix a generation nonce into their ids.
- **Migrate an archive; never re-parse one.** The old root `evals.md` was moved
  verbatim into the folder under a clearly legacy name, never grouped by
  conversation: splitting a human-rated file means guessing, and a wrong guess
  destroys ratings. Never overwrite the destination — pick `-2`, `-3`.
- **"Optional" is a cross-layer property, and it must be an explicit PASS.**
  Adding one optional question touched config, the prompt's question bullets,
  an intake-protocol rule, the reviewer prompt, the pre-summary normalizer, the
  deterministic checks, the bench driver and the test whitelists. Simply *not
  checking* an optional field is not enough: the code layer must assert `pass`
  so a model that decides it wants a location cannot fail the field and block a
  write. Normalize-or-drop at the boundary (store exactly `US` / `non-US`, or
  nothing) so raw prose never reaches a normalized field, and cap clarification
  at one question — an optional field that loops is a required field.
- **Separate "visible" from "deployable".** `plaa_referral` had been hidden
  because its Airtable catalog row has no ID Sequence, which also made the
  activity impossible to add, demo or test — so a later "add this activity"
  request could not be fulfilled at all. Replacing `hidden: true` with a
  declarative `launch_blocker` block keeps it fully usable locally while
  `deploy-to-n8n.mjs` refuses to publish (before any n8n call) and the validator
  prints the blocker every run. Encode a product prerequisite at the step that
  can actually reach members, not by deleting the feature from view.
- **Rename, don't duplicate.** The displayed name changed to "Recommend A New
  PLAA Member"; the id, Activity Key, detail table and 200 points did not. A new
  id would have orphaned every historical row and mapping.
- **`mkdir(mode)` is not `chmod`.** The documented "0700 transcript folder" was
  0755 in practice: `mkdir`'s mode applies only when the directory is created
  and is masked by umask, so a folder already present in the tree kept its old
  bits. Files were 0600, but the *listing* (session ids) was readable. Assert the
  mode explicitly on every boot instead of trusting the creation flag.
- **Boot-time decisions belong in a pure function.** The rule "only a bench
  using the default folder may move the owner's `evals.md`" lived inside the
  server's `listen()` callback, so the one branch that runs on the next restart
  had no automated test — testing it in place would have moved the owner's file.
  Extracting `resolveEvalTarget(env, root)` made the whole decision unit-testable
  (including the "an override never claims the legacy file" invariant) with no
  server and no I/O.
- **A deploy gate on the workflow is not a gate on the catalog.** The activity
  was safely un-deployable, but the page reads a *separately published*
  `activities.json`: publishing that first would render a Submit button the
  deployed workflow answers with "we couldn't find that activity". Whenever a
  feature ships as two artifacts on two publish paths, the guard has to cover
  both — the bench now masks launch-blocked activities in LIVE mode and the
  rollout order is documented for the static asset.
- **Say which evidence is conclusive and which is merely consistent.** The
  "conversations aren't saved" diagnosis leaned on one `refused a turn` log line;
  the conclusive proof was the file itself (895 B, zero entries, and not even the
  header the current code writes — written by an older boot, never appended to).
  Same conclusion, but one of the two is proof and the write-up should say so.
- **A destination URL rule needs an origin check, not a hostname check.**
  `os.pl.xyz` matching alone still accepts `os.pl.xyz:8443`, `user:pw@os.pl.xyz`
  and `https://os.pl.xyz@evil.com`. Check scheme + exact host + port + absence of
  userinfo + a *leading whole path segment* (`/members-evil` must fail), and
  parse only — never fetch a member-supplied URL.

## Where the learnings live

- [[patterns/n8n-llm-workflows]] — execution billing, `$env`/`$vars` split, webhook-over-chat-trigger, import gotchas, generate-don't-hand-edit
- [[patterns/llm-bot-structural-defense]] — code-layer guarantees vs prompt-layer persuasion; deterministic-first testing
- ADR: [[decisions/2026-07-19-plaa-activity-submission-bot-mvp-build-resolutions-11-open-questions]] — the §11 open-question resolutions baked into the build

## Q&A mode (2026-10-14)

Chat icon (`PLAABot.init({ launcher: true })`) → consent → "Submit an activity" (picker → existing intake, consent carried over) or "Ask a question" (`POST { sessionId, mode: "question", message }`). Answers only from `kb/sources/` via BM25 (`kb/retrieval.mjs`) embedded in a `Retrieve Knowledge` node; unknown → plaa-wg@plrs.xyz; off-topic warned once, then `event: "session_ended"` — strikes counted in code from a `<qa_signal>` tag. Decision record: [[decisions/2026-10-14-plaa-bot-qa-mode-lexical-kb-in-workflow]]. Lessons: the PLAA site snapshot carried leaderboard names, kudos and the capturer's private profile — exclude member data by heading BEFORE indexing, and rewrite the forbidden verb in the derived index (not the sources) so the workflow vocabulary gate needs no data exemption.

## Open items

- Q&A: WG/Legal to confirm the Reg D PPM may be answered from by a public-page bot; deploy still refused by the `plaa_referral` launch blocker.

- `speak_at_event` category (Brand) pending WG confirmation (points confirmed 500).
- Legal review (Camille/Javier) of privacy notice, FAQ corpus, refusal copy — production-embed gate.
- Phase 2: Directory-auth identity (`username`/`member_id`), email question removed; LabOS-mirrored DB cutover replaces the sheet. **Status 2026-09-25 (PLAA-86): requirement revised by the owner.** The bot keeps asking for the email and now does a server-side exact lookup in the Members base for `member_uid` (above) — enrichment, not authentication. The unwired `/auth/introspect` port was **removed**; its four external blockers (AUTH_API_URL reachability from n8n Cloud, unverified introspection schema, no n8n auth credential, widget not embedded on the Directory) still stand and still block real authentication. `PLAABot.init({ identity })` remains **withdrawn** — anything an embedder can set is browser-supplied and unverified.
- Members lookup runtime prerequisites (external) — **now launch-blocking (2026-09-26)**: grant the existing Airtable PAT `data.records:read` on `appnci3U5hQIEWMQo` (read only, no write), and the planned `Email` column on `tbl0acHycHt9KpCnc` must exist. Until both land every lookup is `lookup_unavailable`, which under the required match means **no submission can complete**. Also still open: confirm both columns return plain strings, and confirm `Members.memberUid` and `AAID Registry.member_uid` are the same identifier space. Owner subsequently imported the 64-node workflow and requested manual production testing. The configured client token was restored into the imported gate, then the workflow activated. A real Playwright browser received the expected different-email reminder for a synthetic unknown address (HTTP 200, no page errors); successful registered-email persistence remains unverified. The loopback-only manual UI runs via `npm run dev:live` at `http://localhost:8080/`. See [[architecture/security-findings]] for static-server hardening.
