# ADR-006: Pinata for Hot IPFS Storage

**Date:** 2026-08-31
**Status:** Accepted
**Supersedes:** [[decisions/adr-003-storacha-decentralized-storage]]
**Source project:** Cairn (reference)

## Context

ADR-003 chose Storacha (formerly web3.storage) for decentralized media storage. In April 2026 Storacha's team joined Filecoin Foundation and the product is winding down; the `w3s.link` public gateway shuts down May 31, 2026. Cairn had only stubbed the Storacha upload path, so there is no data to migrate — but a replacement hot IPFS provider is needed before real uploads ship.

Requirements: fastest possible mobile photo retrieval, cheapest at MVP scale, content-addressed (portable CIDs), no API keys in the client bundle.

## Options considered

- **Pinata:** Fastest gateways measured (dedicated gateway, 200+ edge locations, sub-200ms). Free 1GB/10GB bandwidth tier; $20/mo for 1TB. Presigned upload URLs remove the need for UCAN-style delegation. IPFS pinning on centralized infra — no Filecoin persistence.
- **Lighthouse:** Real Filecoin deals + IPFS hot layer. Free 5GB; $12/mo 500GB. Strongest decentralization at low cost, but gateway speed less proven.
- **Filebase:** S3-compatible, $7.50/mo 500GB. Middle ground on all axes.
- **Fil One / Filecoin Onchain Cloud + FilBeam CDN:** Storacha's official successor; $4.99/TB/mo, no egress fees, verifiable on-chain storage. Launched April 2026 — too immature to build on today.

## Decision

Pinata for hot IPFS storage and gateway retrieval. Upload flow: Supabase Edge Function (`pinata-sign`) holds the Pinata JWT and issues 60-second presigned upload URLs; clients upload directly to Pinata and store the returned CID.

## Reasoning

Retrieval speed is what a map full of photo pins feels like to users, and Pinata is the fastest option. The free tier covers the entire MVP. CIDs are content-addressed and portable: dual-pinning to Lighthouse or migrating to Fil One later requires no changes to stored references — Filecoin persistence becomes a background job, not an architecture decision. Presigned URLs are simpler than the UCAN delegation plan they replace.

## Tradeoffs accepted

Pinata is centralized pinning infrastructure — the "decentralized" property today is content-addressing (portable CIDs), not distributed persistence. If Pinata disappears, content must be re-pinned from caches/originals. Revisit Fil One in ~6 months as the persistence endgame.

## Related

- [[decisions/adr-003-storacha-decentralized-storage]] (superseded)
- [[decisions/adr-001-supabase-postgis]] — the Edge Function lives in the same Supabase project
