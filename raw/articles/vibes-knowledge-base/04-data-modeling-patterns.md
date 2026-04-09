# Data Modeling Patterns

This document covers how to think about database schemas for MVPs built on Supabase (Postgres). The goal is schemas that are simple to query, easy to evolve, and don't require a PhD in relational theory to understand.

## Start With Fewer Tables

A common mistake is modeling every noun in the product spec as its own table. For an MVP, ask: "Will I ever need to query this entity independently?" If the answer is no, it probably belongs as a column (possibly a JSONB column) on its parent table, not as a separate table with a foreign key.

Example: A "trace" in a location app has metadata like tags, media URLs, and display settings. For an MVP, a single `traces` table with a `metadata JSONB` column is simpler and more flexible than `traces` + `trace_tags` + `trace_media` + `trace_settings` across four tables with three join queries.

When to split into a separate table: when you need to query that entity independently, enforce unique constraints on it, or it has its own lifecycle (created/updated/deleted separately from the parent).

## Use Postgres Enums for Small Fixed Sets

If a column has a small, known set of values (status, role, type), use a Postgres enum rather than a lookup table. Enums are type-safe, self-documenting, and don't require a join.

```sql
CREATE TYPE trace_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE traces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status trace_status DEFAULT 'draft',
  ...
);
```

When to use a lookup table instead: when the set of values needs to be user-editable at runtime, or when you need to attach metadata to each value (display name, sort order, icon).

## JSONB Is Your Friend (With Limits)

Postgres JSONB columns are excellent for MVP schemas because they let you store semi-structured data without migrations every time you add a field. Use them for:

- Metadata that varies per record (display settings, user preferences)
- Denormalized data you've copied for read performance (author name alongside author_id)
- Flexible schemas that are still being figured out

Do not use JSONB for:
- Data you need to filter or sort by frequently (use a real column and index it)
- Foreign key relationships (Postgres can't enforce referential integrity inside JSON)
- Large arrays that grow unboundedly (they'll make the row huge and slow to update)

## UUIDs for Primary Keys

Always use `UUID DEFAULT gen_random_uuid()` for primary keys. Not serial integers. UUIDs are safe to expose in URLs, can be generated client-side for offline-first patterns, and don't leak information about record count or creation order.

## Timestamp Conventions

Every table gets these columns:

```sql
created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
```

Add a trigger to auto-update `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Use `TIMESTAMPTZ` (with timezone), not `TIMESTAMP`. Always. Timezone-naive timestamps cause bugs that are painful to debug.

## Soft Delete Only When Necessary

For most MVP tables, hard delete is fine. Soft delete (an `is_deleted` boolean or `deleted_at` timestamp) adds complexity to every query — you have to remember to filter it out. Only use soft delete when:

- The data has legal or compliance retention requirements
- Users expect an "undo" or "trash" feature
- Other records reference it and you can't cascade delete safely

If you do soft delete, prefer `deleted_at TIMESTAMPTZ` over `is_deleted BOOLEAN` because the timestamp gives you audit information for free.

## Row-Level Security Patterns

Supabase uses Postgres RLS to control data access. For an MVP, you need exactly two patterns:

**Pattern 1: Users can only see their own data.**

```sql
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own traces"
  ON traces FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own traces"
  ON traces FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own traces"
  ON traces FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own traces"
  ON traces FOR DELETE
  USING (user_id = auth.uid());
```

**Pattern 2: Some data is public to read, private to write.**

```sql
CREATE POLICY "Anyone can read published traces"
  ON traces FOR SELECT
  USING (status = 'published');

CREATE POLICY "Owner can do everything with own traces"
  ON traces FOR ALL
  USING (user_id = auth.uid());
```

Do not build role-based access control, team permissions, or organization hierarchies for an MVP unless the core loop is literally about team collaboration.

## PostGIS for Spatial Data

If the product involves locations, distances, or geographic queries, enable PostGIS and use `GEOGRAPHY` columns:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE traces ADD COLUMN location GEOGRAPHY(POINT, 4326);

CREATE INDEX traces_location_idx ON traces USING GIST (location);
```

Query for nearby traces:

```sql
SELECT * FROM traces
WHERE ST_DWithin(
  location,
  ST_MakePoint(-79.1, 36.07)::geography,
  5000  -- meters
)
ORDER BY ST_Distance(location, ST_MakePoint(-79.1, 36.07)::geography);
```

Use `GEOGRAPHY` (spherical, meters) not `GEOMETRY` (planar, degrees) unless you're doing specialized GIS work. Geography gives you distance in meters, which is what users understand.

## Migration Discipline

Even for an MVP, use migrations. Apply schema changes via `supabase migration new` and SQL files, not by clicking around in the dashboard. This makes the schema reproducible, reviewable, and version-controlled. The dashboard is for exploration; migrations are for truth.
