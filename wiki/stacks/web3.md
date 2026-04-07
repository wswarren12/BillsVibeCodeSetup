# Web3 Stack

## Core Stack

- **Scaffold-ETH 2** — pattern derived from SpeedRunEthereum-v2
- **Next.js** — frontend application
- **Privy** — wallet authentication (not RainbowKit)
- **wagmi + viem** — contract interaction
- **Hardhat or Foundry** — smart contract development
- **Neon Postgres + Drizzle** — off-chain data storage
- **Monorepo** — always use `packages/` structure

## Project Structure

```
packages/
  nextjs/     # Frontend application (Next.js)
  hardhat/    # Smart contracts (Hardhat or Foundry)
  shared/     # Shared types, ABIs, and utilities
```

## Conventions

- Monorepo structure is mandatory.
- Use **Privy** for wallet auth, not RainbowKit.
- Use **wagmi hooks** for contract reads and writes.
- Use **viem** for low-level blockchain operations.
- Store ABIs in the `shared` package so both frontend and tooling can reference them.
- Test contracts with Hardhat or Foundry test suites.
- Test frontend with Playwright + Synpress for wallet-aware E2E tests.

## Docker Pattern

`docker-compose` with supporting services:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"

  hardhat-node:
    build: ./packages/hardhat
    ports:
      - "8545:8545"
    command: npx hardhat node
```

Frontend runs locally via `next dev` during development; deployed to Vercel for production.

## Related

- [[web]]
- [[auth]]
- [[database]]
- [[monorepo]]
