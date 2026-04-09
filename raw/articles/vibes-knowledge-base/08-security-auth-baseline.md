# Security & Auth Baseline

This document defines the minimum security posture for any MVP that touches real users or real data. This is not a comprehensive security audit — it's the floor, not the ceiling.

## Environment Variables

- **Never commit secrets to git.** API keys, database URLs, service role keys — all go in `.env.local` (gitignored).
- **Commit a `.env.example`** with every secret listed but set to placeholder values. This is documentation for anyone (human or agent) setting up the project.
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

This gives you one place to see all config, type safety, and a build-time crash if a variable is missing (via the `!` assertion — fine for MVPs, use runtime validation for production).

- **Distinguish public vs. private env vars.** In Next.js, only vars prefixed `NEXT_PUBLIC_` are sent to the browser. Supabase anon key is public (it's designed to be). Service role key is private and should NEVER appear in client code.

## Supabase Auth Patterns

**Default to magic link auth** for MVPs. It requires no password management, no "forgot password" flow, and no concern about password strength. The user enters their email, clicks a link, and they're in.

**Add OAuth (Google, GitHub) only when:**
- Your target users expect it (developer tools → GitHub, consumer apps → Google)
- You need profile data from the OAuth provider (avatar, name)

**Session handling:** Supabase's client library manages sessions automatically via cookies/localStorage. Do not build custom session management. Do check for session expiry in your app layout:

```typescript
// In your root layout or auth provider
const { data: { session } } = await supabase.auth.getSession();
if (!session) redirect('/login');
```

**For Web3 auth (Privy):** Privy handles wallet connection and embedded wallet creation. The user never sees "connect wallet" unless you want them to. After Privy auth, sync the user to your Supabase `profiles` table via a webhook or Edge Function. Privy is the auth layer; Supabase is the data layer.

## Row-Level Security (RLS)

RLS is not optional, even for MVPs. If you skip RLS, any user with your anon key (which is public) can read and write any row in any table. Enable RLS on every table and write policies.

See the Data Modeling Patterns doc for specific RLS patterns. The two you need for most MVPs:

1. Users can only access their own data.
2. Some data is public to read, private to write.

**Test your RLS policies.** Use the Supabase SQL editor logged in as different users (via the "Run as" feature) to verify that user A cannot see user B's data.

## CORS

If your frontend and backend are on different domains (e.g., Vercel frontend calling Supabase Edge Functions on a different subdomain), CORS headers matter.

For Supabase Edge Functions, set headers explicitly:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

For an MVP, you can use `'*'` for the origin during development, but narrow it to your actual domain before any real users touch it.

## Rate Limiting

Supabase has built-in rate limiting on auth endpoints. For your own Edge Functions, add basic rate limiting if the function:

- Calls a paid external API (OpenAI, Resend)
- Performs expensive database operations
- Is publicly accessible without auth

For an MVP, a simple in-memory counter or Supabase-based counter is sufficient. Do not set up Redis for rate limiting at this stage.

## Input Validation

Validate all user input server-side, even if you validate client-side too. Client-side validation is a UX convenience; server-side validation is security.

For Edge Functions, validate at the top of the function:

```typescript
const { title, latitude, longitude } = await req.json();

if (!title || typeof title !== 'string' || title.length > 200) {
  return new Response(JSON.stringify({ error: 'Invalid title' }), { status: 400 });
}
```

For Supabase direct calls, lean on Postgres constraints (NOT NULL, CHECK constraints, enums) defined in your migrations. The database is the last line of defense.

## What Not to Build for an MVP

- **Do not build a custom auth system.** Use Supabase Auth or Privy. You will get it wrong.
- **Do not build an admin panel with user management.** Manage users via the Supabase dashboard.
- **Do not implement 2FA.** Unless your product handles financial data or sensitive health data.
- **Do not build audit logging.** Use `created_at` and `updated_at` timestamps. Full audit trails come later.
- **Do not implement field-level encryption.** Encrypt the database at rest (Supabase does this by default) and use HTTPS (Supabase and Vercel do this by default). That's sufficient for an MVP.
