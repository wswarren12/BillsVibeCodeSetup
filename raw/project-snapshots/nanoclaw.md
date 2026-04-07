# Project Snapshot: nanoclaw

**Source:** ~/Desktop/Vibes/nanoclaw/
**Date:** 2026-04-06
**Type:** AI personal assistant platform (fork of open-source project)

## Stack
- Node.js 20+ (ESM)
- TypeScript 5.7
- better-sqlite3 (local persistence)
- discord.js 14.18 (Discord channel)
- grammy 1.41 (Telegram channel)
- pino + pino-pretty (structured logging)
- cron-parser (scheduled tasks)
- Zod 4.3.6 (validation)
- yaml (config parsing)
- Vitest 4 + coverage-v8 (testing)
- Husky + Prettier (code quality)
- Docker containers for agent isolation

## Architecture
```
src/
  index.ts              # Orchestrator: state, message loop, agent invocation
  channels/
    registry.ts         # Self-registering channel system
    telegram.ts         # Telegram adapter (grammy)
    discord.ts          # Discord adapter (discord.js)
    index.ts
  config.ts             # Configuration
  container-runner.ts   # Spawns streaming agent containers
  container-runtime.ts  # Container abstraction (Docker/Apple Container)
  credential-proxy.ts   # Secure credential forwarding to containers
  db.ts                 # SQLite operations (messages, groups, sessions, state)
  env.ts                # Environment variable handling
  group-folder.ts       # Per-group filesystem management
  group-queue.ts        # Per-group message queue with global concurrency limit
  ipc.ts                # IPC watcher and task processing
  logger.ts             # Pino logger setup
  mount-security.ts     # Mount point security validation
  remote-control.ts     # Remote control functionality
  router.ts             # Message formatting and outbound routing
  sender-allowlist.ts   # Sender authentication
  task-scheduler.ts     # Cron-based scheduled tasks
  timezone.ts           # Timezone handling
  types.ts              # Shared types
container/
  Dockerfile            # Agent container image
  agent-runner/         # In-container agent runner (Claude Agent SDK)
  build.sh
setup/                  # Claude Code-guided setup system
  index.ts, container.ts, environment.ts, groups.ts, mounts.ts, platform.ts, register.ts, service.ts, verify.ts
groups/                 # Per-group memory (CLAUDE.md files)
  global/, main/, telegram_main/
data/                   # Runtime data (sessions, IPC, env)
.claude/skills/         # 20+ Claude Code skills (add-telegram, add-discord, add-gmail, setup, debug, etc.)
```

## Patterns Observed
- Single-process architecture: channels -> SQLite -> polling loop -> container -> response
- Channel self-registration at startup (registry pattern)
- Agent isolation via Linux containers (Docker or Apple Container) with filesystem isolation per group
- Per-group CLAUDE.md for agent memory persistence
- Skills-over-features philosophy: capabilities added via Claude Code skills that modify the fork
- IPC via filesystem between host and container agents
- Credential proxy to securely forward secrets to sandboxed agents
- Mount security validation to prevent container escape
- Comprehensive test suite with co-located test files (*.test.ts)
- launchd plist for macOS background service
- GitHub Actions CI: version bumping, skill syncing, token counting

## Lessons / Decisions
- Deliberately small codebase (~35k tokens) -- designed to be fully understood by both humans and Claude
- "Fork and customize" model instead of configuration files -- each user modifies the code
- Container isolation chosen over application-level security (allowlists, permission checks)
- Claude Agent SDK used inside containers -- agents are full Claude Code instances
- Skills contributed as branches, not merged features -- keeps core minimal
- SQLite over PostgreSQL for simplicity (single-user, single-process design)
- Active Telegram integration with workout tracking and scheduled task logs visible in data/
