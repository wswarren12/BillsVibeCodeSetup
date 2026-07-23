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

### Authorization & Access Control (IDOR, RLS gaps)

<!-- No findings recorded yet. -->

### Input Validation & Injection

### No length caps on free-text fields
- **Found in:** roadmap-builder.4 — all API routes writing title/description/okrs/dris/kpi/milestoneText (2026-07-23)
- **Severity:** low
- **Vulnerability:** authenticated writers can store arbitrarily large strings (dates/status/emails are validated, lengths are not) — storage bloat and oversized payloads to every reader; abuse bounded to users with write access.
- **Fix:** (recommended) enforce server-side max lengths (e.g. 200 chars titles, 5k descriptions) alongside the existing validators.
- **Prevention rule:** every string field that reaches the database gets a server-side max length, even in trusted-user apps.
- **Detect:** in each route's input mapping, ask "what bounds the size of this string?"

### Secrets & Configuration

### Live service-role key inside the deploy-zip root
- **Found in:** roadmap-builder.4 — `app/.env.local` (Supabase service_role JWT) (2026-07-23)
- **Severity:** medium (process risk — not currently exposed)
- **Vulnerability:** a live service-role key (bypasses RLS; key exp ~2100) sits inside `app/`, the exact directory that gets zipped and uploaded at deploy time. `.gitignore` and `.dockerignore` both cover `.env*`, but the deploy zip is built by an agent following instructions — one sloppy zip command ships the key to be stored server-side.
- **Fix:** covered by `.dockerignore`/`.gitignore`; the production key is meant to arrive via the LabOS secrets flow. Residual risk is procedural.
- **Prevention rule:** before any deploy-zip upload, list the archive contents and assert no `.env*`/key material is present; prefer keeping live keys outside the shippable directory entirely (e.g. project root, not `app/`).
- **Detect:** `unzip -l` (or equivalent) the artifact before upload; grep the app dir for `.env` files and check every ignore layer covers them.

### Client-Side Exposure

<!-- No findings recorded yet. -->

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
