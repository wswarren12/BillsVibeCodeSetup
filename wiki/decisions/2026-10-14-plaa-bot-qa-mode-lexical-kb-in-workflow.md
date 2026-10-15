# ADR: PLAA bot Q&A mode — lexical (BM25) knowledge base embedded in the n8n workflow

**Date:** 2026-10-14
**Status:** accepted

## Context
The PLAA Activity Submission Bot gained a second entry point: a chat icon in the lower-right corner of the page → consent → "Submit an activity" (existing intake) or "Ask a question". Answers must come ONLY from a folder of documents (PLAA site snapshot, pl.xyz, plrd.org snapshots, the PLAA1 Trust PPM — ~4.5 MB of markdown + a 92-page PDF), the folder must be easy to extend, unknown answers refer to plaa-wg@plrs.xyz, and repeated unrelated questions end the session. Constraints: the bot runs as an n8n Cloud workflow whose only model vendor is Anthropic (no embeddings API), Code nodes cannot reach the filesystem, and the repo already has a "generate the workflow from config" pattern (`build-workflow.mjs`).

## Decision
1. **Lexical retrieval, no vector store.** `kb/build-kb.mjs` cleans and chunks every file in `kb/sources/` into ~1,400-char passages (`kb/plaa-kb-index.json`, ~2.2 MB); `kb/retrieval.mjs` is a ~80-line BM25 inlined into a `Retrieve Knowledge` Code node that runs only on question turns (top 6 passages, ~65 ms). Updating the KB = drop a file in, rebuild, regenerate, redeploy — the same config-sync step as `activities.json`. No new vendor, no ingestion job, no store to drift.
2. **Index embedded in the workflow JSON** (now ~3 MB), the same way `faq-corpus.md` is, rather than hosted and fetched per turn: there is no known public static host the workflow could reach, and hosting would add a runtime dependency.
3. **Off-topic enforcement in code, not model judgment.** The model ends each reply with `<qa_signal>answered|clarify|not_in_kb|off_topic</qa_signal>`; `Post-process` strips it and counts strikes — warn on the first, end the session (`event: "session_ended"`, session pinned ended server-side) on the second. A missing/unknown tag never counts.
4. **Member data excluded at build time.** Leaderboards, Top Contributors, Community Kudos, historical rounds and the snapshot owner's "Private account" pages are dropped by heading pattern (`EXCLUDED_SECTIONS`); the forbidden e-word is rewritten in the index only, so the workflow vocabulary gate stays green without exempting data.

## Consequences
### Positive
- Zero new credentials or services; retrieval, prompt and strike logic are all unit-tested against the GENERATED node source (`tests/unit/knowledge-qa.test.mjs`), and the dev bench exercises the real retrieval with a mocked model.
- Adding a document is a one-command change.
### Negative
- Lexical retrieval misses questions phrased with none of a page's words; follow-ups work only because the previous question is folded into the query. Upgrade path: swap `kb/retrieval.mjs` for an embeddings call + stored vectors (see [[architecture/embedding-models]]).
- A 3 MB workflow: the n8n editor is slow to open the `Retrieve Knowledge` node (never hand-edited anyway); deploy payload is still far under n8n's 16 MB default.
- The PPM is indexed — factual answers about the Trust are possible; the prompt still declines tax/legal/securities advice. Whether a Reg D PPM should be answerable by a public-page bot is a WG/Legal call, flagged to the owner.

## Related
[[projects/plaa-activity-bot]] · [[patterns/n8n-llm-workflows]] · [[patterns/llm-bot-structural-defense]] · [[architecture/embedding-models]]
