# Web Stack

## Core Stack

- **Next.js** — App Router, Server Components
- **TypeScript** — strict mode
- **Vercel** — deployment platform
- **Neon Postgres** — via Vercel Marketplace
- **Drizzle ORM** — type-safe database access
- **Supabase Auth** — authentication
- **Tailwind CSS + shadcn/ui** — styling and component library
- **Zustand** — client state management
- **React Hook Form** — form handling
- **Server Actions** — mutations
- **Route Handlers** — webhooks

## Project Scaffold

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
npx shadcn@latest init
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

## File Structure

See [[patterns/file-structure#nextjs-web]] for the canonical Next.js layout.

Quick recap:

```
app/                # App Router routes
  (auth)/           # Route groups for layout boundaries, not URL segments
  (dashboard)/
  api/webhooks/     # Route Handlers — webhooks and third-party integrations only
components/         # ui/ for primitives, [FeatureName]/ for feature-specific
lib/
  supabase/
    client.ts       # Browser client
    server.ts       # Server-side client (NEVER import from client components)
    middleware.ts   # Auth middleware helper
hooks/
public/
```

- Server Components by default; add `"use client"` only when the component needs state, effects, or event handlers.
- Separate browser vs. server Supabase clients. This is not optional — mixing them causes auth bugs.
- Route groups `(groupName)` are for layout boundaries, not URL structure.
- No `src/` directory — the project root IS the source. See [[patterns/file-structure#universal-rules]].
- No barrel files (`index.ts` re-exports). Import directly from the file.

## Docker Pattern

Multi-stage Node 22 alpine build:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
CMD ["node", "server.js"]
```

Requires `output: "standalone"` in `next.config.js`.

## Tier Note

This stack is the **production tier** of [[architecture/database]] and [[architecture/api-design]]. For the MVP tier (Supabase client direct, no Server Actions layer), see the Supabase sections in those pages.

## Gotchas

### Nested `<a>` inside a design-system nav slot → app-wide hydration failure (2026-07)

- **Symptom:** every page throws React #418/#423 in production (`Hydration failed…`, `…entire root will switch to client rendering`); intermittently pages render an **empty `<main>`** when recovery fails, breaking E2E tests far from the nav. Dev console names it: `In HTML, <a> cannot be a descendant of <a>`.
- **Root cause:** passed a Next `<Link>` as the `logo` prop of a design-system `NavBar` that already wraps the logo slot in its own `<a href={logoHref}>`. Nested anchors are invalid HTML, so the browser re-parents the DOM before hydration and the server/client trees never match.
- **Resolution:** pass plain content to the slot and use the component's own `logoHref` prop for navigation.
- **Prevention rule:** before wrapping a design-system slot (`logo`, `title`, `action`, list items…) in `<Link>`/`<a>` or `<button>`, read the component source to see whether the slot is already rendered inside an interactive element — use the component's `href`/`onClick` prop instead. Treat any React #418/#423 in a Next app as "find the invalid HTML nesting first" (anchors in anchors, `<div>` in `<p>`, buttons in buttons).

## Related

- [[patterns/file-structure]] — Canonical Next.js layout
- [[patterns/data-flow]] — End-to-end data flow
- [[architecture/auth]]
- [[architecture/database]]
- [[architecture/styling]]
- [[architecture/state-management]]
