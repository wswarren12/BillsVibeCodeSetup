---
description: "The constitution. Every other wiki page defers to this."
---

Status: Active

# MVP Philosophy

This document defines the architectural worldview for every project built with this system. When in doubt, defer to these principles.

## Core Belief

An MVP is not a worse version of the final product. It is the smallest thing that tests whether the core idea works. Everything else — scale, polish, abstraction — is earned by proving the core loop first.

## Principles

### Ship the Core Loop First

Every product has one thing it fundamentally does. A location-based storytelling app places content on a map. A chore tracker assigns and rewards tasks. An agent automation tool executes a plan and reports results. Build that loop — input to output — before touching anything else. Auth, onboarding, settings pages, admin panels: none of these matter if the core loop doesn't work or doesn't feel right.

### Monolith Until It Hurts

Start with one codebase, one database, one deploy target. No microservices. No separate API repo. No event bus. A Supabase project with Edge Functions, or a Next.js app with API routes, is almost always sufficient for an MVP. You will never hit the scale ceiling that justifies microservices during validation. If you think you will, you're wrong.

### One Database, One Schema

Use Postgres (via Supabase) as the single source of truth. Do not introduce Redis, a separate analytics DB, or a vector store unless the core loop literally cannot function without it. Postgres with its JSON columns, full-text search, and PostGIS extension handles more use cases than most people realize.

### Managed Services Over Self-Hosted

Every hour spent configuring infrastructure is an hour not spent on the product. Use Supabase, Vercel, EAS, Railway. Pay for managed services. The cost is trivial compared to the time cost of debugging a Docker Compose file at 11pm.

### Premature Abstraction Is the Enemy

Do not create a generic `BaseService` class. Do not build a plugin system. Do not write a "flexible" config layer. Write the specific thing for the specific use case. When — and only when — you build the second thing that looks similar, extract the shared pattern. Two concrete implementations teach you what the abstraction should look like. One implementation teaches you nothing.

### Resist the Urge to Over-Model

Your first database schema will be wrong. Design for the current requirements, not imagined future ones. Use fewer tables with slightly denormalized data rather than a perfectly normalized schema with twelve join tables. You can refactor a schema. You cannot get back the week you spent designing one that anticipated requirements that never materialized.

### Auth Comes After the Core Loop

The first version of most products can use a hardcoded user or a simple magic link. Do not spend three days integrating OAuth providers before you know whether the product idea works. Exception: if auth IS the core loop (identity products, access control tools), obviously build it first.

### Deploy From Day One

The app should be deployed and accessible via URL or TestFlight from the first day of development. Not "deployed when it's ready" — deployed immediately, even if it's a blank screen with a title. Continuous deployment removes the anxiety of "will it work in production" and forces you to keep the build passing.

### Delete Code Freely

Code that was written to test an idea and is no longer needed should be deleted, not commented out. Git remembers. Dead code confuses future you and confuses coding agents. If a feature didn't work out, remove it entirely.

### Scope Is the Only Lever That Matters

When a project is taking too long, the answer is always to cut scope. Not to work faster, not to add more tools, not to parallelize. Cut a feature. Simplify a screen. Replace a custom component with a default. The MVP that ships with three features beats the one that ships with seven features next month.

## Related

- [[principles/anti-patterns]]
- [[principles/dependency-selection]]

## Sources

- [[raw/articles/vibes-knowledge-base/01-mvp-philosophy]]
