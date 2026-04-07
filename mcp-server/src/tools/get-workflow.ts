import { readVaultFile } from '../utils/vault.js';

const WORKFLOW_MAP: Record<string, string> = {
  feature: 'wiki/workflows/feature-dev.md',
  bugfix: 'wiki/workflows/bug-fix.md',
  ingest: 'wiki/workflows/ingest.md',
};

export async function executeGetWorkflow(
  vaultPath: string,
  type: 'feature' | 'bugfix' | 'ingest'
): Promise<string> {
  const filePath = WORKFLOW_MAP[type];
  if (!filePath) {
    return `Unknown workflow type: ${type}. Available: ${Object.keys(WORKFLOW_MAP).join(', ')}`;
  }
  const content = await readVaultFile(vaultPath, filePath);
  if (!content) {
    return `Workflow file not found: ${filePath}`;
  }
  return content;
}
