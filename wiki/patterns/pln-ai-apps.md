# PLN AI Apps (ai-app-starter-kit)

Building/deploying apps to the Protocol Labs Network sandbox via the AI App
Starter Kit (v1.4 as of 2026-07; v1.7 as of 2026-08 adds the **LabOS
provisioned Postgres** — `database: {enabled:true,type:"postgres"}` in
`pln-app.config.json`, `DATABASE_URL` injected at runtime, SSL mandatory —
plus draft/secrets and logs endpoints). The kit's own docs (`CLAUDE.md`,
skills, `pl-design-system/USAGE.md`) are authoritative for the deploy
contract; this page holds what they *don't* tell you. Reference builds:
Roadmapper (`~/Desktop/roadmap-builder.4`, 2026-07-22) and its v1.7/native-db
migration Roadmapper V2 (`~/Desktop/RoadmapperV2`, 2026-08-12).

## Contract in one line

Next.js 14 in `app/`, `$PORT` on `0.0.0.0`, `GET /health` → 200,
iframe-embeddable from `*.plnetwork.io` (no `X-Frame-Options`; CSP
`frame-ancestors 'self' https://plnetwork.io https://*.plnetwork.io`), secrets
via the LabOS draft flow, deploy via the `deploy-to-labs` skill — or, for
repeat deploys, directly with a LabOS deployment key (next section).

## Direct deploy with a LabOS deployment key (verified PLaybook, 2026-10-06)

A **deployment key** replaces the connect flow for repeat deploys. The app
owner generates it in LabOS → AI Apps → the app's ⋯ menu →
**Deployment settings**. It is long-lived (valid until revoked there), and
scoped to **one app and one environment** (`prod` or `preview`). Send it as
`x-app-token`, exactly like a connect-flow token.

**Verified: a direct `deployEndpoint` upload works for an app that already has
stored runtime secrets and a provisioned database.** No draft, no click in
LabOS. The 202 response's `providedEnvVars` confirmed the stored values were
attached, and the build went `DEPLOYING → READY` in under a minute. The
kit documents keys and the secrets flow separately, never together, so this
was an open question. Use the draft flow only when secret **names** change or
values still need entering; a draft does nothing until someone clicks Deploy.

### Steps

1. **Pull the branch you deploy, and confirm the working tree is clean.** If
   others push to `main`, the tip may contain code you haven't tested.
2. **Read-only preflight.** `GET statusEndpoint` with `latest` as the
   `{deploymentId}`. A 200 proves the key is accepted and shows its
   `environment` and the current status, without changing anything.
3. **Gate.** In `app/`, run `npm install`, `typecheck`, `test` and `build`.
   Don't deploy on any failure. Add the browser E2E run when UI changed; it
   is the only check on what users see, and these repos often have no CI.
4. **Zip the contents of `app/` by the `.dockerignore` exclusion list.** Don't
   hand-pick an allowlist, which silently drops new folders. Then scan inside
   the ZIP for the actual **values** of every local secret, not just
   secret-looking filenames (see the `local.env` gotcha below).
5. **Upload** (command below), then **poll** the returned `statusEndpoint`
   every `pollIntervalSec` until `READY` or `ERROR`. On `ERROR`, read
   `failureStream` and fetch build or runtime logs.
6. **Verify past `READY`.** `READY` only means the container started. Fetch
   runtime logs filtered with `?deploymentId=<id>` and confirm the migrate
   line, the listening line, and zero error-level lines. `0 applied, N
   already current` means an earlier deploy already ran the migration.

```bash
# Key referenced only by name; its value never appears in output or files.
export DEPLOY_KEY="$(grep -E '^LAB_OS_DEPLOYMENT_KEY=' app/local.env | cut -d= -f2-)"
curl -sX POST "$(jq -r .deployEndpoint pln-app.config.json)" \
  -H "x-app-token: $DEPLOY_KEY" \
  -F "appId=<appId>" -F "name=<appName>" -F "description=<appDescription>" \
  -F 'tags=<appTags as JSON array>' \
  -F "deploymentId=$(date -u +%Y%m%d%H%M%S)" -F "kitVersion=<kitVersion>" \
  -F 'database={"enabled":true,"type":"postgres"}' \
  -F "file=@app.zip;type=application/zip"
# → 202 { status: "DEPLOYING", statusEndpoint, pollIntervalSec, providedEnvVars, … }
```

