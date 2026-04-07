# Project Snapshot: LinkedIn Job Hunter

**Source:** ~/Desktop/linkedin-job-hunter/
**Date:** 2026-04-06
**Type:** Python Job Search Automation Pipeline

## Stack
- Runtime: Python 3.12+
- Browser automation: Playwright (headless Chromium)
- HTML parsing: BeautifulSoup4 + lxml
- HTTP: aiohttp (async career page discovery)
- AI/RAG: notebooklm-py (cover letter generation via NotebookLM)
- Database: SQLite (WAL mode, foreign keys)
- Scheduling: macOS launchd (every 3 days via plist)
- Build: setuptools

## Architecture
Flat `src/` package with a 7-step pipeline orchestrated by `main.py`:

1. **Ingest** (`ingest.py`) -- Parse LinkedIn `Connections.csv` into SQLite; upload connections + resume to a NotebookLM notebook for RAG context.
2. **Discover** (`discover.py`) -- Find career page URLs for each company using async web requests; detect ATS platform (Greenhouse, Lever, Ashby, Workday, etc.).
3. **Scrape** (`scraper.py`) -- Playwright renders career pages; ATS-specific parsers (Greenhouse, Lever, Ashby) extract job listings, with a generic fallback for unknown sites.
4. **Filter** (`filter.py`) -- Regex-based classification: include Product Manager variants, exclude Project/Program/Property/Production Manager.
5. **Score** (`scorer.py`) -- Rank PM roles by relevance using weighted keyword matching (crypto/web3/legaltech/AI/agentic score highest).
6. **Cover Letters** (`cover_letter.py`) -- Generate personalized cover letters by prompting NotebookLM with resume + connections context (RAG).
7. **Outreach** (`outreach.py`) -- Draft outreach messages to LinkedIn connections at target companies.
8. **Digest** (`emailer.py`) -- Build HTML + plain-text digest of new roles + outreach; save to `data/latest_digest.html`.

Data layer (`db.py`): Five tables -- `connections`, `companies`, `job_listings`, `cover_letters`, `outreach_messages`. Simple migration system via ALTER TABLE with ignore-on-duplicate.

## Patterns Observed
- **Async throughout** -- Pipeline is `async def`, uses `asyncio.run()` at the entry point. Playwright and aiohttp are both async.
- **Strategy pattern for ATS scrapers** -- Dict mapping ATS name to scraper function (`ATS_SCRAPERS`), with generic fallback.
- **Granular skip flags** -- Every pipeline step can be independently skipped via CLI args (`--skip-ingest`, `--skip-scrape`, etc.).
- **launchd scheduling** -- macOS plist runs the pipeline every 259200 seconds (3 days), skipping ingest by default (connections CSV rarely changes).
- **Context manager for DB** -- `get_db()` yields a connection with auto-commit/rollback.
- **INSERT OR IGNORE + UNIQUE constraints** -- Idempotent ingestion; safe to re-run without duplicates.

## Lessons / Decisions
- **NotebookLM as RAG engine** -- Rather than building a custom vector store, the project uses Google's NotebookLM (via `notebooklm-py[browser]`) as a managed RAG backend for cover letter generation. Clever reuse of an existing product.
- **ATS-aware scraping** -- Dedicated parsers for the three most common ATS platforms (Greenhouse, Lever, Ashby) dramatically improves extraction quality vs. a generic scraper alone.
- **Personalized scoring** -- Priority domains (crypto, web3, legaltech, AI, agentic) are hardcoded to match the user's career interests, making the tool opinionated and practical rather than generic.
- **No external API keys for scraping** -- Playwright + BeautifulSoup handles everything client-side; no paid scraping services.
- **SQLite WAL mode** -- Enables concurrent reads during long scraping runs without blocking the digest/email step.
- **Resume auto-discovery** -- `find_resume()` searches multiple patterns and directories, accommodating file renames without config changes.
