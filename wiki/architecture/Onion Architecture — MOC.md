---
title: Onion Architecture — MOC
tags:
  - architecture
  - onion-architecture
  - moc
  - standards
type: moc
status: canonical
aliases:
  - Onion Architecture Index
  - Onion MOC
---

# Onion Architecture — MOC

> [!abstract] Map of Content
> The entry point for how all my products are structured. Start here, then follow the path that matches what you're doing.

## The one rule

**All dependencies point inward. The domain depends on nothing.** Everything in these notes follows from that. Full reasoning in [[Onion Architecture — Overview]].

## The notes

| Note | Use it when |
|---|---|
| [[Onion Architecture — Overview]] | You want the concept: layers, dependency inversion, onion vs. hexagonal/clean, and when not to use it. |
| [[Onion Architecture — Rules & Conventions]] | You're setting up a project and need the enforceable rules: folder layout, allowed imports, naming, enforcement tooling. |
| [[Onion Architecture — Agent Rules (CLAUDE.md)]] | You're about to vibe-code and need the paste-ready block for `CLAUDE.md` / `.cursorrules`. |
| [[Onion Architecture — Project Template Block]] | You're spinning up a new repo and want a filled-in `CLAUDE.md` + dependency-cruiser config + verify scripts to copy. |
| [[Onion Architecture — Stack Mapping]] | You're stuck on "where does Supabase / a component / a server action go?" |

## Paths through the material

> [!example] Starting a new product
> 1. Skim [[Onion Architecture — Overview]] to confirm onion is the right call (not a throwaway/CRUD spike).
> 2. Pick a folder flavour in [[Onion Architecture — Rules & Conventions#3. Folder structure]] (single-package vs. workspace packages).
> 3. Copy the filled-in starter from [[Onion Architecture — Project Template Block]] into the repo and replace the bracketed tokens.
> 4. Use [[Onion Architecture — Stack Mapping]] as you place each piece.

> [!example] Reviewing or fixing an existing build
> 1. Run the merge checklist in [[Onion Architecture — Rules & Conventions#8. Checklist before merging a feature]].
> 2. Check placements against [[Onion Architecture — Stack Mapping#Quick placement table]].
> 3. If boundaries aren't enforced yet, add the tooling in [[Onion Architecture — Rules & Conventions#7. Enforcement (make the rule mechanical, not aspirational)]].

> [!example] Onboarding an agent on a task
> 1. Ensure the repo's `CLAUDE.md` has the block from [[Onion Architecture — Agent Rules (CLAUDE.md)]].
> 2. Ensure a single `verify` command exists and passes.
> 3. Make the agent produce a layer-mapped plan before it writes code.

## Reference implementation

Howie's `CosmicDreamer17/ddd-onion-hexagonal-typescript-starter-template` is the working skeleton these notes describe. Mapping to my stack is in [[Onion Architecture — Stack Mapping#Howie's reference template]].

## Related

- [[Onion Architecture — Overview]]
- [[Onion Architecture — Rules & Conventions]]
- [[Onion Architecture — Agent Rules (CLAUDE.md)]]
- [[Onion Architecture — Stack Mapping]]
