export interface IndexEntry {
  path: string;
  summary: string;
  category: string;
}

/**
 * Parse index.md content into structured IndexEntry objects.
 * Expects lines like: - [[path]] — summary
 * Tracks the current ## Category header.
 */
export function parseIndex(content: string): IndexEntry[] {
  const entries: IndexEntry[] = [];
  let currentCategory = '';

  for (const line of content.split('\n')) {
    // Track ## section headers
    const headerMatch = line.match(/^## (.+)$/);
    if (headerMatch) {
      currentCategory = headerMatch[1].trim();
      continue;
    }

    // Match entry lines: - [[path]] — summary
    const entryMatch = line.match(/^- \[\[(.+?)\]\] — (.+)$/);
    if (entryMatch) {
      entries.push({
        path: entryMatch[1],
        summary: entryMatch[2].trim(),
        category: currentCategory,
      });
    }
  }

  return entries;
}

/**
 * Find entries matching a query. Case-insensitive search across path, summary, and category.
 * The query is split into terms; an entry matches if ANY term is found in any field.
 */
export function findRelevantPages(entries: IndexEntry[], query: string): IndexEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return entries.filter((entry) => {
    const haystack = `${entry.path} ${entry.summary} ${entry.category}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}
