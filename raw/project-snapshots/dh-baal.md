# Project Snapshot: DH Baal (HausDAO)

**Source:** ~/Desktop/Vibes/Old Vibe Coding/DH Baal/Baal/
**Date:** 2026-04-06
**Type:** Ethereum Smart Contracts (Hardhat)

## Stack
- Framework: Hardhat (^2.4.1)
- Language: Solidity (0.8.7 primary, also 0.7.5, 0.6.1, 0.5.3) + TypeScript (^4.3.2)
- Testing: Waffle + Chai + Mocha
- Key Dependencies:
  - `@openzeppelin/contracts` (^4.3.2) -- standard contract building blocks
  - `@gnosis.pm/safe-contracts` (^1.3.0) -- Gnosis Safe multisig integration
  - `@gnosis.pm/zodiac` (^1.0.3) -- modular DAO tooling framework
  - `ethers` (^5.3.1) -- Ethereum interaction library
  - `hardhat-typechain` -- TypeScript bindings for contracts
  - `hardhat-gas-reporter` -- gas usage analysis
  - `solidity-coverage` -- test coverage
  - `hardhat-contract-sizer` -- contract size reporting

## Architecture

Moloch V3 (codename "Baal") -- a minimal, composable DAO template building on Moloch V2, Minion, and Compound governance patterns.

### Core Contracts
- **Baal.sol** -- Main DAO contract. Handles proposals (Action, Membership, Period, Whitelist), voting, ragequit, flash loans, and arbitrary execution. Acts as a Gnosis Safe module via Zodiac.
- **SharesERC20.sol** -- ERC-20 voting shares with EIP-2612 permit support and Compound-style delegation/checkpointing. Pausable and burnable by the DAO.
- **LootERC20.sol** -- ERC-20 non-voting economic rights (loot). Transferable, ragequittable.

### Extension Contracts (tools/)
- **TributeEscrow.sol** -- Escrow for tribute-based membership proposals (applicant locks tokens, DAO votes to accept).
- **ShamanMinter.sol** -- External contract authorized to mint shares/loot, enabling automated membership flows.
- **RageQuitBank.sol** -- Alternative pull-pattern banking for ragequit claims.
- **Poster.sol** -- On-chain event posting for metadata (proposal details, DAO metadata).

### Supporting
- **fixtures/GnosisImports.sol** -- Imports Gnosis Safe contracts for local compilation.
- **mock/MockBaal.sol, TestERC20.sol** -- Test helpers.

### Deployment
- **BaalSummoner** -- Factory contract for deploying new DAOs. Uses proxy/singleton pattern (template + clone). Summoning creates a Baal instance paired with a Gnosis Safe.

## Patterns Observed

- **Modular "Shaman" pattern**: External contracts can be whitelisted to call privileged functions (mint shares/loot, manage membership) without modifying the core DAO. Shamans have permission levels and can be added/removed via governance proposals. This is a powerful extensibility mechanism.
- **Gnosis Safe as treasury**: Baal operates as a Zodiac module on a Gnosis Safe, separating governance logic from asset custody. The Safe holds funds; Baal executes approved proposals through it.
- **Compound-style governance**: Voting shares use checkpointed balances and delegation (delegateBySig for gasless meta-transactions), borrowed directly from Compound's governance token design.
- **MultiSend for batched actions**: Proposals can encode multiple actions via Gnosis MultiSend, allowing complex operations (mint shares + mint loot + post metadata) in a single proposal.
- **Sequential proposal processing**: Proposals must be processed in order (Moloch game theory), ensuring ragequit protection -- members can exit before unfavorable proposals execute.
- **EIP-2612 permit**: Gasless token approvals, abstracting the need for members to hold ETH.
- **Flash loans (ERC-3156)**: DAO treasury tokens can be flash-lent for a configurable fee, toggleable on/off.
- **Hardhat tasks as CLI**: Extensive custom Hardhat tasks for DAO administration (summon, propose, vote, sponsor, process, ragequit, delegate) -- effectively a CLI for on-chain DAO operations.
- **Multi-compiler Solidity config**: Multiple Solidity compiler versions to accommodate dependencies from different eras (Gnosis Safe at 0.7.5, OpenZeppelin at 0.8.7, etc.).
- **TypeChain integration**: Auto-generated TypeScript types for all contracts, used throughout tasks and tests.

## Lessons / Decisions

- **Separation of governance and treasury**: Using Gnosis Safe as the asset vault while Baal handles governance is a strong architectural choice. It lets DAOs benefit from Safe's battle-tested multisig security and ecosystem (e.g., Safe apps) while layering on Moloch-style governance.
- **Extensibility over monolith**: The Shaman pattern avoids bloating the core contract. New membership mechanics (crowdsales, airdrops, staking rewards) are plugged in as external contracts rather than forked into the base.
- **Ragequit as exit right**: Preserving the Moloch ragequit mechanism (burn shares/loot for proportional treasury claim) is a fundamental design constraint that shapes the entire proposal flow. Direct transfer on ragequit (vs. pull pattern) is an opinionated efficiency tradeoff.
- **Tokenized shares enable DeFi composability**: Making voting shares ERC-20 allows staking, trading, and LP positions -- but always revocable by the DAO via ragekick. This tension between composability and governance control is a deliberate design choice.
- **Factory + proxy pattern**: BaalSummoner uses minimal proxies (clones) to deploy DAOs cheaply, a standard gas-optimization pattern for protocol factories.
- **Multi-network deployment**: Config supports mainnet, Rinkeby, Kovan, Goerli, Ropsten, xDai, Polygon, Mumbai -- reflecting the multi-chain DAO deployment reality of the 2021-2022 era.
