import { describe, it, expect } from 'vitest';
import { parseIndex, findRelevantPages, type IndexEntry } from '../../src/utils/index-parser.js';

const SAMPLE_INDEX = `# Wiki Index

## Stacks
- [[stacks/web]] — Next.js + Vercel + Drizzle + Neon + Tailwind + shadcn/ui
- [[stacks/mobile]] — React Native + Expo + Expo Router + EAS Build
- [[stacks/agents]] — Python + Claude Agent SDK + FastAPI + Pydantic
- [[stacks/web3]] — Scaffold-ETH 2 patterns (wagmi + viem + Hardhat/Foundry)

## Architecture
- [[architecture/auth]] — Web → Supabase Auth, Web3 → Privy
- [[architecture/database]] — Neon Postgres + Drizzle

## Decisions
- [[decisions/2026-04-06-use-drizzle]] — Chose Drizzle over Prisma for ORM
`;

describe('parseIndex', () => {
  it('extracts all page entries from index.md content', () => {
    const entries = parseIndex(SAMPLE_INDEX);
    expect(entries).toHaveLength(7);
  });

  it('preserves category from ## section headers', () => {
    const entries = parseIndex(SAMPLE_INDEX);
    const stackEntries = entries.filter((e) => e.category === 'Stacks');
    expect(stackEntries).toHaveLength(4);

    const archEntries = entries.filter((e) => e.category === 'Architecture');
    expect(archEntries).toHaveLength(2);

    const decisionEntries = entries.filter((e) => e.category === 'Decisions');
    expect(decisionEntries).toHaveLength(1);
  });

  it('returns entry with {path, summary, category}', () => {
    const entries = parseIndex(SAMPLE_INDEX);
    const web = entries.find((e) => e.path === 'stacks/web');
    expect(web).toBeDefined();
    expect(web).toEqual({
      path: 'stacks/web',
      summary: 'Next.js + Vercel + Drizzle + Neon + Tailwind + shadcn/ui',
      category: 'Stacks',
    });
  });
});

describe('findRelevantPages', () => {
  const entries = parseIndex(SAMPLE_INDEX);

  it('finds pages matching a query (searches path + summary + category)', () => {
    const results = findRelevantPages(entries, 'drizzle');
    expect(results.length).toBeGreaterThanOrEqual(2);
    const paths = results.map((e) => e.path);
    expect(paths).toContain('stacks/web');
    expect(paths).toContain('decisions/2026-04-06-use-drizzle');
  });

  it('returns empty for no matches', () => {
    const results = findRelevantPages(entries, 'nonexistent-xyz');
    expect(results).toEqual([]);
  });

  it('is case-insensitive', () => {
    const lower = findRelevantPages(entries, 'drizzle');
    const upper = findRelevantPages(entries, 'DRIZZLE');
    const mixed = findRelevantPages(entries, 'Drizzle');
    expect(lower).toEqual(upper);
    expect(upper).toEqual(mixed);
  });
});
