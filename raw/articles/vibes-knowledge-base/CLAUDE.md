# CLAUDE.md — Knowledge Base Schema

This file defines how a coding agent should use this knowledge base when building or planning software.

## Directory Structure

```
knowledge/
  wiki/           # Architecture guidance, patterns, and decision frameworks
    INDEX.md      # Master index — read this first
    01-*.md       # Tier 1: always read before starting any project
    02-*.md       #   ...
    03-*.md       #   ...
    04-12-*.md    # Tier 2-3: read when the topic is relevant to the current task
  raw/            # Source material: articles, transcripts, reference docs (append-only, never edit)
  outputs/        # Generated ADRs, project-specific decisions, and query responses
```

## When Starting a New Project

1. Read `wiki/INDEX.md` to understand what guidance exists.
2. Read all Tier 1 documents (01, 02, 03) in full.
3. Identify which Tier 2 documents are relevant to the project and read those.
4. Follow the conventions and decision trees when making technology choices.
5. If a decision isn't covered by the wiki, make the choice that is simplest, most aligned with the MVP Philosophy, and document it as an ADR in `outputs/`.

## When Adding a Feature to an Existing Project

1. Read `wiki/INDEX.md` to refresh on available guidance.
2. Read the specific Tier 2 documents relevant to the feature (e.g., `04-data-modeling-patterns.md` if adding a new table, `07-agent-automation-patterns.md` if adding an agent).
3. Check `wiki/12-anti-patterns.md` — make sure the feature doesn't fall into a known trap.
4. Follow the file structure conventions from `03-file-structure-conventions.md`.

## When Making a Technology Decision

1. Check `wiki/02-decision-trees.md` first. If the decision is covered, follow the recommendation.
2. If the decision involves adding a dependency, check `wiki/10-dependency-selection.md`.
3. If the decision is not covered, evaluate options using the same framework as the Reference ADRs (`wiki/11-reference-adrs.md`): context, options, decision, reasoning, tradeoffs.
4. Write a new ADR to `outputs/adr-NNN-[slug].md`.

## When Reviewing or Debugging Code

1. Check if the code violates any principle in `wiki/01-mvp-philosophy.md`.
2. Check if the code matches an anti-pattern in `wiki/12-anti-patterns.md`.
3. Verify the file structure matches `wiki/03-file-structure-conventions.md`.
4. Verify state management follows `wiki/05-state-management.md`.
5. Verify data flow follows `wiki/06-api-data-flow.md`.

## Updating the Knowledge Base

When new decisions are made or patterns are learned during a project:

1. If it's a technology choice: write an ADR to `outputs/` using the template in `wiki/11-reference-adrs.md`.
2. If it's a reusable pattern: propose an update to the relevant wiki article. Do not edit wiki articles without confirming the change with the user.
3. If it's raw source material (article, transcript, reference): save it to `raw/` with a descriptive filename.
4. After any wiki update, update `wiki/INDEX.md` to reflect changes.

## Linting Pass

Periodically (after every 5-10 new raw sources or after completing a project), run a linting pass:

1. Read all wiki articles.
2. Check for contradictions between articles.
3. Check for concepts mentioned in one article but lacking their own entry.
4. Check for stale recommendations (e.g., a library that's been deprecated).
5. Check that `INDEX.md` accurately reflects all wiki articles.
6. Report findings to the user. Do not auto-fix — propose changes and wait for confirmation.

## Behavioral Rules

- **When uncertain between two approaches, choose the simpler one.** This is the single most important rule.
- **Do not introduce tools, libraries, or patterns not covered in the Decision Trees without checking with the user first.**
- **Do not build for scale before there are users.** Optimize for developer speed and code clarity, not throughput.
- **When the wiki doesn't cover a topic, say so.** Do not hallucinate guidance. Propose adding new guidance to the wiki.
- **Treat the MVP Philosophy document as the constitution.** If another document's advice conflicts with it, the MVP Philosophy wins.
