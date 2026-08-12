# Testing

> **The goal is confidence that the core loop works, not coverage metrics.** Test the critical path end-to-end, test data mutations that are painful to undo, test genuinely tricky logic. Skip everything else until you have a reason to care.

## The MVP Testing Pyramid (Inverted)

The traditional pyramid says lots of unit tests, fewer integration tests, fewest E2E tests. **For MVPs, invert it:**

1. **A handful of E2E tests for the critical path** — the one user journey that IS the product.
2. **Integration tests for data mutations** — writes to the database that would be painful to debug if broken.
3. **Unit tests only for genuinely tricky logic** — math, parsing, state machines. Not components that render a div.

**Why:** In an MVP, interfaces between things break more often than the things themselves. A component renders correctly in isolation but breaks when the API returns a different shape. E2E tests catch this; unit tests don't.

## Decision Tree

- **New feature?** → BDD scenarios first, then Playwright E2E for the happy path + one error path
- **Bug fix?** → BDD scenario reproducing the bug, then Playwright test that would have caught it
- **Pure function (math, parsing, scoring)?** → Vitest unit test
- **Data mutation (insert/update/delete)?** → Vitest integration test against a real test database
- **Webhook receiver?** → Vitest integration test with a mock payload
- **Smart contract?** → Hardhat or Foundry tests
- **Mobile E2E?** → Detox (or manual on a real device if Detox setup feels too heavy for your MVP)
- **Styling, layout, snapshot of a div?** → Don't test it. Use your eyes.

## The BDD-to-Playwright Workflow

Features and bug fixes start as BDD scenarios (Given/When/Then) BEFORE any code is written. This forces you to define "done" in user-visible terms instead of implementation details.

1. Write BDD scenarios
2. Get approval on the scenarios (a single-line "looks right" from the user is enough)
3. Implement the feature
4. Write Playwright tests that map 1:1 to the BDD scenarios
5. Run tests → debug → green → commit

**Every feature needs a happy path and at least one error path.** If the only scenario you can think of is the happy path, you haven't thought about the feature hard enough yet.

### BDD Scenario Format (Gherkin-style)

```gherkin
Feature: User checkout

  Scenario: Successful purchase with valid card
    Given the user has items in their cart
    And the user is on the checkout page
    When the user enters valid payment details
    And the user clicks "Pay Now"
    Then the order should be created
    And the user should see a confirmation page
    And the user should receive a confirmation email

  Scenario: Failed purchase with declined card
    Given the user has items in their cart
    And the user is on the checkout page
    When the user enters a declined card number
    And the user clicks "Pay Now"
    Then the user should see an error message "Payment declined"
    And no order should be created
```

### Playwright Test Mapping

```typescript
import { test, expect } from "@playwright/test";

// Scenario: Successful purchase with valid card
test("user can complete checkout with valid card", async ({ page }) => {
  // Given the user has items in their cart
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart"]');

  // And the user is on the checkout page
  await page.goto("/checkout");

  // When the user enters valid payment details
  await page.fill('[data-testid="card-number"]', "4242424242424242");
  await page.fill('[data-testid="card-expiry"]', "12/30");
  await page.fill('[data-testid="card-cvc"]', "123");

  // And the user clicks "Pay Now"
  await page.click('[data-testid="pay-button"]');

  // Then the user should see a confirmation page
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.locator('[data-testid="order-status"]')).toHaveText(
    "Order confirmed"
  );
});
```

## What to Test

- **The critical happy path.** The single most important user journey. If this test passes, the product works. For a location-based app: open → see map → tap → fill in details → save → see trace. One E2E test.
- **Auth flow.** Login and session persistence. Can the user log in? Are they still logged in after refresh? Second most common bug source.
- **Data mutations that would be hard to undo.** Functions that write to the DB in ways that would be painful to fix manually. Reads are less critical — you see broken reads immediately.
- **Tricky business logic.** Distance calculations, date parsing, scoring algorithms. Pure functions with clear inputs and outputs. Easy to test, high value.

