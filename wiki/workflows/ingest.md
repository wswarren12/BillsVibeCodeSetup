# Source Ingestion Workflow

Process for incorporating external knowledge (articles, docs, project snapshots, assets) into the wiki.

---

## Rules

- **Never modify `raw/`** — raw sources are immutable once added
- **Always update [[index]]** — every new page must be cataloged
- **A single source typically touches 5-15 pages** — expect cross-cutting updates
- **Involve the user at each step** — get approval before moving to the next step

---

## Step 1: Add Source

- User adds material to the appropriate `raw/` subdirectory:
  - `raw/articles/` — blog posts, essays, tutorials
  - `raw/docs/` — official documentation, API references
  - `raw/project-snapshots/` — codebases, config files, architecture exports
  - `raw/assets/` — images, diagrams, videos

## Step 2: Read and Discuss

- Read the source material thoroughly
- Discuss key findings with the user
- Identify:
  - **Concepts** — new ideas, patterns, or principles
  - **Entities** — tools, libraries, services, people, organizations
  - **Decisions** — architectural choices, tradeoffs, recommendations
- Get user approval on what to extract

## Step 3: Write Summary

- Create `wiki/summaries/<source-name>.md`
- Include: source metadata, key takeaways, concepts identified, entities mentioned
- Link to relevant existing wiki pages using wikilink syntax (double-bracket links)

## Step 4: Update Wiki Pages

- Update existing pages with new information from the source
- Create new pages where the source introduces novel concepts or entities
- Add wikilinks to connect new content to existing content
- Resolve contradictions — if the source disagrees with existing wiki content, flag it for user decision
- New entity pages go in `wiki/entities/`
- New synthesis pages go in `wiki/syntheses/`

## Step 5: Update Index

- Add all new pages to [[index]] under the appropriate section
- Follow the format: `- [​[category/page-name]] — One-line summary`

## Step 6: Log

- Append to [[log]] with:
  - Date
  - Operation type (`ingest`)
  - Source name
  - Pages affected (created and updated)
