# API Design

## Decision Tree
- UI mutation (form submit, button action)? → Server Actions
- RSC data loading? → Direct DB calls in the Server Component
- Webhook receiver? → Route Handler (POST)
- External API proxy? → Route Handler
- Public API for third parties? → Route Handler with `/api/v1/` versioning
- Agent-to-agent communication? → FastAPI
- Real-time data? → WebSocket or Supabase Realtime

## Why
- Server Actions are colocated with UI, fully type-safe, and trigger auto-revalidation
- Route Handlers are for non-UI concerns (webhooks, public APIs, proxies)
- Not tRPC — unnecessary abstraction layer when Server Actions + Route Handlers cover everything

## Conventions
- Server Actions live in `src/server/actions/` or colocated next to the component that uses them
- Route Handlers live in `src/app/api/`
- Always validate inputs with zod
- Use `next-safe-action` for type-safe Server Actions with built-in error handling

## Anti-patterns
- Don't use tRPC — adds complexity without benefit in a Server Actions world
- Don't put business logic in Route Handlers that should be Server Actions
- Don't skip zod validation — never trust client input

## Sources
[To be populated via ingest]
