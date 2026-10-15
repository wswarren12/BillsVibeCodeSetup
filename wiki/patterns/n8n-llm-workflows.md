# n8n for LLM / Chatbot Workflows

Status: Active
Source: PLAA Activity Submission Bot build (2026-07), see [[projects/plaa-activity-bot]]

Practical lessons from shipping a production-shaped conversational bot on n8n (Cloud-targeted, self-host-portable). Complements [[patterns/agent-automation]], which covers agent loops generally; this page is n8n-specific mechanics.

## Execution billing shapes the topology

n8n Cloud bills **per workflow execution, and each chat message is one execution**. Two design consequences:

- **Never put multi-step LLM chains in sub-workflows.** A sub-workflow call is a second billable execution per message. Keep review/QA/validation chains as chained nodes inside the same workflow — same behavior, half the executions.
- **Group questions to reduce turns.** Asking intake questions one-at-a-time multiplies executions; one grouped message per phase keeps a full conversation to ~8 executions.
- The escape hatch is real: identical workflow JSON runs on self-hosted n8n with unlimited executions. Design for Cloud, document the self-host cutover instead of pre-building it.

## `$env` vs `$vars` — the Cloud/self-hosted split

The single biggest portability trap: **`$env.MY_VAR` expressions only resolve on self-hosted n8n.** On n8n Cloud you can't set instance env vars; user-defined Variables are referenced as `$vars.MY_VAR` and the Variables feature is plan-gated.

Related self-hosted gotchas (n8n 2.x): **`$env` access in Code nodes is blocked by default** — start with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` or every `$env` read throws "access to env vars denied"; and **error workflows must themselves be activated** to be callable when the main workflow fails.

Portable options, in order of preference:
1. Write `$env` in the JSON (works locally / self-hosted, which is also where automated tests run), and document the two Cloud paths: edit expressions to `$vars`, or paste values directly into the affected nodes after import.
2. Centralize config in one Set/Code node at the top of the workflow so "paste values directly" is a single-node edit.

## Webhook node over Chat Trigger for custom widgets

If the frontend is a custom widget (not n8n's stock chat), use a **plain Webhook node (POST) instead of the Chat Trigger**: it exposes request headers (needed for shared-secret checks), supports returning a real 403 via Respond to Webhook, and speaks plain JSON without embedded-chat framing. CORS allow-listing works on both — see the local-testing section below for its sharp edges.

Cheap abuse gate that costs nothing: verify a static shared-secret header **before any model node** — fail closed with 403 so drive-by traffic can't burn LLM credits. It's an abuse gate, not authentication; say so in the docs.

## Testing locally: CORS is where it breaks

Debugged in full on the PLAA build (n8n 2.30.8); every point below cost real time.

**The allow-list rules:**
- **Exact origins only — wildcard ports are not supported.** `http://localhost:*` silently matches nothing; n8n neither errors on it nor matches it. List each dev origin with its literal port (`http://localhost:4173`).
- **`localhost` and `127.0.0.1` are different origins to a browser.** A page served at `127.0.0.1:4173` fails against an allow-list containing only `localhost:4173`. List both spellings for every dev port.

**Why it's deceptive to debug:**
- **curl cannot reproduce the failure.** curl sends no `Origin` header and enforces nothing, so server-side smoke tests pass while every real browser request dies. Worse, the failure happens at *preflight* — the browser never sends the POST at all, so **no execution appears in n8n**, which reads as "the request never arrived" rather than "CORS rejected it."
- The frontend just shows its generic network-error state; nothing anywhere says "CORS" except the browser devtools console.
- **Test CORS from the terminal with a preflight, not a POST:** `curl -i -X OPTIONS <webhook> -H 'Origin: http://127.0.0.1:4173' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type,<custom-headers>'` — then check the echoed `Access-Control-Allow-Origin` actually equals your origin. A misconfigured list echoes some *other* origin from the list, which is the tell.
- **After fixing the server, hard-refresh the page.** Browsers cache preflight verdicts (`Access-Control-Max-Age`), so a fixed allow-list can still look broken for minutes.

**Headless local setup that works (no UI clicking):** `n8n import:workflow --input=<file>` writes straight to the local SQLite — but in 2.x the JSON **must contain an `id` field** or import fails with a NOT NULL constraint. Stamping your own id has a bonus: you can also pre-set `settings.errorWorkflow` to the error workflow's id in the same JSON, skipping the manual Settings step entirely (locally — Cloud imports still need it done in the UI). Then `n8n update:workflow --id=<id> --active=true` and start the server; activation flags are read at startup, so restart after changing them.

## Import/deploy gotchas (each cost real time)

