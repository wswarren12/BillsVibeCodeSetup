---
description: "Batch-process raw/tips/inbox.md: pull from Apple Notes, transcribe, propose wiki updates, archive processed entries"
---

You are running the batch processor for the coding tips inbox in the VibeCoding knowledge base.

Follow the workflow at `/Users/[youruser]/Obsidian/VibeCoding/wiki/workflows/tips-ingest.md` for routing conventions and rules.

## Step 1: Pull from Apple Notes

Run the Apple Notes import script to drain any mobile captures into the inbox:

```bash
/Users/[youruser]/Obsidian/VibeCoding/scripts/import-apple-notes.sh
```

Report what was imported (or "nothing to import"). Don't fail if Apple Notes is empty or the note doesn't exist — the script handles both gracefully.

## Step 2: Read the inbox

Read `/Users/[youruser]/Obsidian/VibeCoding/raw/tips/inbox.md` in full.

Entries are separated by `---` and sit beneath the inbox template header. Parse each entry as one of:

- **Structured**: `## <timestamp>` heading followed by `Source:` / `Note:` / `Tags:` lines
- **Batch import**: `## <timestamp> — apple-notes batch import` followed by a block of free-form lines, often one URL per line with optional notes
- **Bare**: any URL or text block without a proper heading

If the inbox has zero unprocessed entries, say so and stop. Do not fabricate work.

## Step 3: Extract content from each entry

For each entry, determine what the tip actually is using this tiered fallback:

1. **User-provided note wins.** If there's a `Note:` line or any free text alongside the URL, that IS the extraction. Skip transcription entirely.
2. **Auto-captions via yt-dlp.** For a bare URL with no note, try:
   ```bash
   yt-dlp --write-auto-subs --skip-download --sub-lang en --sub-format vtt -o '/tmp/tip-%(id)s.%(ext)s' '<url>'
   ```
   Read the resulting `.vtt` file if it exists.
3. **Whisper transcription.** If no auto-captions, download audio and transcribe:
   ```bash
   yt-dlp -x --audio-format mp3 -o '/tmp/tip-%(id)s.%(ext)s' '<url>'
   whisper /tmp/tip-<id>.mp3 --model base --output_format txt --output_dir /tmp
   ```
   Use `whisper-cpp` (`brew install whisper-cpp`) or the Python `openai-whisper` package, whichever is available. If neither is installed, skip to step 4.
4. **Vision fallback.** For silent videos with on-screen text, extract 3-5 keyframes with ffmpeg and read them with your vision capability:
   ```bash
   ffmpeg -i /tmp/tip-<id>.mp4 -vf 'fps=1/5' /tmp/tip-<id>-%02d.jpg
   ```
   Then read the jpg files as images.
5. **Ask the user.** If all three technical paths fail, flag the entry with `# needs manual transcription` and move on.

**Do not install dependencies silently.** If yt-dlp / whisper / ffmpeg is missing, note it and fall back — do not run `brew install` without permission.

**Always clean up /tmp/tip-* files** after processing each entry, even if the entry failed.

## Step 4: Group and route

Once every entry has extracted content, group related tips together and draft proposed wiki updates. Use the routing table in `wiki/workflows/tips-ingest.md`:

| Tip type | Destination |
|---|---|
| Claude Code hook / slash command / skill trick | `patterns/agent-automation.md` section |
| New MCP server or tool | `entities/<tool>.md` (new) |
| Testing trick | `architecture/testing.md` |
| Security / auth nugget | `architecture/security.md` or `architecture/auth.md` |
| Stack-specific (Next.js, RN, Supabase) | Relevant `stacks/*.md` |
| Workflow-wide adoption | ADR in `decisions/` |
| Novel technique with substance | New `patterns/*.md` page |

Present the proposed changes as a numbered list. For each proposed change, show:
- Destination file
- What section gets added or modified
- The exact text that will be written (or diff for edits)
- Which inbox entries it consumes

**Wait for user approval before writing any wiki changes.** The user may approve all, approve some, or ask to revise.

## Step 5: Apply approved changes

For each approved proposal:
- Write to the destination wiki page (Edit for modifications, Write for new pages)
- Update `wiki/index.md` if new pages were created
- Follow `wiki/workflows/ingest.md` rules for wikilinks

Run the knowledge base linter to verify nothing broke:

```bash
cd /Users/[youruser]/Obsidian/VibeCoding/mcp-server
node --import tsx --input-type=module -e "import { executeLint } from './src/tools/lint.ts'; const r = await executeLint('/Users/[youruser]/Obsidian/VibeCoding'); console.log(JSON.stringify(r.stats)); r.issues.forEach(i => console.log(i.type, i.page, i.message));"
```

Fix any broken links before continuing.

## Step 6: Archive processed entries

Move all processed entries out of `raw/tips/inbox.md` and into `raw/tips/processed/YYYY-MM.md` (create the file if it doesn't exist for the current month). For each entry, annotate the outcome:

- `# routed → wiki/patterns/agent-automation.md` (accepted and written)
- `# skip — <reason>` (rejected as not useful)
- `# defer — <reason>` (keep for later, re-add to inbox on next run)

Do **not** delete entries. Everything gets moved to `processed/` for provenance. The only exception is entries annotated `# defer` — those get appended back to `raw/tips/inbox.md` after the archive move.

After archiving, the inbox should contain only the template header and any deferred entries.

## Step 7: Log and report

Append an entry to `/Users/[youruser]/Obsidian/VibeCoding/wiki/log.md`:

```markdown
## [YYYY-MM-DD] tips-ingest | Batch <N>

**Processed:** <N> entries
**Routed:** <count> (list destinations)
**Skipped:** <count> (list reasons)
**Deferred:** <count>
**New pages:** <list, or "none">
**Updated pages:** <list>
```

Then give the user a one-paragraph summary of what got routed where and what (if anything) needs their follow-up attention.

## Rules

- **Never write to the wiki without explicit approval for each proposal.** Batch approval is fine, silent writes are not.
- **Never delete inbox entries.** Always move to `processed/`.
- **Never install dependencies automatically.** Note missing tools and fall back.
- **Always clean up `/tmp/tip-*` files** after processing.
- **Always run the linter** after wiki writes.
- **Keep the final summary short** — the user doesn't need a replay of everything you did.
