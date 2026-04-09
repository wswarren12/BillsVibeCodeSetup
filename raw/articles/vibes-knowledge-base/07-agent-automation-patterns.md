# Agent Automation Patterns

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

## When Not to Use an Agent

Not everything needs an agent. Use a simple script when:

- The task is fully deterministic (no judgment calls)
- The inputs and outputs are well-defined
- There's no need to handle ambiguity or variation

A cron job that runs a SQL query and sends an email is a script, not an agent. An LLM adds latency, cost, and unpredictability. Use it only when the task genuinely benefits from language understanding or flexible reasoning.
