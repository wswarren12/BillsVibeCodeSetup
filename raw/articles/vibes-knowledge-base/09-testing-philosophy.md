# Testing Philosophy

This document defines what to test in an MVP and — equally important — what not to test yet. The goal is confidence that the core loop works, not coverage metrics.

## The MVP Testing Pyramid (Inverted)

The traditional testing pyramid says lots of unit tests, fewer integration tests, fewest E2E tests. For MVPs, invert it:

1. **A handful of E2E tests for the critical path** — the one user journey that IS the product.
2. **Integration tests for data mutations** — writes to the database that would be painful to debug if broken.
3. **Unit tests only for genuinely tricky logic** — math, parsing, state machines. Not for components that render a div.

The reasoning: in an MVP, the interfaces between things break more often than the things themselves. A component renders correctly in isolation but breaks when the API returns a different shape. An E2E test catches this; a unit test doesn't.

## What to Test

**The critical happy path.** Identify the single most important user journey in the product. For a location-based app: open app → see map → tap to create trace → fill in details → save → see trace on map. Write one E2E test that walks through this. If this test passes, the product works.

**Auth flow.** Login and session persistence. Not every edge case — just: can a user log in, and are they still logged in when they refresh? This is the second most common source of bugs.

**Data mutations that would be hard to undo.** If a function writes to the database in a way that would be painful to fix manually (creating records, modifying state), write a test for it. Reads are less critical because a broken read is immediately visible in the UI.

**Tricky business logic.** If you have a function that calculates distance, parses a date, or implements a scoring algorithm, unit test it. These are pure functions with clear inputs and outputs — easy to test, high value.

## What Not to Test Yet

**Component rendering.** Do not write tests that assert a component renders the right text. You can see that by looking at the screen. Save snapshot tests for design systems, not MVPs.

**Styling and layout.** Visual regression testing is expensive to set up and maintain. For an MVP, use your eyes.

**Third-party integrations.** Do not mock Supabase or Stripe to test your wrappers around them. If Supabase's `.insert()` works (it does — they test it), your wrapper's test is just testing that you called it correctly, which you can verify by running the app.

**Edge cases you haven't seen yet.** Do not write tests for hypothetical failures. When a bug appears in production, write a test for it then. This is test-driven-by-reality, not test-driven-by-imagination.

**Admin or settings flows.** These are low-traffic, low-risk, and you'll change them frequently. Test them manually.

## Tooling

**E2E: Playwright (web) or Detox (React Native).** Playwright is fast to set up for Next.js apps. Detox is heavier but necessary for real device testing on mobile. For a mobile MVP, manual testing on a real device is acceptable if E2E setup feels too heavy.

**Integration/Unit: Vitest.** Drop-in replacement for Jest with better speed and ESM support. Use it for any non-E2E tests.

**Do not set up:** Cypress (Playwright is better), Enzyme (dead), Testing Library for simple components (overkill for MVPs), Storybook (build it later when your component library stabilizes).

## The One Rule

If you're unsure whether to write a test, ask: "If this broke silently, would I notice within a day from normal usage?" If yes, don't test it — you'll catch it. If no — it's a background process, a data migration, an async operation — test it.
