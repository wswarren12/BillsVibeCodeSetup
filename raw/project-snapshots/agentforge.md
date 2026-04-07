# Project Snapshot: AgentForge

**Source:** ~/Desktop/Vibes/AgentForge/
**Date:** 2026-04-06
**Type:** Full-stack AI agent management platform

## Stack
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Supabase (auth + database)
- Vitest + Testing Library + jsdom
- class-variance-authority, clsx, tailwind-merge (UI primitives)
- lucide-react (icons)
- uuid for ID generation

## Architecture
```
src/
  app/
    api/
      agents/[agentId]/       # CRUD, chat, streaming, connectors, memory, skills, soul, tasks
      dashboard/status/       # Dashboard status endpoint
      ide/active/             # IDE integration
      notifications/          # Notification system
      projects/[encodedPath]/ # Claude project/session integration
      settings/               # App settings
      stream/                 # SSE streaming
      tasks/                  # Task queue processing
    login/, signup/           # Auth pages
    page.tsx                  # Main canvas view
  components/
    auth/                     # AuthProvider, OnboardingModal
    canvas/                   # GameCanvas, AgentSprite, AgentFactory, Minimap, ProjectHub, SessionSelector
    hud/                      # TopBar, NotificationDropdown
    panels/                   # AgentConfigPanel + tabs (Chat, Connectors, Conversation, Memory, Metadata, Skills, Soul, Timeline)
  hooks/                      # useAgents, useCamera, useChat, useClaudeProjects, useClaudeSessions, useNotifications, useSSE
  lib/                        # agent-runtime, auth, claude-fs, encryption, supabase client/server, task-queue
  types/                      # agent-runtime, claude-session, database
supabase/migrations/          # Initial schema SQL
```

## Patterns Observed
- Canvas-based spatial UI for agent visualization (GameCanvas, AgentSprite, Minimap)
- SSE (Server-Sent Events) for real-time streaming from agents
- Supabase for auth and persistence with client/server split
- Encrypted connector credentials (encryption.ts + reveal endpoint)
- Task queue pattern for async agent processing
- Agent "soul" concept -- personality/identity config separate from skills
- Deep Claude Code integration -- reads local Claude projects/sessions from filesystem (claude-fs.ts)
- PRD-driven development (PRD-AgentForge-v2.md present)

## Lessons / Decisions
- Built as a visual "command center" for managing multiple AI agents, not a chat-only interface
- Chose canvas metaphor with sprites and minimap over traditional list/card layouts
- Tight coupling to Claude Code's local filesystem for project/session introspection
- Separate concepts for agent memory, skills, connectors, and soul allow modular agent personality design
- Notification system built in from the start for agent-initiated alerts
