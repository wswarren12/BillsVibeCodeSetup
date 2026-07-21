# Lesson Capture Workflow

Turn every unexpected problem into a permanent, findable wiki entry so it is never hit twice. This workflow runs **after** the problem is resolved — it records the lesson; it does not replace the Bug Fix workflow.

---

## Triggers

Run this workflow whenever any of the following happens in a session:

1. **Self-discovered error** — Claude finds a mistake in its own prior work (wrong assumption, broken code it wrote, incorrect config).
2. **Workaround required** — the obvious/documented approach didn't work and a non-obvious alternative was needed.
3. **Surprising behavior** — a tool, library, API, or platform behaved in an undocumented or counterintuitive way.
4. **User-reported breakage** — the user says something is broken, erroring, or not working. Fix it first (Bug Fix workflow), then run this.

**Does NOT qualify:** trivial slip-ups with no reusable lesson — typos, wrong paths, forgotten flags that error clearly and are fixed in seconds. If the error message alone was enough to fix it, there is no lesson to capture.

## Steps

### 1. Resolve first
Fix the problem completely before recording anything. For user-reported bugs, follow the Bug Fix workflow (reproduce → diagnose → fix → test). Never record an unverified fix.

### 2. Locate the owning page
Search the wiki (`kb_search`) for the page that owns this topic — stack, architecture, pattern, or project page.

- **Prefer updating an existing page.** Add to (or create) a **Gotchas** or **Rules** section on it. Precedent: `wiki/architecture/payments.md` "Gotchas (production-learned)".
- **Only create a new page** (usually under `wiki/patterns/`) if no existing page plausibly owns the topic.
- **Project-specific lessons** with no general value go on the project's page under `wiki/projects/`.
- **Security vulnerabilities have a dedicated home:** findings from security reviews (and any security-relevant lesson) go to `wiki/architecture/security-findings.md` under the matching category, using its finding format — not scattered across topic pages.

### 3. Dedup check (hard gate)
Before writing anything, search for the lesson itself, not just the topic: `kb_search` the symptom and the error message, and read the owning page's existing Gotchas/Rules.

- **Already recorded, nothing new** — do NOT add a duplicate. Stop here; no index/log updates. (If the existing entry failed to prevent a repeat, that is itself a lesson — consider whether the entry needs a sharper prevention rule, which is the "refine" case below.)
- **Already recorded, but incomplete or stale** — refine the existing entry in place (better root cause, sharper prevention rule, new variant of the symptom). Log the refinement in Step 6.
- **Genuinely new** — proceed to Step 4.

One canonical entry per lesson. Never record the same gotcha on two pages — if a second page needs it, link to the canonical entry instead.

### 4. Record the lesson
Write the entry with all four parts:

- **Symptom** — the observable failure (exact error message/code where useful).
- **Root cause** — what was actually wrong, not just what made it stop.
- **Resolution** — the fix or workaround that worked.
- **Prevention rule** — the forward-looking rule that avoids it next time, phrased as an instruction a future session can follow.

### 5. Index
If a new page was created, add it to `wiki/index.md` in the right section. If an existing page gained a materially new scope (like payments gaining a Gotchas section), update its one-line index description.

### 6. Log
Append a timestamped entry to `wiki/log.md`: what happened, which page was updated, and why it matters. Then record the operation via `kb_log` (operation: `ingest`, details: page + lesson summary).

## Rules

- A fix without a recorded lesson is **incomplete work** — the session is not done until Steps 2–5 are complete.
- Capture the lesson in the same session it was learned. Context evaporates.
- One lesson per entry; if a debugging session surfaced three distinct gotchas, record three.
- Never modify `raw/` (vault rule 1); lessons go directly into wiki pages.
