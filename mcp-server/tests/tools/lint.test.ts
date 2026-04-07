import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { executeLint, extractWikiLinks, collectPages } from '../../src/tools/lint.js';

describe('extractWikiLinks', () => {
  it('extracts simple wikilinks', () => {
    const content = 'See [[stacks/react]] and [[entities/vercel]]';
    expect(extractWikiLinks(content)).toEqual(['stacks/react', 'entities/vercel']);
  });

  it('extracts aliased wikilinks', () => {
    const content = 'Check [[stacks/react|React]] for details';
    expect(extractWikiLinks(content)).toEqual(['stacks/react']);
  });

  it('returns empty array for no links', () => {
    expect(extractWikiLinks('No links here')).toEqual([]);
  });
});

describe('collectPages', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'lint-collect-'));
    await mkdir(join(tmpDir, 'sub'), { recursive: true });
    await writeFile(join(tmpDir, 'index.md'), '# Index');
    await writeFile(join(tmpDir, 'sub/page.md'), '# Page');
    await writeFile(join(tmpDir, 'readme.txt'), 'not md');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('collects .md files recursively', async () => {
    const pages = await collectPages(tmpDir);
    expect(pages).toContain('index.md');
    expect(pages).toContain('sub/page.md');
    expect(pages).not.toContain('readme.txt');
  });

  it('returns empty for nonexistent directory', async () => {
    const pages = await collectPages(join(tmpDir, 'nope'));
    expect(pages).toEqual([]);
  });
});

describe('executeLint', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'lint-test-'));
    await mkdir(join(tmpDir, 'wiki/stacks'), { recursive: true });
    await mkdir(join(tmpDir, 'wiki/entities'), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('detects broken index links', async () => {
    await writeFile(
      join(tmpDir, 'wiki/index.md'),
      '# Index\n- [[stacks/missing]] — A missing page\n- [[stacks/react]] — React stuff\n'
    );
    await writeFile(join(tmpDir, 'wiki/stacks/react.md'), '# React');

    const report = await executeLint(tmpDir);

    const brokenIndex = report.issues.filter(i => i.type === 'broken-index-link');
    expect(brokenIndex).toHaveLength(1);
    expect(brokenIndex[0].file).toBe('index.md');
    expect(brokenIndex[0].details).toContain('stacks/missing');
    expect(brokenIndex[0].severity).toBe('error');
  });

  it('detects broken wiki links in pages', async () => {
    await writeFile(join(tmpDir, 'wiki/index.md'), '# Index\n- [[stacks/react]] — React\n');
    await writeFile(
      join(tmpDir, 'wiki/stacks/react.md'),
      '# React\nSee also [[entities/nonexistent]] for details.'
    );

    const report = await executeLint(tmpDir);

    const brokenLinks = report.issues.filter(i => i.type === 'broken-link');
    expect(brokenLinks).toHaveLength(1);
    expect(brokenLinks[0].file).toBe('stacks/react.md');
    expect(brokenLinks[0].details).toContain('entities/nonexistent');
    expect(brokenLinks[0].severity).toBe('warning');
  });

  it('detects orphan pages', async () => {
    await writeFile(join(tmpDir, 'wiki/index.md'), '# Index\n');
    await writeFile(join(tmpDir, 'wiki/stacks/orphan.md'), '# Orphan\nNo one links to me.');

    const report = await executeLint(tmpDir);

    const orphans = report.issues.filter(i => i.type === 'orphan-page');
    const orphanFiles = orphans.map(o => o.file);
    expect(orphanFiles).toContain('stacks/orphan.md');
    expect(orphans[0].severity).toBe('info');
  });

  it('does not flag exempt files as orphans', async () => {
    await writeFile(join(tmpDir, 'wiki/index.md'), '# Index\n');
    await writeFile(join(tmpDir, 'wiki/log.md'), '# Log');
    await writeFile(join(tmpDir, 'wiki/TEMPLATE.md'), '# Template');

    const report = await executeLint(tmpDir);

    const orphanFiles = report.issues.filter(i => i.type === 'orphan-page').map(i => i.file);
    expect(orphanFiles).not.toContain('index.md');
    expect(orphanFiles).not.toContain('log.md');
    expect(orphanFiles).not.toContain('TEMPLATE.md');
  });

  it('reports correct stats', async () => {
    await writeFile(
      join(tmpDir, 'wiki/index.md'),
      '# Index\n- [[stacks/react]] — React\n'
    );
    await writeFile(join(tmpDir, 'wiki/stacks/react.md'), '# React\nSee [[entities/vercel]]');
    await writeFile(join(tmpDir, 'wiki/entities/vercel.md'), '# Vercel');

    const report = await executeLint(tmpDir);

    expect(report.stats.totalPages).toBe(3);
    expect(report.stats.totalLinks).toBe(3); // 1 from index check, 1 from index page scan, 1 from react
    expect(report.stats.totalIssues).toBe(report.issues.length);
  });
});
