# Decision Trees

This document provides opinionated routing for common technology decisions. Follow these defaults unless there is a specific, articulable reason not to. "I've heard good things about X" is not a reason. "The core loop requires a capability that only X provides" is.

## Platform

- **Web app (content-heavy, SEO matters):** Next.js with App Router
- **Web app (tool/dashboard, no SEO):** Next.js or plain Vite + React
- **Mobile app:** React Native + Expo (always, no exceptions for MVPs)
- **Cross-platform (web + mobile):** React Native + Expo with Expo Web, or separate Next.js web + RN mobile sharing a Supabase backend
- **CLI tool or script:** Node.js with TypeScript, or Python if ML/data-heavy
- **Agent automation:** Node.js with TypeScript (for MCP/tool-calling ecosystem compatibility)

## Database

- **Default:** Supabase (managed Postgres). Always start here.
- **Need spatial/geo queries:** Supabase + PostGIS extension. Do not reach for a separate geo service.
- **Need full-text search:** Postgres full-text search via Supabase. Do not add Elasticsearch or Algolia for an MVP.
- **Need vector search (embeddings):** Supabase pgvector extension. Only if the core loop is semantic search. Not "might be nice later."
- **Local-first or embedded:** SQLite via better-sqlite3 (Node) or expo-sqlite (React Native).
- **Need a simple key-value store:** Use a Postgres table with a `key` and `value` column. Do not introduce Redis for an MVP.

## Auth

- **Web app, standard users:** Supabase Auth. Magic link by default, add OAuth (Google, GitHub) only if the target user expects it.
- **Web3 wallet-based:** Privy. It handles embedded wallets so users don't need MetaMask. The Web3 layer should be invisible to the user.
- **Already deep in Next.js ecosystem with complex provider needs:** NextAuth (Auth.js). But Supabase Auth is almost always simpler.
- **Agent-to-agent or API auth:** API keys stored in environment variables. Use Supabase service role keys for backend-to-Supabase calls. Do not build a custom auth system.

## Hosting & Deployment

- **Next.js web app:** Vercel. Zero-config deploys from Git.
- **React Native mobile:** EAS (Expo Application Services) for builds and OTA updates.
- **Backend that needs a persistent process (cron, websockets, long-running):** Railway. Simple, Git-deploy, good DX.
- **Static site or landing page:** Vercel or Cloudflare Pages.
- **Need a quick API with no frontend:** Supabase Edge Functions or a Railway-deployed Express/Hono server.

## Storage

- **User-uploaded files (images, documents):** Supabase Storage. Integrates with RLS for access control.
- **Need decentralized/permanent storage:** Storacha (IPFS pinning). Use for content that benefits from immutability or decentralized access.
- **Large media (video):** Do not self-host. Use Mux, Cloudflare Stream, or just link to external hosting.

## Styling

- **Web:** Tailwind CSS. Always. Do not debate this.
- **React Native:** NativeWind (Tailwind for RN) or StyleSheet.create with a consistent spacing/color system. No CSS-in-JS libraries.
- **Component library (web):** shadcn/ui components as needed. They're copy-paste, not a dependency. Do not install a full component library like MUI or Chakra for an MVP.

## State Management

- **React (web):** useState and useContext for most MVPs. Reach for Zustand only when you have global state that multiple unrelated components need and prop-drilling becomes painful.
- **React Native:** Same as web, plus consider Zustand earlier because navigation makes prop-drilling worse.
- **Server state (data from API/DB):** TanStack Query (React Query) for caching and synchronization. Do not hand-roll fetch-and-setState patterns for anything beyond a single call.
- **Form state:** React Hook Form if forms are complex (multi-step, validation). Plain controlled inputs if the form is simple.
- **URL state:** Use URL search params for state that should survive page refresh or be shareable (filters, pagination, selected tabs). Next.js `useSearchParams` or `nuqs` library.

## Payments

- **Default:** Stripe. Checkout Sessions for one-time, Stripe Billing for subscriptions.
- **Crypto/Web3 payments:** Do not build this into an MVP unless payments ARE the core loop. If they are, use Coinbase Commerce or a simple smart contract interaction via wagmi/viem.

## Email & Notifications

- **Transactional email:** Resend. Simple API, good DX, reasonable free tier.
- **Push notifications (mobile):** Expo Notifications. Built into the Expo ecosystem.
- **Do not build** a notification preference center, email template system, or digest system for an MVP. Send the one email that matters.

## When to Deviate

You can deviate from these defaults when ALL of these are true:
1. You can articulate the specific capability the default lacks.
2. The missing capability is required by the core loop, not a future feature.
3. You've spent less than 30 minutes evaluating the alternative (if evaluation is taking longer, the default is probably fine).
