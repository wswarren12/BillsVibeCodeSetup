# Feature Development Workflow

8-step process for building new features. Every feature flows through this pipeline.

---

## Step 1: Brainstorm

- Explore the problem space with the user
- Propose 2-3 implementation approaches with tradeoffs
- Get explicit user approval before proceeding
- Check [[wiki/index]] for relevant existing patterns and decisions

## Step 2: Specify

- Write BDD Given/When/Then scenarios covering happy path and error paths
- Use Gherkin format (see example below)
- Scenarios become the contract — nothing ships without a matching scenario
- Get explicit user approval on scenarios before proceeding

## Step 3: Plan

- Derive an implementation plan directly from the approved scenarios
- Each scenario maps to one or more implementation tasks
- Identify dependencies between tasks
- Flag tasks that can be parallelized via subagents

## Step 4: Implement

- Execute the plan step by step
- Use subagents for independent tasks (e.g., component + API route in parallel)
- Follow the wiki stacks and architecture pages — check [[stacks/web]], [[stacks/mobile]], [[architecture/auth]], etc.
- Consult [[wiki/decisions/TEMPLATE]] format if a significant decision arises

## Step 5: Test

- Write Playwright e2e tests directly from the BDD scenarios
- Each Given/When/Then scenario becomes one test case
- Run the tests — they should pass on first try if implementation matches spec

## Step 6: Debug

- If any test fails: diagnose the root cause, fix, re-test
- Loop until all scenario tests are green
- Then run the full test suite to catch regressions
- If full suite fails, repeat the diagnose-fix-retest loop

## Step 7: Review

- Check implementation against wiki patterns and ADRs
- Verify it follows the correct stack page conventions
- Confirm no architecture decision trees were violated
- Look for anything that should be recorded

## Step 8: Record

- Update wiki pages if the feature introduced new patterns
- Create an ADR (using [[decisions/TEMPLATE]]) if a significant architectural decision was made
- Update [[wiki/index]] if new pages were created
- Append to [[wiki/log]] with date, operation, and pages affected

---

## BDD Scenario Example: User Registration

```gherkin
Feature: User Registration

  Scenario: Successful registration with valid credentials
    Given the user is on the registration page
    And no account exists for "alice@example.com"
    When the user enters "alice@example.com" as email
    And the user enters "SecureP@ss1" as password
    And the user clicks "Create Account"
    Then the user should see the onboarding dashboard
    And a verification email should be sent to "alice@example.com"
    And the user record should exist in the database

  Scenario: Registration fails with existing email
    Given the user is on the registration page
    And an account already exists for "alice@example.com"
    When the user enters "alice@example.com" as email
    And the user enters "SecureP@ss1" as password
    And the user clicks "Create Account"
    Then the user should see an error "An account with this email already exists"
    And no new user record should be created

  Scenario: Registration fails with weak password
    Given the user is on the registration page
    When the user enters "alice@example.com" as email
    And the user enters "123" as password
    And the user clicks "Create Account"
    Then the user should see an error "Password must be at least 8 characters"
    And no new user record should be created

  Scenario: Registration fails with invalid email format
    Given the user is on the registration page
    When the user enters "not-an-email" as email
    And the user enters "SecureP@ss1" as password
    And the user clicks "Create Account"
    Then the user should see an error "Please enter a valid email address"
    And no new user record should be created
```
