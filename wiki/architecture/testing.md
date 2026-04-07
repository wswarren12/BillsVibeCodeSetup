# Testing

## Decision Tree
- New feature? → BDD scenarios first, then Playwright e2e
- Bug fix? → BDD scenario reproducing the bug, then Playwright
- Pure function? → Vitest unit test
- API endpoint? → Playwright or Vitest
- Smart contract? → Hardhat / Foundry tests
- Mobile? → Detox for e2e

## Why
- BDD scenarios force you to define behavior before writing code — prevents scope creep
- Playwright is the best e2e framework — fast, reliable, great debugging tools
- Vitest is the best unit test runner — fast, ESM-native, compatible with Jest API
- Smart contracts need their own test tooling — Hardhat for Solidity, Foundry for speed
- Detox handles the complexity of mobile e2e (gestures, native modules, deep links)

## Testing Workflow
1. Write BDD scenarios (Given/When/Then)
2. Get approval on scenarios before implementing
3. Implement the feature
4. Write Playwright tests mapping to BDD scenarios
5. Run tests
6. Debug loop until green
7. Commit

## Patterns

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

### Playwright Test Mapping from BDD Scenarios

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

// Scenario: Failed purchase with declined card
test("user sees error with declined card", async ({ page }) => {
  // Given the user has items in their cart
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart"]');

  // And the user is on the checkout page
  await page.goto("/checkout");

  // When the user enters a declined card number
  await page.fill('[data-testid="card-number"]', "4000000000000002");
  await page.fill('[data-testid="card-expiry"]', "12/30");
  await page.fill('[data-testid="card-cvc"]', "123");

  // And the user clicks "Pay Now"
  await page.click('[data-testid="pay-button"]');

  // Then the user should see an error message
  await expect(page.locator('[data-testid="error-message"]')).toHaveText(
    "Payment declined"
  );
});
```

## Rules
- BDD scenarios BEFORE implementation — they define what "done" means
- Playwright tests AFTER implementation — they verify the behavior works
- Every feature needs both a happy path and an error path scenario
- Unit tests only for pure logic — don't unit test React components or API routes
- Don't mock databases — use a real test database (docker-compose makes this easy)
- Don't test implementation details — test behavior the user can see
- Use `data-testid` attributes for Playwright selectors — don't rely on CSS classes or text

## Sources
[To be populated via ingest]
