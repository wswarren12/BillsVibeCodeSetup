# State Management

## Decision Tree
- Server data needed on load? → Server Components (fetch in RSC, no client JS)
- Server data updating on the client? → React Query (TanStack Query)
- Global client state? → Zustand
- Form state? → React Hook Form (+ zod for validation)
- URL-derived state? → Next.js searchParams
- Ephemeral / local UI state? → useState / useReducer

## Why
- Server Components ship zero client JS for data that only needs to render once
- React Query handles caching, deduplication, background refetching, and optimistic updates
- Zustand has a minimal API, no boilerplate, no providers, and works outside React
- React Hook Form is performant (uncontrolled inputs) and pairs cleanly with zod schemas

## Anti-patterns
- No Redux — unnecessary complexity for modern React
- No Context API for frequently updating values — causes full subtree re-renders
- No useEffect for data fetching — use React Query or Server Components instead
- Don't put server-cacheable data in Zustand — that's React Query's job

## Sources
[To be populated via ingest]
