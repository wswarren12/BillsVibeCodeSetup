# Security Baseline

The minimum security posture for any MVP that touches real users or real data. This is the **floor**, not the ceiling. Everything here is mandatory; skip nothing.

## Environment Variables

- **Never commit secrets to git.** API keys, database URLs, service role keys — all go in `.env.local` (gitignored).
- **Commit `.env.example`** with every required variable listed but set to placeholder values. This doubles as documentation for anyone (human or agent) setting up the project.
- **Access env vars through a typed config file**, not scattered `process.env.X` calls:

```typescript
// lib/config.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
  },
} as const;
```

One place to see all config, type safety, build-time crash if a variable is missing.

- **Distinguish public vs. private env vars.** In Next.js, only `NEXT_PUBLIC_`-prefixed vars ship to the browser. The Supabase anon key is public by design; the service role key is private and must never appear in client code.
- **Gotcha: don't shell-`source` `.env` files in ad-hoc scripts.** Symptom: `set -a && source .env.local` fails with `unmatched '` (zsh) when any value contains an apostrophe or other shell metacharacter — dotenv files are KEY=VALUE, not shell syntax, so unquoted values break sourcing. Resolution: parse the file with a dotenv-style parser instead (Node one-liner matching `^([A-Z_0-9]+)=(.*)$`, `dotenv` package, or `npx dotenv-cli`). Prevention rule: treat `.env*` as data files; only a real dotenv parser reads them, never `source`.

## Row-Level Security (RLS)

**RLS is not optional, even for MVPs.** If you skip RLS on a Supabase project, any user with your anon key (which IS public) can read and write any row in any table. Enable RLS on every table and write policies.

**The two RLS policies that cover 90% of MVPs:**

1. Users can only access their own data:
```sql
create policy "users can read their own traces"
on traces for select
using (auth.uid() = user_id);

create policy "users can insert their own traces"
on traces for insert
with check (auth.uid() = user_id);
```

2. Some data is public to read, private to write:
```sql
create policy "anyone can read public traces"
on traces for select
using (visibility = 'public');

create policy "only the author can update"
on traces for update
using (auth.uid() = user_id);
```

**Test your RLS policies.** Use the Supabase SQL editor's "Run as" feature to verify that user A cannot see user B's data. Untested RLS is worse than no RLS — it gives false confidence.

See [[patterns/data-modeling]] for more RLS patterns.

## Input Validation

**Validate all user input server-side, even if you validate client-side too.** Client-side validation is UX; server-side validation is security.

- **In Server Actions / Edge Functions:** Validate with zod at the top of the handler.
- **In Supabase direct calls:** Lean on Postgres constraints (`NOT NULL`, `CHECK`, enums) defined in migrations. The database is the last line of defense.

```typescript
// Edge Function
import { z } from 'zod';

const BodySchema = z.object({
  title: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const body = BodySchema.parse(await req.json());
```

Never trust anything that came from the client.

## CORS

When your frontend and backend are on different domains (e.g., Vercel frontend calling Supabase Edge Functions on a different subdomain), set CORS headers explicitly:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

For development, `'*'` is fine. Narrow it to your actual domain before any real user touches it.

## Rate Limiting

Supabase has built-in rate limiting on auth endpoints. For your own Edge Functions, add basic rate limiting when the function:

- Calls a paid external API (OpenAI, Resend, Anthropic)
- Performs expensive database operations
- Is publicly accessible without auth

For an MVP, a simple in-memory counter or Supabase-based counter is sufficient. **Do not set up Redis for rate limiting at this stage** — you don't need the infra.

## Transport & At-Rest Encryption

- Supabase encrypts at rest by default.
- Vercel and Supabase serve over HTTPS by default.
- Don't implement field-level encryption for an MVP. The default encryption-at-rest plus HTTPS-in-transit is sufficient until you have a specific compliance requirement.

## What NOT to Build for an MVP

- **Don't build a custom auth system.** Use Supabase Auth or Privy. See [[architecture/auth]].
- **Don't build an admin panel with user management.** Use the Supabase dashboard. See [[principles/anti-patterns#building-admin-panels]].
- **Don't implement 2FA.** Unless your product handles financial data or PHI.
- **Don't build audit logging.** Use `created_at` / `updated_at` timestamps. Full audit trails come when you have compliance requirements.
- **Don't implement field-level encryption.** See above — at-rest plus in-transit is enough.

## Related

- [[architecture/auth]] — Authentication decisions and patterns
- [[patterns/data-modeling]] — RLS policy patterns
- [[principles/anti-patterns]] — What to skip at the MVP stage

## Sources

- [[raw/articles/vibes-knowledge-base/08-security-auth-baseline]]
