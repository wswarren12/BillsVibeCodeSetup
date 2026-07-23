Basic setup for using Claude Code with Obsidian as a knowledge base to improve coding workflows. 

These workflows are based on the types of apps I'm currently working on, so they might not work for everyone. 

To use, you'll need Claude Code and Obsidian on your local machine. 

## Setup note: fix file paths

Absolute file paths in this repo are anonymized with the placeholder `/Users/[youruser]/`. Before using, replace every occurrence with your actual home directory path (e.g. `/Users/yourname/`). The affected files are:

- `claude-config/settings.json` — hook commands (this is a mirror; the live copy belongs at `~/.claude/settings.json`)
- `commands/process-tips.md`
- `commands/tip.md`

A quick way to fix them all (macOS, run from the vault root):

```sh
LC_ALL=C grep -rl '/Users/\[youruser\]/' . --exclude-dir=.git | xargs sed -i '' "s|/Users/\[youruser\]/|$HOME/|g"
```

The paths also assume the vault lives at `~/Obsidian/VibeCoding/` — adjust if yours is elsewhere.
