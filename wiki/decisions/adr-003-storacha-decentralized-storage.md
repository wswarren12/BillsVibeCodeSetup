# ADR-003: Storacha for Decentralized Storage

**Date:** 2026-04-09
**Status:** Accepted
**Source project:** Cairn (reference)

## Context

Cairn's traces include multimedia content (photos, audio, text). We want content to be durable and not dependent on a single platform's continued existence.

## Options considered

- **Supabase Storage only:** Simple, integrated, handles permissions via RLS. But content lives on one platform. If Supabase goes down or we migrate, all media URLs break.
- **IPFS direct (via Helia or Kubo):** True decentralization but requires running/paying for pinning infrastructure. Unreliable without a pinning service.
- **Storacha (formerly web3.storage):** IPFS pinning as a managed service. Upload via API, content gets an IPFS CID (content-addressed, immutable), Storacha handles pinning and gateway access.
- **Arweave:** Permanent storage, pay once. But the upload experience is clunkier and tied to AR tokens.

## Decision

Storacha for media content, Supabase Storage as a fallback/cache.

## Reasoning

Content-addressed storage (IPFS CIDs) gives us immutable references to content that work regardless of which platform hosts the gateway. Storacha abstracts away IPFS pinning complexity. We store the CID in our Supabase database alongside a Supabase Storage URL as a fallback — if Storacha is slow or down, we can serve from Supabase. The dual-storage approach adds complexity but makes the content layer resilient.

## Tradeoffs accepted

Dual storage means uploading content twice (or syncing between them). IPFS gateway performance can be slow on first access. Storacha is a younger service with less track record than AWS S3 or similar. Added complexity in the upload flow.

## Related

- [[stacks/web3]]
- [[decisions/adr-001-supabase-postgis]] — Supabase is the fallback/cache for Storacha content
