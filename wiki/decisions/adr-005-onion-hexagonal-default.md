# ADR-005: Onion + Hexagonal as the default architecture for every new project

**Date:** 2026-06-01
**Status:** Accepted

## Context

Across my projects (Cairn, Newsbreef, Rootstock, Agentforge) I've watched the same failure mode recur: domain logic leaks into route handlers, server actions, components, or Supabase queries. The product becomes inseparable from its current vendor stack. Swapping Supabase → Neon, or React → React Native, or one LLM provider → another, turns into a rewrite instead of an adapter change.

The canonical material in `wiki/architecture/Onion Architecture — MOC.md` and `wiki/architecture/Onion Architecture — Project Template Block.md` already encodes the rule and ships a working `dependency-cruiser` gate. What was missing was **enforcement at project birth** — a workflow that fires the moment a new project is being spun up, before any framework scaffolder gets to set the structure.

I also kept seeing Claude jump straight from "I want to build X" to `npx create-next-app` without ever asking *what the domain actually is*. The core was being implicitly defined by whatever CRUD the framework's tutorial assumed. That is the bug this ADR fixes.

## Options considered

- **Keep onion as an optional pattern.** Status quo. Documented but only applied when remembered. Fails because the structure is set in the first 5 minutes of a new project, and the agent's default is faster than the human's discipline.
- **Recommend onion in vault `CLAUDE.md` but allow soft fallback.** Encoded but easily bypassed. Domain leakage still happens whenever the project is "small enough to not bother".
- **Hard gate with escape hatch (CHOSEN).** Every new project triggers `wiki/workflows/new-project.md`. Steps 2 (Domain Discovery) and 3 (Core Identification) are non-negotiable. A single explicit opt-out exists for genuine throwaway spikes, and it is logged in the project's `CLAUDE.md`.

## Decision

1. **The default architecture for every new project is Onion with Hexagonal adapters**, regardless of stack (Web / Mobile / Agents / Web3).
2. **`wiki/workflows/new-project.md` is the canonical workflow** for project initialization. It is a hard gate: Claude must complete Domain Discovery and Core Identification before scaffolding.
3. **The escape hatch** for throwaway spikes is an explicit user "yes" to the prompt *"Is this a throwaway spike where we should skip the onion gate?"*, logged in the project `CLAUDE.md`.
4. **Enforcement at the code level** uses the `dependency-cruiser` config and `pnpm verify` script from `wiki/architecture/Onion Architecture — Project Template Block.md`. The gate must be proven to bite (canary file test) before the project is considered scaffolded.

## Reasoning

The rule *"all dependencies point inward"* is testable mechanically. The rule *"identify the domain core before writing code"* is not — it requires a workflow that forces a conversation. ADR-005 wires the two together:

- The conversation step (workflow) makes the boundaries **conceptually correct** for this product.
- The dependency-cruiser gate keeps them **structurally enforced** as the code grows.

Onion is the layering rule. Hexagonal is what makes onion practical: every external capability becomes a port in `domain/ports`, and every vendor becomes a swappable adapter in `infrastructure/`. The two paired give a code base that survives stack changes — which, given how fast the AI / Web / Web3 ecosystems move, is the realistic constraint.

## Consequences

### Positive

- New projects start with the right shape. The first `git commit` is already onion-shaped.
- The "what's the core?" question gets asked while the answer still matters — not three months in.
- Stack swaps become adapter swaps (e.g. Supabase → Neon, OpenAI → Claude) instead of rewrites.
- Tests can use in-memory fakes for every port, so unit tests don't need the network or a DB.
- Each project's `CLAUDE.md` is filled-in from the Project Template Block, so the agent inside the project has the same rules at hand.

### Negative

- Higher friction at project birth. Throwaway spikes pay a tax of ~one prompt (the escape-hatch question).
- The agent must resist the urge to be helpful by running the scaffolder before the questions are answered. This requires the vault `CLAUDE.md` "New Project Initialization" section to be loaded every session via the user's global `~/.claude/CLAUDE.md`.
- A few stacks (especially Web3) require interpretive work to identify the domain core vs. the contracts vs. the off-chain glue. The workflow accepts that this is non-trivial and surfaces it via the ADR escape route for stack-specific deviations.

### Neutral

- The architectural pattern was already canonical in the vault. ADR-005 doesn't add a new pattern; it raises the existing one to **default + enforced**.
- Existing projects (Cairn, Newsbreef, Rootstock, Agentforge) are not retroactively required to refactor. ADR-005 binds future projects.

## Related

- [[architecture/Onion Architecture — MOC]]
- [[architecture/Onion Architecture — Project Template Block]]
- [[workflows/new-project]]
- [[workflows/feature-dev]]
- [[principles/mvp-philosophy]]
- [[principles/anti-patterns]]
