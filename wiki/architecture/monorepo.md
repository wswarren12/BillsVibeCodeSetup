# Monorepo

## Decision Tree
- Web3 project? → Always monorepo
- Web + mobile sharing code? → Monorepo with shared packages
- Single web app? → No monorepo
- Single mobile app? → No monorepo
- Agent + API sharing types? → Monorepo if shared types exist

## Why
- Web3 projects always have contracts + frontend + scripts — they belong together
- Shared packages (types, utils, config) eliminate version drift between apps
- Single-app projects don't benefit — monorepo tooling adds complexity for no gain
- Shared types between agent and API are the trigger — if there's no sharing, keep them separate

## Structure

```
project/
├── packages/
│   ├── web/              # Next.js app
│   ├── mobile/           # Expo app
│   ├── contracts/        # Solidity / Hardhat / Foundry
│   └── shared/           # Shared types, utils, config
├── package.json          # Root workspace config
├── turbo.json            # Turborepo config (only if needed)
├── docker-compose.yml
└── .gitignore
```

### Root package.json

```json
{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  }
}
```

## Tools
- npm/yarn workspaces are built-in and sufficient for most projects
- Turborepo only if build times become a problem — it adds caching and parallel builds
- Don't use Nx, Lerna, or Rush — too much config, too much magic

## Rules
- Each package gets its own `package.json`, `tsconfig.json`, and build config
- Shared package exports through a single `index.ts` barrel file
- Never have circular dependencies between packages
- Keep the dependency graph simple: shared → web, shared → mobile, shared → contracts

## Sources
[To be populated via ingest]
