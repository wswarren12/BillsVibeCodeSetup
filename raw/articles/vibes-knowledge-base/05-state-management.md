# State Management

This document defines when and how to manage state across web and mobile MVPs. The guiding principle is: use the simplest tool that works, and only reach for more complexity when you feel the pain of the simpler approach.

## The State Hierarchy

State lives in exactly one of these places, listed from simplest to most complex. Start at the top and only move down when you have a reason.

1. **Local component state (useState)** — the default. If only one component needs it, it stays here.
2. **URL state (search params)** — for state that should survive a page refresh or be shareable via link. Filters, sort order, selected tab, pagination page.
3. **Server state (TanStack Query / Supabase Realtime)** — for data that lives in the database. This is not "your" state; it's a cache of the server's state.
4. **Global client state (Zustand)** — for state that multiple unrelated components need and that does NOT come from the server. Examples: a global toast notification queue, a modal stack, a map viewport that multiple panels read from.

The most common mistake is putting server data into global client state. If the data comes from Supabase, it belongs in TanStack Query, not in a Zustand store. TanStack Query handles caching, refetching, optimistic updates, and stale data. Your Zustand store does not.

## When useState Is Enough

For an MVP, useState handles more than you think:

- Form input values (unless the form is multi-step or very complex)
- Toggle states (open/closed, show/hide)
- Local loading and error states
- Temporary UI state (selected item in a list, hover/focus state)

If you find yourself passing a useState setter through more than two levels of props, that's the signal to consider alternatives — but the alternative is usually restructuring your components (moving state up or composing differently), not adding a state library.

## TanStack Query (React Query) for Server State

Every Supabase read should go through TanStack Query. The pattern:

```typescript
// hooks/useTraces.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTraces(userId: string) {
  return useQuery({
    queryKey: ['traces', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traces')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

For mutations (insert, update, delete), use `useMutation` with `onSuccess` that invalidates the relevant query:

```typescript
export function useCreateTrace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTrace: TraceInsert) => {
      const { data, error } = await supabase
        .from('traces')
        .insert(newTrace)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
    },
  });
}
```

This gives you loading states, error states, caching, background refetching, and optimistic updates for free.

## Zustand (Only When You Need It)

Zustand is the right choice when you have truly global, client-only state. For an MVP, this is rare. Legitimate Zustand use cases:

- A map viewport (lat, lng, zoom) that the map component sets and multiple sidebar components read
- A global audio/video player state
- A multi-step wizard where state spans several screens and isn't tied to a URL

The pattern:

```typescript
// lib/stores/mapStore.ts
import { create } from 'zustand';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  setView: (center: { lat: number; lng: number }, zoom: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: { lat: 36.07, lng: -79.1 },
  zoom: 13,
  setView: (center, zoom) => set({ center, zoom }),
}));
```

One store per concern. Do not create a single giant store for all app state. If you have more than three Zustand stores in an MVP, you're probably overusing it.

## URL State

State that represents a "view" of data should live in the URL. This means filters, sort orders, search queries, selected tabs, and pagination. The user should be able to copy the URL and send it to someone who sees the same view.

In Next.js, use `useSearchParams` and `useRouter` to read/write URL state. The `nuqs` library provides a cleaner hook-based API if you have multiple URL params.

In React Native, URL state is less relevant because there's no shareable URL. Use route params for screen-level state and local state for everything else.

## What Not To Do

- **Do not use Redux.** It adds ceremony with no benefit for an MVP. If you think you need Redux, you need TanStack Query plus maybe Zustand.
- **Do not use Context for frequently changing values.** React Context re-renders every consumer on every change. It's fine for values that change rarely (theme, auth user, locale). It's terrible for values that change often (form inputs, animations, scroll position).
- **Do not sync server state to client state.** Do not fetch data from Supabase, put it in Zustand, and then read from Zustand. You now have two sources of truth that will diverge. Use TanStack Query as the cache layer; it was designed for this.
- **Do not build a custom pub/sub system.** If components need to communicate, restructure the component tree so they share a common ancestor that holds the state. If that's impractical, use Zustand.
