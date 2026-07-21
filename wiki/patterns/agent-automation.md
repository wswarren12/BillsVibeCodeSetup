# Agent Automation Patterns

Status: Active

This document defines how to build, structure, and manage LLM-powered agents and automations. The focus is on practical patterns for personal and small-scale agent systems — not enterprise orchestration frameworks.

## The Core Loop: Plan → Execute → Validate

Every agent, regardless of complexity, follows this loop:

1. **Plan:** The LLM receives context (system prompt, user input, current state) and decides what to do next. This might be a single action or a sequence of steps.
2. **Execute:** The agent calls a tool (function call, MCP server, API request) or produces output.
3. **Validate:** The result is checked — did the tool return an error? Does the output match expectations? Is the task complete?

If validation fails, the loop repeats with the error as new context. If it succeeds, the agent either moves to the next step or returns the result to the user.

Do not overcomplicate this. Most agent failures come from trying to build complex orchestration (DAGs, state machines, multi-agent handoffs) before the basic loop works reliably.

## Tool/Function Schema Design

Tools are the agent's hands. Good tool design is the highest-leverage investment in agent quality.

**Keep tools atomic.** Each tool does one thing. `search_contacts` and `send_email` are two tools, not one `search_and_email` tool. Atomic tools are reusable across different agent workflows and easier to test.

**Name tools as verb-noun pairs.** `create_task`, `search_documents`, `get_weather`. The name should be self-explanatory to the LLM without reading the description.

**Write descriptions for the LLM, not for humans.** The tool description is a prompt. Tell the LLM when to use the tool, what the parameters mean, and what the output looks like. Be explicit about edge cases.

**Use typed parameters with clear constraints.** Enums for fixed options, required vs. optional clearly marked, format descriptions for strings (dates, emails, IDs).

```typescript
{
  name: "create_trace",
  description: "Creates a new location-based trace. Use when the user wants to pin content to a geographic location. Requires coordinates and at least a title.",
  parameters: {
    type: "object",
    required: ["title", "latitude", "longitude"],
    properties: {
      title: { type: "string", description: "Display title for the trace, 3-100 characters" },
      latitude: { type: "number", description: "Latitude in decimal degrees, -90 to 90" },
      longitude: { type: "number", description: "Longitude in decimal degrees, -180 to 180" },
      body: { type: "string", description: "Optional markdown body content" },
      status: { type: "string", enum: ["draft", "published"], default: "draft" }
    }
  }
}
```

## MCP Integration

MCP (Model Context Protocol) is the standard for connecting LLMs to external tools and services. When integrating MCP servers:

**Initialize once, reuse the connection.** Set up the MCP client at the start of the agent session, not per-tool-call.

**Handle tool results by type, not position.** MCP responses contain mixed content blocks (text, tool_use, tool_result). Filter by `type` field rather than assuming array order.

```typescript
const toolResults = response.content
  .filter(block => block.type === 'mcp_tool_result')
  .map(block => block.content?.[0]?.text || '');
```

**Expect failures.** MCP servers are external services. They go down, they rate-limit, they return unexpected formats. Wrap every MCP call in try/catch with a meaningful fallback — either retry, skip, or ask the user what to do.

**Keep MCP server lists minimal.** Only connect the servers the agent actually needs for the current task. Each connected server adds tools to the LLM's context, which increases confusion and latency.

## State Between Agent Turns

Agents that span multiple turns (conversations, multi-step workflows) need a strategy for state:

**For short conversations (under ~50 turns):** Pass the full conversation history. This is the simplest approach and works until the context window fills up.

**For longer conversations:** Summarize older turns. Keep the last 10-15 messages verbatim and replace older ones with a running summary. The summary should include key decisions made, current task status, and any constraints established.

**For persistent agents (daily automations, background tasks):** Store state in a file or database, not in conversation history. Load relevant state into the system prompt at the start of each run. This is the AgentForge pattern — each agent run is stateless, but it reads/writes a persistent state store.

```
State Store (JSON/DB) → Load into System Prompt → Agent Run → Write Updated State → Done
```

## Error Handling in Agents

Agent errors fall into three categories:

1. **Tool errors** (API returned 500, rate limited, invalid parameters): Retry once with the same parameters. If it fails again, tell the user and ask how to proceed. Do not retry in a loop.

