# Project Snapshot: Rootstock

**Source:** ~/Desktop/Vibes/Rootstock/
**Date:** 2026-04-06
**Type:** Community Q&A platform with garden/village metaphor

## Stack
- Next.js 14.2.28 (App Router)
- React 18.2
- TypeScript 5.3
- Tailwind CSS 3.4 + autoprefixer
- Supabase (auth + database via @supabase/ssr + @supabase/supabase-js)
- Framer Motion 11 (animations)
- lucide-react (icons)
- clsx + tailwind-merge (styling utilities)
- Vitest 1.6 + Testing Library (unit tests)
- Playwright 1.58 (E2E tests)
- Docker + Dockerfile for deployment

## Architecture
```
src/
  app/
    api/
      mailbox/[id]/read/   # Mark notifications read
      places/[slug]/        # Community "places" CRUD + seeds
      places/by-id/[id]/    # Place join/details
      responses/[id]/helpful/ # Helpful voting
      search/               # Search endpoint
      seeds/[id]/           # Seeds CRUD + responses + solve
      session/              # Auth session + heartbeat
      users/[id]/plot/      # User plot management
      village/              # Village view data
    auth/callback/          # Supabase auth callback
    login/, signup/         # Auth pages
    mailbox/                # Notification inbox
    places/[slug]/          # Place pages + seed detail + construction + propose
    plot/                   # User's personal plot
    search/                 # Search page
    seeds/[id]/             # Seed detail page
    users/[id]/             # User profile
  components/
    AmbientParticles, Building, CalmOverlay, ConstructionBuildingVillage, ConstructionPlot
    GrowthIndicator, HelpfulButton, LetterCard, LetterDetail, Mailbox, Memento, MementoTooltip
    OnboardingFlow, Place, PlaceProposal, PlaceSelector, PlantSeedButton, Plot, PlotStats
    ResponseCard, ResponseComposer, ResponseList, Search, SearchResultCard, SearchResults
    SeedCard, SeedComposer, SeedDetail, SolutionButton, Village, VillageSun, AuthForm
  hooks/
    useAuth.ts, useCalmTech.ts, useDebounce.ts
  lib/
    api-utils.ts, auth.ts, seasons.ts
    supabase/ (client.ts, server.ts, middleware.ts)
  middleware.ts             # Supabase auth middleware
  types/database.ts
e2e/                        # Playwright tests (accessibility, API, auth, homepage, navigation, performance, search)
supabase/migrations/        # 3 migration files (initial schema, RPC functions, hardening)
```

## Patterns Observed
- Garden/village metaphor throughout: "seeds" (questions), "places" (communities), "plots" (user profiles), "growth stages", "seasons"
- "Calm tech" design philosophy with CalmOverlay, AmbientParticles, VillageSun, useCalmTech hook
- Mailbox notification system (letter-based metaphor)
- Construction/building mechanics for new places (proposal -> construction -> built)
- "Helpful" voting on responses (like upvoting but softer language)
- "Solve" mechanism for marking seed questions as resolved
- Onboarding flow component for new users
- Supabase middleware for auth session management
- Comprehensive testing: unit tests (components, API, hooks, integration), E2E (Playwright)
- Docker deployment ready
- Claude agent configuration for mobile UI optimization (.claude/agents/)
- Multiple PRDs present (v2, v3)

## Lessons / Decisions
- Entire domain language is metaphorical (garden/village) -- no "posts", "comments", "upvotes"
- Calm tech as an explicit design principle, not just aesthetic -- has dedicated hook and overlay
- Three Supabase migrations show progressive hardening (initial -> RPC functions -> security)
- Playwright E2E tests cover accessibility and performance alongside functional tests
- Seasons system (seasons.ts) likely drives visual theming based on time of year
- Growth stages for seeds suggest gamification of question lifecycle
