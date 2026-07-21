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
