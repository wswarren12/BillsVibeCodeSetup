---
title: Onion Architecture — Project Template Block
tags:
  - architecture
  - onion-architecture
  - vibe-coding
  - claude-code
  - cursor
  - template
  - standards
type: template
status: canonical
---

# Onion Architecture — Project Template Block

> [!abstract] What this note is
> A filled-in, ready-to-commit starter kit for a new project: the `CLAUDE.md` architecture block with real values, a working `dependency-cruiser` config, and the `package.json` scripts that back the verify gate. Copy these into a fresh repo and you're onion from commit one. Generic version and rationale: [[Onion Architecture — Agent Rules (CLAUDE.md)]]. Index: [[Onion Architecture — MOC]].

> [!tip] How to use this
> 1. Copy the three files below into the repo root (`CLAUDE.md`, `.dependency-cruiser.cjs`, and the `package.json` scripts).
> 2. Replace the three bracketed tokens: `[PROJECT NAME]`, the stack line, and confirm the folder paths match your chosen flavour.
> 3. Run the gate once against a deliberate violation to prove it bites (see the bottom of this note).
> 4. Commit it. From here, the rule outranks the agent.

---

## File 1 — `CLAUDE.md` (filled in for a single-package Next.js + Supabase app)

This is the generic block from [[Onion Architecture — Agent Rules (CLAUDE.md)]] with the stack line and verify command made concrete. For a different stack, edit the marked lines.

```markdown
# [PROJECT NAME] — Architecture & Agent Rules

## Stack
- Next.js (App Router) + TypeScript, deployed on Vercel.   <-- EDIT for this project
- Supabase (Postgres + PostGIS) for persistence.           <-- EDIT
- Zod for validation. dependency-cruiser for boundaries.
- (If mobile: Expo / React Native sharing the domain + application core.)

## Architecture: Onion (domain / application / infrastructure)
The single rule from which everything follows:
ALL DEPENDENCIES POINT INWARD. Obey it without exception.

### Layers and allowed imports
- domain/         imports NOTHING outward. No framework, no SDK, no Supabase,
                  no React/Next/Expo, no fetch, no process.env. Zod is the only
                  permitted dependency (for expressing domain rules).
- application/    imports domain ONLY. Orchestrates use cases. No DB, no HTTP,
                  no UI, no SDK code here.
- infrastructure/ imports application + domain. ALL real-world code lives here:
                  Supabase client + repository adapters, route handlers / server
                  actions, React/Expo UI, vendor SDKs, env reading, config,
                  mappers, the composition root.

If an inner layer needs an outer capability, declare an INTERFACE (port) in
domain/ports and IMPLEMENT it with an adapter in infrastructure. Never import
the concrete thing inward.

### Hard DO NOTs (these are errors, not preferences)
- DO NOT import infrastructure or application code into domain.
- DO NOT import infrastructure or ui code into application.
- DO NOT call Supabase, the network, the filesystem, or any SDK from domain or
  application directly. Go through a port.
- DO NOT read process.env outside infrastructure/config.
- DO NOT put business rules in React components, route handlers, server actions,
  or hooks. They render / capture input / call a use case. Nothing more.
- DO NOT leak Supabase row shapes or raw API JSON into domain types. Map at the
  edge with explicit toDomain / toPersistence mappers.
- DO NOT weaken, edit, or delete the dependency-cruiser rules to make a task
  pass. If the gate is red, the layering is wrong — fix the code.

### DOs
- Put each user intent in its own file under application/use-cases.
- Express every external capability as a port (interface) in domain/ports,
  named for the capability (e.g. TraceRepository, Clock, FileStore, AuthProvider).
- Name adapters <Tech><Port> in infrastructure (e.g. SupabaseTraceRepository).
- For every real adapter, provide an in-memory fake for tests.
- Validate (Zod) all inbound data at the boundary; convert to domain types
  before it reaches application/domain.
- Wire concretes only in the composition root. Inner layers receive ports.
- For auth, resolve the verified user (not an unverified session read) inside
  the infrastructure adapter.

### Folder layout (single-package flavour)
src/
  domain/         entities/ value-objects/ ports/ index.ts
  application/    use-cases/ dto/ index.ts
  infrastructure/ repositories/ clients/ actions/ config/ mappers/ composition/
  ui/             presentational components only

### Workflow you MUST follow on every task
1. PLAN FIRST. Before writing code, list the files you will add/change and the
   LAYER each belongs to. If the plan would put outward code in an inner layer,
   redesign it — do not proceed.
2. IMPLEMENT within the boundaries above.
3. VERIFY. Run and pass before declaring the task done:
       pnpm verify
   This runs lint + typecheck + dependency-cruiser (boundary check) + tests.
   A dependency-cruiser boundary error means you broke the architecture. Fix the
   layering. Never edit the rules to silence it.

### When unsure
- Ask: which layer owns this? Business rule -> domain. Coordinating one user
  intent -> application. Anything touching the outside world -> infrastructure.
- If a rule here blocks you, surface the conflict and propose an option. Do not
  silently route around the architecture.
```

