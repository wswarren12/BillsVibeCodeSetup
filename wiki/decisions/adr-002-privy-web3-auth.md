# ADR-002: Privy for Invisible Web3 Auth

**Date:** 2026-04-09
**Status:** Accepted
**Source project:** Cairn (reference)

## Context

Cairn has a decentralized storage layer (IPFS via Storacha) and may eventually use on-chain attestations. Users need a wallet, but the target audience is not crypto-native.

## Options considered

- **MetaMask / WalletConnect:** Standard Web3 wallet connection. Requires users to already have a wallet, understand gas fees, and approve transactions. Completely wrong for a mainstream consumer app.
- **Privy:** Embedded wallet provider. Creates a wallet behind the scenes during a standard email/social login. Users never see "connect wallet" unless they want to. Progressive disclosure — start with email auth, reveal Web3 features only when relevant.
- **Dynamic:** Similar to Privy but less mature, fewer integrations.
- **No wallet, skip Web3:** Simplest option but removes the ability to do decentralized storage attestations and future on-chain features.

## Decision

Privy.

## Reasoning

Privy lets us build for mainstream users today while preserving the option for Web3 features. The wallet exists silently — it's an implementation detail, not a user-facing concept. If we later add token-gated traces or on-chain attestations, the infrastructure is already there without requiring users to "onboard to crypto."

## Tradeoffs accepted

Privy adds a dependency and a small cost per user. The wallet is custodial-by-default (Privy holds the keys), which matters for crypto purists but not for our target users. We're dependent on Privy's uptime for wallet operations.

## Related

- [[architecture/auth]]
- [[stacks/web3]]