### Rules

- **Metadata verbatim** from `pln-app.config.json` (`appId`, `appName`,
  `appDescription`, `appTags`, `kitVersion`). The deploy overwrites stored
  name/description, so never re-run the approval flow on a redeploy.
- **Omit `access`**: sending it overwrites who can open the app.
- **Omit `environment` for a prod key.** A prod key rejects
  `environment=preview`, and vice versa.
- **Send `database` on every deploy** once the app has a provisioned database.
- **Never print the key, and never write it into the app tree.** If it lives
  in `app/local.env` for convenience, that file must be excluded from the
  ZIP: the kit's documented zip excludes (`.env`, `.env.*`) do **not** match
  `local.env`. Prefer a shell-only variable.
- **Scrub responses recursively before printing.** The deploy response nests
  the app's private URL/host under `deployments.prod.*`. A top-level-only
  filter leaked it once, so withhold any `url|host|port` key at every depth,
  keeping only `appPageUrl` and `statusEndpoint`.
- Project runbook: PLaybook's `docs/deploying.md` in `protocol/playbook`.

## Gotchas

### Clipboard denial must not become a silent no-op (PLaybook, 2026-10)

- **Symptom:** a skill's Copy button did nothing when `navigator.clipboard.writeText`
  rejected; its catch block swallowed the error. Missing Clipboard API support
  had the same result. The shared component also served prompt copying.
- **Root cause:** relying solely on the async Clipboard API ignores secure-context,
  permission and embedding-policy restrictions; success-only UI hid the failure.
- **Resolution:** keep the native API first, then try a temporary selected textarea
  with `execCommand('copy')` inside the active modal's focus boundary. Remove it
  and restore focus. Show Copied only on success; if both methods fail, show
  manual-copy instructions. A failing browser reproduction now passes and reads
  the actual clipboard text, including Unicode and newlines.
- **Prevention rule:** test normal, rejected and unavailable Clipboard API paths,
  plus total denial. Verify clipboard contents, not merely the Copied label.
  A fallback cannot override browser/OS policy; retain an honest manual recovery.

### Member context has NO email — challenge email-based specs at design time (v1.4)

- **Symptom:** a PRD assumes features keyed on the member's email (whitelists,
  notifications, "share to email") — but `GET /v1/ai-apps/me` deliberately
  returns only uid/name/image/location/skills/teams. No email, no contact info.
- **Root cause:** platform privacy decision, easy to miss because LabOS
  obviously *knows* the email.
- **Resolution (Roadmapper):** one identity seam `{uid, name, email: member.email ?? null}` —
  works automatically if LabOS ever adds email; email-dependent features degrade
  honestly (explain in UI) instead of silently failing.
- **Prevention rule:** when a PLN app spec relies on any member attribute,
  check the pln-member-context skill's response shape *before* writing the PRD
  section. If email is load-bearing, flag it as an open platform question and
  build the null-email path first.

### Design system's internal `@components/*` alias needs a consumer-side mapping

- **Symptom:** `tsc`/`next build` fails with `Cannot find module '@components/Avatar'`
  from *inside* `pl-design-system/` — even though tsconfig `exclude`s that folder.
- **Root cause:** kit components import each other via a bare `@components/*`
  alias, and tsconfig `exclude` does not stop type-checking of files imported
  by included files; bundler resolution needs the alias too.
- **Resolution:** add `"@components/*": ["./pl-design-system/components/*"]` to
  the app's tsconfig `paths` (Next.js honors tsconfig paths for webpack as well).
- **Prevention rule:** after copying `pl-design-system/` into `app/`, grep it
  for `from '@` and map every internal alias in the consumer tsconfig before
  first build.

### Design-system Dropdown triggers inside overlays need forwarded refs and modal-level portals (2026-08)

