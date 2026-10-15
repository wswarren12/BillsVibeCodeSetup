# Security Findings

The empirical companion to [[architecture/security]]. That page is the prescriptive baseline (what to do up front); this page is the catalog of vulnerabilities **actually found** in security reviews of these projects — what was exposed, how it was fixed, and the rule that prevents it in the next analogous project.

**Read this page before starting any security review or security-sensitive feature.** Known vulnerability classes get checked first — a finding recorded here should never be re-discovered from scratch in a later project.

---

## Capture protocol

Populated by the Security Review Capture flow: after any security review (`/security-review`, `/code-review` with security scope, or a security-reviewer agent), every **confirmed** finding is recorded here.

- **Dedup first** (Lesson Capture Step 3 applies): search this page for the vulnerability class before adding. Same class in a new context → extend the existing finding's *Found in* and refine its prevention rule; don't duplicate.
- **Confirmed findings only.** False positives that were investigated and dismissed get one line in the review's `log.md` entry (so the next review doesn't re-litigate them), not an entry here.
- **Sanitize entries.** Describe the vulnerability class and location; never paste live secrets, tokens, or working exploit payloads into the vault.
- Every review — even one with zero findings — gets a `log.md` entry naming the project, scope, and outcome, recorded via `kb_log`.

### Finding format

```markdown
### <Vulnerability class — short name>
- **Found in:** <project> — <file/route/table> (<date>)
- **Severity:** critical | high | medium | low
- **Vulnerability:** what an attacker could do, and why the code allowed it
- **Fix:** the change that closed it
- **Prevention rule:** forward-looking instruction a future session can follow
- **Detect:** how to spot this in review — the grep, the question to ask, or the test to run
```

---

## Findings by category

### Development static server exposes private repository files
- **Found in:** PLAA Activity Bot — `dev/local-server.mjs`, manual production UI setup (2026-09-25).
- **Severity:** high when reachable by untrusted clients.
- **Vulnerability:** the fallback static handler served arbitrary files beneath the repository root, including environment files and deployment backups; its listener bound all interfaces by default. Gitignore does not restrict HTTP access.
- **Fix:** bind the bench to `127.0.0.1` and allow only the exact public page, widget bundles and activities catalog. Backend bench checks verify private paths return 404 and public assets remain available.
- **Prevention rule:** never expose the repository root as a static directory; explicitly allow public assets and bind credential-bearing development tools to loopback.
- **Detect:** inspect static fallback roots and listener addresses; request private configuration paths without recording response contents. No evidence of prior exploitation was observed.

### Teardown deletes the resource but leaves its credentials on disk
- **Found in:** PLAA Activity Bot — `workflow/provision-live-test.mjs`, isolated readiness probes (2026-09-25, caught in independent review).
- **Severity:** low-to-medium (depends on what the orphaned secret still authorizes).
- **Vulnerability:** the provisioner writes each isolated probe/clone's endpoint URL, one-off bearer token and workflow id into a private `0600` runtime env file. `--destroy` deleted the workflows but never removed those keys, so the file kept advertising a live-looking endpoint+token trio for a resource that no longer existed. Two concrete harms: an operator (or a later script) reads a "configured" endpoint and confidently talks to a 404, and a token that was supposed to have a lifetime bounded by its workflow instead persists indefinitely on disk with nothing revoking it. The same shape applies to any provision/teardown pair — temporary API keys, tunnel URLs, scratch database URLs.
- **Fix:** declare key ownership per resource kind in one place (`RUNTIME_KEY_NAMES`), make the prune decision a pure function (`pruneEnvEntries(entries, deadKinds)`) with unit tests, and call it from teardown after the manifest is rewritten — pruning only kinds with **no surviving resource**, and never touching keys it does not own.
- **Prevention rule:** provisioning and teardown must be symmetric in *both* directions — whatever `create` writes (cloud resource **and** local secret material), `destroy` removes. "Delete it by hand later" in a teardown log line is an unenforced TODO, not cleanup. Treat a secret whose authorizing resource is gone as an orphan to be deleted, not as harmless.
- **Detect:** after any teardown, diff the private runtime/env file against the resource manifest; every key must map to a resource that still exists. A `--status` listing that is empty while the env file is full is the signature.

