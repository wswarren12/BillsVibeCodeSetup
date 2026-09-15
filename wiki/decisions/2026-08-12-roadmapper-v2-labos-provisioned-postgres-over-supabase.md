# ADR: Roadmapper V2: LabOS provisioned Postgres over Supabase

**Date:** 2026-08-12
**Status:** accepted

## Context
Roadmapper v1 (ai-app-starter-kit v1.4) used a Supabase Postgres reached via supabase-js with the service-role key, with SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY managed through the LabOS secrets flow, and RLS enabled with zero policies purely to close Supabase's public Data API. Starter kit v1.7 introduced a PLN-provisioned "native" Postgres: database {enabled:true,type:"postgres"} in pln-app.config.json, DATABASE_URL injected automatically at runtime, SSL mandatory, single dedicated db user, no public Data API. Migrating removes a third-party dependency and two member-managed secrets.

## Decision
Migrate Roadmapper to the LabOS provisioned Postgres (RoadmapperV2, 2026-08-12). Replace SupabaseStore with a PostgresStore (node-postgres, pool max 5 for the 384Mi budget) behind the unchanged Store interface; factory keys off DATABASE_URL. Consolidate the seven Supabase migrations into one idempotent DDL applied by the app on every boot (members have no psql access), dropping RLS since no Data API exists — authorization remains entirely in the API layer as before. Data moves via export (Supabase REST) → import (single transaction, FK-ordered, preserving UUIDs/tokens/timestamps) → verify (ID-set comparison) scripts in RoadmapperV2/migration/. DATE columns pinned to strings via pg type parser to preserve the REST-era wire shapes.

## Consequences
Positive: no third-party database vendor; zero member-managed db secrets (only ANTHROPIC_API_KEY remains in the secrets flow); schema self-provisions on deploy; share links, agent-link tokens, and timestamps survive the move byte-for-byte; the API layer and UI needed no changes. Negative: SSL is encrypted-but-unverified by default (platform ships no CA; DATABASE_CA_CERT enables verification, e.g. the public AWS RDS bundle); schema now lives in two places that must stay in sync (app/src/lib/store/schema.ts and migration/schema/001_labos_init.sql); no dashboard/SQL console for the provisioned db — debugging goes through the app or one-off scripts; boot-time DDL means schema errors surface at cold start rather than deploy time.

## Related
