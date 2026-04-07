import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { executeLog } from '../../src/tools/log.js';

describe('executeLog', () => {
  let vaultPath: string;

  beforeEach(async () => {
    vaultPath = await mkdtemp(join(tmpdir(), 'log-test-'));
    await mkdir(join(vaultPath, 'wiki'), { recursive: true });
    // Create an empty log file so appendVaultFile works
    const { writeFile: wf } = await import('fs/promises');
    await wf(join(vaultPath, 'wiki', 'log.md'), '# Log\n', 'utf-8');
  });

  afterEach(async () => {
    await rm(vaultPath, { recursive: true, force: true });
  });

  it('appends a log entry with timestamp', async () => {
    const result = await executeLog(vaultPath, 'CREATE', 'Added new page stacks/web');
    const content = await readFile(join(vaultPath, 'wiki', 'log.md'), 'utf-8');

    // Result should contain the operation and details
    expect(result).toContain('CREATE');
    expect(result).toContain('Added new page stacks/web');

    // File should contain the entry
    expect(content).toContain('CREATE');
    expect(content).toContain('Added new page stacks/web');

    // Should have a date pattern like [YYYY-MM-DD]
    expect(content).toMatch(/\[\d{4}-\d{2}-\d{2}\]/);
  });

  it('appends multiple entries', async () => {
    await executeLog(vaultPath, 'CREATE', 'First operation');
    await executeLog(vaultPath, 'UPDATE', 'Second operation');

    const content = await readFile(join(vaultPath, 'wiki', 'log.md'), 'utf-8');
    expect(content).toContain('CREATE');
    expect(content).toContain('First operation');
    expect(content).toContain('UPDATE');
    expect(content).toContain('Second operation');
  });
});