### Authentication & Session

### Dev-auth bypass not guarded by NODE_ENV
- **Found in:** roadmap-builder.4 — `app/src/lib/auth.ts` (`resolveIdentity`) (2026-07-23)
- **Severity:** low
- **Vulnerability:** `DEV_AUTH=1` switches identity resolution to a client-controlled `dev_user` cookie (or a default dev owner with no cookie at all). Nothing prevents the flag from being honored in a production build — if the env var were ever set on the deployed app (operator mistake, secrets-flow typo), every visitor could impersonate any uid.
- **Fix:** (recommended, not yet applied) refuse the dev path when `NODE_ENV === 'production'`, or require an additional non-guessable `DEV_AUTH_SECRET`.
- **Prevention rule:** any env-gated auth shim must also check `NODE_ENV !== 'production'` (belt-and-suspenders), and the Dockerfile/deploy flow must never declare the flag.
- **Detect:** grep for the dev-auth env flag; confirm the production build refuses it even when set.

### Unbounded in-memory identity cache
- **Found in:** roadmap-builder.4 — `app/src/lib/auth.ts` (token→identity Map) (2026-07-23)
- **Severity:** low
- **Vulnerability:** validated tokens are cached in a global Map with a 5-min TTL but no eviction — entries are only overwritten when the same token is re-seen, so long uptime with many rotating tokens grows memory without bound (slow memory-exhaustion vector).
- **Fix:** (recommended) prune expired entries on insert, or cap the Map size (simple LRU).
- **Prevention rule:** every server-side cache keyed by client-supplied values needs a size bound or eviction sweep, not just per-entry TTL.
- **Detect:** search for `new Map()` caches keyed on tokens/headers; ask "what removes entries?"

### Per-turn identity resolution with no session binding
- **Found in:** PLAA Activity Submission Bot — `workflow/lib/identity-verification.mjs` (`resolveTurnIdentity`) (2026-09-24), caught in review **before** wiring
- **Severity:** medium (would have been high once wired)
- **Vulnerability:** a pure `verify(introspectionResponse) → identity` helper is safe in isolation and unsafe as a per-turn call in a multi-turn conversation. Nothing pinned the verified uid to the session, so turn *n* could verify as member A and turn *n+1* as member B while a single half-built draft accumulated — the submitted record would carry whichever identity happened to verify last. A verified email could likewise silently replace an address the member had already typed for the draft in flight.
- **Fix:** `resolveTurnIdentity` now returns `pinMemberUid` (persist on first verification, pass back as `sessionMemberUid` every later turn); a different verified uid returns `abort: true` rather than overwriting, and a `collectedEmail` always wins over a verified one for the draft in flight.
- **Prevention rule:** identity verification in a stateful conversation is two controls, not one — *verify the credential* **and** *bind the result to the session on first success, aborting on mismatch*. Add the binding before the verifier is wired; retrofitting it after means auditing every draft written in between.
- **Detect:** for any `verify…(claims) → identity` helper, ask "what happens if this returns a **different** subject on turn 2?" If the answer is "it overwrites", the binding is missing. Test it explicitly: same uid twice → ok; changed uid → abort, not overwrite.

