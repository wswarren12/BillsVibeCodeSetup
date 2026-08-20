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
via the LabOS draft flow, deploy via the `deploy-to-labs` skill.

## Gotchas

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
  not a warning.

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

## Related

- [[stacks/web]] — Next.js gotchas (hydration/nesting)
- [[architecture/testing]] — Playwright gotchas, testing rules
