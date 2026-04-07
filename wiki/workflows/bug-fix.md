# Bug Fix Workflow

5-step process for fixing bugs. Prioritize correctness over speed — never refactor during a bug fix.

---

## Step 1: Reproduce

- Write a BDD scenario that describes the bug (Given/When/Then)
- Create a Playwright test that demonstrates the failure
- The test must fail before you proceed — if it passes, you misunderstood the bug
- This test becomes the regression guard

## Step 2: Diagnose

- Trace the root cause starting from the failing test
- Check [[index]] for known patterns that might be relevant
- Review related [[decisions/TEMPLATE|ADRs]] for context on past architectural choices
- Identify the minimal surface area of the bug

## Step 3: Fix

- Make the smallest change that fixes the bug
- Do not refactor adjacent code — that is a separate task
- Do not add features — that is a separate task
- If the fix requires an architectural change, stop and create an ADR first

## Step 4: Test

- Run the reproduction test from Step 1 — it must pass
- Run the full test suite to catch regressions
- If anything fails, loop back through diagnose-fix-retest until green
- Do not merge with any failing tests

## Step 5: Record

- If the bug revealed a pattern (e.g., "always validate X before Y"), update the relevant wiki page
- If a significant decision was made during the fix, create an ADR using [[decisions/TEMPLATE]]
- Append to [[log]] with date, operation, and pages affected