2. **LLM reasoning errors** (hallucinated a tool that doesn't exist, produced malformed output): Catch the parsing error, include the error message in the next turn's context, and ask the LLM to try again. Cap retries at 2.

3. **Task errors** (the agent completed the wrong task, misunderstood the goal): These are the hardest to catch automatically. For high-stakes tasks, add a confirmation step before executing irreversible actions. "I'm about to send this email to 50 people. Here's the content. Should I proceed?"

## Prompt Structure for Agents

A good agent system prompt has four sections:

1. **Identity and scope:** What the agent does, what it does NOT do.
2. **Available tools:** Listed by the framework automatically, but add guidance about when to use each.
3. **Behavioral rules:** How to handle errors, when to ask for confirmation, what to do when uncertain.
4. **Output format:** How to structure responses, especially for agents that produce files or structured data.

Keep system prompts under 2000 tokens. Longer prompts dilute the important instructions. If you need more context, put it in a tool that the agent can read on demand (like a knowledge base wiki — this system).

## Prompt Storage: Where to Keep System Prompts

System prompts for LLM agents have different requirements than regular code — they're iterated on frequently, benefit from being readable as prose, and ideally should be editable without a redeploy. The right storage location depends on the deployment environment.

### Decision tree

**Serverless (Vercel, Cloudflare Workers, Lambda)?**
→ Do NOT use `fs.readFileSync` on `.md` files — the bundler won't include files it can't statically trace through imports. Use TypeScript template literals in `.ts` files instead. They're functionally identical to markdown (just prose in a string) but are guaranteed to be bundled.

**Need non-developer editing or deploy-free iteration?**
→ Store prompts in KV (Cloudflare KV, Upstash, Vercel KV). Load at request time. Keep `.ts` fallback defaults in the codebase.

**Long-running process (Docker, fly.io, Railway)?**
→ `.md` files on disk are fine. `fs.readFileSync` with `path.join(process.cwd(), 'prompts/...')` works reliably.

### The shared persona + topic file pattern

When a single agent voice needs to serve multiple contexts (e.g. separate newsletters per topic), split prompts into:

```
lib/pipeline/prompts/
  shared.ts      ← persona, voice, universal output rules
  nl_ai.ts       ← topic-specific categories, lens, skepticism heuristics
  nl_crypto.ts
  index.ts       ← assembles TOPIC_PROMPTS record
```

Each topic file imports `SHARED_PERSONA` and appends its own domain rules. This means:
- Voice changes in one place (`shared.ts`) propagate everywhere
- Topic-specific curation logic stays isolated and independently editable
- The bundler traces the import graph and includes all files automatically

### Why not `.md` files in serverless?

Vercel/Turbopack/webpack only bundles files reachable via `import`/`require`. A `.md` file in `lib/prompts/` that isn't imported gets silently excluded from the function bundle. You'd need raw-loader or webpack config to make it importable — overhead with no practical benefit, since a TypeScript template literal reads identically as prose.

The upgrade path if you want markdown editing without redeploy: store prompts in Cloudflare KV, load them in the workflow step, fall back to the `.ts` defaults if KV returns null.

### Prompt composition pattern

```typescript
// shared.ts
export const SHARED_PERSONA = `
## Who You Are
[voice, tone, story selection tiers, universal output rules]
`;

// nl_ai.ts
import { SHARED_PERSONA } from './shared';
export const AI_PROMPT = `${SHARED_PERSONA}

## Your Assignment: AI Brief
[topic-specific lens, skepticism heuristics, output format]
`;
```

This is the same pattern as CSS variables or design tokens — one source of truth for the shared layer, overridden at the specific layer.

## When Not to Use an Agent

Not everything needs an agent. Use a simple script when:

- The task is fully deterministic (no judgment calls)
- The inputs and outputs are well-defined
- There's no need to handle ambiguity or variation

A cron job that runs a SQL query and sends an email is a script, not an agent. An LLM adds latency, cost, and unpredictability. Use it only when the task genuinely benefits from language understanding or flexible reasoning.

## Related

- [[stacks/agents]]
- [[principles/mvp-philosophy]]

## Sources

- [[raw/articles/vibes-knowledge-base/07-agent-automation-patterns]]
