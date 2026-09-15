# Dev Environment (macOS)

Gotchas and rules for the local toolchain itself — node/npm, version managers, PATH, shell config. Owns lessons where the *machine's* setup, not any project's code, is the root cause.

---

## Gotchas

### Gotcha: stale root-owned Node in /usr/local silently shadows nvm's npm — updates "don't take"

- **Symptom:** `npm install -g npm@latest` appears to succeed (or fails with `EACCES`), but `npm --version` keeps reporting an old version (here: 9.8.1 while nvm's Node 22 bundled 10.9.4). Machine uses nvm; updating npm seems impossible.
- **Root cause:** a pre-nvm Node installed via the macOS `.pkg` installer left root-owned `node`/`npm` binaries in `/usr/local/bin` and an npm tree in `/usr/local/lib/node_modules` (root:wheel, 755 — not user-writable). In some shell contexts `/usr/local/bin/npm` resolves ahead of nvm's npm, so the executed binary is the old copy. Updates then either hit `EACCES` on the root-owned tree, or succeed *into nvm's prefix* while `/usr/local/bin/npm` keeps reporting its own stale bundled version — the update looks like a silent no-op. nvm never cleans up a prior system install; the two coexist indefinitely.
- **Resolution:** delete the stale system install (needs admin): `/usr/local/bin/{node,npm,npx,corepack}`, `/usr/local/lib/node_modules`, `/usr/local/include/node`, `/usr/local/share/man/man1/node.1`, plus any dangling `/usr/local/bin` symlinks into the removed tree (here: yarn, yarnpkg, truffle, near, graph). Then `hash -r`, confirm `which -a npm` shows only the nvm path, and update npm normally. Global CLIs from the old tree are reinstallable under nvm (`corepack enable` for yarn).
- **Prevention rules:**
  1. When any tool "won't update" or reports a version that contradicts what was just installed, run `which -a <tool>` (the `-a` matters) first — shadowed duplicate installs are the prime suspect before permissions or network.
  2. The smoking gun lives in npm's own logs: line 0 of `~/.npm/_logs/*-debug-0.log` shows the exact node *and* npm binary paths executed (`verbose cli <node-path> <npm-path>`) — a mixed pair (nvm node + /usr/local npm) confirms shadowing.
  3. `<tool> --version` reports the binary PATH resolved, not what your package manager last installed at its prefix — never treat it as proof an update failed without checking `which -a`.
  4. After migrating a Mac to nvm (or any version manager), remove the old `/usr/local` Node install outright rather than leaving it shadowed — it will resurface in shells where the manager isn't loaded.

### Gotcha: npm@latest can require a *patch* Node bump — engine check, not permissions

- **Symptom:** after fixing PATH/ownership, `npm install -g npm@latest` fails with `notsup Not compatible with your version of node/npm: npm@12.0.2 … Required: ^22.22.2 …` while running Node 22.22.1 — one patch behind.
- **Root cause / resolution:** npm majors pin minimum Node *patch* versions, and `nvm install 22 --latest-npm` only bumps npm conservatively. Fix: `nvm install 22 --reinstall-packages-from=current` (migrates global CLIs), `nvm alias default 22`, then `npm install -g npm@latest`.
- **Prevention rule:** read the `Required:` line of an npm `notsup` error literally — it names the exact acceptable versions; a patch-level `nvm install` is usually the whole fix. Verify globals migrated afterward with `npm ls -g --depth=0`.

### Gotcha: nested macOS TMPDIR exceeds PostgreSQL's Unix socket path limit

- **Symptom:** a disposable PostgreSQL test cluster fails with `Unix-domain socket path ... is too long (maximum 103 bytes)` when launched through a sandboxed tool, although the same runner works directly.
- **Root cause:** macOS already supplies a long `/var/folders/.../T/` path; a tool adds another temporary directory, then the runner adds its cluster/socket directories and PostgreSQL's socket filename.
- **Resolution:** PLAA Schemas `scripts/test.py` creates its unpredictable mode-0700 disposable directory directly under `/tmp`, keeps TCP listening disabled and cleans up only its own cluster. Native PostgreSQL 16.10 suite then passes.
- **Prevention rule:** keep Unix socket paths short independently of inherited TMPDIR; use private random directories, not a shared fixed socket path. Test the actual agent/sandbox launch environment.

## Related

- [[patterns/agent-automation]] — agent-session mechanics, including running sudo from a TTY-less agent shell
