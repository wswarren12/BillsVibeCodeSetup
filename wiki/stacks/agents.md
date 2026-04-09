# Agents Stack

## Core Stack

- **Python 3.12+**
- **Claude Agent SDK** — agent orchestration
- **FastAPI** — when HTTP interface is needed
- **Pydantic v2** — data validation and models
- **asyncio** — async execution

## Auth

API keys and service accounts only. No user-facing auth flows.

## Project Scaffold

```bash
mkdir my-agent && cd my-agent
python3 -m venv .venv
source .venv/bin/activate
pip install claude-agent-sdk fastapi uvicorn pydantic
pip freeze > requirements.txt
```

## File Structure

See [[patterns/file-structure#agentautomation-projects]] for the canonical layout.

Quick recap:

```
agents/                 # Agent definitions
  [agent-name]/
    index.ts            # Agent entry point
    tools.ts            # Tool/function definitions
    prompts.ts          # System prompts and templates
    types.ts            # Input/output types
lib/
  mcp.ts                # MCP client setup
  llm.ts                # LLM client initialization
  state.ts              # State between agent turns
scripts/                # One-off or scheduled scripts
config/
  agents.yaml
```

- One agent per folder. Keep agents small and single-purpose.
- All data contracts defined as typed models (Pydantic for Python, zod for TS).
- FastAPI routes are thin wrappers; business logic lives in agents and models.
- See [[patterns/agent-automation]] for the plan-execute-validate loop and tool schema design.

## Docker Pattern

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Related

- [[patterns/agent-automation]] — Plan-execute-validate loop, tool schemas, MCP integration
- [[patterns/file-structure]] — Agent project layout
- [[architecture/docker]]
- [[architecture/api-design]]
