# Docker

## Decision Tree
- New project? → Add Dockerfile + docker-compose from day one
- Web (Node.js)? → Multi-stage build (deps → build → runner)
- Python? → Slim base + pip from requirements.txt
- Need DB locally? → docker-compose with Postgres
- Multiple services? → docker-compose named services
- CI/CD? → Same Dockerfile used in production

## Why
- Dockerfile from day one means every contributor can run the project with one command
- Multi-stage builds keep production images small — no dev dependencies, no build tools
- docker-compose standardizes local dev — no "works on my machine" problems
- Same Dockerfile in CI/CD and prod eliminates environment drift

## Patterns

### Multi-stage Node.js Dockerfile

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

USER appuser
EXPOSE 3000
ENV PORT=3000 NODE_ENV=production

CMD ["node", "server.js"]
```

### docker-compose for Local Dev with Postgres

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps
    command: npm run dev
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://dev:dev@db:5432/app
    depends_on:
      - db

volumes:
  pgdata:
```

## Rules
- Always use Alpine images — smaller, fewer vulnerabilities
- Always run as non-root user in production (adduser + USER directive)
- Always include a `.dockerignore` — at minimum: `node_modules`, `.git`, `.env`, `.next`
- Always pin major versions (`node:20-alpine`, not `node:latest`)
- Never put secrets in Dockerfiles — use env vars or mounted secrets
- Never copy `node_modules` into the image — install fresh with `npm ci`

## Sources
[To be populated via ingest]