> [!note] Cursor / other agents
> The same content works verbatim in `.cursorrules`, or in `AGENTS.md` for Codex / Gemini / Antigravity. Keep one canonical copy and symlink or duplicate as needed; `rule-porter`-style converters exist if you'd rather generate the variants.

---

## File 2 — `.dependency-cruiser.cjs` (the gate that makes the rules real)

This is the single-package version. It fails CI if the dependency rule is broken.

```js
// .dependency-cruiser.cjs
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-stays-pure',
      comment: 'domain must not import application, infrastructure, or ui',
      severity: 'error',
      from: { path: '^src/domain' },
      to:   { path: '^src/(application|infrastructure|ui)' },
    },
    {
      name: 'domain-no-frameworks',
      comment: 'domain must not import frameworks, SDKs, or node builtins (zod is allowed)',
      severity: 'error',
      from: { path: '^src/domain' },
      to: {
        dependencyTypes: ['npm', 'core'],
        pathNot: ['node_modules/zod'],
      },
    },
    {
      name: 'application-no-infra',
      comment: 'application may import domain only',
      severity: 'error',
      from: { path: '^src/application' },
      to:   { path: '^src/(infrastructure|ui)' },
    },
    {
      name: 'no-orphans',
      comment: 'flag dead modules',
      severity: 'warn',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', '(^|/)index\\.ts$'] },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
  },
};
```

> [!warning] Workspace-packages flavour
> If you're on the monorepo flavour ([[Onion Architecture — Rules & Conventions#Flavour B — workspace packages (default for monorepos / multi-app)]]), you mostly don't need these path rules — each package's `package.json` already forbids the wrong direction because it doesn't declare the dependency. Keep a lighter dependency-cruiser config as a backstop and let the build tool be the primary enforcer.

---

## File 3 — `package.json` scripts (the verify command the agent runs)

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "depcruise": "depcruise src --config .dependency-cruiser.cjs",
    "test": "vitest run",
    "verify": "pnpm lint && pnpm typecheck && pnpm depcruise && pnpm test"
  },
  "devDependencies": {
    "dependency-cruiser": "^16",
    "vitest": "^2",
    "typescript": "^5"
  }
}
```

> [!danger] The verify line must point at something real
> The most common failure is a `verify` command in `CLAUDE.md` that doesn't exist in `package.json`. The agent runs it, gets command-not-found, and either invents a substitute or quietly skips the gate — and now the rules are decorative. Wire the script before you trust the block.

---

## Prove the gate bites (do this once per repo)

Before relying on any of this, confirm a violation actually fails:

1. Add a throwaway line to any file under `src/domain/` that imports something outward, e.g.:
   ```ts
   // src/domain/entities/__canary.ts
   import { createClient } from '@supabase/supabase-js'; // should be forbidden
   ```
2. Run `pnpm verify`.
3. You want dependency-cruiser to report `error domain-stays-pure` (or `domain-no-frameworks`) and the command to exit non-zero.
4. Delete the canary file.

If `verify` stayed green, the gate is theater — fix the config before continuing. If it went red, the architecture is enforced and the agent block has teeth.

## Related notes

- [[Onion Architecture — MOC]]
- [[Onion Architecture — Agent Rules (CLAUDE.md)]]
- [[Onion Architecture — Rules & Conventions]]
- [[Onion Architecture — Stack Mapping]]
- [[Onion Architecture — Overview]]
