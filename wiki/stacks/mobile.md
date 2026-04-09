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

## File Structure

See [[patterns/file-structure#react-native-expo-mobile]] for the canonical layout.

Quick recap:

```
app/                    # Expo Router file-based routing
  (tabs)/               # Tab navigation group
    _layout.tsx
  (auth)/               # Auth flow screens
    _layout.tsx
  _layout.tsx           # Root layout (providers, fonts, splash)
  +not-found.tsx
components/
  ui/                   # Primitives (Button, Input, Card)
  [FeatureName]/        # Feature-specific (MapMarker, TraceCard)
lib/
  supabase.ts           # Single client — no browser/server split on mobile
  auth.ts
  storage.ts
  constants.ts
  types.ts              # Shared TS types (per-file types stay in the file)
hooks/
assets/
```

- All Supabase calls go through `lib/` helpers, never directly from components.
- One component per file. File name matches the default export.
- Share business logic with web via a `packages/` monorepo structure when needed.
- Platform-specific code behind `.native.ts` / `.web.ts` extensions.
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

## Tier Note

Mobile apps with Expo are almost always on the **MVP tier** — Supabase client called directly from the app, RLS for authorization, TanStack Query for caching. See [[architecture/database]] and [[architecture/api-design]] for the full tier framing.

## Related

- [[patterns/file-structure]] — Canonical Expo layout
- [[patterns/data-flow]] — Data flow patterns
- [[decisions/adr-004-react-native-expo]] — Why RN + Expo over Flutter or native
- [[architecture/auth]]
- [[architecture/state-management]]
- [[architecture/styling]]
