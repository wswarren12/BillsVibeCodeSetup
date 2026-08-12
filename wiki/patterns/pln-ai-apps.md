# PLN AI Apps (ai-app-starter-kit)

Building/deploying apps to the Protocol Labs Network sandbox via the AI App
Starter Kit (v1.4 as of 2026-07). The kit's own docs (`CLAUDE.md`, skills,
`pl-design-system/USAGE.md`) are authoritative for the deploy contract; this
page holds what they *don't* tell you. Reference build: Roadmapper
(`~/Desktop/roadmap-builder.4`, 2026-07-22).

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