- **Symptom:** composing the canonical `Dropdown` with the canonical `Button`
  logs “Function components cannot be given refs”; inside a modal, the menu is
  visibly open but Playwright/browser clicks time out because the modal overlay
  intercepts pointer events.
- **Root cause:** Radix `Trigger asChild` attaches a ref to its child, so the
  trigger component must use `forwardRef`. Dropdown content is portalled to the
  document body, escaping the modal stacking context; the kit's
  `--z-dropdown` (100) is below `--z-overlay`/`--z-modal` (300/400).
- **Resolution:** make the vendored canonical `Button` forward its button ref,
  and render Dropdown portal content above modal content but below toasts (for
  the current token scale, `calc(var(--z-modal) + 2)`). Verify with a real
  browser click from a dropdown nested in a modal, not only jsdom rendering.
- **Prevention rule:** every Radix `asChild` trigger must forward refs, and every
  portalled overlay primitive must be tested nested inside the highest overlay
  where it is supported; never assume its local stacking context follows it
  into the portal.

### Connect-flow approval links never seen: don't sandwich user-action links between tool calls (2026-07)

- **Symptom:** repeated LabOS connect sessions expire unapproved (each lives ~10
  min) even though the member says they're ready; member later reports "I never
  saw the link". Seven sessions burned in one deploy.
- **Root cause:** the agent posted the `connectUrl` mid-turn and then immediately
  started a blocking poll tool-call in the same turn. Harness behavior: text
  between tool calls may not be shown to the user — only the turn's final
  message reliably renders. The member literally never saw any link; meanwhile
  the poll blocked the conversation so they couldn't even ask.
- **Resolution:** create the session, start the poll+upload watcher as a
  **background** task first, then end the turn with the link as the final
  message (big, isolated, with the code and expiry). Approval → watcher
  auto-uploads → agent reports the `appPageUrl`.
