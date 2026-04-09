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
