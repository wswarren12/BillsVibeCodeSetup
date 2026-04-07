import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { executeSearch } from '../../src/tools/search.js';

describe('executeSearch', () => {
  let vaultPath: string;

  beforeEach(async () => {
    vaultPath = await mkdtemp(join(tmpdir(), 'search-test-'));
    // Create wiki directory structure
    await mkdir(join(vaultPath, 'wiki', 'stacks'), { recursive: true });

    // Create index.md with test entries
    await writeFile(
      join(vaultPath, 'wiki', 'index.md'),
      [
        '## Stacks',
        '- [[stacks/web]] — Drizzle ORM, Next.js, and Supabase setup',
        '- [[stacks/mobile]] — React Native with Expo',
        '',
        '## Patterns',
        '- [[patterns/auth]] — Authentication patterns with Clerk',
      ].join('\n'),
      'utf-8'
    );

    // Create matching wiki files
    await writeFile(
      join(vaultPath, 'wiki', 'stacks', 'web.md'),
      '# Web Stack\nWe use Drizzle ORM with Supabase as the database provider.\n',
      'utf-8'
    );
    await writeFile(
      join(vaultPath, 'wiki', 'stacks', 'mobile.md'),
      '# Mobile Stack\nReact Native with Expo for cross-platform apps.\n',
      'utf-8'
    );
  });

  afterEach(async () => {
    await rm(vaultPath, { recursive: true, force: true });
  });

  it('finds pages via index matching', async () => {
    const result = await executeSearch(vaultPath, 'Drizzle');
    expect(result.indexMatches.length).toBeGreaterThanOrEqual(1);
    expect(result.indexMatches.some((m) => m.path === 'stacks/web')).toBe(true);
  });

  it('finds pages via content search', async () => {
    const result = await executeSearch(vaultPath, 'Supabase');
    expect(result.contentMatches.length).toBeGreaterThanOrEqual(1);
    expect(
      result.contentMatches.some((m) => m.matches.some((line) => line.toLowerCase().includes('supabase')))
    ).toBe(true);
  });

  it('returns empty for no matches', async () => {
    const result = await executeSearch(vaultPath, 'GraphQL');
    expect(result.indexMatches).toEqual([]);
    expect(result.contentMatches).toEqual([]);
  });
});
