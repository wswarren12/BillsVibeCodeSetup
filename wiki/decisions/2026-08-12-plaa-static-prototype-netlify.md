# ADR: Host the PLAA static prototype on Netlify

**Date:** 2026-08-12
**Status:** accepted

## Context

The approved PLAA deliverable is an exact, backend-free Design Composer export. The vault defaults web projects to Next.js on Vercel, but that stack would add an unnecessary build/runtime layer and risk changing the prototype.

## Decision

Publish the repository root as a static Netlify site. Keep `index.html` as the verbatim export with its sibling `support.js` and `ds/` assets. Do not add a build transform, serverless functions, authentication, or backend.

## Consequences

### Positive

The deployed site preserves the approved prototype's visual and client-side behavior with no project dependencies.

### Negative

The prototype relies on its existing external CDN resources and is not an authenticated application.

### Neutral

This deliberately replaces the vault's Vercel default for this static artifact only.

## Related

- [[decisions/2026-06-24-syncing-large-claude-design-dc-html-files-past-the-mcp-256-kib-cap]]
- [[projects/plaa-static-prototype]]
