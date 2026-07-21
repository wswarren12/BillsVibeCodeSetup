# ADR: Syncing large Claude Design (.dc.html) files past the MCP 256 KiB cap

**Date:** 2026-06-24
**Status:** accepted

## Context
When building front-end clickable prototypes from Claude Design, the design is exported as a self-contained `<file>.dc.html` (a Design Composer file rendered client-side by `support.js`, which boots React + Babel from CDN) plus a `ds/` design-system CSS bundle. The standard import path is the `claude_design` MCP `DesignSync.get_file` tool.

That tool has a HARD 256 KiB (262,144 byte) cap on returned file content. Small assets (`support.js` ~54 KB, the `ds/` token CSS files) stay well under it, but the main `.dc.html` grows as the prototype gains views/features. On the PLAA "Alignment Asset" prototype it crossed the cap between two work sessions (260 KB → 269 KB).

Past the cap, `get_file` silently returns TRUNCATED content: the JSON response has `truncated: true`, the content is cut mid-file (does not end with `</html>`), and the file size comes back as exactly 262,144 bytes. Applying a truncated `.dc.html` breaks the app at runtime — the component `<script>` is severed partway, producing a JavaScript `Unexpected token` error and a fallback/blank render. There is no offset/pagination parameter on `get_file`, so the tail is unreachable via the MCP. Hand-reconstructing the missing tail is unsafe because new view code adds data-bindings in the truncated region, so a graft silently drops them.

## Decision
For any `.dc.html` that may exceed 256 KiB, do NOT sync the main HTML file via the `claude_design` MCP `get_file`. Instead source it from a full local export:

1. In Claude Design, use Export / handoff to download the whole project bundle (a `…-handoff.zip` or `project/` folder containing `Alignment Asset.dc.html`, `support.js`, `ds/`, etc.).
2. Copy the complete `.dc.html` over the repo's entry file (e.g. `cp ".../project/<name>.dc.html" index.html`).
3. ALWAYS validate completeness before trusting it: `tail -c 20 index.html` must end with `</html>`, and `wc -c < index.html` must be > 262144 bytes. If it's exactly 262144 or doesn't end in `</html>`, it was truncated.
4. Verify it boots with no `Unexpected token` error (serve statically / `npm run dev` and load in a browser; check the console).

The small companion files (`support.js`, `ds/*`) CAN still be pulled via the MCP and diffed against the export — they rarely change. Before concluding "the design is updated," diff every file; in practice only the main `.dc.html` changes between iterations.

Hosting model that makes this work: keep the `.dc.html` export verbatim (never hand-edit it) so functionality matches "exactly," and layer any prototype concerns (password gate, demo controls) OUTSIDE it. The Alignment Asset's own "Demo controls" persona switcher lives inside the design; the Vercel Edge Middleware password gate wraps it externally.

## Consequences
Positive: re-imports stay faithful and never ship a half-truncated app; a 2-command check (`tail -c`, `wc -c`) reliably catches truncation; keeping the export verbatim preserves exact design fidelity and makes future syncs a single file drop.

Negative: syncing the main file now requires a manual browser export step (can't be fully automated through the MCP); the human must remember to re-export when the design changes. Mitigation: the prototype repo's README documents the export-and-drop workflow under "Re-importing the design," and the completeness checks are written out there.

Watch for: the 256 KiB limit is on the `claude_design` `get_file` tool specifically; other DesignSync methods (`list_files`, etc.) are unaffected. The threshold to apply this workflow is ~256 KiB of `.dc.html` source — most early-stage prototypes are under it and can still use the plain MCP pull.

## Related
