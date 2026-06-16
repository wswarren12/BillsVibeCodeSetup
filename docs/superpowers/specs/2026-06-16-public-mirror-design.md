# Public Mirror of the VibeCoding Knowledge Base — Design

**Date:** 2026-06-16
**Status:** approved (design)

## Goal

Produce a publicly shareable mirror of the VibeCoding Obsidian knowledge base that
contains **no private project names or project-specific examples**, with one exception:
projects explicitly whitelisted for the public `project-snapshots` folder.

**Whitelisted projects (the only ones allowed anywhere in the mirror):**
`billsclub`, `kidspinner`, `linkedin-job-hunter`, `nanoclaw`, `wordcraft`.

**Removed projects (must not survive anywhere in the mirror):**
`cairn`, `agentforge`, `newsbreef`, `rootstock`, `dh-baal`, `summon-summarybot` (and the
"Summon" parent program where it identifies private work).

## Output

- A new sibling directory: `~/Obsidian/VibeCoding-public/`.
- A **fresh `git init`** — no history from the original repo is carried over.
- The original vault at `~/Obsidian/VibeCoding/` is **never modified**.
- The user pushes the mirror to a public GitHub repo manually when satisfied.

## Treatment principle

For content tied to a **removed** project, **genericize, keep the lesson**: rewrite to
strip the project name and project-specific identifiers (repo URLs, commit hashes,
domains, private filesystem paths, personal handles) while preserving the transferable
technical lesson. Only delete content that is meaningless once anonymized (e.g. a
standalone project page that is nothing but project description).

For the **whitelisted** snapshots: keep the project content, **light-scrub** personal /
sensitive identifiers (private repo URLs, GitHub handle `wswarren12`, the email
`w.s.warren12@gmail.com`, the `billsai.club` domain, any API keys or secrets).

## File-by-file disposition

| Source | Action |
|---|---|
| `CLAUDE.md` | Keep. Update the `~/Obsidian/VibeCoding/` path reference to the public path; otherwise it is project-free. |
| `README.md` | Keep; add a one-line note that this is a sanitized public mirror. |
| `wiki/principles/*`, `wiki/stacks/*`, `wiki/workflows/*` | Keep as-is (verified clean of project refs). |
| `wiki/patterns/agent-automation.md` | Genericize: "the AgentForge pattern" → "the persistent-agent pattern". |
| `wiki/patterns/*` (others) | Keep. |
| `wiki/architecture/payments.md` | Genericize the NewsBreef Stripe incident: keep the technical lesson, drop the `newsbreef.billsai.club` domain, commit hash `6616ae6`, repo `wswarren12/NewsBreef`, and the project name. |
| `wiki/architecture/embedding-models.md` | Genericize: drop the `[[projects/cairn]]` pointer/bullet. |
| `wiki/architecture/*` (others, incl. Onion notes) | Keep. |
| `wiki/decisions/adr-001..004` | Genericize: strip "Cairn" and project specifics from title, "Source project", and Context; keep the decision/reasoning/tradeoffs. (e.g. ADR-001 → "PostGIS over Firebase for spatial apps".) |
| `wiki/decisions/adr-005`, `TEMPLATE.md` | Keep (already clean). |
| `wiki/summaries/small-embedding-models-field-guide.md` | Genericize: drop the Cairn application bullet and `[[projects/cairn]]` link. |
| `wiki/projects/` (agentforge, cairn, newsbreef, rootstock) | **Remove entirely** — all non-whitelisted. Folder ends up empty / omitted. |
| `wiki/index.md` | Rewrite: remove the four removed-project entries from the Projects section (repoint it to the snapshots or note projects are illustrative-only); fix ADR titles that carry "(Cairn)". |
| `wiki/log.md` | **Genericize each entry**: keep the action + lesson, strip project names, private paths (`~/Desktop/Vibes/...`, `~/Desktop/Summon/...`), the `billsai.club` domain, commit hashes, and repo handles. Project-bookkeeping entries collapse to their generic substance (e.g. "created per-project CLAUDE.md files capturing tier + documented deviations" without naming projects). |
| `raw/articles/**` | Keep (generic external knowledge; verified clean). |
| `raw/tips/inbox.md`, `raw/tips/processed/` | Keep (generic; example URLs only). |
| `raw/project-snapshots/` | Keep **only** the 5 whitelisted files; light-scrub each. **Delete** `agentforge.md`, `dh-baal.md`, `rootstock.md`, `summon-summarybot.md`. |
| `mcp-server/` (src + tests + package manifests + config) | Keep. Exclude `node_modules/` and `dist/`. Verified clean of project/personal refs. |
| `hooks/`, `scripts/`, `commands/` | Keep as-is (verified clean). |
| `docs/superpowers/` (specs + plans, incl. this file) | Genericize project references; keep the build narrative. |
| `.obsidian/` | **Exclude** (local app settings; already gitignored). |
| `.git/` | **Exclude** (fresh init). |
| `.gitignore` | Keep. |

## Final global scrub gate

After the copy + per-file edits, run a verification grep across the entire mirror that
**fails loudly** if any of the following survive (case-insensitive), excluding the
whitelisted snapshot filenames/content:

- Removed project names: `cairn`, `agentforge`, `newsbreef`, `rootstock`, `dh-baal`,
  `summon` / `summarybot`.
- Personal identifiers: `wswarren`, `w.s.warren12`, `billsai.club`,
  `~/Desktop/Vibes`, `~/Desktop/Summon`.

If the gate finds a hit, fix it before declaring done.

## Out of scope

- No publishing to GitHub (user does this manually).
- No changes to the original vault.
- No restructuring of the wiki beyond what scrubbing requires.

## Open risks

- `log.md` and the ADRs require careful rewriting so the genericized lesson still reads
  naturally — this is the main quality risk and gets human review.
- The whitelisted snapshots may contain identifiers not anticipated here; the light-scrub
  step inspects each file individually rather than relying on a fixed pattern list.
