# Anti-Patterns

This document catalogs recurring mistakes in MVP development. When the coding agent is about to do any of these things, it should stop and reconsider.

## Premature Microservices

**The pattern:** Splitting the app into separate services (auth service, API gateway, notification service, worker service) before the product has users.

**Why it happens:** It feels like good engineering. Articles and conference talks describe microservices as best practice. The developer imagines future scale and tries to build for it.

**Why it's wrong for MVPs:** Microservices multiply operational complexity — you now have deployment coordination, service discovery, distributed debugging, and network latency between things that could be function calls. A monolith with clear module boundaries gives you all the separation you need and can be decomposed later when you actually understand the service boundaries from real usage patterns.

**The fix:** One codebase, one database, one deploy target. Always.

## Over-Abstraction Before the Second Use Case

**The pattern:** Building a generic, configurable system when you only have one concrete use case. A "flexible notification framework" when you need to send one type of email. A "plugin architecture" when you have zero plugins.

**Why it happens:** Developers pattern-match from past experience and abstract preemptively. "I'll need this to be flexible later."

**Why it's wrong for MVPs:** Abstractions built from one example are almost always wrong. They encode assumptions about variation that don't match reality. When the second use case arrives, you end up fighting the abstraction instead of using it.

**The fix:** Write the specific thing. When you build the second similar thing, notice what they share. Extract the abstraction from two concrete implementations. This gives you an abstraction shaped by reality, not imagination.

## Auth Before Core Loop

**The pattern:** Spending the first three days integrating OAuth providers, building a profile page, and handling session edge cases before the product's main feature works.

**Why it happens:** Auth feels foundational. "Users need to log in before they can do anything."

**Why it's wrong for MVPs:** You can test the core loop with a hardcoded user ID. Auth is important but it's a solved problem (Supabase Auth, Privy) — it takes an afternoon, not a week. Spending a week on auth before validating the core idea means you might build a beautiful login flow for a product nobody wants.

**The fix:** Hardcode a user for the first iteration. Add real auth when you're ready for other people to use it.

## Building Admin Panels

**The pattern:** Building a custom admin interface to manage users, view analytics, moderate content, or configure the app.

**Why it happens:** The developer wants visibility into what's happening in the system. It feels irresponsible not to have tools for managing the product.

**Why it's wrong for MVPs:** Admin panels are full applications unto themselves — forms, tables, pagination, role-based access. They easily consume a week or more of development time. For an MVP with 0-100 users, you have better options.

**The fix:** Use the Supabase dashboard for data management. Use SQL queries in the SQL editor for ad-hoc analysis. Use Supabase's built-in auth management for user administration. Build an admin panel only when the Supabase dashboard genuinely can't do what you need.

## Choosing a Database for Scale You Won't Hit

**The pattern:** Choosing ScyllaDB, CockroachDB, or a multi-region distributed database because "what if we get a million users?"

**Why it happens:** Optimism about growth combined with fear of migration.

**Why it's wrong for MVPs:** A single Postgres instance on Supabase handles thousands of concurrent users with properly indexed queries. You will not outgrow it during the MVP phase. If you do, that's the best problem you could possibly have, and you'll have revenue to fund the migration.

**The fix:** Supabase Postgres. Index your common queries. Revisit when you actually have performance problems, not when you imagine them.

## Designing a Perfect Schema Upfront

**The pattern:** Spending days modeling the database with entity-relationship diagrams, normalization analysis, and anticipating every future feature's data needs.

**Why it happens:** Schemas feel permanent. "If I get this wrong, I'll have to migrate data."

**Why it's wrong for MVPs:** You don't know what the product needs until users touch it. The schema will change. Migrations exist for exactly this purpose. A "wrong" schema that ships today teaches you more than a "perfect" schema that ships next month.

**The fix:** Model what you need for the core loop. Use JSONB columns for parts you're unsure about. Add migrations as you learn. Postgres makes schema changes cheap.

## Gold-Plating Error Handling

**The pattern:** Building elaborate error boundaries, retry logic, fallback UIs, error logging services, and user-facing error messages for every possible failure mode before the product launches.

**Why it happens:** Professional pride. Nobody wants to ship something that crashes unceremoniously.

**Why it's wrong for MVPs:** Most error paths will never be hit. You're writing code for scenarios that haven't happened and may never happen. Meanwhile, the happy path — the thing users will actually do — gets less attention.

**The fix:** Handle errors at the data layer (throw so TanStack Query catches them). Show a generic error message in the UI. Add specific error handling only for errors you actually see in testing or early usage.

## Multiple State Management Libraries

**The pattern:** Using Redux for global state, React Query for server state, Context for theme, Recoil for shared component state, and local state for forms. Five state management paradigms in one app.

**Why it happens:** Each library was added to solve a specific problem at a specific time. Nobody stepped back to assess the total complexity.

**Why it's wrong for MVPs:** Cognitive overhead for the developer (and the coding agent). Data lives in multiple places. Bugs arise from state synchronization between systems.

**The fix:** useState + TanStack Query covers 90% of MVP needs. Add Zustand if and only if you have global client state that multiple unrelated components need. Two systems maximum.

## Premature Performance Optimization

**The pattern:** Implementing code splitting, lazy loading, memo-izing every component, virtualizing lists, and adding CDN caching before the app has traffic.

**Why it happens:** Lighthouse scores. Blog posts about "10x your performance." Fear that slow === bad.

**Why it's wrong for MVPs:** Performance optimization is about tradeoffs — you spend developer time and add code complexity to save user time. With few users, the developer time cost is high and the user time saved is near zero.

**The fix:** Ship the obvious implementation. Profile if users report slowness. Optimize the specific bottleneck, not the whole app. React's default rendering is fast enough for most MVPs.

## The Summary Heuristic

When you're about to build something, ask: "Is this serving the core loop, or is it serving my anxiety about the future?" If it's the latter, skip it. The future will arrive with specific, concrete requirements that are easier to address than the vague ones you're imagining now.
