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

## Conventions

```
src/
  agents/    # Agent definitions and configurations
  models/    # Pydantic models
  api/       # FastAPI routes
tests/       # Test suite
```

- One agent per file in `src/agents/`.
- All data contracts defined as Pydantic models.
- FastAPI routes are thin wrappers; business logic lives in agents and models.

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

- [[architecture/docker]]
- [[architecture/api-design]]
