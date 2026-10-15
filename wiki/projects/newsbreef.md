# NewsBreef

**Status:** Active development
**Path:** `~/Desktop/Summon/prototypes/NewsBreef/`
**Tier:** ⚠️ **Deviation** — Cloudflare D1 + KV, custom JWT
**Stack:** Next.js 16 + Vercel Workflow/Cron, Cloudflare D1 + KV, Stripe, Resend

## Current State — 2026-09-25

**AI editorial caps deployed:** owner requested independent maximums of one legal-tech/legal-AI story and one BCI/brain-chip story per rolling168h in AI, explicitly with send-time enforcement. Shared policy/system-budget guidance plus independent final-email coverage extraction feed code-enforced arithmetic and one atomic D1 compare-and-reserve. Summary-only coverage and source URLs count; other newsletters unchanged. Migration `0011_ai_editorial_quota.sql` starts both slots on a conservative168h cooldown because historical dedup rows contain shadow/failed attempts. Invalid/unavailable review or storage blocks AI sending; uncertain provider outcomes retain reservations; shadow/empty-recipient runs do not consume slots. Topic recognition is model-assisted, not guaranteed perfect.84 focused tests,486 full-suite tests, changed-file lint and isolated build pass; two stale suites/four historical type errors remain. Independent review **OK** after a reproduced-and-fixed source-link projection P1; no independent test execution/live-model certification. Docs: `docs/ai-editorial-{policy,review}.md`. Owner authorized publication and migration on2026-09-25. Applied0011 to the D1 database from the verified Vercel production environment; exactly one quota row, both slots unavailable until **2026-10-02 19:05:45 UTC**. Committed/pushed `37c8016f0f590734ef65c1a9437e5c7c51c6942f`; Vercel `dpl_EQFZxpNjZVAtRifrH2xdPxpKuTqt` READY, custom domain verified at that SHA. Post-deploy D1 reads confirm unchanged cooldowns and existing runtime keys present (not disclosed). Read-only production smoke: home/archive/login200, dashboard307, auth/me401. No newsletter sends, paid model calls, signup or payment tests. Git tree clean and origin/main aligned.

**Top-navigation archive link deployed:** owner requested moving “Read recent AI briefs” from the subscription paragraph into the shared top nav as a text link. Implemented in `SubscriberNav.tsx` / `HomeContent.tsx`; footer and session actions unchanged. Existing nav flex layout wraps on narrow screens with vertical padding; no button treatment or new menu. Changed-file lint, isolated build, archive matrix and all 11 subscriber groups pass, including guest/authenticated 320–1440px and 200% scaling checks. Prior 18/20 audit is not a new audit of this change. Owner authorized publication: `29a687a9b4c0572c5db43f01a05ef7d96ae3b545` committed/pushed to main; Vercel `dpl_6HVtLYT24BaADLSNmxbCeozgaiHA` READY and custom domain verified at this SHA. Production guest checks at 1440/390/320px confirm the header text link, no intro duplicate, retained footer, visible keyboard focus/order and successful navigation to `/ai`, with no overflow or page errors. No signup/payment/email/cron mutations. Signed-in behavior remains covered by the isolated fixtures; working tree clean.

**Public AI archive deployed:** `/ai` and `/ai/[date]` expose at most the same latest 14 qualifying live AI dates, with homepage/footer discovery, sanitized real-email reading and the existing free-signup continuation. New `published-ai:<date>` copies are retained only after provider acknowledgement and delivery bookkeeping; legacy render-before-send caches are excluded. The archive fills prospectively and may initially be empty. Accepted by Resend does not mean delivered to an inbox. No email renderer, cadence, pricing or account-flow changes. Independent technical UI audit: **18/20 Excellent**, one inherited P2 mobile wordmark target; separate safety re-check: **OK with notes**, all three initial P1 publication findings resolved. Verification: **77 focused tests, 448 full-suite tests** pass; two historical suites still fail to load, full lint/types retain baseline issues. Fresh isolated build, changed-file lint (one inherited warning), archive browser matrix and 11 subscriber groups pass. Reports: `docs/ui/ai-archive-{brief,audit,data-safety}.md`. Owner subsequently authorized publication: commit `9a28277dbca82d60f96d360ca0f4bad12d429314` pushed to main; Vercel `dpl_7gpiwQvv1toRp7SrtEQooWNjtrqT` READY and custom domain verified at that SHA. Production `/ai` returns 200 at 1440/390px, with zero saved public editions (expected prospective fill), no overflow/page errors, guest Sign in and correct signup continuation. Homepage/footer discovery and invalid-edition noindex pass; login200, dashboard307, auth/me and subscriptions401. No live signup/payment/email/cron mutations; repository clean.

