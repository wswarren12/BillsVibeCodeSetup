# PLAA Website

Status: committed as `488c2ad16` and pushed to `wswarren12/pln-directory-portal-v2:BW-edits` on 2026-10-09. Draft [PR #3221](https://github.com/memser-spaceport/pln-directory-portal-v2/pull/3221) targets `memser-spaceport:stream/plaa-overview` (`0259fe287`). Awaiting authenticated UAT chart verification before marking ready.

- Repository: `memser-spaceport/pln-directory-portal-v2`
- Working directory: `~/Sites/pln-directory-portal-v2`
- Local URL: `http://localhost:4200/alignment-asset`; holdings moved upstream to `/alignment-asset/portfolio-holdings` (old URL redirects).
- Run: `nvm use` (repo `.nvmrc`:22), `npm ci`, then `npm run dev` (includes the new bridge predev build).
- Owner explicitly approved stopping the Desktop checkout's server to free4200. Its files are untouched. The Sites checkout now owns4200; the old4201 server was stopped.

## Rebase and current UAT setup

Rebase advanced289 commits (no local commits to replay). Safety branch: `backup/BW-edits-before-plaa-overview-20261007`; retained stash: `ee392b0923195de7d4e2384ade1cf51bbb5d487f`. Resolved homepage/holdings/services conflicts by retaining upstream's public summary, Portfolio & Holdings route rename and buyback sorting while preserving local colors, charts, image fixture, server-only key fallback and protected-fetch no-store. All27 pre-rebase changed/untracked paths accounted for, including renamed files.255 focused tests and desktop/mobile preview regressions passed after rebase. Full typecheck reports53 diagnostics in untouched test files, none in local changed/untracked files.

At the owner's next request, recreated `.env.local` from `.env.example` and changed ONLY the six specified values: Directory/Auth/PLAA URLs now point to the corresponding `*-plaa-uat.plnetwork.io` services; Privy ID is `clvuuo34u04bhrjo4tyuu9173`, cookie domain `localhost`, app base `http://localhost:4200`. All other template bytes preserved; file mode0600. Previous settings backed up to `/tmp/plaa-before-uat.FKRKoo/.env.local` (private directory). Node22.23.2 selected via nvm; exact `npm ci` succeeded with package/lock files unchanged. npm reports139 vulnerabilities, including6 critical; no unrequested dependency upgrades.

**Normal authentication is active; temporary preview bypasses/data and API-key fallbacks have been removed before the PR.** Anonymous homepage returns200 with no preview notice or page errors; protected holdings redirects to login, and Sign in opens the email form. Opened the portal for the owner to sign in with a plaa-uat test account; no account credentials supplied, so authenticated UAT history remains unverified.
- Homepage palette: `#0C5259` for hero background, text links, and section headings via `plaa-home-tokens.tsx`; primary actions now also use `#0C5259` (hover `#09434A`), per the owner's latest request, ONLY inside `.plaa-home`. Both hero CTAs (“Contribute now” / “Get started”) remain white with teal text/tinted hover. White hero text/secondary ghost controls remain for contrast. Illustration and global Directory shell unchanged. Desktop/mobile computed colors and WCAG AA contrast verified; see [[architecture/styling]] for the footer Link scoping fix.

## Permanent owner instruction: every PR

Before creating or updating a PR for this repo/project, check that any commented-out or bypassed authentication is fully restored. Remove all temporary member-preview wiring, sample fixtures/banner, and preview-only helpers/tests; unset `PLAA_MEMBER_PREVIEW`. Review the full PR diff for auth bypasses, forced logged-in states, and mock identities. Verify signed-out homepage/protected-route behavior and the real authenticated flow; report any verification blocker. This rule is also in the repo's `AGENTS.md` and `CLAUDE.md` and must survive cleanup.

## PR #3221: cleanup, validation, and recovery

Removed all local preview gates, homepage/image fixtures, preview branches/banners, development API-key fallback, partial-history component mode, and preview-only tests before committing. Local preview/key variables are unset. Auth routes/pages/helpers match the upstream base; real session forwarding, complete API history, and protected-fetch no-store remain. Updated the issuance browser check to require approved authenticated storage state outside the repository. The original Desktop image is untouched. Permanent cleanup instructions remain in AGENTS.md/CLAUDE.md.

Recovery: retained pre-cleanup stash `60578c5e30cc3ec7904411620ebb524d6904d80d`, including untracked files. This is a local backup, not pushed; do not restore its bypasses into an open PR. Earlier rebase stash remains retained too.

Node22.23.2 validation: full Jest4528 passed/65 skipped/2 failed; PLAA/header/auth subset244 passed across31 suites. Both failures (CV date-range and founder-guide date-only formatting) reproduced on a clean detached base worktree. Full lint303 errors/199 warnings and typecheck53 diagnostics match the base; no new TypeScript diagnostics and only two pre-existing chart display-name lint findings in changed files. Temporary baseline worktree removed. Desktop/mobile homepage color isolation passed at1440/390; public homepage renders and four protected PLAA routes return307 login redirects. Authenticated UAT history/issuance clearance still needs owner-session verification; PR is explicitly a draft.

Upstream push returned403: `wswarren12` has READ access. Owner explicitly approved the fork workflow; reused existing public fork `wswarren12/pln-directory-portal-v2`, verified its parent and push permission, added remote `fork`, and pushed `BW-edits` there. Local branch now tracks `fork/BW-edits`; upstream PR targets `stream/plaa-overview`, not main. Lesson: verify permissions and fork identity, get approval before changing publishing location, and compare broad validation failures against the target baseline rather than silently fixing unrelated code or claiming green checks.

## Historical local preview (removed)

During earlier local editing, the owner authorized a development-only route preview, then a read-only API-key option (no key was supplied), then a labeled transcription of `~/Desktop/TrustSampleData.png`. The snapshot contained16 monthly rows and six quarter ends, with no invented buyback/portfolio metadata. Those implementations are no longer in the working tree or PR; historical details and checks remain in [[log]] and the retained safety stash. Normal UAT member authentication is now the only protected-data path.

## Monthly circulation line

Trust & Holdings → Monthly Graph plots `NavPoint.totalPlaa` directly as a red `#DC2626` line, labeled **PLAA issuance** in the top legend. A separate right-hand count axis reads **PLAA in circulation**; native point titles give exact monthly counts. No dollar-axis reuse or cumulative summation. Quarterly graph/table remain unchanged; narrow screens horizontally scroll the monthly plot to retain legibility.

Axis labels share the date-axis font family, 12px size and 500 weight; issuance and NAV lines share a 2px stroke. The owner requires all series OVERLAPPING in one420px plot; a separate upper band was explicitly rejected. The circulation axis now spans0–actual maximum (at least1), with32px bottom padding, so the red points sit slightly above each month's bar totals. Counts themselves stay unchanged. Totals use the normal10px bar-top offset, retaining price-pill collision handling; a background-colored text halo protects them where a steep red segment passes behind. Clearance is calibrated to the approved image and must be rechecked with live history. Avoid fractional endpoint padding: the earlier functional15% ceiling produced720,897.05 despite `allowDecimals=false`. With a real member session, the page forwards full API quarterly/monthly arrays without substituting image data; the monthly plot retains the existing trailing12 window and the table retains all months. Session forwarding and batched buyback loading were backported from `release/plaa-uat` at15541e5a6 without merging the branch. Protected trust data uses no-store.

Run `node scripts/check-plaa-issuance.cjs` against localhost4200 with approved credentials (`PLAA_STORAGE_STATE` kept outside the repo); `BASE_URL` can override the URL. Historical image-preview checks below were run before switching to normal UAT authentication. Desktop/mobile checks pass: six quarters,12 monthly points,16 table rows, matching typography/2px strokes, whole-number circulation ticks, labels rendered above the red line, and no invented portfolio counts.At the earlier preview stage,43 focused Jest tests passed, including image arithmetic, API precedence, and production/flag-off denial; those preview-only checks have since been removed. **Live API history is still not verified** because no authenticated browser session was available. Existing chart display-name lint errors and full TypeScript issues remain; supporting changed files lint clean with no new diagnostics in touched files.

## PLAA top-banner color scope

The active header uses `PlaaTopBannerCarousel`, not the legacy `PlaaBanner`/`HighlightsBar` variant. Both rotating slides now have background `#0C5259` via the carousel CSS-module `.slide > div` rule; underlying snapshot/buyback styles retain their original backgrounds when used outside that wrapper. Rendering now checks exact `/alignment-asset` or its `/`-delimited descendants; the old substring test also matched `/alignment-assets` and `/other/alignment-asset`. Membership gating is unchanged.29 header tests pass, including negative route boundaries; native computed-style fixtures using the real compiled CSS verify inside/outside colors and unchanged desktop/mobile visibility. No authenticated member session was needed or fabricated for those style checks. Do not move homepage brand variables to root/shared layout just to reach this banner.

## Homepage activity suggestions

Homepage suggestions reuse the Activities page's canonical `activities/data/activities.data.ts`, verified byte-identical to fetched `origin/main` at `e5d206e32`; no separate example list or invented activity API. Filter `isSunset` records before ranking and taking three. Never link the legacy `build-ai-app` record; current main contains only that sunset, PL-Infra-only version, so the AI-app suggestion is omitted. A future replacement requires a different ID, a submission CTA and explicit verified `audience: 'all-plaa-participants'` on its source record. Missing eligibility must not be inferred from a title or treated as unrestricted.

Points, category, verification method and destination hash come from the same selected object. Mode labels now match the Activities page (“Submission”, “Manual Review”, “Auto-tracked”), avoiding the misleading past-tense “Reviewed”. Shared catalog contents and Activities-page behavior are unchanged. Nine new regression cases cover metadata updates, filtering before limits, unknown/restricted eligibility and a verified replacement;264 focused tests pass. Desktop/mobile rendering matches current source records. Lesson: omit unavailable/unverified replacements instead of inventing an ID, public URL or point value to preserve a suggested card.

## Homepage-only primary color scope

Searched all usages of `--color-brand`, `--pl-blue-500` and `--pl-blue-600` before editing. Other pages (leaderboard and founder guides) also reference brand variables, so never change their declarations or root/shared-layout tokens for this task. `PlaaHomeTokens` is imported only by `app/alignment-asset/page.tsx` and scopes declarations to `.plaa-home`. The two local action aliases now resolve to teal/darker teal; hero background already used the correct brand token. Reused the white hero-button modifier for signed-out visitors to avoid a teal-on-teal button.

`node scripts/check-plaa-home-colors.cjs` verifies desktop/mobile hero, actions, hover, shared-shell colors, and no color leakage after client-side navigation to `/home`.12 existing homepage tests pass; white/brand contrast8.87:1 and white/hover10.98:1. Lesson for browser checks: `/home` has an additional in-content “Sign in”; compare the navbar control, not every same-named button across different page bodies.

## Table alignment

Numeric headers and values must both be right-aligned; dates remain left-aligned. Headers already had `text-align: right`, but body cells inherited `start`, causing Total PLAA/NAV misalignment. Added the missing declaration to `.th-table td`; the later buyback-table left-alignment override remains intact. Browser regression checks every header/body cell at desktop/mobile sizes and failed before the one-line fix, then passed.

## Gotcha: homepage 404 can hide an upstream API-key requirement

- **Symptom:** after restarting on 2026-09-30, `/alignment-asset` returned 404 instead of the member preview.
- **Cause:** the homepage calls `notFound()` when current-round stats are absent; direct read-only probes of both live PLAA stats and trust-holdings endpoints returned HTTP 401, with the trust response reporting `Missing API key`. The same endpoints had worked on 2026-09-29. Changing UI auth state cannot supply a backend service credential.
- **Initial workaround (rejected for Trust & Holdings):** labeled sample data let the page render but replaced the real history. Its empty quarterly array and four monthly rows produced the user's next bug report.
- **Correction:** added the newer release branch's bearer-session API wiring and authenticated bulk rounds request. Local gate bypasses cannot grant upstream access. The owner then explicitly supplied an image as an approved local source; this is clearly identified, preserves the supplied history, and does not imply live API success. Live verification still requires credentials.
- **Prevention:** inspect upstream HTTP responses and newer release-branch auth contracts before treating a missing-data page as a rendering problem. Never replace requested real financial data with demo fixtures just to pass a screenshot check. A check for a new line is incomplete if it permits the existing quarterly graph to be empty or proves only a four-month fixture. Treat unavailable credentials as an explicit blocker and require authenticated verification.
