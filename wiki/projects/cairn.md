#  Cairn

**Status:** PRD stage — no code directory yet
**Path:** PRD at `~/Desktop/Vibes/prds/PRD-Cairn-v1.md` (v1.0, 2026-03-31)
**Tier:** MVP (Supabase) — planned
**Stack:** [[stacks/mobile]] — React Native + Expo (planned)

## One-Sentence Description

A mobile app that lets people leave presence-verified multimedia stories at real-world locations — and link them into discoverable trails — so that the physical world becomes a living, layered archive of personal memory and local history.

## Current State

**No code directory yet.** Cairn exists as a PRD only (`~/Desktop/Vibes/prds/PRD-Cairn-v1.md`). No per-project `CLAUDE.md` has been created because there is no project directory to anchor it to. Once scaffolding begins, this page should be updated with a `Path:` pointing to the working directory and a `CLAUDE.md` should be added there.

## Planned Stack

All four architecture ADRs in this vault were originally derived from Cairn's needs:

- **[[decisions/adr-001-supabase-postgis]]** — Supabase + PostGIS for geospatial queries (200m radius presence check, bbox viewport fetches, Ghost Pin proximity)
- **[[decisions/adr-002-privy-web3-auth]]** — Privy for authentication (embedded wallets + social login path)
- **[[decisions/adr-003-storacha-decentralized-storage]]** — Storacha for durable photo storage (multimedia Traces outlive a single hosting provider)
- **[[decisions/adr-004-react-native-expo]]** — React Native + Expo for the mobile client

Additional planned components:
- **PostGIS** for `ST_DWithin` presence checks and bbox viewport queries on the `traces` table
- **Supabase Storage** for short-term photo hosting with CDN; Storacha for long-term durability
- **Supabase RLS** enforcing group-based visibility on Traces (public / private / group)
- **Expo Location** for GPS accuracy checks (worse than 200m → reject Trace drop)

## Core Concepts

- **Trace** — A geo-anchored multimedia marker (photo + text) at a specific real-world location. Must be created from within 200m of its reported coordinates.
- **Ghost Pin** — A pre-seeded historical marker sourced from public datasets (NRHP, Wikimedia Commons, Wikipedia geo). Faded by default; becomes vivid as users "enrich" it.
- **Trail** — An ordered sequence of Traces forming a followable path with auto-calculated distance/duration.
- **Time Capsule** — A Trace locked until either a future date or until someone physically visits the location (two lock modes).
- **Group** — Invite-link-based shared visibility scope for Traces and Trails.
- **Presence verification** — The core anti-spam mechanism. You cannot drop a Trace for a place you haven't physically visited.

## Architectural Patterns (Planned)

- **Presence verification is a universal gate.** Every write that claims to happen at a location — drop a Trace, enrich a Ghost Pin, unlock a location-locked Time Capsule — checks `ST_DWithin(user_position, claimed_position, 200)`. Implemented in API and mirrored in RLS where feasible.
- **Ghost Pins are seed data, not user content.** An ingestion pipeline (F-8) loads public historical datasets into the `traces` table with a distinct `source` field. User enrichments are a separate `trace_enrichments` table referencing the Ghost Pin.
- **Bbox-first map queries.** The map fetches Traces for a viewport bounding box, not for "near me" — necessary for remote browsing (users view maps of places they're not physically at).
- **RLS as the authorization backbone.** Group visibility, private Traces, and Time Capsule lock states are enforced in RLS policies rather than in application code. This matches the MVP tier default in [[architecture/database]].

## Target Users

- **Heritage Walker** (Margaret) — creates walking tours of local history for her town's historical society
- **Memory Keeper** (David) — builds a shared family memory layer across the places his family has visited together
- **Trail Explorer** (Anika) — discovers authentic human-curated place experiences and contributes her own

## Key Differentiators

- **Persistence over ephemerality** — Traces don't disappear in 24 hours like Snap Map; the physical world becomes a permanent, layered archive
- **Presence-gated writes** — you must physically visit a location to leave or enrich content there
- **Historical baseline** — the map is pre-seeded with ~95k+ Ghost Pins so the app is useful on day one, before any user content exists
- **Time Capsule mechanic** — a unique way to leave messages "to the future" of a place

## Tier Reasoning

Cairn is planned for the **MVP tier**:

- Supabase + PostGIS handles the entire data layer (auth, database, geo queries, storage, realtime for Trail-follow progress)
- RLS enforces group/private/Time Capsule visibility without a separate API layer
- Schema changes evolve through Supabase migrations

The production tier (Neon + Drizzle) would only make sense if multi-tenancy or schema complexity grew beyond what RLS can reasonably express — not expected for the initial launch.

## Project-Specific Decisions (Anticipated)

- **React Native + Expo over native iOS/Android** — single codebase, Expo Location is sufficient for GPS accuracy needs, EAS Build handles provisioning
- **Privy over Supabase Auth** — the product roadmap includes wallet-gated features (see [[decisions/adr-002-privy-web3-auth]]); defer auth choice complexity by adopting Privy from day one
- **Storacha for photo durability** — memories should outlive a single hosting provider; per [[decisions/adr-003-storacha-decentralized-storage]]
- **PostGIS over a separate geospatial service** — the query patterns (ST_DWithin within 200m, bbox viewport fetches) are directly supported by PostGIS and compose with Supabase RLS

## Related Wiki Pages

- [[decisions/adr-001-supabase-postgis]] — Geospatial backend choice
- [[decisions/adr-002-privy-web3-auth]] — Auth with embedded wallets
- [[decisions/adr-003-storacha-decentralized-storage]] — Durable media storage
- [[decisions/adr-004-react-native-expo]] — Mobile framework choice
- [[architecture/database]] — MVP tier = Supabase
- [[architecture/auth]] — Privy for Web3-adjacent auth
- [[architecture/security]] — RLS for group/private visibility
- [[stacks/mobile]] — Expo conventions
- [[patterns/data-modeling]] — Table design for Traces, Trails, Groups

## Sources

- External PRD: `~/Desktop/Vibes/prds/PRD-Cairn-v1.md` v1.0 (2026-03-31)