**Session-aware header deployed:** header now checks the existing session endpoint: guests see only Sign in; authenticated readers see Your newsletters and Sign Out. `web/components/SubscriberNav.tsx` uses the existing logout POST, full navigation after success, and inline retry on failure. `SubscriberHome` blocks header logout during unsaved/in-flight work. Checks: 32 focused tests, 11 synthetic browser groups, changed-file lint, isolated build, 13 captures and detector []; no live auth/provider actions. Prior 16/20 audit is not a new audit of this change. Owner authorized publication: `c1efdb9e041accce343edf1e12a1d9ca51f7461e` pushed to main; Vercel `dpl_6er7EgxKjvCha6aoeYM6ThepsQi5` READY, custom domain verified at this SHA. Live guest browser checks at 1440/390px show Sign in only, no overflow/page errors; login 200, dashboard 307 to login, auth/me and subscriptions 401 unauthenticated. Signed-in/logout behavior remains covered by synthetic checks, not live account mutation.

**Prior editorial release:** owner requested top-right Sign in, a separate $0/$3/$5/$8 pricing comparison, and a modest editorial/paper refinement. Implemented with existing green, warm paper, a self-hosted 21,488-byte Source Serif 4 headline font, and 12px free qualifiers. Focused 32 tests, 10 synthetic browser groups and isolated production build pass. Independent Impeccable audit: **16/20 Good**, P0/P1 0, one carried-forward P2 (small standalone edit/recovery links). Report: `docs/ui/editorial-refinement-audit.md`. Auditor's fresh browser attempt was blocked by local-server availability; its source/capture review does not independently reproduce the earlier passing browser checks. Owner then authorized publication: commit `fdf378fd43e6e7d0a79570aed325e557261c333c` pushed to `origin/main`, Vercel production deployment `dpl_EeFYh3oSzLNKMvkYec3kV6CvMKpd` READY, custom domain verified at that exact SHA. Public homepage includes header Sign in and separate pricing; local font asset returns 200 and matches its source hash. Login 200, dashboard 307 to login, unauthenticated subscriptions API 401. No signup, payments, or newsletter sends exercised; no extra audit fixes. Historical initial-release verification follows.

The repository's `CLAUDE.md` and `web/` supersede the historical n8n snapshot below. The full product now runs in Next.js, with `web/workflows/` owning the durable daily editorial/delivery pipeline and Vitest under `web/tests/`.

Owner-confirmed audience: busy professionals. The approved Daily Itinerary subscriber redesign is deployed to https://newsbreef.billsai.club: topics and total first, existing email-link access, explicit free activation or paid Stripe handoff, and one **Your newsletters** home combining delivery overview and draft editing. Five newsletters, free bundled AI, $3/$5/$8 tiers, and Stripe remain unchanged. Newsletter content, all email templates, cadence and admin UI remain outside the subscriber website world. The archive's narrowly approved persistence/acknowledgement repairs are documented above; the editorial pipeline itself was not redesigned.

Product truth: `PRODUCT.md`; approved surface/status/evidence: `docs/ui/subscriber-experience-brief.md`; sole built design authority: `.impeccable/DESIGN.md`, retaining the reference-only shortlist, with `.impeccable/design.json` extensions. No competing root `DESIGN.md`. Live config remains in `web/.impeccable/live/config.json`. Documentation was extracted from scoped CSS/components, the built direction contract, thirteen synthetic captures, and independent acceptance reports; no interview or design reroll.

Initial release (superseded by the editorial release above): owner explicitly authorized commit, push, and production deploy on 2026-09-15. Commit `ca3ad393fdcd8b08c273821e611315115bacd25b` is pushed to `origin/main`; Vercel Git deployment `dpl_8SPxZqdNWeV5y1cD6r3PoGdKS1ZB` is READY and the custom domain resolves to that exact SHA. Public landing/login and both CSS assets return 200; unauthenticated dashboard redirects to login and subscriptions API returns 401. No signup, billing mutation, provider delivery, or cron endpoint was exercised. Local verification/session artifacts are gitignored, not published. Latest recorded checks pass: 32 focused tests, nine synthetic browser groups, affected harness lint, isolated build, and source verification. Independent behavior re-review reports no material findings; visual re-review accepts the two scored billing/refresh repairs only. Baseline stale-suite/full-lint/standalone-TypeScript failures and live Stripe/D1/KV/Resend/delivery behavior remain open. The 10px mobile Free-topic qualifier is explicitly not canonized as a design token; it was not repaired in this documentation pass.

