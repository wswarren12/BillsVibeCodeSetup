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

## Conventions

```
src/
  app/           # Routes (App Router file-based routing)
  components/    # Shared UI components
  lib/           # Utilities and helpers
  server/        # Server-only code (DB queries, services)
```

- Server Components by default; add `"use client"` only when needed.
- Co-locate route-specific components inside `app/` route folders.
- Keep server-only imports in `src/server/` to avoid accidental client bundling.

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

## Related

- [[architecture/auth]]
- [[architecture/database]]
- [[architecture/styling]]
- [[architecture/state-management]]