### Identity-by-claim presented as verified identity (documentation risk)
- **Found in:** PLAA Activity Submission Bot — `docs/RUNBOOK.md` §7 / `workflow/lib/airtable.mjs buildParticipantFields` (2026-09-24)
- **Severity:** low (documentation/threat-model accuracy; behavior unchanged)
- **Vulnerability:** the runbook described `member_uid` as reaching production rows "the safe way — server-side from an EXACT AAID Registry email match". The lookup is server-side, but its key is the email the member typed in chat. A member who knows a colleague's address gets that colleague's `member_uid` written to the row. Carrying that sentence into a pattern library would launder identity-by-claim into "verified identity" for the next project that copies it.
- **Fix:** reworded to "server-side derived, but from a self-asserted email — this is not authentication", with the consequence spelled out.
- **Prevention rule:** when documenting an identity mechanism, name the *trust source of the key*, not just where the lookup runs. "Server-side lookup" is not a synonym for "verified".
- **Detect:** for every identity field written to storage, trace the key back to its origin; if any hop is user-typed text, the field is a claim.

### Authorization & Access Control (IDOR, RLS gaps)

### Soft-deleted content leaks through secondary download routes
- **Found in:** PLaybook — `app/routes/skills.js`, legacy POST `/:id/download` and skill PATCH (2026-10-06).
- **Severity:** medium.
- **Vulnerability:** normal reads excluded `removed_at` rows, but the counter/download endpoint updated any matching ID and returned its install snippet. A signed-in member with the ID could recover removed content after a takedown; the edit route also accepted removed skills.
- **Fix:** filter removed rows in legacy download/edit routes, enforce the same parent visibility for new original-ZIP downloads, and lock/recheck the parent before archive replacement. API tests assert removed snippets/archives return 404 and removed skills cannot be updated.
- **Prevention rule:** carry removal/visibility rules into every data-bearing secondary route (downloads, exports, counters returning content), not only lists and detail views. Recheck state at writes and avoid caching private downloads.
- **Detect:** trace every route that returns original content or a file for a soft-deletable row; test those routes after marking that row removed, using a still-valid signed-in caller.

### Sync/mirror propagation as a write channel — link creation under-authorized
- **Found in:** roadmap-builder.4 (Roadmapper) — `app/src/lib/sync.ts` + `POST /api/roadmaps/[id]/items/import` (2026-08-14)
- **Severity:** high
- **Vulnerability:** cross-roadmap "linked item" import required only READ on the source roadmap. Since edits to any linked copy propagate to all copies without re-checking the caller's role on sibling roadmaps, a viewer of roadmap A could import A's item into their own roadmap and then write into A through the copy (read→write privilege escalation). Sprint create/update/delete propagated the same way.
- **Fix:** creating a link is treated as a write on BOTH roadmaps — the import endpoint now requires owner/editor on the source (viewer → 403; invisible roadmap → 404). With that invariant, propagation-time checks are unnecessary: every sync group only spans roadmaps whose write-holders opted into shared editing. The invariant is documented at the top of `lib/sync.ts`.
- **Prevention rule:** any feature that mirrors/propagates writes across authorization boundaries (linked records, shared embeds, sync groups) must authorize the LINK CREATION at the strictest tier of any write it will later enable — or re-check the actor's role on every propagation target. Read access to data is never sufficient to create a channel that can write it.
- **Detect:** grep for propagation loops that call store write methods on rows fetched by group/link id (`listItemsBySyncGroup`, `listSprintsBySyncGroup`, or similar) and ask: "what was required to put a row into this group?" If the answer is less than write-on-that-row's-parent, it's exploitable.

### Implicit temporary-schema precedence in SECURITY DEFINER audit lookup
- **Found in:** PLAA Schemas — SQL function search paths / audit catalog lookup (2026-09-08)
- **Severity:** medium
- **Vulnerability:** a fixed search path that omitted `pg_temp` still allowed caller-created temporary catalog-name tables to precede real system catalogs during relation resolution, breaking or misdirecting audit-key lookup. Explicit application-table qualification alone did not protect unqualified catalog reads.
- **Fix:** place `pg_catalog` first and explicit `pg_temp` last in every project function's fixed search path; restrict EXECUTE and schema CREATE. Regression test 030 creates conflicting temporary catalog names under an actual runtime role and verifies the audited API remains functional.
- **Prevention rule:** include explicit `pg_temp` last in definer paths and qualify sensitive relations; test catalog-name shadowing as well as application-table shadowing.
- **Detect:** inspect `pg_proc.proconfig`, and test caller-created temporary names against all definer lookup paths.

