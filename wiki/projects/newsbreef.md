# NewsBreef

**Status:** Active development
**Path:** `~/Desktop/Summon/prototypes/NewsBreef/`
**Tier:** ⚠️ **Deviation** — Cloudflare D1 + KV, custom JWT
**Stack:** Next.js 16 + Vercel Workflow/Cron, Cloudflare D1 + KV, Stripe, Resend

## Current State — 2026-09-15

**Editorial follow-up deployed:** owner requested top-right Sign in, a separate $0/$3/$5/$8 pricing comparison, and a modest editorial/paper refinement. Implemented with existing green, warm paper, a self-hosted 21,488-byte Source Serif 4 headline font, and 12px free qualifiers. Focused 32 tests, 10 synthetic browser groups and isolated production build pass. Independent Impeccable audit: **16/20 Good**, P0/P1 0, one carried-forward P2 (small standalone edit/recovery links). Report: `docs/ui/editorial-refinement-audit.md`. Auditor's fresh browser attempt was blocked by local-server availability; its source/capture review does not independently reproduce the earlier passing browser checks. Owner then authorized publication: commit `fdf378fd43e6e7d0a79570aed325e557261c333c` pushed to `origin/main`, Vercel production deployment `dpl_EeFYh3oSzLNKMvkYec3kV6CvMKpd` READY, custom domain verified at that exact SHA. Public homepage includes header Sign in and separate pricing; local font asset returns 200 and matches its source hash. Login 200, dashboard 307 to login, unauthenticated subscriptions API 401. No signup, payments, or newsletter sends exercised; no extra audit fixes. Historical initial-release verification follows.

The repository's `CLAUDE.md` and `web/` supersede the historical n8n snapshot below. The full product now runs in Next.js, with `web/workflows/` owning the durable daily editorial/delivery pipeline and Vitest under `web/tests/`.

Owner-confirmed audience: busy professionals. The approved Daily Itinerary subscriber redesign is deployed to https://newsbreef.billsai.club: topics and total first, existing email-link access, explicit free activation or paid Stripe handoff, and one **Your newsletters** home combining delivery overview and draft editing. Five newsletters, free bundled AI, $3/$5/$8 tiers, and Stripe remain unchanged. Newsletter content, all email templates, delivery pipeline, and admin UI are outside this world.

Product truth: `PRODUCT.md`; approved surface/status/evidence: `docs/ui/subscriber-experience-brief.md`; sole built design authority: `.impeccable/DESIGN.md`, retaining the reference-only shortlist, with `.impeccable/design.json` extensions. No competing root `DESIGN.md`. Live config remains in `web/.impeccable/live/config.json`. Documentation was extracted from scoped CSS/components, the built direction contract, thirteen synthetic captures, and independent acceptance reports; no interview or design reroll.

Initial release (superseded by the editorial release above): owner explicitly authorized commit, push, and production deploy on 2026-09-15. Commit `ca3ad393fdcd8b08c273821e611315115bacd25b` is pushed to `origin/main`; Vercel Git deployment `dpl_8SPxZqdNWeV5y1cD6r3PoGdKS1ZB` is READY and the custom domain resolves to that exact SHA. Public landing/login and both CSS assets return 200; unauthenticated dashboard redirects to login and subscriptions API returns 401. No signup, billing mutation, provider delivery, or cron endpoint was exercised. Local verification/session artifacts are gitignored, not published. Latest recorded checks pass: 32 focused tests, nine synthetic browser groups, affected harness lint, isolated build, and source verification. Independent behavior re-review reports no material findings; visual re-review accepts the two scored billing/refresh repairs only. Baseline stale-suite/full-lint/standalone-TypeScript failures and live Stripe/D1/KV/Resend/delivery behavior remain open. The 10px mobile Free-topic qualifier is explicitly not canonized as a design token; it was not repaired in this documentation pass.

Resolved reusable lessons live in [[architecture/payments#Billing access outlives a paid entitlement (NewsBreef, 2026-09-11)]] and [[architecture/testing]] (mutation/refresh distinction, same-URL navigation, generated route types, and branch-specific visual proof). Synthetic acceptance is not provider or deployment certification.

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
