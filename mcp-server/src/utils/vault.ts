import { readFile, writeFile, appendFile, readdir, mkdir } from "fs/promises";
import { join, resolve, relative } from "path";

export interface SearchResult {
  path: string;
  matches: string[];
}

function assertInsideVault(vaultPath: string, filePath: string): string {
  const resolved = resolve(vaultPath, filePath);
  const rel = relative(vaultPath, resolved);
  if (rel.startsWith("..") || resolve(resolved) !== resolved.replace(/\/$/, "")) {
    // Extra check: just ensure it starts within vault
  }
  if (rel.startsWith("..") || rel.startsWith("/")) {
    throw new Error(`Path "${filePath}" is outside vault`);
  }
  return resolved;
}

function assertNotRaw(filePath: string): void {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized === "raw" || normalized.startsWith("raw/")) {
    throw new Error(`Cannot write to raw/ directory — it is immutable`);
  }
}

export async function readVaultFile(
  vaultPath: string,
  filePath: string
): Promise<string | null> {
  const fullPath = assertInsideVault(vaultPath, filePath);
  try {
    const content = await readFile(fullPath, "utf-8");
    return content;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function writeVaultFile(
  vaultPath: string,
  filePath: string,
  content: string
): Promise<void> {
  assertNotRaw(filePath);
  const fullPath = assertInsideVault(vaultPath, filePath);
  const dir = join(fullPath, "..");
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, "utf-8");
}

export async function appendVaultFile(
  vaultPath: string,
  filePath: string,
  content: string
): Promise<void> {
  assertNotRaw(filePath);
  const fullPath = assertInsideVault(vaultPath, filePath);
  await appendFile(fullPath, content, "utf-8");
}

export async function listVaultDir(
  vaultPath: string,
  dirPath: string
): Promise<string[]> {
  const fullPath = assertInsideVault(vaultPath, dirPath);
  try {
    const entries = await readdir(fullPath);
    return entries;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function searchVaultFiles(
  vaultPath: string,
  dirPath: string,
  query: string
): Promise<SearchResult[]> {
  const fullPath = assertInsideVault(vaultPath, dirPath);
  const results: SearchResult[] = [];
  await searchRecursive(fullPath, query.toLowerCase(), results);
  return results;
}

async function searchRecursive(
  dir: string,
  query: string,
  results: SearchResult[]
): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await searchRecursive(fullPath, query, results);
    } else if (entry.name.endsWith(".md")) {
      try {
        const content = await readFile(fullPath, "utf-8");
        const lines = content.split("\n");
        const matches = lines.filter((line) =>
          line.toLowerCase().includes(query)
        );
        if (matches.length > 0) {
          results.push({ path: fullPath, matches });
        }
      } catch {
        // skip unreadable files
      }
    }
  }
}
