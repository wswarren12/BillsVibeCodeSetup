# Global Claude Code Config

## Knowledge Base
Read and follow the schema at ~/Obsidian/VibeCoding/CLAUDE.md.
Use the knowledge-base MCP server tools for search, ingest, and lint operations.
When starting work in any project, check the wiki for relevant decisions and patterns.
After editing `~/.claude/CLAUDE.md` or `~/.claude/settings.json`, refresh their mirrors in `~/Obsidian/VibeCoding/claude-config/` and commit.

## Lesson Capture (mandatory)
Whenever any of the following happens during a session, you MUST run the Lesson Capture workflow (`~/Obsidian/VibeCoding/wiki/workflows/lesson-capture.md`) after resolving the problem:

- You discover an error in your own prior work
- You need a workaround because the obvious/documented approach failed
- You hit surprising, undocumented, or counterintuitive behavior in a tool, library, API, or platform
- The user reports an error or that something is not working — assess and fix it as normal first, then capture the lesson

Security reviews are a special case: before running `/security-review`, `/code-review` with security scope, or any security-reviewer agent, read `~/Obsidian/VibeCoding/wiki/architecture/security-findings.md` and check its recorded vulnerability classes against the code first. After the review, record every confirmed finding there (class, found-in, severity, vulnerability, fix, prevention rule, detection hint — dedup gate applies; no live secrets or working exploits in the vault), and log the review in `wiki/log.md` + `kb_log` even if it found nothing.

Capture means: find the wiki page that owns the topic (`kb_search`), then dedup-check before writing — search for the lesson itself (symptom + error message) and read the page's existing Gotchas/Rules; if it's already recorded, skip or refine the existing entry in place, never append a duplicate. For genuinely new lessons: add to the owning page's Gotchas/Rules section (symptom, root cause, resolution, prevention rule), update `wiki/index.md` if needed, append to `wiki/log.md`, and record via `kb_log`. Prefer updating existing pages over creating new ones; one canonical entry per lesson. Trivial slips (typos, wrong paths, clearly-messaged errors fixed in seconds) do not qualify. A fix without a recorded lesson is incomplete work.