## What NOT to Test Yet

- **Component rendering.** Don't write tests that assert a component renders the right text. You can see that by looking at the screen. Save snapshot tests for design systems, not MVPs.
- **Styling and layout.** Visual regression testing is expensive to set up and maintain. Use your eyes.
- **Third-party integrations.** Don't mock Supabase or Stripe to test your wrappers around them. If `.insert()` works (it does — they test it), your wrapper's test is just verifying you called it correctly, which you can verify by running the app.
- **Edge cases you haven't seen yet.** Don't write tests for hypothetical failures. When a bug appears in production, write a test for it then. Test-driven-by-reality, not test-driven-by-imagination.
- **Admin or settings flows.** Low-traffic, low-risk, change frequently. Test them manually.

## Tooling

- **E2E (web):** Playwright. Fast setup, great debugging tools, reliable.
- **E2E (mobile):** Detox for React Native. Heavy but necessary for real-device testing. Manual testing on a real device is acceptable for a mobile MVP if Detox setup feels too heavy.
- **Unit/integration:** Vitest. Drop-in Jest replacement with better speed and native ESM.
- **Smart contracts:** Hardhat (Solidity-native) or Foundry (faster, Rust-based tooling).

### Do Not Set Up

- **Cypress** — Playwright is better.
- **Enzyme** — dead.
- **Testing Library for simple components** — overkill for MVPs.
- **Storybook** — build it later when your component library stabilizes.

## Rules

- **BDD scenarios BEFORE implementation** — they define what "done" means.
- **Playwright tests AFTER implementation** — they verify the behavior works.
- **Don't mock databases.** Use a real test database (docker-compose or a Supabase test project).
- **Don't test implementation details.** Test behavior the user can see.
- **Use `data-testid` attributes** for Playwright selectors. Don't rely on CSS classes or text content.
- **External-SSO identity → env-gated test shim.** When auth comes from a platform cookie you can't mint locally, add a dev-only identity shim so the full authorization matrix runs in unit + E2E tests. Canonical pattern: [[patterns/pln-ai-apps]].

## Gotchas

### Playwright `reuseExistingServer` silently tests a stale build (2026-07)

- **Symptom:** an E2E suite that passed keeps failing after a code fix — or fails in ways matching *already-fixed* bugs; the run seems slow/hung; failures make no sense against current source.
- **Root cause:** `webServer.reuseExistingServer: true` makes Playwright adopt *anything* already listening on the port. A leftover server from a manual debugging session (started before the fix, with old `.next` output and a warm in-memory store) answered the health URL, so the entire suite ran against the outdated build.
- **Resolution:** kill the stale process (`lsof -iTCP:<port> -sTCP:LISTEN`), rerun — suite went from broadly failing to fully green.
- **Prevention rule:** when using `reuseExistingServer: true` locally, verify what owns the port before every debugging-session rerun, and always kill ad-hoc servers you start on the test port (start probes on a *different* port). If E2E failures contradict a fix you just made and verified, suspect the server build before the code.
- **Variant (2026-07):** the stale artifact can be the *build*, not the server. `git stash` → `npm run build` (to baseline-test) → `git stash pop` leaves `.next` compiled from the stashed tree; the next `playwright test` starts a *fresh* server that serves the old build, so new tests fail on missing testids. After any stash/checkout dance that touched source, rebuild before rerunning E2E — the failure signature is "exactly the tests exercising new UI fail; API/unit tests pass".

### Vitest run from the wrong cwd: "Cannot find package '@/…'" looks like broken aliases (2026-08)

