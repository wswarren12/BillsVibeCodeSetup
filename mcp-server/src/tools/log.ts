import { appendVaultFile } from '../utils/vault.js';

export async function executeLog(vaultPath: string, operation: string, details: string): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const entry = `\n## [${date}] ${operation} | ${details}\n`;
  await appendVaultFile(vaultPath, 'wiki/log.md', entry);
  return `Logged: [${date}] ${operation} | ${details}`;
}
