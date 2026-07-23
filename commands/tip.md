---
description: "Quickly capture a coding tip (URL + optional note) to the knowledge base inbox"
---

You are capturing a coding tip to the knowledge base inbox at `/Users/[youruser]/Obsidian/VibeCoding/raw/tips/inbox.md`.

## Arguments

The user invoked this command with: `$ARGUMENTS`

Parse the arguments as either:
- `<url>` alone — bare URL, no note
- `<url> <note>` — URL followed by a free-form note (everything after the first whitespace-delimited token)
- `<note>` alone — if the input doesn't start with `http://` or `https://`, treat the whole input as a note with no URL

If `$ARGUMENTS` is empty, ask the user what they want to capture (URL and/or note) before proceeding.

## Steps

1. **Get the current timestamp** in the format `YYYY-MM-DDTHH:MM` (local time). Use `date +%Y-%m-%dT%H:%M` via the Bash tool.

2. **Format a new entry**:

   ```markdown

   ## <timestamp>
   Source: <url or "(no url)">
   Note: <note or "(to transcribe)">

   ```

   Include the blank line before the heading so entries are visually separated.

3. **Append the entry** to `/Users/[youruser]/Obsidian/VibeCoding/raw/tips/inbox.md` using the Bash tool with a heredoc append (`>>`). Do not use Write or Edit — appending preserves the append-only semantics of the inbox.

4. **Confirm briefly** with a one-line status message showing the timestamp and whether the entry has a note or is flagged for transcription. Nothing else. Example: `Captured 2026-04-09T14:32 — note included` or `Captured 2026-04-09T14:32 — bare URL, will transcribe on /process-tips`.

## Rules

- Never read the inbox file unless needed for troubleshooting — this is a fire-and-forget capture command
- Never edit existing entries
- Never suggest running /process-tips after each capture — batch processing is intentional
- Keep the confirmation message to one line
