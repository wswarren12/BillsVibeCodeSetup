# Database

## Decision Tree
- Web / mobile backend? → Neon Postgres (via Vercel Marketplace)
- ORM? → Always Drizzle
- Web3 off-chain data? → Same Neon + Drizzle setup
- On-chain data? → Read via wagmi / viem — don't duplicate into your DB
- Full-text search? → Postgres tsvector (no external search service needed)
- Real-time subscriptions? → Supabase Realtime
- Agent storage? → Postgres, same pattern as everything else

## Why
- Neon serverless scales to zero, has database branching for preview environments, and lives in the Vercel Marketplace
- Drizzle is type-safe, SQL-like, and lightweight — no query engine binary like Prisma
- Not Prisma: heavier runtime, query engine overhead, slower cold starts on serverless

## Migration Workflow
1. Modify the Drizzle schema file
2. `drizzle-kit generate` — creates the SQL migration
3. `drizzle-kit migrate` — applies it to the database
4. `drizzle-kit studio` — inspect the result visually

## Anti-patterns
- Don't use Prisma — query engine overhead is real on serverless
- Don't duplicate on-chain data into Postgres — read it directly via wagmi/viem
- Don't reach for Elasticsearch or Algolia before trying Postgres tsvector

## Sources
[To be populated via ingest]
