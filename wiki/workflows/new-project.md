---
title: New Project Workflow
tags:
  - workflow
  - onion-architecture
  - hexagonal
  - project-init
  - standards
type: workflow
status: canonical
---

# New Project Workflow

8-step process for spinning up a brand-new project. Every new repo flows through this pipeline. The **architecture is fixed** (Onion + Hexagonal adapters); the **domain is what we discover**.

> [!warning] Hard gate
> Claude MUST NOT scaffold, run `create-next-app`/`npx create-*`, generate file structure, or write any implementation code until **Step 2 (Domain Discovery)** and **Step 3 (Core Identification)** are complete and the user has explicitly approved them. If the user pushes to skip ahead, surface this rule rather than silently obeying.

> [!tip] Escape hatch (the only way to skip the gate)
> If the project is a **throwaway spike / CRUD demo / one-off script**, Claude MUST ask: *"Is this a throwaway spike where we should skip the onion gate?"* — and the user must answer **yes** explicitly. Log the opt-out in the project's `CLAUDE.md` ("**Onion gate: skipped — throwaway spike**"). Anything else (including silence) means the full workflow runs.

---

## Step 1: Trigger Recognition

Claude recognizes these as "new project" triggers and switches into this workflow:

- "I'm starting a new project…"
- "Let's spin up a new repo for…"
- "I want to build a new app that…"
- "Create a new Next.js / Expo / Python agent project for…"
- "Scaffold a new …"
- Any `mkdir`/`git init`/`pnpm create` for a directory with no existing code

On any of these, **stop**, announce the workflow, and proceed to Step 2. Do not pick a stack yet. Do not pick a name's CSS framework. Do not write README.md. Do nothing outward-facing yet.

## Step 2: Domain Discovery (clarifying questions)

The goal is to find the **business reality** the product encodes, before any tech choice can contaminate it. Ask the user the questions below in batches — using `AskUserQuestion` when there are concrete choices, or open-ended prompts when you need their words.

### Question battery — must be answered before Step 3

**Purpose**
1. In one sentence, what does this product do that nothing else could do for the user?
2. Who is the user? What event in their day/week makes them open this product?
3. What state of the world is different after a successful use? (Describe the *change*, not the screen.)

**Vocabulary (the ubiquitous language)**
4. What are the 3–10 nouns a domain expert would use even before any code? (These are candidate **entities** and **value objects**.)
5. What are the verbs / events? (These are candidate **use cases** and **domain events**.)
6. What words from the tech world (DB, framework, vendor) should NOT appear in the vocabulary?

**Invariants & rules**
7. What must ALWAYS be true regardless of UI, DB, or session? Examples: "a memory can only be recalled at its anchor location"; "a payout cannot exceed the campaign balance"; "two users cannot claim the same handle".
8. What kinds of mistakes would a sloppy implementation make that domain experts would immediately reject?

**Boundaries**
9. What does the product NOT do? (Hard scope cut — written down so we can refuse it later.)
10. What external capabilities does the core depend on? (Persistence, time, auth, payments, file storage, geolocation, email, push, AI/LLM calls.) These become **ports**.

### Output of Step 2