### Review audit actor loses the operator's text identity
- **Found in:** PLAA Schemas — `plaa.audit_write`, submission/crosswalk review (2026-09-08)
- **Severity:** low
- **Vulnerability:** audit actor extraction omitted `reviewed_by`, falling back to a shared database principal for review mutations even though the supplied reviewer was present in the row. The after-image retained evidence, but the dedicated actor field was misleading for operator attribution.
- **Fix:** select the changed reviewer principal for review audit entries, retaining the separate database principal and before/after evidence; regression test 032 verifies both review paths.
- **Prevention rule:** audit the actor of the mutation, not merely the row creator or shared service account; retain database identity separately and validate the backend's actor trust contract.
- **Detect:** inspect audit trigger field precedence for every mutation workflow and assert actual actor values, not just existence of an audit row.

### Input Validation & Injection

### No length caps on free-text fields
- **Found in:** roadmap-builder.4 — all API routes writing title/description/okrs/dris/kpi/milestoneText (2026-07-23)
- **Severity:** low
- **Vulnerability:** authenticated writers can store arbitrarily large strings (dates/status/emails are validated, lengths are not) — storage bloat and oversized payloads to every reader; abuse bounded to users with write access.
- **Fix:** (recommended) enforce server-side max lengths (e.g. 200 chars titles, 5k descriptions) alongside the existing validators.
- **Prevention rule:** every string field that reaches the database gets a server-side max length, even in trusted-user apps.
- **Detect:** in each route's input mapping, ask "what bounds the size of this string?"

### Secrets & Configuration

### DB TLS encrypted-but-unverified on managed platform Postgres (accepted, mitigated)
- **Found in:** roadmap-builder.4 (Roadmapper) — `app/src/lib/store/postgres.ts`, `app/db/migrate.js` (2026-08-15)
- **Severity:** medium (accepted risk with upgrade path)
- **Vulnerability:** `pg` pools connect to the PLN-provisioned RDS with `ssl: { rejectUnauthorized: false }` — encrypted but not certificate-verified, so an on-path attacker inside the platform network could in principle MITM the DB connection.
- **Fix:** partially accepted: the setting is the PLN kit's documented contract (no CA bundle is distributed to apps; strict verify risks failing the first-boot migration). Mitigation shipped: `PGSSLROOTCERT` env var enables strict verification (`ca` + rejectUnauthorized:true) with zero code change once PLN provides a bundle; mode is fixed at boot — no runtime downgrade path.
- **Prevention rule:** when a platform prescribes unverified TLS, isolate the ssl config in one helper, add a CA-bundle env escape hatch immediately, and record the accepted risk — don't scatter `rejectUnauthorized: false` across call sites.
- **Detect:** grep `rejectUnauthorized` — every hit must be one shared helper with a documented CA override.

### Live service-role key inside the deploy-zip root
- **Found in:** roadmap-builder.4 — `app/.env.local` (Supabase service_role JWT) (2026-07-23)
- **Severity:** medium (process risk — not currently exposed)
- **Vulnerability:** a live service-role key (bypasses RLS; key exp ~2100) sits inside `app/`, the exact directory that gets zipped and uploaded at deploy time. `.gitignore` and `.dockerignore` both cover `.env*`, but the deploy zip is built by an agent following instructions — one sloppy zip command ships the key to be stored server-side.
- **Fix:** covered by `.dockerignore`/`.gitignore`; the production key is meant to arrive via the LabOS secrets flow. Residual risk is procedural.
- **Prevention rule:** before any deploy-zip upload, list the archive contents and assert no `.env*`/key material is present; prefer keeping live keys outside the shippable directory entirely (e.g. project root, not `app/`).
- **Detect:** `unzip -l` (or equivalent) the artifact before upload; grep the app dir for `.env` files and check every ignore layer covers them.