- **The production webhook URL only exists after Activation.** Unactivated workflows expose a one-shot `/webhook-test/` URL that requires clicking Execute per message. Activate before wiring any frontend.
- **The error-workflow link cannot ship in the JSON.** Settings → Error Workflow must be selected manually after every import. Forgetting it silently disables error logging — put it in the runbook as a numbered step.
- **Re-importing resets node credentials.** Credential ids in exported JSON are placeholders; every re-import means re-selecting credentials on flagged nodes. Budget for this in the config-sync procedure.
- **Placeholders are not only credential ids — in-code secrets are placeholders too, and an API `PUT` pushes them straight to production.** *Symptom:* after deploying the generated export via `PUT /api/v1/workflows/{id}`, every request returned `403 Forbidden`; a full outage, because the shared-secret gate was comparing against the literal `REPLACE_AFTER_IMPORT`. *Root cause:* the generator deliberately keeps live secrets out of the committed export, so the placeholder appears in credential ids **and** inside a Code node's `const expected = "…"` abuse-gate secret. A merge that carefully preserved `credentials` still overwrote the in-code secret — credentials are the *obvious* live-only value, not the only one. *Resolution:* restore from a pre-deploy snapshot, then treat every live-only value the same way (credential ids, in-code secrets, node ids, `webhookId`, `settings.errorWorkflow`). *Prevention:* deploy through a script that (1) merges by node **name**, (2) **refuses to push any payload still containing the placeholder string anywhere** — grep the serialized payload, do not enumerate known fields — (3) snapshots the deployed workflow first and offers `--restore`, and (4) makes one real authenticated request after deploying, failing the run on 403. Structural verification cannot see a broken abuse gate; only a live request can.
- **Importing a file is not deploying it — n8n Cloud versions workflows, and `GET /workflows/{id}` returns the DRAFT at the top level.** *Symptom (PLAA, 2026-09-25):* the owner imported the regenerated 64-node build and reported the new behaviour as live; the production endpoint still ran the previous build. Node **names**, node **count** and **connections** were identical between draft and running, so every shallow check said "same". *Root cause:* Import-from-File writes the editor draft; the published definition lives under `activeVersion`, and the two only converge when someone clicks Publish. Any tooling that reads the top-level `nodes` is reading the unpublished draft and calling it production. *Resolution:* read `activeVersion.nodes` (falling back to the top level on unversioned instances) and expose a `draftDiverged` flag from `workflow.versionId !== workflow.activeVersionId`; diff the two by `jsCode` **content**, not by name/count. *Prevention:* never report "deployed" from an import; before and after any deploy, compare the running definition's content against the repo artifact, and back up **both** the draft and the running version — they are different documents.
- **A freshly imported draft is exactly the thing you must never press Publish on.** *Symptom (same session):* the draft was byte-identical to the committed export — **including the `REPLACE_AFTER_IMPORT` client-token placeholder** inside the abuse gate, while the running version held the real secret. Publishing from the n8n UI would have reproduced the 2026-08-31 403-for-every-member outage in one click. *Root cause:* the committed export is deliberately secret-free, so importing it into the editor stages a broken payload; the editor offers no placeholder guard. *Prevention:* the safe path is always the deploy script that merges the regenerated logic onto the **running** definition and refuses any payload still containing the placeholder string. Tell owners plainly: import to inspect, deploy to publish. A useful cheap check is "which side holds the placeholder" — that alone identifies the unpublishable copy.
- **n8n Cloud refuses `DELETE` on a published workflow (409 "Cannot delete a published workflow. Unpublish it before deleting.").** *Symptom:* a provisioner that creates+activates isolated test/probe workflows could never destroy them; `--destroy` reported `kept <id>` and left an ACTIVE workflow with a live webhook path and a bound production credential behind. *Root cause:* activation is part of provisioning but deactivation was not part of teardown. *Prevention:* teardown is `deactivate` → `delete`, with the deactivate failure tolerated (already-inactive is fine); and give the destroy command a `--kind` filter so cleaning up this session's resources cannot delete another session's.
- **Re-import into the same workflow slot** (open workflow → ⋯ → Import from File) so the production webhook URL never changes across config syncs.
- **Ship optional-credential nodes `disabled: true`.** An error-notification email node that needs SMTP blocks nothing if it ships disabled: the import works with zero credentials, errors still land in the execution log, and go-live is "enable node + attach credential." Log to the execution log *before* the notification node so the durable record never depends on the optional channel.

## The Code-node sandbox is not Node

