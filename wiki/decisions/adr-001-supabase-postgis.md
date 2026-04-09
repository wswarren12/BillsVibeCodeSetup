# ADR-001: Supabase + PostGIS over Firebase for Spatial Apps

**Date:** 2026-04-09
**Status:** Accepted
**Source project:** Cairn (reference)

## Context

Cairn is a location-based storytelling app that needs spatial queries (find traces near me), relational data (users, traces, media), auth, and file storage.

## Options considered

- **Firebase (Firestore + Firebase Auth + Cloud Storage):** Familiar, fast to prototype, good mobile SDKs. But Firestore has no native spatial query support — you'd need GeoFire or a third-party geohash library, which gives imprecise results and can't do complex spatial queries (polygon containment, route-based proximity).
- **Supabase (Postgres + PostGIS + Supabase Auth + Supabase Storage):** Full relational database with native spatial indexing. PostGIS is the industry standard for geospatial data. Supabase provides auth, storage, and Edge Functions in one platform.
- **PlanetScale + separate auth/storage:** MySQL-based, no spatial support worth mentioning. Would require stitching together multiple services.

## Decision

Supabase + PostGIS.

## Reasoning

The core loop IS spatial — "show me traces near this location." PostGIS handles this natively with proper great-circle distance calculations, spatial indexes, and complex queries (e.g., "traces within 500m of my route"). Firebase would require a workaround that degrades as the dataset grows. Supabase also consolidates auth, storage, and Edge Functions into one platform, reducing integration overhead.

## Tradeoffs accepted

Supabase's real-time capabilities are less mature than Firebase's. Postgres requires more schema upfront than Firestore's schemaless approach. Supabase's mobile SDKs are newer and have fewer community examples than Firebase's.

## Related

- [[architecture/database]]
- [[patterns/data-modeling]] — JSONB, RLS, and PostGIS patterns
- [[stacks/mobile]]
