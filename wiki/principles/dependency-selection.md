---
description: "How to evaluate whether a dependency earns its place in an MVP."
---

Status: Active

# Dependency Selection Heuristic

This document defines how to evaluate whether to add a dependency to an MVP. Every dependency is a liability — it's code you don't control that can break, go unmaintained, or introduce security vulnerabilities. The bar for inclusion should be higher than "it looks useful."

## The Default Answer Is No

Before adding a package, ask: can I accomplish this with what I already have? Supabase, React/React Native, and the standard library handle an enormous range of functionality. A 20-line utility function you write and understand is almost always better than a dependency you don't.

## When to Add a Dependency

Add a dependency when ALL of these are true:

1. **It solves a genuinely hard problem** that would take more than a day to implement yourself. Date handling (date-fns), animation (Reanimated), map rendering (react-native-maps) — these are legitimately complex.
2. **It's actively maintained.** At least one commit in the last 90 days. A release in the last 6 months. Open issues are being triaged. If the last commit was a year ago, it's effectively abandonware.
3. **It has meaningful adoption.** More than 1,000 weekly npm downloads and more than 500 GitHub stars for niche libraries; more than 10,000 weekly downloads for general-purpose ones. Adoption means bugs are found and fixed by other people.
4. **It has TypeScript types.** Either built-in or via DefinitelyTyped. Untyped dependencies in a TypeScript project create a constant source of friction.
5. **It doesn't pull in a massive dependency tree.** Check `npm pack --dry-run` or bundlephobia.com. A library that adds 500KB to your bundle for a feature you use in one place is not worth it.

## Preferred Libraries by Category

These are pre-approved. If one of these solves your problem, use it without further evaluation:

- **Date/time:** date-fns (not moment, not luxon)
- **HTTP client:** Built-in fetch (not axios)
- **Schema validation:** Zod
- **State management:** Zustand (if needed beyond useState)
- **Server state:** TanStack Query
- **Forms:** React Hook Form (if complex forms)
- **Icons:** Lucide React
- **Animation (web):** Framer Motion
- **Animation (RN):** Reanimated + Gesture Handler
- **Maps (RN):** react-native-maps
- **Maps (web):** Mapbox GL JS or react-map-gl
- **Markdown rendering:** react-markdown
- **CSV/data parsing:** Papaparse
- **Crypto/Web3:** wagmi + viem (if needed), Privy SDK

## Red Flags

Do not use a dependency if any of these are true:

- **No TypeScript support.** Life is too short.
- **Requires ejecting from Expo.** If a React Native library requires native module linking that Expo doesn't support, find an alternative or use an Expo-compatible fork. Ejecting from Expo for an MVP is never justified.
- **It's a wrapper around a wrapper.** If library A wraps library B which wraps a browser API, just use the browser API directly.
- **The README has more marketing than documentation.** Libraries that spend more words on "why" than "how" are often underbaked.
- **It solves a problem you don't have yet.** "This will be useful when we scale" means you don't need it now.

## Vendoring vs. Installing

For very small utilities (a single function or a few hundred lines), consider vendoring: copy the code into your `lib/` folder rather than adding a dependency. This is appropriate when:

- The library is a single file with no dependencies of its own
- You only need one function from a larger library
- The library is unmaintained but the code is solid

When you vendor, add a comment with the source and version:

```typescript
// Vendored from lodash.debounce@4.0.8
// https://github.com/lodash/lodash/blob/4.0.8/lodash.js#L10304
export function debounce(func: Function, wait: number) { ... }
```

## Lock Files

Always commit your lock file (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`). It ensures that every environment (local, CI, production, coding agent) installs the exact same versions. An MVP that works on your machine but fails in production because of a transitive dependency update is a waste of a day.

## Related

- [[principles/mvp-philosophy]]
- [[principles/anti-patterns]]

## Sources

- [[raw/articles/vibes-knowledge-base/10-dependency-selection]]