A short note (4–10 lines) the user has read and approved, containing:
- The one-sentence purpose
- The vocabulary (entities, value objects, events, in the user's words)
- The invariants
- A list of "outside" capabilities the core will need

**STOP** until the user approves this note. Do not proceed to Step 3 without that approval.

## Step 3: Core Identification

From the Step 2 output, name **THE core** — the unique business logic that justifies the product.

Apply the **substitution test**: *if we swapped the database, framework, UI library, hosting, and vendor SDKs, what would still be here?* That residue is the core.

Output:
- A 1–3 sentence core statement
- A list of what is **core** vs. **non-core** (non-core = vendor-replaceable glue)
- Confirmation from the user that this captures the heart of the product

**STOP** until the user approves the core statement. Without this, the layering in Step 5 has no anchor.

## Step 4: Ports & Adapters Mapping (Hexagonal)

For every external capability identified in Step 2 (Q10), define:

| Port (in `domain/ports`) | Adapter (in `infrastructure/`) | Tech |
|---|---|---|
| e.g. `MemoryRepository` | `SupabaseMemoryRepository` | Supabase + PostGIS |
| e.g. `Clock` | `SystemClock` | `Date.now()` |
| e.g. `PaymentProvider` | `StripePaymentProvider` | Stripe |
| e.g. `LLMClient` | `AnthropicLLMClient` | Claude Agent SDK |

Rules:
- One port per capability, named for the **capability** (not the vendor).
- Every real adapter has an **in-memory fake** for tests.
- If two adapters share an interface (e.g. dev/prod payment providers), the port stays one — that's the whole point of hexagonal.

## Step 5: Stack Selection

Pick the stack via the decision trees in the vault `CLAUDE.md` and [[architecture/Onion Architecture — Stack Mapping]] (once it exists). Confirm:
- Web → [[stacks/web]] defaults
- Mobile → [[stacks/mobile]] defaults
- Agents → [[stacks/agents]] defaults
- Web3 → [[stacks/web3]] defaults

If the project requires a **deviation** from defaults, that requires an ADR (see [[decisions/TEMPLATE]]).

## Step 6: Scaffold

Apply [[architecture/Onion Architecture — Project Template Block]]:

1. Copy the filled-in `CLAUDE.md` block. Replace `[PROJECT NAME]`, the stack line, and verify command for the chosen stack.
2. Copy the `.dependency-cruiser.cjs` (single-package) or the workspace-package variant.
3. Wire the `package.json` scripts so `pnpm verify` runs lint + typecheck + dependency-cruiser + tests.
4. Create the folder layout:
   ```
   src/
     domain/         entities/ value-objects/ ports/ index.ts
     application/    use-cases/ dto/ index.ts
     infrastructure/ repositories/ clients/ actions/ config/ mappers/ composition/
     ui/             presentational components only
   ```
5. Seed `domain/` with the entities, value objects, and ports identified in Steps 2–4 — **named in the user's vocabulary, not framework terms**.
6. Seed `infrastructure/` with placeholder adapters (one per port) AND in-memory fakes.

## Step 7: Verify Gate (prove the gate bites)

Per the bottom of [[architecture/Onion Architecture — Project Template Block]]:

1. Add a canary file `src/domain/__canary.ts` that imports something outward (e.g. `@supabase/supabase-js`).
2. Run `pnpm verify`.
3. Confirm dependency-cruiser reports `error domain-stays-pure` (or `domain-no-frameworks`) and the command exits non-zero.
4. Delete the canary.

If verify stayed green, the gate is theatre. Fix the config before continuing.

## Step 8: Record

- Create per-project page: `wiki/projects/<project-slug>.md` capturing purpose, core statement, ports/adapters, stack tier.
- Create ADR: if any deviation from defaults was made (Step 5) or any unusual port was introduced (Step 4), record it via [[decisions/TEMPLATE]].
- Update [[index]] under **Projects**.
- Append to [[log]] with date, operation (`new-project`), project slug, and core statement.

---

## Reference: domain-discovery questions cheat sheet

Use this if the user prefers a single-block prompt over batched questions:

```
Before I write any code, I need to understand the domain. Please answer:

1. In one sentence: what does this product do that nothing else could?
2. Who is the user, and what trigger makes them open it?
3. What state of the world is different after a successful use?
4. What 3–10 nouns would a domain expert use, even before any tech?
5. What verbs / events go with those nouns?
6. What must ALWAYS be true regardless of UI/DB/session? (Invariants.)
7. What does this product explicitly NOT do?
8. What outside capabilities does it depend on? (persistence, time, auth, payments, files, etc.)

Once you've answered, I'll restate the core in one sentence for your approval before scaffolding anything.
```

## Related

- [[architecture/Onion Architecture — MOC]]
- [[architecture/Onion Architecture — Project Template Block]]
- [[workflows/feature-dev]]
- [[decisions/adr-005-onion-hexagonal-default]]
