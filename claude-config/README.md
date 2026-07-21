# Claude Config Mirror

Version-controlled copies of the global Claude Code config that wires this knowledge base into every session:

- `CLAUDE.md` → mirror of `~/.claude/CLAUDE.md` — global instructions: knowledge-base pointer, mandatory Lesson Capture protocol, Security Review Capture special case
- `settings.json` → mirror of `~/.claude/settings.json` — permissions, plugins, and the hooks that fire this vault's scripts (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse` security-review capture, `PostToolUseFailure` lesson capture)

## Install on a new machine

```bash
cp claude-config/CLAUDE.md ~/.claude/CLAUDE.md
cp claude-config/settings.json ~/.claude/settings.json
```

The hooks in `settings.json` reference scripts by absolute path under `~/Obsidian/VibeCoding/hooks/`, so the vault must be cloned to that location (or the paths updated).

## Keeping in sync

These are copies, not symlinks — after changing `~/.claude/CLAUDE.md` or `~/.claude/settings.json`, re-copy them here and commit. When Claude Code edits either file as part of knowledge-base work, it should refresh this mirror in the same session.
