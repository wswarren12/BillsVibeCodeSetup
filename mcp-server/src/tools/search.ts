import { readVaultFile, searchVaultFiles, type SearchResult } from '../utils/vault.js';
import { parseIndex, findRelevantPages, type IndexEntry } from '../utils/index-parser.js';

export interface SearchOutput {
  indexMatches: IndexEntry[];
  contentMatches: SearchResult[];
}

export async function executeSearch(vaultPath: string, query: string): Promise<SearchOutput> {
  const indexContent = await readVaultFile(vaultPath, 'wiki/index.md');
  let indexMatches: IndexEntry[] = [];
  if (indexContent) {
    const entries = parseIndex(indexContent);
    indexMatches = findRelevantPages(entries, query);
  }
  const contentMatches = await searchVaultFiles(vaultPath, 'wiki', query);
  return { indexMatches, contentMatches };
}