The n8n 2.x task-runner sandbox that executes Code nodes is missing globals you'd assume exist. Found the hard way: **the `URL` global is absent** — `new URL(...)` throws, and if it's inside a try/catch validity check, every URL silently reads as "malformed" *only inside n8n* while the identical module passes unit tests in plain Node. (`Date`, `JSON`, regex, and `crypto.getRandomValues` were present; don't assume anything else is.)

Defenses:
- Write shared/embedded validation code against **primitives only** (regex parsing instead of URL, hand-rolled date parsing) so behavior is identical in tests and in the sandbox.
- Add a static "sandbox safety" test asserting the embedded modules never construct forbidden globals (e.g., source must not match `new URL\(`).
- When a check passes in tests but fails in n8n, diff the *environments* before the logic: pull the actual stored values out of `~/.n8n/database.sqlite` (`execution_data` is pointer-compressed JSON — an array where string digits index other entries) and re-run the function on them locally. If it passes locally on the exact failing input, the sandbox is the suspect.

## Generate the workflow JSON, don't hand-edit it

Workflow JSON with embedded Code-node logic drifts from its source instantly. Keep the Code-node bodies as real, importable modules (unit-testable), and generate the workflow JSON from them with a build script (`build-workflow.mjs` pattern) plus a validator script asserting topology invariants (node connections, model pins, no sub-workflows, retry settings). The n8n JSON becomes a build artifact; the modules are the source of truth. Same pattern for any config the workflow mirrors (activity catalogs, prompts): one repo source, one sync command.

## Confirmation gates: whole-message intent, never token containment

**Symptom (PLAA production smoke, 2026-08-24):** a labeled draft edit containing
`Internal content library opt-in: yes` submitted the *previous* draft before the
model could apply the edit. The next explicit `yes` then started a new model
turn, making a successful Airtable write look like a missing receipt.

**Root cause:** the deterministic confirmation regex matched `yes` (or another
confirmation token) as a whole *word anywhere in the message*. “Whole word” is
not “whole-message confirmation intent”; acknowledgement fields naturally
contain yes/no inside substantive edits.

**Resolution:** normalize punctuation/case, then compare the entire utterance to
an allow-list (`yes`, `confirm`, `yes please submit`, `ok go ahead`, etc.). Add
negative regression cases for acknowledgement/edit text containing `yes`.

**Prevention rule:** a code-side confirmation gate may accept bounded polite
phrases, but never substring/token containment. A message that carries any
field value or edit must not submit a prior draft.

## Cloud smoke tests: persistence beats receipt-copy matching

When automating a conversational write flow, poll the destination by the
session/idempotency key immediately after each confirmation turn. Stop as soon
as the row exists and report receipt-copy mismatch separately. Otherwise a
valid write followed by unexpected copy can make the harness send extra turns,
start a new draft, or misreport persistence as failure. Always clean by the
session/idempotency prefix in `finally`; retain serial-sequence gaps.

## Test the generated glue, not just the modules it inlines

A workflow generator that inlines pure lib modules into Code nodes leaves a
seam: the lib is unit-tested, the generated wrapper is not. Both production
breakages in one session lived in that seam — an undeclared variable
(ReferenceError) and a gate that counted a return value wrongly.

Execute the generated Code-node source directly in tests with stubbed platform
globals (`$input`, `$()`, `$getWorkflowStaticData`). It is a ~30-line harness
that runs the exact string you deploy, and it reproduces this class of failure
that no lib-level test can see.

Related trap: when you change what a shared return value MEANS (here: adding
`pass` entries to a map that previously held only failures), every consumer that
treated presence-as-problem silently inverts. Grep is not enough when consumers
live inside generator template strings — give the concept one exported helper
(`failedConstraintFields`) and make every caller use it.

## An LLM reviewer has no "today" — and silence is not a pass

Two defects that combine into confident, wrong rejections of valid answers:

**Inject the current date into every model call that judges time.** A review
model asked "is 2026-06-20 in the future?" answers from its training cutoff, not
your clock: it rejected a date two months in the past as "in the future", with a
fluent user-facing explanation. Any prompt whose criteria mention past/future/
recency must carry today's date explicitly, and should be told which layer owns
that decision.

**A deterministic checker that only emits failures cannot correct a false
failure.** The code layer validated dates/emails/URLs/acks and wrote a verdict
only when something was *wrong*; the merge step then overlaid those verdicts on
the model's. A field the code proved *valid* produced no entry, so the model's
false "fail" survived unchallenged — the override was documented as "code always
wins" but was really "code wins only when it objects". Make the deterministic
layer assert **explicit passes** for the fields it fully decides, and leave
genuinely subjective fields (prose substance) unasserted. Then "authoritative"
means it in both directions.

Corollary: don't let a model re-litigate through prose what a structured field
already enforces. A past-only date question made the reviewer reject impact text
phrased as "will help" — the timing was already proven by the date field.

**Assert the transport contract's flags, not just the reply copy.** A smoke
helper that returned only `json.output` could not observe that the deployed
workflow's receipt reply omitted `event: "receipt"` — so the frontend never
rendered its receipt card (and its buttons) while every test, local bench, and
smoke run passed. *Root cause:* every mock sent the flag, so the mocks encoded
an assumption production never satisfied. *Prevention:* for each field the
frontend **branches on**, assert it end-to-end against the deployed system, and
add a build gate pinning the responding node's shape. When a UI state renders
only on a flag, a test that asserts the accompanying prose proves nothing.
