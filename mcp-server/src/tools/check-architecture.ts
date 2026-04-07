import { readVaultFile, searchVaultFiles } from '../utils/vault.js';

interface ArchCheckOutput {
  relevantPages: { path: string; excerpt: string }[];
  relevantDecisions: { path: string; excerpt: string }[];
  conflicts: string[];
}

export async function executeCheckArchitecture(vaultPath: string, proposal: string): Promise<ArchCheckOutput> {
  const archResults = await searchVaultFiles(vaultPath, 'wiki/architecture', proposal);
  const decisionResults = await searchVaultFiles(vaultPath, 'wiki/decisions', proposal);

  const conflicts: string[] = [];
  for (const result of archResults) {
    const content = await readVaultFile(vaultPath, result.path);
    if (content) {
      const treeMatch = content.match(/## Decision Tree\n([\s\S]*?)(?=\n##|$)/);
      if (treeMatch) {
        conflicts.push(`Check decision tree in ${result.path}:\n${treeMatch[1].trim()}`);
      }
    }
  }

  return {
    relevantPages: archResults.map(r => ({ path: r.path, excerpt: r.matches })),
    relevantDecisions: decisionResults.map(r => ({ path: r.path, excerpt: r.matches })),
    conflicts,
  };
}