Resolved reusable lessons live in [[architecture/payments#Billing access outlives a paid entitlement (NewsBreef, 2026-09-11)]] and [[architecture/testing]] (mutation/refresh distinction, same-URL navigation, generated route types, and branch-specific visual proof). Synthetic acceptance is not provider or deployment certification.

### Gotcha: old execution status is not an active workflow queue

- **Symptom:** migration preflight found a July5 AI execution still marked `pending` in D1 during the September25 rollout.
- **Cause:** application bookkeeping is historical state, not authoritative evidence that a durable workflow is still executing.
- **Resolution:** read-only Vercel Workflow production inspection returned zero `running` and zero `pending` workflows; proceeded with additive migration, retaining the old D1 row unchanged.
- **Prevention:** inspect the actual workflow backend before rollout if execution records appear active. Do not unblock by marking rows completed or assume an old application status proves a live job. Separate migration success, application READY/SHA and provider-delivery evidence.

### Gotcha: editorial quotas are not story dedup, and review must retain link evidence

- **Symptom:** AI coverage bled into Legal and Health. A new send-time review initially missed a BCI story whose only identifying evidence was its source URL; an empty classification allowed the mocked send despite a closed quota.
- **Root cause:** dedup prevents repeat events, not repeated topic coverage. Its historical rows include shadow/failed attempts (publication-provenance rule linked below). The first review projection discarded hrefs, so neither semantic review nor lexical backstop could see the only clue.
- **Resolution:** keep independent atomic AI cooldowns, start conservatively for168h, and review final subject/body plus HTTP(S) anchor destinations without fetching them. Exact-quote validation and numeric caps gate Resend. Preserve reservations on uncertain outcomes; shadow/empty sends cannot spend live slots.
- **Prevention:** test the actual renderer→review→SQL→send seam with generic link labels, summary-only coverage, independent expiries, concurrent claims and unavailable review/storage. Keep a red/green regression for URL-only evidence. Do not call model-assisted topic recognition a perfect semantic guarantee or use unverified dedup logs as a quota ledger.

### Gotcha: optional archive writes must not interrupt delivery bookkeeping

The two publication-provenance P1s and their prevention rules are captured canonically in [[architecture/security-findings#Public projections built from unverified workflow artifacts]].

- **Symptom:** the third independent-review P1 found that an archive-storage failure after sending could skip sent-story dedup and execution bookkeeping.
- **Cause:** the new optional KV write preceded required bookkeeping; its exception entered the overall newsletter failure path after an irreversible send.
- **Resolution:** finish dedup/execution recording first, then attempt public persistence with a local failure handler. Archive availability is best effort; confirmed delivery accounting stays intact.
- **Prevention:** inject an archive-write failure after acknowledgement and assert bookkeeping order, successful delivery status and absence of overall failure recording. Do not claim cross-store atomicity.

### Gotcha: Next error reset and sanitizer transforms have narrower semantics than expected

- **Symptom:** retry retained a failed server-component response; replacing an anchor with empty transform `text` left its original text visible.
- **Cause:** boundary reset alone did not fetch a new RSC payload; the sanitizer's empty text override does not mean delete source content.
- **Resolution:** refresh the router and reset in a transition; use parser `exclusiveFilter` to remove unsafe/personal links and their labels. Derive metadata from decoded parser frames, not regex HTML stripping.
- **Prevention:** actual production-build failure→recovery tests and adversarial real-renderer fixtures; never infer deletion behavior from an option name.
- **Production smoke variant:** Next emitted two identical `meta[name="robots"]` noindex elements on an unavailable route; a strict single-element locator failed despite correct behavior. Assert nonempty metadata and inspect every directive instead of assuming uniqueness. Fixed only the ignored deployment smoke script; no application change.

### Gotcha: header logout must share editor leave guards

- **Symptom:** the shared header unconditionally exposed subscriber-home access and Sign in, regardless of session; adding a header logout could bypass the editor's disabled local sign-out button.
- **Root cause:** shell navigation was static, while unsaved/busy state lived inside the editor.
- **Resolution:** a small client navigation component reads `/api/auth/me`; a cancelable `newsbreef:before-signout` event lets the mounted editor reject logout before any POST. Failed logout preserves navigation for retry; success reloads the guest homepage.
- **Prevention:** synthetic smoke coverage checks guest/authenticated controls, draft-blocked POST, failure/retry, and cleared-session navigation. Do not rely solely on `beforeunload`: it runs after the logout mutation would already have happened.

### Gotcha: historical architecture is not current product truth

- **Symptom:** the previous wiki snapshot described n8n orchestration and old billing/auth details that no longer matched the app.
- **Root cause:** the snapshot predates the Vercel Workflow migration and current free/paid tier implementation.
- **Resolution:** checked repository `CLAUDE.md`, routes, and `web/lib/constants.ts`, confirmed product constraints with the owner, and recorded current context in `PRODUCT.md`.
- **Prevention:** use this page to locate the project, then verify architecture and product rules against current code before planning changes. Never restore historical n8n assumptions during subscriber-UI work.

### Gotcha: newsletter selection saves need one wire contract and a confirmed baseline

- **Symptom:** the prior editor sent `newsletter_ids` to an endpoint expecting `newsletterIds`, and successful saves left the UI dirty.
- **Root cause:** the UI/API payload contract had drifted and the saved baseline was not reconciled after mutation.
- **Resolution:** the shared home sends `newsletterIds`; the response supplies confirmed IDs to replace saved and draft state. Legacy subscriptions/settings routes redirect to that home, removing the unsupported profile/referral placeholder surface. Focused actual-route tests and synthetic browser save/discard/failure checks pass.
- **Prevention:** trace every caller before editing a shared mutation contract; test the real request/response shape and assert clean state after success, retained draft after failure, and preserved unsubscribed AI during paid edits. Do not infer a new supported profile/referral capability from removal of placeholder UI.

## Historical Snapshot — superseded where it conflicts with Current State

## One-Sentence Description

An automated daily newsletter system where an n8n Cloud workflow aggregates news from 11+ web sources and Gmail newsletters, uses Claude for editorial synthesis, and delivers a formatted HTML briefing email every morning — with a Next.js companion app for subscriber management and Stripe billing.

## Stack

### Core product (n8n workflow)
- **n8n Cloud** — the entire aggregation → editorial → delivery pipeline
- **Anthropic SDK** — Claude for categorization and executive briefing
- **Gmail API + public RSS** — inputs
- **Resend** — email delivery

### Web companion (`web/` subdirectory)
- **Next.js 16.1.6** App Router, React 19.2.3, TypeScript 5, Tailwind 4
- **Cloudflare D1** via REST API (see `lib/db.ts`) — SQLite at the edge, no ORM
- **Cloudflare KV** via REST API (see `lib/kv.ts`)
- **JWT via `jose`** — custom minimal auth
- **Stripe** — subscription billing
- **Resend** — transactional emails

## Architectural Patterns

- **The workflow IS the product.** The n8n workflow JSON (`daily-news-brief-workflow.json`) contains the entire aggregation and editorial pipeline. The Next.js app is a companion for subscriber management, not the main codebase.
- **Generate-validate-deploy loop.** Custom `generate-workflow.js`, `validate-workflow.js`, and `deploy.js` scripts manage the n8n workflow JSON as source-controlled code.
- **Raw SQL over ORM.** For a ~3-table subscriber schema, `lib/db.ts` is a thin REST wrapper around Cloudflare D1's HTTP API. No Drizzle, no Prisma.
- **Custom JWT auth.** Subscribers only need a token in their signup link — no login UI, no session management, no RLS.
- **Jest for n8n node logic.** The unit tests live in `tests/` and cover the n8n node JavaScript, not the Next.js components.

## Tier Reasoning (Deviation)

NewsBreef is **explicitly off the wiki's Supabase/Neon tiered defaults**. The deviations:

| Wiki default | NewsBreef choice | Why |
|---|---|---|
| Supabase / Neon | Cloudflare D1 + KV | Simpler schema, cheaper at low scale, edge-compatible |
| Supabase Auth / Privy | JWT via `jose` | Minimal auth surface — subscribers only need a token in the signup link |
| Drizzle / Supabase client | Raw SQL via D1 REST client | No ORM overhead for 3 tables |
| Server Actions | Route Handlers + n8n | Workflow logic lives in n8n, not in the Next.js app |

**Defensibility:** The product's value is in the n8n workflow's aggregation and editorial quality. The database is an afterthought — just a list of subscribers with Stripe customer IDs. Paying Supabase's monthly minimum for that would be silly.

**When to revisit:** If NewsBreef grows features like per-user content filtering, tiered access, or social features (share/forward), the subscriber model becomes complex enough that Supabase + RLS would start earning its keep. File an ADR at that point.

## Project-Specific Decisions

- **No Supabase.** Intentional — see tier reasoning above.
- **n8n over custom backend.** Editorial pipeline is orchestration-heavy; n8n's visual workflow + built-in retry/state handling beats writing this as a cron + job queue in Node.
- **Cloudflare D1 over SQLite-on-disk.** Chosen for edge compatibility and zero-ops hosting.
- **`jose` over NextAuth.** Token-in-link signup doesn't need a full auth library.

## Related Wiki Pages

- [[architecture/api-design]] — Route Handlers for webhooks (Stripe, n8n triggers)
- [[architecture/security]] — JWT signing, webhook signature verification
- [[patterns/agent-automation]] — Plan-execute-validate loosely applies to the n8n workflow
- [[principles/dependency-selection]] — When NOT to default to Supabase
- [[principles/anti-patterns]] — Not falling into "premature Supabase" when D1 fits

## Sources

- [[raw/project-snapshots/linkedin-job-hunter]] — unrelated, but shows another n8n project
- External: n8n Cloud workflow JSON (`daily-news-brief-workflow.json`)
- External: PRD at `~/Desktop/Summon/prototypes/NewsBreef/PRD-DailyNewsBrief-v1.md`
