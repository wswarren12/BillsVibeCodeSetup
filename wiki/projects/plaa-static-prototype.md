# PLAA Static Prototype

Status: built (2026-08-12)
Repo directory: `/Users/[youruser]/Desktop/PLAA_Web_Design`
Hosting: Netlify static publish root (`.`)

## Purpose

Serve the approved Alignment Asset Design Composer prototype exactly as exported for browser-based demonstration.

## Source of truth

`index.html` is the verbatim `Alignment Asset.dc.html` export, with `support.js` and `ds/` retained as its local runtime assets. The app has no backend, build step, authentication, ports, or adapters. Its built-in Demo controls provide client-side prospective, new-member, and active-member states; they are not real authorization.

## Decision

Netlify is used instead of the default Vercel web stack because this is a dependency-free static artifact. See [[decisions/2026-08-12-plaa-static-prototype-netlify]].
