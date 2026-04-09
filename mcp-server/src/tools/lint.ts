import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export interface LintIssue {
  type: 'broken-link' | 'broken-index-link' | 'orphan-page' | 'missing-cross-ref';
  severity: 'error' | 'warning' | 'info';
  file: string;
  details: string;
}

export interface LintReport {
  issues: LintIssue[];
  stats: {
    totalPages: number;
    totalLinks: number;
    totalIssues: number;
  };
}

/**
 * Extract all [[wikilink]] targets from markdown content.
 * Handles [[path]] and [[path|alias]] forms.
 */
export function extractWikiLinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
  return [...matches].map(m => m[1]);
}

/**
 * Recursively collect all .md file paths under basePath/relPath.
 * Returns paths relative to basePath (e.g. "stacks/react.md").
 */
export async function collectPages(basePath: string, relPath: string = ''): Promise<string[]> {
  const fullDir = relPath ? join(basePath, relPath) : basePath;
  let entries;
  try {
    entries = await readdir(fullDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const pages: string[] = [];
  for (const entry of entries) {
    const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const subPages = await collectPages(basePath, entryRel);
      pages.push(...subPages);
    } else if (entry.name.endsWith('.md')) {
      pages.push(entryRel);
    }
  }
  return pages;
}

/**
 * Normalize a wikilink target: strip heading anchors and return the path portion only.
 * `architecture/security#row-level-security` → `architecture/security`
 */
function normalizeLinkTarget(link: string): string {
  const hashIndex = link.indexOf('#');
  return hashIndex === -1 ? link : link.slice(0, hashIndex);
}

/**
 * Wikilinks targeting raw/ resolve across the whole vault in Obsidian.
 * The linter only scans wiki/ so treat raw/-prefixed links as external references.
 */
function isExternalVaultLink(link: string): boolean {
  return link.startsWith('raw/') || link.startsWith('outputs/');
}

export async function executeLint(vaultPath: string, _scope?: string): Promise<LintReport> {
  const wikiBase = join(vaultPath, 'wiki');
  const allPages = await collectPages(wikiBase);
  const pageSet = new Set(allPages);

  const issues: LintIssue[] = [];
  let totalLinks = 0;

  // Track inbound links for orphan detection
  const inboundLinks = new Set<string>();

  // 1. Check index.md links
  const indexPath = join(wikiBase, 'index.md');
  let indexContent: string;
  try {
    indexContent = await readFile(indexPath, 'utf-8');
  } catch {
    indexContent = '';
  }

  const indexLinks = extractWikiLinks(indexContent);
  totalLinks += indexLinks.length;

  for (const link of indexLinks) {
    if (isExternalVaultLink(link)) continue;
    const normalized = normalizeLinkTarget(link);
    const target = `${normalized}.md`;
    if (pageSet.has(target)) {
      inboundLinks.add(target);
    } else {
      issues.push({
        type: 'broken-index-link',
        severity: 'error',
        file: 'index.md',
        details: `Index references [[${link}]] but wiki/${target} does not exist`,
      });
    }
  }

  // 2. Check all wiki pages for broken wikilinks
  for (const page of allPages) {
    const pagePath = join(wikiBase, page);
    let content: string;
    try {
      content = await readFile(pagePath, 'utf-8');
    } catch {
      continue;
    }

    const links = extractWikiLinks(content);
    totalLinks += links.length;

    for (const link of links) {
      if (isExternalVaultLink(link)) continue;
      const normalized = normalizeLinkTarget(link);
      const target = `${normalized}.md`;
      if (pageSet.has(target)) {
        inboundLinks.add(target);
      } else {
        issues.push({
          type: 'broken-link',
          severity: 'warning',
          file: page,
          details: `Page contains [[${link}]] but wiki/${target} does not exist`,
        });
      }
    }
  }

  // 3. Detect orphan pages (no inbound links)
  const exemptFiles = new Set(['index.md', 'log.md', 'TEMPLATE.md']);
  for (const page of allPages) {
    if (exemptFiles.has(page)) continue;
    if (!inboundLinks.has(page)) {
      issues.push({
        type: 'orphan-page',
        severity: 'info',
        file: page,
        details: `Page has no inbound links from other wiki pages`,
      });
    }
  }

  return {
    issues,
    stats: {
      totalPages: allPages.length,
      totalLinks,
      totalIssues: issues.length,
    },
  };
}
