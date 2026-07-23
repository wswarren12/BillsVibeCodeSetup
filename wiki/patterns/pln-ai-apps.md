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
