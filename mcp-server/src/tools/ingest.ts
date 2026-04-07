import { readVaultFile, listVaultDir } from '../utils/vault.js';

interface IngestOutput {
  sourceContent: string;
  existingIndex: string;
  existingSummaries: string[];
}

export async function executeIngest(vaultPath: string, sourcePath: string): Promise<IngestOutput> {
  const content = await readVaultFile(vaultPath, sourcePath);
  if (!content) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }
  const index = await readVaultFile(vaultPath, 'wiki/index.md') ?? '';
  const summaryFiles = await listVaultDir(vaultPath, 'wiki/summaries');
  const existingSummaries = summaryFiles.filter(f => f.endsWith('.md'));
  return { sourceContent: content, existingIndex: index, existingSummaries };
}
