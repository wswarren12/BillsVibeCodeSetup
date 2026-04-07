import { readVaultFile, writeVaultFile, appendVaultFile } from '../utils/vault.js';

interface ADRInput {
  title: string;
  context: string;
  decision: string;
  consequences: string;
}

export async function executeRecordDecision(vaultPath: string, input: ADRInput): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fileName = `${date}-${slug}`;
  const filePath = `wiki/decisions/${fileName}.md`;

  const content = `# ADR: ${input.title}\n\n**Date:** ${date}\n**Status:** accepted\n\n## Context\n${input.context}\n\n## Decision\n${input.decision}\n\n## Consequences\n${input.consequences}\n\n## Related\n`;

  await writeVaultFile(vaultPath, filePath, content);

  // Update index - insert new entry after "## Decisions" line
  const indexContent = await readVaultFile(vaultPath, 'wiki/index.md');
  if (indexContent) {
    const decisionEntry = `- [[decisions/${fileName}]] — ${input.title}`;
    const updatedIndex = indexContent.replace(
      /^(## Decisions)$/m,
      `$1\n${decisionEntry}`
    );
    // Only write if we actually made a change (avoid writing raw/ etc)
    if (updatedIndex !== indexContent) {
      await writeVaultFile(vaultPath, 'wiki/index.md', updatedIndex);
    }
  }

  // Log the operation
  await appendVaultFile(vaultPath, 'wiki/log.md',
    `\n## [${date}] decision | ${input.title}\n- ADR: ${filePath}\n`
  );

  return `Created ADR: ${filePath}`;
}