### Client-Side Exposure

### Public projections built from unverified workflow artifacts
- **Found in:** NewsBreef — `web/lib/ai-archive.ts`, `web/workflows/steps/send-emails.ts`, AI archive publication path (2026-09-18, found and fixed before deployment).
- **Severity:** high (two P1 release blockers; no observed production exposure).
- **Vulnerability:** public readers could receive an unsent draft because resolved Resend `{data:null,error}` results incremented the success count. Separately, list titles/excerpts could disclose an earlier unsent same-day attempt because the dedup ledger's execution ID was shared across attempts. Sanitizing HTML and requiring positive database counters did not establish publication provenance.
- **Fix:** require provider acknowledgement with an ID and no SDK error; publish into a new confirmed-only KV namespace and never fall back to legacy pre-send copies. Extract headline/excerpt during sanitization of that exact published snapshot. API/account errors do not mark recipients bounced. The archive fills prospectively; acknowledgement is not inbox-delivery certification.
- **Prevention rule:** public projections must inherit the displayed snapshot's publication boundary. A cache entry, resolved SDK promise, or shared date/run label is not proof of successful publication. Separate UI-quality scores from security/data-safety acceptance.
- **Detect:** inspect actual SDK error return shapes, seed an earlier unsent attempt before a later acknowledged copy, and verify legacy cache exclusion. Regressions cover returned errors, missing IDs, mixed results, invalid API keys without recipient mutation and exact-copy metadata. Same-reviewer recheck: all original blockers resolved, OK with notes; source/test review, not live-provider certification.

### API & Webhook Hardening

### No CSRF/Origin validation on cookie-authenticated mutating routes
- **Found in:** roadmap-builder.4 — all POST/PATCH/DELETE API routes (auth = LabOS `authToken` cookie) (2026-07-23)
- **Severity:** low (conditional)
- **Vulnerability:** state-changing routes authenticate purely from a cookie and never check `Origin`/`Sec-Fetch-Site`. `req.json()` parses bodies regardless of Content-Type, so a cross-site `text/plain` form POST would be accepted — exploitable only if the platform cookie is `SameSite=None` (its SameSite policy is set by LabOS, outside the app's control).
- **Fix:** (recommended) reject mutating requests whose `Origin` header is present and not the app's own origin (or a `*.plnetwork.io` sibling).
- **Prevention rule:** any app authenticating from a cookie it doesn't set itself must add its own Origin check on mutations — don't assume the platform's SameSite settings protect you.
- **Detect:** find mutating routes; ask "what stops a cross-site form POST carrying this cookie?" Check whether the JSON parser enforces Content-Type.

### Dependencies & Supply Chain

### Framework pinned to an end-of-life major (Next.js 14)
- **Found in:** roadmap-builder.4 — `app/package.json` (next 14.2.35) (2026-07-23)
- **Severity:** medium
- **Vulnerability:** `npm audit` reports 1 critical / 2 high / 1 moderate against next@14.2.35 + its bundled postcss; the 14.x line is EOL so fixes only land in 15/16. Practical exploitability here is low — the flagged surfaces (next/image, Server Actions, middleware, i18n Pages Router, beforeInteractive scripts, rewrites) are all unused, and routes are force-dynamic — but the gap only widens.
- **Fix:** (recommended) plan an upgrade to Next.js 15/16; until then re-check each new advisory against actually-used features.
- **Prevention rule:** treat an EOL framework major as a standing medium finding even when current advisories don't apply — new ones will never be patched for it.
- **Detect:** `npm audit --omit=dev`; check whether the fix version crosses a major (signals EOL line); map each advisory to used features before rating.

### Web3 / Smart Contracts

<!-- No findings recorded yet. -->

---

## Related

- [[architecture/security]] — the prescriptive baseline every project starts from
- [[workflows/lesson-capture]] — general lesson capture; its dedup hard gate governs this page too
- [[patterns/data-modeling]] — RLS policy patterns
