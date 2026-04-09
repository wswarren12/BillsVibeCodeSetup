# API Design

> **Tiered defaults (Option D):** MVP tier calls Supabase directly from the client (RLS enforces authorization). Production tier uses Next.js Server Actions and Route Handlers.

## Tier 1: MVP Default — Supabase Client as the API

**Use when:** Building a Supabase-backed app (web or mobile). The Supabase client IS the API layer.

- **Reads/writes from UI:** Call the Supabase client directly. `supabase.from('traces').select()`, `.insert()`, `.update()`. RLS policies on the table enforce who can do what.
- **Server-only logic:** Supabase Edge Functions. Use when you need a secret (API key, webhook signer) or third-party integration that can't happen on the client.
- **Webhooks from third parties:** Edge Functions with explicit signature verification.
- **Realtime subscriptions:** `supabase.channel()`. Use sparingly — most MVPs don't need it.
- **File uploads:** Supabase Storage via the client SDK. RLS policies on storage buckets.

**Why no separate API layer:** RLS collapses the stack. The client talks to the database, the database enforces authorization, and you don't maintain duplicate types between a frontend and a backend. Schema changes ship through SQL migrations.

**When you DO need server-side logic in the MVP tier:**
- You're calling a third-party API with a secret key → Edge Function
- You're running an agent or LLM workflow → Edge Function or a separate FastAPI service
- You need to enforce a rate limit a client can't see → Edge Function

Don't build an Express server as the middle layer. If you think you need one, you're either (a) about to leak a secret and should use an Edge Function, or (b) drifting toward the production tier and should consider Next.js + Server Actions.

## Tier 2: Production — Next.js Server Actions + Route Handlers

**Use when:** The production tier of [[architecture/database]] is Neon + Drizzle, or the app is Next.js App Router and you want type-safe mutations.

- **UI mutations (form submit, button action):** Server Actions. Colocated with the component or in `src/server/actions/`. Use `next-safe-action` for type-safe actions with zod validation.
- **RSC data loading:** Fetch directly in the Server Component. No hooks, no useEffect, no client JS.
- **Webhooks from third parties:** Route Handler at `/app/api/webhooks/<provider>/route.ts`.
- **External API proxy:** Route Handler.
- **Public API for third parties:** Route Handler with versioned paths (`/app/api/v1/...`).
- **Agent-to-agent communication:** FastAPI in a separate service.
- **Realtime:** Server-Sent Events via a Route Handler, or Supabase Realtime if you're already using Supabase for auxiliary data.

**Rules for the production tier:**
- Always validate inputs with zod. Never trust client input.
- Server Actions live next to the component or in `src/server/actions/`.
- Route Handlers are for non-UI concerns only. If a Route Handler is being called from your own UI, it should probably be a Server Action.
- Use `next-safe-action` — it gives you type-safe wrapped actions with built-in error handling and auth checks.

## Decision: Which Tier?

Choose **MVP tier (Supabase client direct)** when:
- You're building a Supabase-backed app
- The frontend is React Native + Expo or SPA-style React
- You want to ship without a separate API layer
- Authorization can be expressed as RLS policies

Choose **Production tier (Server Actions)** when:
- You're building a Next.js App Router app
- You want mutations type-checked end-to-end in TypeScript
- Reads happen in Server Components (not via a client cache)
- The data model is Drizzle + Postgres, not Supabase

## Universal Rules

- **Never trust client input.** Validate with zod at every entry point.
- **Secrets only on the server.** Edge Functions (Supabase) or Server Actions / Route Handlers (Next.js). Never ship an API key in client code.
- **Error handling lives at the data layer.** Throw errors from the fetch call and let TanStack Query (or the Server Action result) propagate them to the UI.
- **Optimistic updates are allowed** but revert on error.
- **Don't build a REST wrapper around your database.** If your entire "API" is CRUD passthrough, you're reinventing Supabase or Drizzle.

## Anti-patterns

- **Don't use tRPC.** Server Actions + Route Handlers cover everything tRPC solved, with less ceremony and no runtime wrapper.
- **Don't stitch together Express + Prisma + REST routes for an MVP.** Use Supabase or Server Actions.
- **Don't duplicate types** between a backend and a frontend if you can avoid it. Drizzle or Supabase-generated types make this automatic.
- **Don't put business logic in Route Handlers** that should be Server Actions. Route Handlers are for webhooks, proxies, and public APIs.
- **Don't skip zod validation** anywhere user input lands.

## Related

- [[architecture/database]] — Tier selection mirrors the data layer
- [[architecture/state-management]] — How the UI consumes API results
- [[patterns/data-flow]] — End-to-end data flow patterns
- [[architecture/auth]] — Who can call what, and how it's enforced

## Sources

- [[raw/articles/vibes-knowledge-base/06-api-data-flow]]
- [[raw/articles/vibes-knowledge-base/08-security-auth-baseline]]
