import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  readVaultFile,
  writeVaultFile,
  appendVaultFile,
  listVaultDir,
  searchVaultFiles,
} from "../../src/utils/vault.js";

let tempDir: string;

function makeTempVault(): string {
  tempDir = mkdtempSync(join(tmpdir(), "vault-test-"));
  return tempDir;
}

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("readVaultFile", () => {
  it("reads a file and returns content as string", async () => {
    const vault = makeTempVault();
    writeFileSync(join(vault, "note.md"), "Hello world");

    const content = await readVaultFile(vault, "note.md");
    expect(content).toBe("Hello world");
  });

  it("returns null for missing file", async () => {
    const vault = makeTempVault();

    const content = await readVaultFile(vault, "does-not-exist.md");
    expect(content).toBeNull();
  });

  it("throws 'outside vault' for path traversal", async () => {
    const vault = makeTempVault();

    await expect(
      readVaultFile(vault, "../etc/passwd")
    ).rejects.toThrow("outside vault");
  });
});

describe("writeVaultFile", () => {
  it("writes a new file", async () => {
    const vault = makeTempVault();

    await writeVaultFile(vault, "new-note.md", "New content");

    const { readFileSync } = await import("fs");
    const content = readFileSync(join(vault, "new-note.md"), "utf-8");
    expect(content).toBe("New content");
  });

  it("creates directories when writing nested paths", async () => {
    const vault = makeTempVault();

    await writeVaultFile(vault, "wiki/sub/deep.md", "Deep content");

    const { readFileSync } = await import("fs");
    const content = readFileSync(join(vault, "wiki/sub/deep.md"), "utf-8");
    expect(content).toBe("Deep content");
  });

  it("throws error when writing to raw/ directory", async () => {
    const vault = makeTempVault();

    await expect(
      writeVaultFile(vault, "raw/file.md", "content")
    ).rejects.toThrow("raw/");
  });
});

describe("appendVaultFile", () => {
  it("appends content to existing file", async () => {
    const vault = makeTempVault();
    writeFileSync(join(vault, "log.md"), "Line 1\n");

    await appendVaultFile(vault, "log.md", "Line 2\n");

    const { readFileSync } = await import("fs");
    const content = readFileSync(join(vault, "log.md"), "utf-8");
    expect(content).toBe("Line 1\nLine 2\n");
  });
});

describe("listVaultDir", () => {
  it("lists directory contents", async () => {
    const vault = makeTempVault();
    writeFileSync(join(vault, "a.md"), "a");
    writeFileSync(join(vault, "b.md"), "b");
    mkdirSync(join(vault, "subdir"));
    writeFileSync(join(vault, "subdir", "c.md"), "c");

    const entries = await listVaultDir(vault, ".");
    expect(entries).toContain("a.md");
    expect(entries).toContain("b.md");
    expect(entries).toContain("subdir");
  });
});

describe("searchVaultFiles", () => {
  it("finds files containing a query string and returns path + matching lines", async () => {
    const vault = makeTempVault();
    mkdirSync(join(vault, "notes"));
    writeFileSync(
      join(vault, "notes", "first.md"),
      "This is a test note\nWith multiple lines\nAnother test here"
    );
    writeFileSync(
      join(vault, "notes", "second.md"),
      "No matching content\nJust filler"
    );
    writeFileSync(
      join(vault, "notes", "third.md"),
      "Test is case insensitive"
    );

    const results = await searchVaultFiles(vault, "notes", "test");

    expect(results.length).toBe(2);

    const firstResult = results.find((r) => r.path.includes("first.md"));
    expect(firstResult).toBeDefined();
    expect(firstResult!.matches).toContain("This is a test note");
    expect(firstResult!.matches).toContain("Another test here");

    const thirdResult = results.find((r) => r.path.includes("third.md"));
    expect(thirdResult).toBeDefined();
    expect(thirdResult!.matches).toContain("Test is case insensitive");
  });
});
