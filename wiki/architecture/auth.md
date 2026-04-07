# Auth

## Decision Tree
- Web app? → Supabase Auth
- Web3 / wallet login? → Privy
- Mobile (Expo)? → Supabase Auth (Expo adapter)
- Agent / service-to-service? → API keys
- Need both wallet + email login? → Privy

## Why
- Supabase Auth free tier is generous and integrates directly with Postgres RLS
- Privy has the best wallet UX and supports hybrid auth (wallet + email + social)
- API keys for agents keep things simple — no OAuth dance, just a bearer token

## Anti-patterns
- Don't roll your own auth — you will get it wrong
- Don't use NextAuth / Auth.js — config-heavy, fragile session handling, poorly maintained
- Don't use RainbowKit / ConnectKit — wallet-only, no hybrid auth story

## Sources
[To be populated via ingest]
