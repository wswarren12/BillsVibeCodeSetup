# Rootstock

**Status:** Active development
**Path:** `~/Desktop/Vibes/Rootstock/`
**Tier:** MVP (Supabase)
**Stack:** [[stacks/web]] — Next.js 14 App Router, React 18, TypeScript, Tailwind 3

## One-Sentence Description

A community Q&A platform wrapped in a garden/village metaphor, designed around "calm tech" principles with ambient animations, seasonal theming, and letter-based notifications.

## Stack

- **Framework:** Next.js 14.2.28 (App Router), React 18.2, TypeScript 5.3
- **Styling:** Tailwind 3.4, clsx, tailwind-merge
- **Backend:** Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- **Animations:** Framer Motion 11 (part of the calm-tech design, not optional)
- **Testing:** Vitest (unit) + Playwright (E2E, accessibility, performance, a11y)
- **Deployment:** Docker + Dockerfile

## Architectural Patterns

- **Domain language is metaphorical.** "Seeds" (questions), "places" (communities), "plots" (user profiles), "letters" (notifications), "helpful" (upvote), "solve" (resolve). No "posts", "comments", or "upvotes" anywhere in the codebase.
- **Calm tech as a first-class principle.** Dedicated `useCalmTech` hook, `CalmOverlay` component, `AmbientParticles`, `VillageSun`. Ambient animation is part of the UX, not decoration.
- **Season-driven theming.** `lib/seasons.ts` drives visual theming based on time of year.
- **Construction/building mechanics.** New places go through `proposal → construction → built` stages.
- **Mailbox notifications.** Notifications delivered as "letters" in a mailbox, not toast-and-forget.
- **Progressive database hardening.** 3 Supabase migrations: initial schema, RPC functions, security hardening.
- **Route Handlers everywhere.** Uses `/app/api/**` route handlers rather than Server Actions.

## Tier Reasoning

Rootstock is explicitly on the **MVP tier**:
- Supabase for everything (auth, database, realtime if needed)
- RLS + auth middleware for authorization
- Route Handlers wrapping Supabase calls
- Schema changes via Supabase migrations

The project chose Route Handlers over Server Actions because Supabase client reads/writes compose naturally with REST-style endpoints, and the team wanted Playwright to be able to hit those endpoints directly in E2E tests.

## Project-Specific Decisions

- **Next.js 14, not 16.** Stability over newness — the project was started when 14 was current and there's no concrete reason to upgrade yet.
- **Framer Motion is non-negotiable.** "Calm tech" REQUIRES ambient animation (particles, sun cycle, transitions). Removing Framer Motion would strip the product of core feel.
- **Metaphor-first language.** Every user-visible term is garden/village. Avoid slipping back into "post/comment/upvote" vocabulary.
- **E2E coverage beyond functional.** Playwright suite includes a11y, performance, and navigation alongside standard functional tests.
- **Docker-ready.** Project ships with a Dockerfile for non-Vercel deployment options.

## Related Wiki Pages

- [[architecture/database]] — MVP tier = Supabase
- [[architecture/api-design]] — Route Handlers pattern
- [[architecture/auth]] — Supabase Auth with `@supabase/ssr` middleware
- [[architecture/security]] — Progressive hardening via migrations
- [[architecture/testing]] — Vitest + Playwright, BDD-first
- [[stacks/web]]

## Sources

- [[raw/project-snapshots/rootstock]]
