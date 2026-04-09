# State Management

> **Tiered defaults (Option D):** For MVPs, use TanStack Query + Zustand + useState. For the Next.js production tier, use Server Components + Server Actions with TanStack Query layered on top only when you have mutation-heavy client state.

## The State Hierarchy

Ask these questions in order. Stop at the first "yes."

1. **Does only one component need this data?** → `useState` / `useReducer`
2. **Should it survive a page refresh or be shareable via URL?** → URL params (`searchParams`)
3. **Does it come from the server?** → TanStack Query (MVP) or Server Components (Next.js production tier)
4. **Do multiple unrelated components need to read/write it on the client?** → Zustand

If none of these apply, you probably don't need state — it's a prop or a derived value.

## Tier 1: MVP Default — TanStack Query + Zustand

**Use when:** Supabase-backed app, React Native + Expo, or any SPA-style frontend where the client fetches from an API.

- **Server state:** TanStack Query (React Query). Handles caching, deduplication, background refetch, optimistic updates, and `isLoading` / `isError` states.
- **Global client state:** Zustand. Minimal API, no providers, no boilerplate, works outside React.
- **Forms:** React Hook Form + zod. Uncontrolled inputs are fast; zod schemas double as types.
- **Local UI:** `useState` / `useReducer`.
- **URL-derived state:** `searchParams` (Next.js) or URL hooks (React Router / Expo Router).

**Rules:**
- Don't duplicate server data into Zustand. If it came from the database, it lives in TanStack Query.
- Don't duplicate URL state into component state. Read from URL, write to URL.
- Don't use Context API for frequently updating values — it causes full subtree re-renders.
- Two state management libraries maximum. Adding a third is an anti-pattern.

## Tier 2: Production — Next.js Server Components

**Use when:** The production tier of [[architecture/database]] is Neon + Drizzle, or the app is Next.js-native and reads dominate writes.

- **Server-rendered reads:** Server Components fetch in the RSC. Zero client JS for static data.
- **Mutations:** Server Actions. Colocated with the component that calls them. Revalidate affected routes automatically.
- **Client caching (when needed):** TanStack Query layered on top for views that need optimistic updates, background refetch, or polling.
- **Global client state:** Zustand, same as MVP tier. Only when multiple unrelated components share it.
- **Forms:** React Hook Form + zod, or plain `<form action={serverAction}>` for simple cases.

**When to reach for TanStack Query in the production tier:**
- The view needs optimistic updates on mutation
- The view polls or subscribes to realtime updates
- You're building a heavily interactive client component (editor, board, chat)

If none of those are true, Server Components + Server Actions are enough. Don't add a client cache for the sake of it.

## Decision: Which Tier?

Choose **MVP tier (TanStack Query + Zustand)** when:
- Your backend is Supabase (client calls DB directly via RLS)
- You're building React Native + Expo
- The frontend is a single-page app, not Next.js App Router
- You want one data-fetching pattern that works the same on web and mobile

Choose **Production tier (Server Components + Server Actions)** when:
- You're building a Next.js App Router app with Neon + Drizzle
- Reads dominate writes and you want the zero-JS-by-default tradeoff
- You want type-safe mutations without wiring up a client-side mutation hook

## Universal Rules

- **Don't use `useEffect` for data fetching.** Use TanStack Query, Server Components, or Server Actions.
- **Don't use Redux.** TanStack Query + Zustand covers everything Redux was invented for, with less code.
- **Don't nest a provider tree.** If you find yourself wrapping the app in 5+ providers, something's wrong.
- **Validate forms with zod.** Share the schema between the form and the server handler.

## Anti-patterns

- Multiple state management libraries beyond two (Redux + Zustand + Recoil + Context is a code smell).
- Copying server data into client state and trying to keep them in sync manually.
- Using Zustand as a cache for server data — that's TanStack Query's job.
- Using Context API for high-frequency updates (cursor position, scroll, animation).
- Prop-drilling 4+ levels deep — either lift to a shared parent with `useState` or use Zustand if the components are unrelated.

## Related

- [[patterns/data-flow]] — How data flows from DB → API → UI in both tiers
- [[architecture/api-design]] — Supabase client vs. Server Actions
- [[architecture/database]] — Tier selection mirrors the database choice

## Sources

- [[raw/articles/vibes-knowledge-base/05-state-management]]
- [[raw/articles/vibes-knowledge-base/06-api-data-flow]]
