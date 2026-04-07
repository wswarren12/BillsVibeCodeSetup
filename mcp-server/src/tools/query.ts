import { readVaultFile, searchVaultFiles } from '../utils/vault.js';
import { parseIndex, findRelevantPages } from '../utils/index-parser.js';

interface QueryOutput {
  relevantPages: { path: string; content: string }[];
  query: string;
}

export async function executeQuery(vaultPath: string, question: string): Promise<QueryOutput> {
  const indexContent = await readVaultFile(vaultPath, 'wiki/index.md');
  const relevantPages: { path: string; content: string }[] = [];

  if (indexContent) {
    const entries = parseIndex(indexContent);
    const matches = findRelevantPages(entries, question);
    for (const match of matches.slice(0, 10)) {
      const pagePath = `wiki/${match.path}.md`;
      const content = await readVaultFile(vaultPath, pagePath);
      if (content) {
        relevantPages.push({ path: pagePath, content });
      }
    }
  }

  // Also do content search for pages not in index
  const contentMatches = await searchVaultFiles(vaultPath, 'wiki', question);
  for (const match of contentMatches) {
    if (!relevantPages.some(p => p.path === match.path)) {
      const content = await readVaultFile(vaultPath, match.path);
      if (content) {
        relevantPages.push({ path: match.path, content });
      }
    }
  }

  return { relevantPages: relevantPages.slice(0, 15), query: question };
}