- **Symptom:** `npx vitest run tests/…/file.test.ts` fails with `Error: Cannot find package '@/lib/…'` (Node's bare-specifier phrasing) on imports that resolved fine earlier the same session; switching one import to a relative path just moves the error one level deeper into the module graph. Easy to misread as a broken/new-file alias problem and burn cycles on cache-clearing and path experiments.
- **Root cause:** the shell's persistent working directory had drifted to the repo root (a `cd repoRoot && git …` in an earlier command). From there vitest still *finds and runs* the nested app's test file (path arg resolves, config discovered oddly), but the `vitest.config.ts` `resolve.alias` never applies, so every `@/` specifier falls through to Node as a bare package. The tell: file labels in output show an unexpected prefix (`app/tests/…` instead of `tests/…`), and a control run of a previously-green suite now fails identically.
- **Resolution:** re-run from the package dir (`cd <app> && npx vitest run …`) — everything passes unchanged.
- **Prevention rule:** when alias imports "suddenly" stop resolving, first re-run a suite that was green earlier — if it now fails too, suspect environment (cwd, node version), not the new code. Check the path prefix on the FAIL line before touching config or imports. In agent shells, prefer `cd <pkg> && <cmd>` in the same compound command over relying on cwd persistence.

### Reopening a Radix Dialog/Drawer mid-close-animation is dropped → flaky E2E (2026-07)

- **Symptom:** a Playwright test presses `Escape` (or otherwise closes a Radix Dialog/Drawer) and immediately re-triggers it open, then asserts on the reopened content. Fails intermittently (~50–65% without retries) with "element(s) not found"; passes on retry. The network shows the reopen's data fetch *succeeding*, so the data path is fine — only the dialog content never becomes visible.
- **Root cause:** the drawer has an exit animation (e.g. `slideOutRight 200ms` on `[data-state='closed']`). Radix keeps the content mounted during that animation; a reopen dispatched inside the ~200ms exit window gets swallowed by the presence/animation machinery, so `data-state` never returns to `open`.
- **Resolution:** wait for the close to finish before reopening — assert the drawer's own body testid is hidden first: `await expect(page.getByTestId('share-panel')).toBeHidden();` then click the trigger again. Deterministic (25/25 with `--repeat-each=5 --retries=0`).
- **Prevention rule:** never chain close→immediate-reopen of an animated Radix overlay in a test (or product code) without waiting for the exit to complete. A succeeding data fetch on reopen while the element stays "not found" is the tell — suspect the animation race, not the fetch. Diagnose from the trace's network log (fetch 200 = data fine) + `error-context.md` snapshot (drawer shown closed).

### Open Radix modal makes background elements invisible to `getByRole` (2026-07)

- **Symptom:** with a Radix modal Dialog/Drawer open, `page.getByRole('button', { name: 'X' }).click()` on an element *outside* the overlay (e.g. a nav-bar avatar) times out with "waiting for getByRole(...)" — the locator never resolves, so the click is never attempted. A CSS/testid locator for the same element finds it (`count() === 1`).
- **Root cause:** modal Radix overlays set `aria-hidden="true"` on the rest of the page (the sibling subtrees, including the whole `<header>`). Playwright's role-based locators query the accessibility tree, which excludes `aria-hidden` subtrees — so the element exists and is visually present but is unmatchable *by role*. Deadlock: the by-role click that would have dismissed the overlay can't run because the overlay hides its target.
- **Resolution:** close the overlay first (`Escape` + `await expect(drawerBody).toBeHidden()`), then interact with the background element by role.
- **Prevention rule:** in E2E flows, never target background page chrome with `getByRole` while a modal overlay is open — close it first. Diagnostic tell: `getByRole` count 0 but `[aria-label=...]`/testid count 1 → an ancestor is `aria-hidden`, not a missing element. Such a test can look "passing" historically and then break; treat it as broken by design.

## The One Rule

If you're unsure whether to write a test, ask:

> "If this broke silently, would I notice within a day from normal usage?"

- **Yes** → don't test it, you'll catch it naturally
- **No** → it's a background process, a data migration, an async operation — **test it**

## Related

- [[workflows/feature-dev]] — Where BDD scenarios fit in the 8-step pipeline
- [[principles/mvp-philosophy]] — Why shipping beats coverage metrics
- [[principles/anti-patterns]] — Gold-plating error handling is the same trap as over-testing

## Sources

- [[raw/articles/vibes-knowledge-base/09-testing-philosophy]]
