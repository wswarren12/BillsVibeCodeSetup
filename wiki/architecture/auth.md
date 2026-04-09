# Auth

## Decision Tree

- **Web or mobile app (mainstream consumers)?** → Supabase Auth with magic link
- **Web3 or wallet login required?** → [[decisions/adr-002-privy-web3-auth|Privy]] (embedded wallet behind standard email/social login)
- **Mobile (Expo)?** → Supabase Auth via the Expo adapter
- **Agent or service-to-service?** → API key (bearer token)
- **Need both wallet and email in one flow?** → Privy (it does hybrid natively)

## Default: Magic Link Auth

For almost every MVP, start with magic link. No passwords, no "forgot password" flow, no concern about password strength.

- User enters email
- Supabase sends a link
- User clicks it, they're in

Add OAuth (Google, GitHub) only when:
- Your target users expect it (dev tools → GitHub, consumer apps → Google)
- You need profile data from the provider (avatar, display name)

## Session Handling

Don't build custom session management. Supabase's client library manages sessions via cookies and localStorage automatically.

```typescript
// In your root layout or auth provider
const { data: { session } } = await supabase.auth.getSession();
if (!session) redirect('/login');
```

For the production tier (Next.js App Router), use the `@supabase/ssr` helpers for cookie-based session handling in Server Components.

## Web3 Auth with Privy

Privy is the default when the app has any Web3 surface area (on-chain attestations, token-gated content, NFT drops) AND targets mainstream users who are not crypto-native.

- Privy creates an embedded wallet silently during standard email/social login
- Users never see "connect wallet" unless you want them to
- After Privy auth, sync the user to your Supabase `profiles` table via a webhook or Edge Function
- **Privy is the auth layer; Supabase is the data layer.** Don't try to make Supabase your wallet provider, and don't try to make Privy your database.

See [[decisions/adr-002-privy-web3-auth]] for the full rationale.

## Authorization

Authentication tells you WHO the user is. Authorization tells you WHAT they can do. For Supabase-backed apps, authorization lives in Row-Level Security (RLS) policies, not in application code.

See [[architecture/security#row-level-security]] and [[patterns/data-modeling]] for RLS patterns.

**The two RLS policies you need for 90% of MVPs:**
1. Users can only access their own rows (`auth.uid() = user_id`)
2. Some data is public to read, private to write (separate `SELECT` and `INSERT/UPDATE` policies)

## Anti-patterns

- **Don't roll your own auth.** You will get it wrong. This is the single most dangerous place to reinvent wheels.
- **Don't use NextAuth / Auth.js.** Config-heavy, fragile session handling, historically poorly maintained.
- **Don't use RainbowKit / ConnectKit for consumer Web3 apps.** Wallet-only, no hybrid auth story. Fine for crypto-native DeFi apps, wrong for mainstream products.
- **Don't build a custom admin panel to manage users.** Use the Supabase dashboard. See [[principles/anti-patterns#building-admin-panels]].
- **Don't build auth before the core loop works.** Hardcode a user ID for the first iteration. See [[principles/anti-patterns#auth-before-core-loop]].
- **Don't implement 2FA for an MVP** unless your product handles financial data or PHI.

## Related

- [[architecture/security]] — The full security baseline (env vars, RLS, CORS, rate limiting, validation)
- [[decisions/adr-002-privy-web3-auth]] — Why Privy over MetaMask / WalletConnect
- [[patterns/data-modeling]] — RLS policy patterns
- [[principles/anti-patterns]] — Auth before core loop, custom admin panels

## Sources

- [[raw/articles/vibes-knowledge-base/08-security-auth-baseline]]
- [[raw/articles/vibes-knowledge-base/02-decision-trees]]
- [[raw/articles/vibes-knowledge-base/11-reference-adrs]]
