# Project Snapshot: KidSpinner

**Source:** ~/Desktop/Vibes/KidSpinner/
**Date:** 2026-04-06
**Type:** Kid chore reward gacha spinner app

## Stack
- Next.js 14.2.35 (App Router)
- React 18.3.1
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- Drizzle ORM 0.44.2 + PostgreSQL 16 (via Docker)
- Framer Motion 12.33.0 (spinner animation)
- canvas-confetti (celebration effects)
- Google Gemini API (@google/genai) for AI prize image generation
- OpenAI SDK also included
- Vitest for testing
- Custom server.js (avoids Next.js CLI memory issues)
- Deployed to Vercel

## Architecture
```
src/
  app/
    admin/page.tsx                  # Admin panel for prize configuration
    api/
      prizes/route.ts              # GET published prizes
      spin/route.ts                # POST execute weighted random spin
      spins/recent/route.ts        # GET recent results
      admin/
        prizes/route.ts            # GET/POST draft configs
        prizes/[id]/route.ts       # DELETE prize
        publish/route.ts           # POST publish config
        generate-image/route.ts    # POST AI image generation
      images/[id]/route.ts         # Serve generated images
    page.tsx                       # Main spinner UI
  components/
    SpinnerStrip.tsx               # Animated horizontal card strip
    PrizeCard.tsx, SpinButton.tsx, PrizeModal.tsx, RecentWins.tsx, AdminPanel.tsx
  db/
    schema.ts                      # Drizzle schema (prize_configurations, prizes, spins)
    index.ts, seed.ts
  lib/
    weighted-random.ts             # Weighted random selection + card distribution
    format-time.ts
docker-compose.yml                 # PostgreSQL 16 container
drizzle/                           # Generated migrations
server.js                          # Custom dev server
```

## Patterns Observed
- Server-side weighted random selection -- grand prize locked at 0.01%, regular prizes must total 99.99%
- Draft/publish workflow for prize configurations (admin edits drafts, then publishes)
- AI-generated prize images via Google Gemini with graceful fallback to placeholder
- Arcade/carnival themed CSS
- Custom `server.js` to work around Next.js CLI memory constraints
- Docker Compose for local PostgreSQL
- Drizzle ORM with generate/migrate/push workflow
- Good test coverage: API route tests, schema tests, weighted-random unit tests

## Lessons / Decisions
- Custom server.js over `npx next dev` to avoid memory issues in constrained environments
- Grand prize probability hardcoded at 0.01% as a design decision (not configurable by admin)
- Two-phase config (draft + publish) prevents accidental prize changes mid-use
- AI image generation is optional -- app fully functional without API key
- Both OpenAI and Google Gemini SDKs present -- may have migrated between providers
