# Mobile Stack

## Core Stack

- **React Native + Expo** — managed workflow
- **TypeScript** — strict mode
- **Expo Router** — file-based routing
- **EAS Build + Submit** — build and app store submission
- **Supabase Auth** — with Expo adapter
- **NativeWind** — Tailwind CSS for React Native
- **Zustand** — client state management
- **React Query** — server state and caching
- **React Hook Form** — form handling

## Project Scaffold

```bash
npx create-expo-app@latest my-app --template tabs
cd my-app
npm install nativewind tailwindcss
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install zustand @tanstack/react-query react-hook-form
```

## Conventions

```
app/           # Routes (Expo Router file-based routing)
components/    # Shared UI components
lib/           # Utilities and helpers
hooks/         # Custom React hooks
```

- Share business logic with web via a `packages/` monorepo structure.
- Keep platform-specific code behind `.native.ts` / `.web.ts` extensions when needed.
- Use Expo Router layouts for navigation chrome (tabs, stacks, drawers).

## Docker Pattern

Node 22 alpine with EAS and Expo CLIs for CI:

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN npm install -g eas-cli expo-cli
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["eas", "build", "--platform", "all", "--non-interactive"]
```

Used for CI pipelines only; actual builds run on EAS servers.

## Related

- [[architecture/auth]]
- [[architecture/state-management]]
- [[architecture/styling]]
