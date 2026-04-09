# AgentForge

**Status:** Active development
**Path:** `~/Desktop/Vibes/AgentForge/`
**Tier:** MVP (Supabase)
**Stack:** [[stacks/web]] — Next.js 16 App Router, React 19, TypeScript, Tailwind 4

## One-Sentence Description

A visual command center for managing multiple AI agents, rendered as a canvas of sprites with a minimap, deeply integrated with local Claude Code projects and sessions.

## Stack

- **Framework:** Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5
- **Styling:** Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge
- **Backend:** Supabase (auth + database + storage) with split browser/server clients
- **State:** Custom hooks (`useAgents`, `useCamera`, `useChat`, `useClaudeProjects`, `useClaudeSessions`, `useNotifications`, `useSSE`)
- **Testing:** Vitest + Testing Library + jsdom
- **Integrations:** Claude Code local filesystem (`lib/claude-fs.ts`), encrypted connector credentials (`lib/encryption.ts`)

## Architectural Patterns

- **Canvas-based spatial UI.** Agents render as sprites on a `GameCanvas`, navigated via a `Minimap`. This is the product, not decoration.
- **SSE streaming.** Server-Sent Events for real-time agent output instead of WebSockets.
- **Agent "soul" concept.** Personality/identity config separated from skills, memory, and connectors — four independent subsystems composed per agent.
- **Task queue pattern.** Async agent processing via a dedicated `task-queue.ts`.
- **Encrypted secrets at rest.** Connector credentials encrypted via `lib/encryption.ts`; decryption only through an explicit reveal endpoint.

## Tier Reasoning

AgentForge is on the **MVP tier** despite being a Next.js App Router app. The backend is entirely Supabase — no Drizzle, no Neon. The reasoning:

- Auth, database, and storage in one platform
- RLS handles authorization without a separate API layer
- Schema evolves through Supabase migrations
- The team wanted to ship the canvas UX and agent management loop first, not build a backend from scratch

If this project ever migrates to the production tier, the trigger would be needing tighter type-safety between frontend and mutations (Drizzle-generated types), or multi-tenant complexity beyond RLS.

## Project-Specific Decisions

- **No shadcn/ui** — hand-rolled primitives with CVA. Match the existing primitive style when adding components.
- **Deep Claude Code coupling** — `lib/claude-fs.ts` reads Claude's local project/session directories. Tighter coupling than typical but intentional: AgentForge IS a Claude Code companion.
- **Canvas over list UI** — rejected the standard "chat list + sidebar" layout in favor of a spatial sprite canvas. Core product differentiation.

## Related Wiki Pages

- [[architecture/database]] — MVP tier = Supabase
- [[architecture/api-design]] — Supabase client direct
- [[architecture/auth]] — Magic link auth via Supabase
- [[architecture/security]] — RLS patterns
- [[patterns/agent-automation]] — Agent orchestration patterns
- [[stacks/web]] — Next.js App Router conventions

## Sources

- [[raw/project-snapshots/agentforge]]
