# NewsBreef

**Status:** Active development
**Path:** `~/Desktop/Summon/prototypes/NewsBreef/`
**Tier:** ⚠️ **Deviation** — Cloudflare D1 + KV, custom JWT
**Stack:** Hybrid — n8n Cloud workflow + Next.js 16 web companion

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
