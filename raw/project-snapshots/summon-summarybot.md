# Project Snapshot: Summon SummaryBot

**Source:** ~/Desktop/Summon/prototypes/SummaryBot/
**Date:** 2026-04-06
**Type:** Discord Bot (Node.js/TypeScript)

## Stack
- Runtime: Node.js 18+
- Language: TypeScript 5.7 (strict mode, ES2022 target, CommonJS modules)
- Discord: discord.js ^14.16.3
- AI: @anthropic-ai/sdk ^0.30.1 (Claude)
- MCP: @modelcontextprotocol/sdk ^1.25.2 (SSE transport to Summon Quest Builder)
- Database: PostgreSQL via pg ^8.13.1
- Logging: winston ^3.17.0
- Config: dotenv ^16.4.5
- Testing: jest ^29.7.0 + ts-jest
- Linting/Formatting: eslint ^9.17.0, prettier ^3.4.2

## Architecture

```
src/
  index.ts              # Entry point, env validation, graceful shutdown, background task orchestration
  bot/
    client.ts           # Discord client setup with required intents
    commandRegistry.ts  # Slash command registration system
    events/
      ready.ts              # Bot startup + command registration
      messageCreate.ts      # Message ingestion pipeline
      interactionCreate.ts  # Slash commands + button interactions
      messageReactionAdd.ts # Reaction tracking (quest system)
      messageReactionRemove.ts
      pollCreate.ts         # Poll event handling
  commands/
    catchup.ts    # /catchup - personalized activity summaries (primary command)
    quest.ts      # /quest - quest system interactions
    questdebug.ts # /questdebug - quest debugging tools
    create.ts     # /create - content creation
    complete.ts   # /complete - task completion
    xp.ts         # /xp - experience points tracking
  services/
    aiService.ts                  # Claude API integration, summary generation, event detection
    summaryService.ts             # Summary orchestration, timeframe parsing, conversation recommendations
    messageService.ts             # Message ingestion, permission-based channel filtering
    eventService.ts               # Discord event sync + AI event detection from messages
    questService.ts               # Quest system business logic
    questCreationService.ts       # Quest creation workflows
    mcpClient.ts                  # MCP client (SSE) to Summon Quest Builder on Cloudflare Workers
    discordVerificationService.ts # Discord-native verification
  db/
    connection.ts  # PostgreSQL connection pooling
    queries.ts     # Parameterized query functions
    schema.sql     # Full schema definition
    migrate.ts     # Migration runner
    migrations/    # 6 migrations (initial schema through quest tasks)
  types/
    database.ts  # DB row types
    index.ts     # Shared type exports
  utils/
    logger.ts       # Winston logger configuration
    embeds.ts       # Discord embed builders
    prompts.ts      # AI prompt templates
    rateLimiter.ts  # Rate limiting utility
    sanitization.ts # Input sanitization
```

## Patterns Observed

- **Service-oriented architecture**: Clean separation between bot layer (events/commands), service layer (business logic), and data layer (db/).
- **Auth/secrets via env vars**: DISCORD_TOKEN, ANTHROPIC_API_KEY, DATABASE_URL, MCP_TOKEN validated at startup; process exits on missing required vars.
- **Graceful shutdown**: SIGINT/SIGTERM handlers tear down background tasks, MCP client, Discord client, and DB connections in order.
- **Background task scheduling**: Periodic cleanup (configurable interval), event detection (6h), cache cleanup, and rate limit cleanup all managed via setInterval with stored IDs for teardown.
- **Ephemeral responses**: Summaries sent as ephemeral Discord messages for user privacy.
- **Expandable detail levels**: Three tiers (brief/detailed/full) with interactive button components.
- **MCP integration**: Uses SSE transport to connect to a Cloudflare Workers-hosted Quest Builder MCP server; includes a validation DSL for quest completion rules.
- **Rate limiting**: Custom rate limiter utility with cleanup intervals; separate limiters for general use and quest operations.
- **30-day message retention**: Hard retention policy enforced by scheduled cleanup tasks.
- **Permission-aware**: Channel access checks before including messages in summaries.
- **Migration system**: Custom sequential migration scripts (001-006), not an ORM -- raw SQL with parameterized queries throughout.
- **Caching**: Summary results cached with 30-minute TTL for button re-interactions.
- **Testing**: Jest configured with ts-jest; tests directory at project root.

## Lessons / Decisions

- **No ORM chosen deliberately**: Raw `pg` with parameterized queries. Keeps the dependency footprint small and gives full control over SQL, at the cost of more manual type mapping.
- **CommonJS over ESM**: Despite targeting ES2022, the project uses `module: "commonjs"` -- likely for compatibility with discord.js and the broader Node ecosystem at the time.
- **MCP as integration layer**: Rather than building a direct API client for the quest system, the bot connects via MCP protocol (SSE), treating the quest backend as a tool-providing server. This decouples the two systems and allows the quest backend to evolve independently.
- **Single-command origin, multi-command evolution**: Started as a `/catchup`-only bot but grew to include quest, XP, and creation commands. The command registry pattern made this extension straightforward.
- **AI for event detection**: Uses Claude not just for summaries but also to detect event mentions in natural language messages -- a dual-use pattern for the AI integration.
- **Build copies non-TS assets**: The build script explicitly copies `schema.sql` into `dist/`, handling the TypeScript compiler's limitation with non-code files.
- **Docker Compose for local dev DB**: PostgreSQL provided via docker-compose.yml for local development, keeping the setup self-contained.
