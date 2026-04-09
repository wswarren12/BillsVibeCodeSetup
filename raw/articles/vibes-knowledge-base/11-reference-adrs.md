# Reference ADRs

Architecture Decision Records from real projects. These exist to show the coding agent how to reason about tradeoffs — not just what was chosen, but why, and what was rejected.

## ADR-001: Supabase + PostGIS over Firebase for Cairn

**Context:** Cairn is a location-based storytelling app that needs spatial queries (find traces near me), relational data (users, traces, media), auth, and file storage.

**Options considered:**
- **Firebase (Firestore + Firebase Auth + Cloud Storage):** Familiar, fast to prototype, good mobile SDKs. But Firestore has no native spatial query support — you'd need GeoFire or a third-party geohash library, which gives imprecise results and can't do complex spatial queries (polygon containment, route-based proximity).
- **Supabase (Postgres + PostGIS + Supabase Auth + Supabase Storage):** Full relational database with native spatial indexing. PostGIS is the industry standard for geospatial data. Supabase provides auth, storage, and Edge Functions in one platform.
- **PlanetScale + separate auth/storage:** MySQL-based, no spatial support worth mentioning. Would require stitching together multiple services.

**Decision:** Supabase + PostGIS.

**Reasoning:** The core loop IS spatial — "show me traces near this location." PostGIS handles this natively with proper great-circle distance calculations, spatial indexes, and complex queries (e.g., "traces within 500m of my route"). Firebase would require a workaround that degrades as the dataset grows. Supabase also consolidates auth, storage, and Edge Functions into one platform, reducing integration overhead.

**Tradeoffs accepted:** Supabase's real-time capabilities are less mature than Firebase's. Postgres requires more schema upfront than Firestore's schemaless approach. Supabase's mobile SDKs are newer and have fewer community examples than Firebase's.

---

## ADR-002: Privy for Invisible Web3 Auth

**Context:** Cairn has a decentralized storage layer (IPFS via Storacha) and may eventually use on-chain attestations. Users need a wallet, but the target audience is not crypto-native.

**Options considered:**
- **MetaMask / WalletConnect:** Standard Web3 wallet connection. Requires users to already have a wallet, understand gas fees, and approve transactions. Completely wrong for a mainstream consumer app.
- **Privy:** Embedded wallet provider. Creates a wallet behind the scenes during a standard email/social login. Users never see "connect wallet" unless they want to. Progressive disclosure — start with email auth, reveal Web3 features only when relevant.
- **Dynamic:** Similar to Privy but less mature, fewer integrations.
- **No wallet, skip Web3:** Simplest option but removes the ability to do decentralized storage attestations and future on-chain features.

**Decision:** Privy.

**Reasoning:** Privy lets us build for mainstream users today while preserving the option for Web3 features. The wallet exists silently — it's an implementation detail, not a user-facing concept. If we later add token-gated traces or on-chain attestations, the infrastructure is already there without requiring users to "onboard to crypto."

**Tradeoffs accepted:** Privy adds a dependency and a small cost per user. The wallet is custodial-by-default (Privy holds the keys), which matters for crypto purists but not for our target users. We're dependent on Privy's uptime for wallet operations.

---

## ADR-003: Storacha for Decentralized Storage

**Context:** Cairn's traces include multimedia content (photos, audio, text). We want content to be durable and not dependent on a single platform's continued existence.

**Options considered:**
- **Supabase Storage only:** Simple, integrated, handles permissions via RLS. But content lives on one platform. If Supabase goes down or we migrate, all media URLs break.
- **IPFS direct (via Helia or Kubo):** True decentralization but requires running/paying for pinning infrastructure. Unreliable without a pinning service.
- **Storacha (formerly web3.storage):** IPFS pinning as a managed service. Upload via API, content gets an IPFS CID (content-addressed, immutable), Storacha handles pinning and gateway access.
- **Arweave:** Permanent storage, pay once. But the upload experience is clunkier and tied to AR tokens.

**Decision:** Storacha for media content, Supabase Storage as a fallback/cache.

**Reasoning:** Content-addressed storage (IPFS CIDs) gives us immutable references to content that work regardless of which platform hosts the gateway. Storacha abstracts away IPFS pinning complexity. We store the CID in our Supabase database alongside a Supabase Storage URL as a fallback — if Storacha is slow or down, we can serve from Supabase. The dual-storage approach adds complexity but makes the content layer resilient.

**Tradeoffs accepted:** Dual storage means uploading content twice (or syncing between them). IPFS gateway performance can be slow on first access. Storacha is a younger service with less track record than AWS S3 or similar. Added complexity in the upload flow.

---

## ADR-004: React Native + Expo over Flutter or Native

**Context:** Cairn is primarily a mobile app (location-based, camera access, map interaction) with potential for a web companion view.

**Options considered:**
- **Native (Swift + Kotlin):** Best performance, full platform API access. But two codebases, two languages, double the maintenance for a solo developer.
- **Flutter:** Single codebase, good performance, mature. But Dart is a language with a smaller ecosystem than JavaScript/TypeScript, and the web output is not true web (renders to canvas).
- **React Native + Expo:** Single codebase in TypeScript, massive ecosystem, Expo handles build/deploy/OTA updates. Expo Router provides file-based routing. Expo Web gives a real web output when needed.

**Decision:** React Native + Expo.

**Reasoning:** TypeScript is the language I know best and that my coding agents work best with. Expo eliminates the need to touch Xcode or Android Studio for an MVP — builds happen in the cloud via EAS. The ecosystem overlap with web (React, npm, TanStack Query, Zustand) means patterns and skills transfer. Expo's managed workflow means no ejecting, no native module pain.

**Tradeoffs accepted:** React Native performance is slightly worse than native for animation-heavy UIs (mitigated by Reanimated). Some native APIs require Expo modules that may lag behind native SDK releases. Expo's managed workflow limits access to some advanced native configurations.

---

## Template for New ADRs

When making a significant technology or architecture decision, document it in this format:

```
## ADR-NNN: [Decision Title]

**Context:** What problem are we solving? What constraints exist?

**Options considered:** List 2-4 options with a one-sentence description of each.

**Decision:** What did we choose?

**Reasoning:** Why this option over the others? What specific capabilities drove the decision?

**Tradeoffs accepted:** What are we giving up? What risks are we taking?
```

Keep ADRs short. If it takes more than a page to justify a decision, the decision is probably too complex for an MVP.
