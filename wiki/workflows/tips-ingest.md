# Tips Ingest Workflow

Lightweight capture pipeline for short-form coding tips from videos, TikToks, DMs, and articles. Optimized for high-volume, low-density sources where most content isn't worth a full [[workflows/ingest]] pass.

Pairs with [[workflows/ingest]] — use that for long-form articles and docs; use this for bite-sized tips.

---

## Why a separate flow?

The main [[workflows/ingest]] assumes a durable, self-contained source in `raw/articles/` or `raw/docs/`. Videos break that assumption:

- URLs rot, videos get deleted, TikToks get hidden
- 90% of a 60-second video is noise; the tip is 10 seconds
- The "raw" artifact is really a URL + transcription, not a file
- Capture has to be mobile-first or it doesn't happen at all

Solution: keep `raw/tips/inbox.md` as the append-only capture layer, process in batches, and route each extracted tip to the appropriate existing wiki page rather than giving every tip its own file.

---

## Rules

- **Never edit `raw/tips/inbox.md` entries once logged** — processed entries are moved to `raw/tips/processed/YYYY-MM.md`, not deleted in place
- **Every extracted tip lands in an existing wiki page by default** — only create a new page if the tip is substantial enough to stand alone
- **If you can't extract a useful tip, move the entry to `raw/tips/processed/YYYY-MM.md` with a `# skip` note** — don't let rejected tips clog the inbox
- **Run the processor when the inbox is full, not on a calendar** — quality over cadence

---

## Step 1: Capture

Capture happens in two places, both end up in `raw/tips/inbox.md`:

### On iPhone (Apple Notes staging)

1. Create a pinned Apple Note called **"Claude Tips Inbox"** (one time)
2. When you see a tip: Share → Copy Link → swipe to Notes → paste + type a 1-sentence note
3. Ideal entry format:
   ```
   https://www.tiktok.com/@someone/video/123
   Hook trick: use PostToolUse to run prettier after every edit
   ```
4. Bare URLs are fine — they'll be transcribed during processing. A 1-sentence note from you is 10× faster and more accurate than auto-transcription, so prefer it when you have 5 seconds.

### On Mac (desktop quick-capture)

Run `/tip <url> <note>` inside Claude Code. Appends a timestamped entry directly to `raw/tips/inbox.md`.

---

## Step 2: Process (batch)

Run `/process-tips` in Claude Code when the inbox feels full (~10-20 entries) or on a scheduled review (weekly/biweekly).

The processor:

1. **Pulls from Apple Notes** via `scripts/import-apple-notes.sh`, appending any new entries to `raw/tips/inbox.md` and clearing the Apple Note
2. **Reads every unprocessed entry** in `raw/tips/inbox.md`
3. **Extracts content** from each entry using a tiered fallback:
   - User-provided note wins (no extraction needed)
   - `yt-dlp --write-auto-subs --skip-download <url>` for auto-captions
   - `yt-dlp <url>` + `whisper` for audio transcription
   - `ffmpeg` keyframe extraction + vision for silent videos with on-screen text
   - Ask the user if all else fails
4. **Groups related tips** and **proposes wiki updates**:
   - Most tips update an existing page (e.g., new Claude Code hook trick → `patterns/agent-automation.md`)
   - Some become new entity pages (e.g., a new MCP server → `entities/<tool>.md`)
   - A few become new pattern pages if the technique is substantial and novel
   - Any tip that's workflow-wide enough might deserve an ADR in `decisions/`
5. **Waits for user approval** before writing anything to the wiki
6. **Moves processed entries** to `raw/tips/processed/YYYY-MM.md` with outcome annotations (routed-to / skipped / deferred)
7. **Appends a log entry** to `wiki/log.md` with counts and routing summary

---

## Step 3: Routing decisions

When processing, use these defaults to decide where an extracted tip lands:

| Tip type | Destination |
|---|---|
| Claude Code hook / slash command / skill trick | `patterns/agent-automation.md` section |
| New MCP server or tool | `entities/<tool>.md` (new) |
| Testing trick | `architecture/testing.md` |
| Security / auth nugget | `architecture/security.md` or `architecture/auth.md` |
| Stack-specific technique (Next.js, RN, Supabase) | Relevant `stacks/*.md` |
| Workflow-wide change you want to adopt across projects | ADR in `decisions/` |
| Novel technique with enough substance | New page in `patterns/` |
| Unclear / needs testing | Stay in `raw/tips/processed/YYYY-MM.md` with `# defer` annotation |

Always follow the [[workflows/ingest]] rules for wikilinks and index updates when adding new pages.

---

## Dependencies

Required:
- **None** for the capture layer (`/tip`, inbox.md, Apple Notes)

Optional (for auto-transcription during `/process-tips`):
- `yt-dlp` — `brew install yt-dlp`
- `ffmpeg` — `brew install ffmpeg`
- Whisper — `brew install whisper-cpp` OR `pip install openai-whisper` OR OpenAI Whisper API

You can start without any of these and rely on your own 1-sentence notes in the Apple Note. Add transcription only if you find yourself capturing bare URLs you can't summarize later.

---

## Related Wiki Pages

- [[workflows/ingest]] — Full source ingestion for articles, docs, project snapshots
- [[workflows/feature-dev]] — When a tip suggests a workflow change worth adopting, feed it through feature-dev
- [[principles/anti-patterns]] — Don't over-engineer the capture flow. Friction is the enemy.
