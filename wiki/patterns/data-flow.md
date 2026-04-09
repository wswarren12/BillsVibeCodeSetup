# API & Data Flow

Status: Active

> **Note:** This pattern targets the **Supabase MVP tier** where the Supabase client IS the API. For the production tier using Server Actions, see [[architecture/api-design]].

This document defines how data moves through an MVP — from the database to the UI and back. The goal is predictable, debuggable data flow with as few layers as possible.

## Supabase Client Calls Are Your API

For most MVPs, you do not need a separate API layer. The Supabase client library talks directly to your Postgres database through PostgREST, with RLS enforcing access control. This means your "API" is:

```typescript
const { data, error } = await supabase
  .from('traces')
  .select('*, profiles(display_name, avatar_url)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(20);
```

This is a query, not an API call, but it behaves like one — it goes over HTTPS, respects auth, and returns JSON. For an MVP, this is your entire backend. Do not build an Express server that wraps these same queries.

## When You Do Need Edge Functions

Supabase Edge Functions (Deno-based, deployed to the edge) are for logic that cannot or should not run on the client:

- **Webhook handlers:** Stripe payment events, third-party callbacks.
- **Third-party API calls that require secrets:** Sending email via Resend, calling OpenAI, interacting with external services where you don't want to expose API keys.
- **Complex multi-step operations:** Where you need to write to multiple tables atomically or enforce business logic the database can't express in RLS.
- **Scheduled/background tasks:** Via Supabase's cron extension or triggered by database events.

Edge Functions are NOT for: simple CRUD, auth, or anything the Supabase client can already do.

## The Data Flow Pattern

For a standard read operation:

```
Component → Custom Hook (useTraces) → TanStack Query → Supabase Client → Postgres
```

For a write operation:

```
Component → Event Handler → Custom Hook (useCreateTrace) → useMutation → Supabase Client → Postgres
→ onSuccess → invalidateQueries → TanStack Query refetches → Component re-renders
```

Every step in this chain is debuggable. You can console.log at any point and see exactly what data is flowing.

## Error Handling

Handle errors at two levels:

**At the data layer** (in your hooks): Throw errors from Supabase so TanStack Query catches them and exposes them via the `error` property.

```typescript
const { data, error } = await supabase.from('traces').select('*');
if (error) throw error;
return data;
```

**At the UI layer** (in your components): Use TanStack Query's `isError` and `error` properties to show error states. Do not silently swallow errors.

```typescript
const { data, isLoading, isError, error } = useTraces(userId);

if (isError) return <ErrorMessage message={error.message} />;
if (isLoading) return <Skeleton />;
```

For mutations, show errors inline near the action that triggered them (a toast or inline message), not in a global error boundary. Users need to know what failed and what to do about it.

## Optimistic Updates

For actions where the expected outcome is obvious (toggling a favorite, marking a task complete), use optimistic updates so the UI feels instant:

```typescript
useMutation({
  mutationFn: toggleFavorite,
  onMutate: async (traceId) => {
    await queryClient.cancelQueries({ queryKey: ['traces'] });
    const previous = queryClient.getQueryData(['traces']);
    queryClient.setQueryData(['traces'], (old) =>
      old.map(t => t.id === traceId ? { ...t, is_favorited: !t.is_favorited } : t)
    );
    return { previous };
  },
  onError: (err, traceId, context) => {
    queryClient.setQueryData(['traces'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['traces'] });
  },
});
```

Only use optimistic updates for simple, reversible actions. Do not optimistically update complex operations (creating a new record with server-generated fields, payment processing).

## Realtime (Use Sparingly)

Supabase Realtime lets you subscribe to database changes via websockets. For an MVP, you almost certainly do not need it. Realtime is justified when:

- The core loop involves multiple users seeing each other's changes live (collaborative editing, live chat, multiplayer)
- Time-sensitive data needs to appear without manual refresh (live dashboards, notifications)

If you're building a single-user app or the data doesn't change often, TanStack Query's background refetching on window focus is sufficient.

## API Design for Edge Functions

When you do write Edge Functions, keep them simple:

- One function per operation. Not a single function that routes based on method or query params.
- Accept JSON body, return JSON response.
- Use standard HTTP status codes: 200 for success, 400 for bad input, 401 for unauthorized, 500 for server errors.
- Validate input at the top of the function, fail fast with a clear error message.
- No middleware chains, no dependency injection, no ORM. It's a function. Keep it a function.

## Related

- [[architecture/api-design]]
- [[architecture/state-management]]
- [[principles/mvp-philosophy]]

## Sources

- [[raw/articles/vibes-knowledge-base/06-api-data-flow]]
