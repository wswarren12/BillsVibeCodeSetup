# Hosting

## Decision Tree
- Web (Next.js)? → Vercel
- Mobile? → EAS Build + Submit
- Agent automation? → Docker on fly.io or Railway
- Background workers? → Docker on fly.io or Railway
- Database? → Neon Postgres via Vercel Marketplace
- Static assets? → Vercel (automatic)
- Need GPU? → Modal or Replicate

## Why
- Vercel is the native platform for Next.js — zero-config deploys, preview URLs, edge functions
- EAS handles the entire mobile build/submit pipeline without local Xcode/Android Studio
- fly.io and Railway run Docker containers with easy scaling — good for long-running processes
- Neon is serverless Postgres — scales to zero, branches for preview environments, Vercel integration
- Modal and Replicate give on-demand GPU access without managing infra

## Conventions
- Every project gets a Dockerfile even if deploying to Vercel — local dev parity matters
- Use `docker-compose` for local dev — database, services, and app all in one command
- Env vars for web projects go through `vercel env` — pull them locally with `vercel env pull`
- Never commit `.env` files — use `.env.example` with placeholder values

## Anti-patterns
- Don't self-host databases unless you have a specific compliance reason
- Don't use Heroku — pricing is bad and the platform has stagnated
- Don't run GPU workloads on general compute — use specialized providers (Modal, Replicate)
- Don't put background jobs in serverless functions — they will timeout

## Sources
[To be populated via ingest]