- **Prevention rule:** any time-limited link the user must open (`connectUrl`,
  OAuth pages, approval codes) goes in the FINAL text of a turn with no tool
  calls after it; long-running waits on user action run as background tasks,
  never as foreground polls. Also sync first ("reply go when you're at the
  browser, signed in") so the 10-minute window doesn't start while they're away.

### LabOS Deploy click "blocked by CORS" is usually a masked gateway timeout — the deploy often succeeded (2026-08)

- **Symptom:** the member clicks **Deploy** on the app's LabOS page and gets
  `Access to fetch at 'https://api-directory.plnetwork.io/v1/ai-apps/<uid>/deploy'
  … blocked by CORS policy: No 'Access-Control-Allow-Origin' header` — and
  concludes the redeploy is stuck/broken.
- **Root cause:** the Deploy call triggers a slow server-side container build.
  When the gateway times out, its error response is emitted without CORS
  headers, and the browser reports the whole thing as a CORS block. The API's
  CORS is actually fine (an `OPTIONS` preflight with
  `Origin: https://directory.plnetwork.io` returns 204 + correct
  `access-control-allow-origin`; even 403s carry it) — and the build keeps
  running behind the failed response. Sibling of the documented "ZIP upload
  504s even though the build succeeded" quirk.
- **Resolution:** verify what's actually serving instead of re-clicking:
  `GET /health` on `https://<appId>.deployment.plnetwork.io` (200), then fetch
  a page HTML, extract its `/_next/static/chunks/app/...` chunk URL (use
  `curl --globoff` — `%5B` in Next.js dynamic-route chunk paths otherwise
  trips curl's glob parser), and grep for a marker string unique to the new
  build (a new testid, dialog title, etc.). Marker present → deploy landed;
  tell the member to hard-refresh (the iframe caches JS aggressively).
- **Prevention rule:** treat browser "CORS" errors on PLN deploy actions as
  *unproven failures*: probe the deployed artifact for a build marker before
  retrying anything. Keep a grep-able marker string in mind per deploy (any
  string added in that commit). Distinguishes the three look-alikes:
  not-deployed vs. deployed-but-cached vs. genuinely-failed.

### Background polling alone does not bound a long LLM job (2026-08)

- **Symptom:** Decision Council passed the visible advisor stages, then stayed on
  “Drafting the decision table” indefinitely even after the long JSON response
  had been replaced with a background job plus fast polling.
- **Root cause:** background polling avoided the LabOS gateway's idle timeout,
  but the Anthropic `fetch` and the client's polling loop had no application
  deadlines. A stalled upstream therefore left the server job pending forever;
  every successful poll only confirmed that permanent pending state. The table
  also used the slower council model for a bounded structured-output task, and
  the member-context lookup on each request was another unbounded fetch.
- **Resolution:** use the faster structured-output model for the table; abort
  each Anthropic request after 3 minutes (the existing retry-once policy gives
  the job 6 minutes total); bound member-context lookup to 10 seconds; bound
  each browser poll to 15 seconds and the complete draft to 7 minutes. Timeout
  becomes the existing retriable “paused” state instead of an endless spinner.
- **Prevention rule:** every background LLM job needs deadlines at both ends:
  an upstream request timeout on the worker and a total polling deadline on the
  client. Polling solves proxy idleness; it does not solve a hung worker.
- **Buffered SDK streaming variant (Terminally Product, 2026-09-14):** a paid public evaluation reached research/SWOT but two nonstream structured audit attempts hit the SDK's 30-second timeout. A journal-whitelisted diagnostic confirmed timeout without exposing raw errors; neither request returned a message ID, so their cost remains unknown rather than zero. Buffer structured `stream.finalMessage()` privately, preserving schema/domain checks and no structured/thinking UI deltas. Keep the SDK 30-second establishment setting, zero retries and the separate 120-second whole-operation signal covering generation/repair/continuation. These are not identical end-to-end deadline semantics to the old nonstream request. A real SDK transport regression holds a partial response for 31 seconds, verifies no partial checkpoint, then completes; separate refusal/truncation/incomplete-stream and total-signal abort checks preserve gates. SDK incomplete-stream errors must map to provider pauses, not human FAQ questions. Do not increase ceilings or call mocked output live judgment.

### Default model thinking can silently consume a structured-output budget (2026-08)

- **Symptom:** Opus 5 returned HTTP 200 for a decision-table request, but the
  JSON ended mid-string and failed validation twice. Raising `max_tokens` from
  3,000 to 5,000 still produced truncated output. Advisor opinions from the
  same shared client also sometimes ended mid-sentence.
- **Root cause:** Opus 5 emits thinking blocks by default, and thinking tokens
  count against `max_tokens`. In a bounded test, 3,513 of 5,000 output tokens
  went to thinking, leaving only ~1,487 for the JSON text. The app joined only
  text blocks, so the response looked mysteriously short. A second initial
  assumption compounded the failure: `claude-sonnet-4-8` was not an available
  API model ID and returned 404.
- **Resolution:** query the provider's models endpoint before adopting a model
  ID; use the confirmed `claude-opus-5`; send `thinking: {type: "disabled"}`
  from the shared Anthropic helper so every configured `max_tokens` value is a
  text budget; retain background polling for Opus latency. Verified with a real
  agent-driven run that completed verdict + color-rated table.
- **Prevention rule:** treat `max_tokens` as a combined reasoning-and-text
  budget unless the provider explicitly says otherwise. For strict JSON and
  other bounded structured output, disable thinking (or explicitly reserve a
  measured reasoning allowance), inspect `stop_reason` and usage details when
  output truncates, and validate runtime model IDs against the provider API.

### A structured-output validator stricter than its own prompt hard-rejects valid LLM output (2026-08)

- **Symptom:** The Decision Council's decision-table step failed on every
  retry ("Drafting the decision table failed") for a rich, multi-jurisdiction
  tax question. Runtime logs showed `malformed_decision_table: json=true` — the
  model returned valid JSON that `validateDecisionTable` then returned `null`
  for. Simpler decisions worked fine.
- **Root cause:** The validator capped distinct row categories at 4
  (`categoryOrder.length > 4` → reject), but the drafting prompt *named six*
  familiar categories to use "when relevant" (Member, Operations, Technical,
  Legal/Tax, Time/Cost, Risk) while telling the model to produce "2–4". A
  genuinely multi-constituent decision uses 5–6 categories, so the model
  obeyed the examples and the validator rejected it — deterministically, so
  the one retry never helped. A row-count cap of 10 compounded it (6 categories
  × 2 features = 12 rows).
- **Resolution:** raise the validator ceilings to at least what the prompt can
  elicit (categories 4→7, rows 10→14), align the prompt ("2–6 meaningful
  categories"), and keep the guards that actually protect the render
  (contiguous category groups, ≥1 group with >1 row, per-row cell count).
  Reproduced deterministically by feeding a synthetic 5-category table straight
  into `validateDecisionTable` (no model/API key needed) — added as a
  regression test.
- **Prevention rule:** a validator for LLM-generated structured output must be
  **at least as permissive as the prompt that produces it** — the prompt's
  examples and its numeric limits must agree, and the validator's limits must
  be ≥ the prompt's. When output "fails validation twice", log *which* gate
  rejected it and reproduce by calling the validator directly with a synthetic
  payload before touching the model. See also [[default-model-thinking-budget]].

### Merging an app over the kit scaffold leaves placeholder files — and can copy secrets in (2026-08)

- **Symptom:** after `rsync`/`cp`-ing an existing project's `app/` over a fresh
  kit's `app/`, the scaffold's placeholder `server.js` still sits next to the
  real Next.js app (it exists only in the destination, so a merge never
  removes it) — and the source's `.env.local` (service-role keys!) rides along
  into the new tree unless explicitly excluded.
- **Root cause:** directory merges are additive in both directions: they
  neither delete destination-only files nor know which source files are
  secrets. The kit's `.dockerignore`/zip-exclusions are the *last* line of
  defense, not the first.
- **Resolution (Roadmapper V2):** after the merge, diff the scaffold's file
  list against the app's (`server.js` → removed) and sweep for
  `find . -name '.env*'` (stray `.env.local` → deleted; original stays in the
  old project).
- **Prevention rule:** when migrating an app into a kit, always (1) exclude
  `.env*` in the copy command itself, and (2) afterwards list scaffold
  placeholder files (`server.js`, placeholder `package.json`/`Dockerfile`) and
  confirm each was overwritten or removed. Secrets check before first zip:
  `find app -iname '*.env*'` must return nothing — `-name '.env*'` misses
  suffix-style names like `local.env`, which the deploy skill's documented zip
  exclusions (`.env`, `.env.*`) also don't match (Decision Council, 2026-08:
  a `local.env` with a live Anthropic key entered the zip and only the
  post-zip `unzip -l | grep -iE '\.env|secret|...'` sanity grep caught it).
  Treat that post-zip grep as mandatory, never skippable, and re-zip with an
  explicit `'*.env'` exclusion when it fires.

### Provisioned-db credentials are runtime-only — data migrations must run INSIDE the app (2026-08)

- **Symptom:** migration plan says "grab `DATABASE_URL` from Deployment
  settings and run the import script locally" — but after deploy the member
  reports no such value exists anywhere in LabOS. Laptop-side import is
  impossible.
- **Root cause:** the v1.7 provisioned database injects credentials only into
  the app's runtime env; the deploy/draft response's `database` block is
  explicitly informational-only ("never the password") and Deployment settings
  shows only member-entered secrets, not platform-injected vars.
- **Resolution (Roadmapper V2):** seed-on-boot module inside the app
  (`seed-from-supabase.ts`): after schema DDL, if the db is empty AND the old
  `SUPABASE_*` secrets are still stored on the deployment, fetch every table
  over PostgREST with plain `fetch` (no supabase-js dep) and import in one
  transaction. One-shot by construction (empty-db guard); inert forever once
  data exists or the old secrets are removed. Verified with real data against
  a local Postgres before shipping.
- **Prevention rule:** on any platform that injects credentials rather than
  exposing them, plan data migrations to execute *where the credentials
  live* — in the app process (seed-on-boot) — not from an operator machine.
  Check credential visibility BEFORE designing the migration runbook.

### Deploy-window container without injected secrets silently serves an in-memory app (2026-08)

- **Symptom:** member reports writes "not working" on the live app (e.g. can't create records); the backing DB's API logs show *reads* for ids that were never inserted anywhere, and the DB itself is healthy. The member may have "created" data that then vanished.
- **Root cause:** during a LabOS deploy, a container can serve traffic without the runtime-injected env secrets. If the app's store selection silently falls back to an in-memory store when DB env vars are absent (the natural local-dev pattern), that container is a fully "working" amnesiac app: writes succeed into RAM, then other containers (or the next restart) reject/lose those ids — experienced as random 400s/404s and disappearing data.
- **Resolution:** make `/health` return 503 whenever the app would run memory-backed outside dev (`DB env missing && DEV_AUTH != 1`) — the sandbox then marks the deploy failed instead of routing members to it. Diagnose the incident class by grepping the DB API logs for GETs on ids with no corresponding INSERT.
- **Prevention rule:** any app with a memory-store fallback for local dev MUST fail its health check (or refuse to boot) when the fallback engages in production. Silent env-based store selection + rolling deploys = data written to RAM.
- **Detection hint:** DB logs show lookups for well-formed uuids that don't exist and were never POSTed; app works for reads of old data but "new" entities 400 on follow-up requests.

### Supabase REST → raw `pg` port: DATE columns silently change type (2026-08)

- **Symptom:** after porting a supabase-js data layer to `pg` (e.g. onto the
  v1.7 provisioned db), date fields that were `'YYYY-MM-DD'` strings arrive as
  JS `Date` objects pinned to *local* midnight — a day-shift off-by-one
  anywhere east/west of UTC, plus broken string-shape validators.
- **Root cause:** Supabase's REST layer (PostgREST) serializes SQL `DATE` as a
  plain string; node-postgres instead parses OID 1082 into a `Date` in the
  container's timezone. Same schema, different wire type.
- **Resolution (Roadmapper V2):** `pgTypes.setTypeParser(1082, v => v)` keeps
  DATE as text; TIMESTAMPTZ stays a `Date` but mappers normalize with
  `.toISOString()` to match the old REST shapes exactly.
- **Prevention rule:** when swapping supabase-js for a wire-protocol driver,
  audit every DATE/TIMESTAMP column's expected JS type at the store boundary
  and pin type parsers before touching queries. Related v1.7 driver trap the
  kit *does* document (deploy skill): `pg` ignores `?sslmode=require` in the
  URL — the pool needs an explicit `ssl` option or the first query fails with
  a misleading `no pg_hba.conf entry … no encryption` error.

### Two kit copies sharing one `appId` — deploying the stale tree, confirmed by a stale local process (2026-08)

A "redeploy my app" request found `ai-app-starter-kit-AI-Council/` by name and
deployed it; the actively-developed tree was `ai-app-starter-kit-v1.3-LLMCouncil.3/`,
edited the same afternoon. **Both `pln-app.config.json` files carried
`appId: decision-council`**, so the July build silently took the live slot from
the August one — the deploy API has no "is this the newest source" check, only
the slug.

The pre-deploy smoke test *confirmed the wrong tree*: `node server.js` failed
with `EADDRINUSE` because the other project's instance already held :3000, and
`curl localhost:3000/health` returned 200 from **that** process. Both apps ship
the identical `frame-ancestors` CSP, so even the header check matched. The tell
that exposed it: `/api/config` returned `{live,labosConfigured}` (v1.3 shape)
while the deployed tree's source returns `{supabaseUrl,supabaseAnonKey}` —
a response that couldn't come from the code being tested.

- **Diagnosis:** `shasum` the file inside the zip against every candidate dir —
  `unzip -p app.zip server.js | shasum` vs each `app/server.js`. Provenance by
  hash, not by directory name.
- **Prevention:** before any redeploy, `find ~ -name pln-app.config.json` and
  compare `appId` across all hits; when two share a slug, pick by newest mtime
  (`find app -type f -newer` / `stat -f %Sm`) and confirm with the member.
- **Prevention:** never trust a health check on a port you didn't just bind.
  Check the listener owns the tree under test (`lsof -a -p <pid> -d cwd`) or
  start on a scratch port; treat `EADDRINUSE` in the log as an invalidated test,
  not a warning. Even the correct-cwd Node process is stale after imported
  renderer modules change: restart it, then inspect a newly generated artifact
  (DOCX XML/font table, response marker, etc.), not only the edited source or tests.

### Mirrored Postgres/Supabase migrations cannot assume Supabase roles exist (2026-08)

- **Symptom:** a schema migration that works in Supabase fails on PLN-provisioned
  Postgres at `GRANT ... TO service_role` or `REVOKE ... FROM anon` because those
  Supabase-specific roles do not exist on plain Postgres.
- **Root cause:** keeping one mirrored SQL migration for both stores preserves
  schema parity, but role DDL is environment-specific even when tables and
  functions are identical.
- **Resolution:** keep the migration files byte-identical and wrap role-specific
  grants/revokes in `DO` blocks that first check `pg_roles`; revoke function
  execute from `PUBLIC` unconditionally. Direct Postgres continues under its
  migration/runtime owner while Supabase grants only `service_role` access.
- **Prevention rule:** every migration shared by Supabase and plain Postgres must
  treat `anon`, `authenticated`, and `service_role` as optional roles. Never put
  an unconditional reference to a Supabase role in mirrored SQL.

### Sticky timeline header inside an `overflow-x` scroller never sticks vertically (Roadmapper, 2026-09)

- **Symptom:** `.timeline-head { position: sticky; top: 0 }` looked correct in
  CSS but month headings scrolled off with the page on tall roadmaps.
- **Root cause:** `position: sticky` binds to the nearest scrolling ancestor.
  The header lived inside `.timeline-scroll { overflow-x: auto }`, which makes
  that box the scroll container — and it never scrolls vertically, so `top: 0`
  had nothing to stick against. The *page* was the vertical scroller, but sticky
  cannot see past an intermediate overflow box.
- **Resolution:** make the same box the vertical scroller too:
  `overflow: auto; max-height: calc(100dvh - nav - padding)`. The header then
  pins to that box's top while rows scroll, and because it sits inside the
  horizontally-scrolled inner element it stays column-aligned with the bars for
  free. Verified with a Playwright metric test (header top == box top after
  `scrollTop`; each `.lane-grid-line` left == the matching `.time-col` left).
- **Prevention rule:** any 2-D grid needing a sticky axis header must put
  *both* scroll axes on one element. If `overflow-x` is set anywhere between
  the sticky element and the intended scroller, sticky-top is dead — assert
  stickiness with a scroll-then-measure test rather than trusting the CSS.

## Rules

- **Test-identity shim for external-SSO apps:** identity arrives only as a
  platform cookie (LabOS `authToken`) that doesn't exist locally. Gate a dev
  shim on an explicit env var (`DEV_AUTH=1` → read a `dev_user` cookie carrying
  `{uid,name,email}` JSON; literal `anonymous` = signed out; absent = default
  dev user). This makes the full owner/viewer/stranger/anonymous authorization
  matrix testable in Vitest (cookie header on `Request`) and Playwright
  (`context.addCookies`) with zero platform dependency — and the shim is inert
  in production because the env var is never set in the image.
- **Slot props over Link-wrapping** when composing the kit's `pl-design-system`
  components — see the hydration gotcha on [[stacks/web]].
- **Never land the deploy token on disk — extract it in-process.** The
  `deploy-to-labs` skill requires the short-lived `deployToken` be held in
  memory only. The natural shell pattern for the connect poll loop — capturing
  the approved JSON to a temp file (`... > /tmp/token.json`) and reading it back
  for the upload — violates this even if you `rm` it after. Instead pipe the
  poll response straight into a shell variable
  (`TOKEN=$(curl ... | python3 -c 'import json,sys;print(json.load(sys.stdin)["deployToken"])')`)
  so the secret never touches the filesystem. Same rule as "no secrets in the
  zip", one layer earlier: the token is a live credential tied to the approving
  member for ~1h. Applies to any credential captured mid-flow (OAuth codes,
  poll-returned tokens), not just PLN.

## Related

- [[stacks/web]] — Next.js gotchas (hydration/nesting)
- [[architecture/testing]] — Playwright gotchas, testing rules
