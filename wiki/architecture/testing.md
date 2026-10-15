# Testing

> **The goal is confidence that the core loop works, not coverage metrics.** Test the critical path end-to-end, test data mutations that are painful to undo, test genuinely tricky logic. Skip everything else until you have a reason to care.

## The MVP Testing Pyramid (Inverted)

The traditional pyramid says lots of unit tests, fewer integration tests, fewest E2E tests. **For MVPs, invert it:**

1. **A handful of E2E tests for the critical path** — the one user journey that IS the product.
2. **Integration tests for data mutations** — writes to the database that would be painful to debug if broken.
3. **Unit tests only for genuinely tricky logic** — math, parsing, state machines. Not components that render a div.

**Why:** In an MVP, interfaces between things break more often than the things themselves. A component renders correctly in isolation but breaks when the API returns a different shape. E2E tests catch this; unit tests don't.

## Decision Tree

- **New feature?** → BDD scenarios first, then Playwright E2E for the happy path + one error path
- **Bug fix?** → BDD scenario reproducing the bug, then Playwright test that would have caught it
- **Pure function (math, parsing, scoring)?** → Vitest unit test
- **Data mutation (insert/update/delete)?** → Vitest integration test against a real test database
- **Webhook receiver?** → Vitest integration test with a mock payload
- **Smart contract?** → Hardhat or Foundry tests
- **Mobile E2E?** → Detox (or manual on a real device if Detox setup feels too heavy for your MVP)
- **Styling, layout, snapshot of a div?** → Don't test it. Use your eyes.

## The BDD-to-Playwright Workflow

Features and bug fixes start as BDD scenarios (Given/When/Then) BEFORE any code is written. This forces you to define "done" in user-visible terms instead of implementation details.

1. Write BDD scenarios
2. Get approval on the scenarios (a single-line "looks right" from the user is enough)
3. Implement the feature
4. Write Playwright tests that map 1:1 to the BDD scenarios
5. Run tests → debug → green → commit

**Every feature needs a happy path and at least one error path.** If the only scenario you can think of is the happy path, you haven't thought about the feature hard enough yet.

### BDD Scenario Format (Gherkin-style)

```gherkin
Feature: User checkout

  Scenario: Successful purchase with valid card
    Given the user has items in their cart
    And the user is on the checkout page
    When the user enters valid payment details
    And the user clicks "Pay Now"
    Then the order should be created
    And the user should see a confirmation page
    And the user should receive a confirmation email

  Scenario: Failed purchase with declined card
    Given the user has items in their cart
    And the user is on the checkout page
    When the user enters a declined card number
    And the user clicks "Pay Now"
    Then the user should see an error message "Payment declined"
    And no order should be created
```

### Playwright Test Mapping

```typescript
import { test, expect } from "@playwright/test";

// Scenario: Successful purchase with valid card
test("user can complete checkout with valid card", async ({ page }) => {
  // Given the user has items in their cart
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart"]');

  // And the user is on the checkout page
  await page.goto("/checkout");

  // When the user enters valid payment details
  await page.fill('[data-testid="card-number"]', "4242424242424242");
  await page.fill('[data-testid="card-expiry"]', "12/30");
  await page.fill('[data-testid="card-cvc"]', "123");

  // And the user clicks "Pay Now"
  await page.click('[data-testid="pay-button"]');

  // Then the user should see a confirmation page
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.locator('[data-testid="order-status"]')).toHaveText(
    "Order confirmed"
  );
});
```

## What to Test

- **The critical happy path.** The single most important user journey. If this test passes, the product works. For a location-based app: open → see map → tap → fill in details → save → see trace. One E2E test.
- **Auth flow.** Login and session persistence. Can the user log in? Are they still logged in after refresh? Second most common bug source.
- **Data mutations that would be hard to undo.** Functions that write to the DB in ways that would be painful to fix manually. Reads are less critical — you see broken reads immediately.
- **Tricky business logic.** Distance calculations, date parsing, scoring algorithms. Pure functions with clear inputs and outputs. Easy to test, high value.

## What NOT to Test Yet

- **Component rendering.** Don't write tests that assert a component renders the right text. You can see that by looking at the screen. Save snapshot tests for design systems, not MVPs.
- **Styling and layout.** Visual regression testing is expensive to set up and maintain. Use your eyes.
- **Third-party integrations.** Don't mock Supabase or Stripe to test your wrappers around them. If `.insert()` works (it does — they test it), your wrapper's test is just verifying you called it correctly, which you can verify by running the app.
- **Edge cases you haven't seen yet.** Don't write tests for hypothetical failures. When a bug appears in production, write a test for it then. Test-driven-by-reality, not test-driven-by-imagination.
- **Admin or settings flows.** Low-traffic, low-risk, change frequently. Test them manually.

## Tooling

- **E2E (web):** Playwright. Fast setup, great debugging tools, reliable.
- **E2E (mobile):** Detox for React Native. Heavy but necessary for real-device testing. Manual testing on a real device is acceptable for a mobile MVP if Detox setup feels too heavy.
- **Unit/integration:** Vitest. Drop-in Jest replacement with better speed and native ESM.
- **Smart contracts:** Hardhat (Solidity-native) or Foundry (faster, Rust-based tooling).

### Do Not Set Up

- **Cypress** — Playwright is better.
- **Enzyme** — dead.
- **Testing Library for simple components** — overkill for MVPs.
- **Storybook** — build it later when your component library stabilizes.

## Rules

- **BDD scenarios BEFORE implementation** — they define what "done" means.
- **Playwright tests AFTER implementation** — they verify the behavior works.
- **Don't mock databases.** Use a real test database (docker-compose or a Supabase test project).
- **Don't test implementation details.** Test behavior the user can see.
- **Use `data-testid` attributes** for Playwright selectors. Don't rely on CSS classes or text content.
- **External-SSO identity → env-gated test shim.** When auth comes from a platform cookie you can't mint locally, add a dev-only identity shim so the full authorization matrix runs in unit + E2E tests. Canonical pattern: [[patterns/pln-ai-apps]].

## Gotchas

### Next lockfile auto-patching can make an unexpected registry request (NewsBreef, 2026-09-18)

- **Symptom:** an otherwise successful isolated Next build attempted a blocked registry request while patching missing SWC lockfile entries after adding a dependency.
- **Cause:** npm removed the baseline top-level non-host SWC package records; equivalent nested records still existed, but Next's patch check requested the top-level entries. This was not an observed Linux deployment failure.
- **Resolution:** restore the seven removed optional compiler records exactly from HEAD, without changing versions or opening the network guard. Validate all eight top-level SWC records against the baseline, rebuild and rerun browser checks; the patch/registry diagnostic disappears.
- **Prevention:** inspect package identity/version changes, not just lockfile line counts. Do not dismiss blocked build-time network traffic as harmless before identifying its caller, or manufacture package integrity values.

### Safety preloads require the intended runtime, not a Node-compatible version string (NewsBreef, 2026-09-18)

- **Symptom:** an isolated archive test unexpectedly contacted Cloudflare and received 404 despite a `NODE_OPTIONS` network guard. Only synthetic IDs/token were present; no real credential or successful provider operation was involved.
- **Cause:** a Bun subprocess ignored the Node preload boundary; using a tool host's `process.execPath` inherited that runtime rather than launching actual Node.
- **Resolution:** reject Bun explicitly and spawn the verified `node` executable; block non-loopback sockets and restrict archive browser requests to same-origin GETs. Require the owned listener PID and a fresh, fully consumed readiness response before browser navigation.
- **Prevention:** test the guard itself under the actual child runtime. A Node-like version string, synthetic credentials, or a successful health status alone does not prove network isolation. Keep the failed-attempt record; only claim zero external contact for the corrected guarded runs.

### Keep the browser open when testing custom Next server shutdown

- **Symptom:** Ctrl+C hung with a workspace tab open, preventing PostgreSQL shutdown and lock release. The earlier browser test closed Chromium first and masked the fault (Terminally Product, 2026-09-10).
- **Cause:** Node's `closeAllConnections()` excludes upgraded sockets. Next's HMR WebSocket kept `server.close()` pending, while Next cleanup was scheduled after that wait.
- **Fix:** track owned upgrade sockets, stop accepting connections, destroy those sockets, then drain request-owned checkpoints before Next/SQL/PG cleanup. Do not replace checkpoint draining with forced database termination.
- **Regression/prevention:** establish and receive a real HMR frame, pause provider work using SDK transport mocks, keep Chromium open, trigger shutdown, release work, and require bounded closure. Check socket closure, PID/lock release and saved checkpoint/export recovery in a freshly started database composition. The pre-fix test failed specifically with `tab-open shutdown exceeded 10 seconds`; the repaired version passed.

### Calendar-rot: "today is in range" e2e seeds with hard-coded dates (2026-08)

- **Symptom:** a today-line/date-window test that passed for weeks fails suddenly with no related code change (here: item seeded to end 2026-08-15; the wall clock crossed it over a weekend).
- **Root cause:** assertions about "today" against fixed seeded dates — the test encodes the authoring date's calendar.
- **Resolution:** seed relative to the real clock (item spans today ±14d inside a months-around-now range).
- **Prevention rule:** any test whose assertion depends on the current date must derive its fixtures from `new Date()` (or freeze the clock). Grep e2e seeds for literal dates near assertions mentioning today/now.


### Playwright `reuseExistingServer` silently tests a stale build (2026-07)

- **Symptom:** an E2E suite that passed keeps failing after a code fix — or fails in ways matching *already-fixed* bugs; the run seems slow/hung; failures make no sense against current source.
- **Root cause:** `webServer.reuseExistingServer: true` makes Playwright adopt *anything* already listening on the port. A leftover server from a manual debugging session (started before the fix, with old `.next` output and a warm in-memory store) answered the health URL, so the entire suite ran against the outdated build.
- **Resolution:** kill the stale process (`lsof -iTCP:<port> -sTCP:LISTEN`), rerun — suite went from broadly failing to fully green.
- **Prevention rule:** when using `reuseExistingServer: true` locally, verify what owns the port before every debugging-session rerun, and always kill ad-hoc servers you start on the test port (start probes on a *different* port). If E2E failures contradict a fix you just made and verified, suspect the server build before the code.
- **Variant (2026-07):** the stale artifact can be the *build*, not the server. `git stash` → `npm run build` (to baseline-test) → `git stash pop` leaves `.next` compiled from the stashed tree; the next `playwright test` starts a *fresh* server that serves the old build, so new tests fail on missing testids. After any stash/checkout dance that touched source, rebuild before rerunning E2E — the failure signature is "exactly the tests exercising new UI fail; API/unit tests pass".
- **Variant (2026-08):** running `next build` while `next dev` or a Playwright-managed `next start` is live rewrites the shared `.next` directory underneath the server. The page may return 200 with unstyled raw HTML (`next dev`) or `Internal Server Error` while locators time out (`next start`) because the server's chunk cache no longer matches disk. Never run builds and E2E against the same checkout concurrently; restart the server after any production build.
- **Generated-type variant (NewsBreef, 2026-09-11):** an isolated source-hash check differed only in `next-env.d.ts` after dev changed `.next/types/routes.d.ts` to `.next/dev/types/routes.d.ts`. Stop the owned server, run native type generation, then rerun the normal source verifier; all 182 inventoried files matched. Do not silently ignore the mismatch or weaken the verifier. Keep build and dev sequential and preserve the original failure evidence.

### Vitest run from the wrong cwd: "Cannot find package '@/…'" looks like broken aliases (2026-08)

- **Symptom:** `npx vitest run tests/…/file.test.ts` fails with `Error: Cannot find package '@/lib/…'` (Node's bare-specifier phrasing) on imports that resolved fine earlier the same session; switching one import to a relative path just moves the error one level deeper into the module graph. Easy to misread as a broken/new-file alias problem and burn cycles on cache-clearing and path experiments.
- **Root cause:** the shell's persistent working directory had drifted to the repo root (a `cd repoRoot && git …` in an earlier command). From there vitest still *finds and runs* the nested app's test file (path arg resolves, config discovered oddly), but the `vitest.config.ts` `resolve.alias` never applies, so every `@/` specifier falls through to Node as a bare package. The tell: file labels in output show an unexpected prefix (`app/tests/…` instead of `tests/…`), and a control run of a previously-green suite now fails identically.
- **Resolution:** re-run from the package dir (`cd <app> && npx vitest run …`) — everything passes unchanged.
- **Prevention rule:** when alias imports "suddenly" stop resolving, first re-run a suite that was green earlier — if it now fails too, suspect environment (cwd, node version), not the new code. Check the path prefix on the FAIL line before touching config or imports. In agent shells, prefer `cd <pkg> && <cmd>` in the same compound command over relying on cwd persistence.

### Reopening a Radix Dialog/Drawer mid-close-animation is dropped → flaky E2E (2026-07)

- **Symptom:** a Playwright test presses `Escape` (or otherwise closes a Radix Dialog/Drawer) and immediately re-triggers it open, then asserts on the reopened content. Fails intermittently (~50–65% without retries) with "element(s) not found"; passes on retry. The network shows the reopen's data fetch *succeeding*, so the data path is fine — only the dialog content never becomes visible.
- **Root cause:** the drawer has an exit animation (e.g. `slideOutRight 200ms` on `[data-state='closed']`). Radix keeps the content mounted during that animation; a reopen dispatched inside the ~200ms exit window gets swallowed by the presence/animation machinery, so `data-state` never returns to `open`.
- **Resolution:** wait for the close to finish before reopening — assert the drawer's own body testid is hidden first: `await expect(page.getByTestId('share-panel')).toBeHidden();` then click the trigger again. Deterministic (25/25 with `--repeat-each=5 --retries=0`).
- **Prevention rule:** never chain close→immediate-reopen of an animated Radix overlay in a test (or product code) without waiting for the exit to complete. A succeeding data fetch on reopen while the element stays "not found" is the tell — suspect the animation race, not the fetch. Diagnose from the trace's network log (fetch 200 = data fine) + `error-context.md` snapshot (drawer shown closed).

### Open Radix modal makes background elements invisible to `getByRole` (2026-07)

- **Symptom:** with a Radix modal Dialog/Drawer open, `page.getByRole('button', { name: 'X' }).click()` on an element *outside* the overlay (e.g. a nav-bar avatar) times out with "waiting for getByRole(...)" — the locator never resolves, so the click is never attempted. A CSS/testid locator for the same element finds it (`count() === 1`).
- **Root cause:** modal Radix overlays set `aria-hidden="true"` on the rest of the page (the sibling subtrees, including the whole `<header>`). Playwright's role-based locators query the accessibility tree, which excludes `aria-hidden` subtrees — so the element exists and is visually present but is unmatchable *by role*. Deadlock: the by-role click that would have dismissed the overlay can't run because the overlay hides its target.
- **Resolution:** close the overlay first (`Escape` + `await expect(drawerBody).toBeHidden()`), then interact with the background element by role.
- **Prevention rule:** in E2E flows, never target background page chrome with `getByRole` while a modal overlay is open — close it first. Diagnostic tell: `getByRole` count 0 but `[aria-label=...]`/testid count 1 → an ancestor is `aria-hidden`, not a missing element. Such a test can look "passing" historically and then break; treat it as broken by design.

### Evidence navigation needs destinations, focus and overflow checks (Terminally Product, 2026-09-09)
- **Symptom:** valid clarification/risk evidence links had no DOM destination; opening evidence also produced a large blank document tail in full-page captures.
- **Root cause:** the renderer linked every supported evidence ID but only claim/source targets existed. Imported PL external-link `sr-only` labels were absolutely positioned without a positioned transcript ancestor, escaping the clipped scroll region.
- **Resolution:** add targets to existing clarification/risk views, open disclosures and transfer focus on activation; position the transcript to contain absolute descendants without deleting accessible labels or editing vendored controls.
- **Prevention rule:** keyboard-activate every distinct internal evidence link and assert one visible focused destination. After opening disclosures, assert document scroll height stays inside body layout, not merely horizontal overflow or screenshot file existence.

### Fullscreen transcript follow-bottom must survive viewport changes (Terminally Product, 2026-09-11)
- **Symptom:** an active stream was present in the DOM but a desktop/mobile capture showed only its opening line or unrelated scrollback.
- **Root cause:** passive post-render scroll updates missed dock/viewport resize, and native scroll anchoring changed the follow-bottom state as the layout settled. A `toContainText` assertion proved text existed, not that it could be read.
- **Resolution:** update following in layout timing, observe scroll-area resize and disable native overflow anchoring, while preserving the reader's explicit non-bottom position. Temporary inspection stores/restores exact scrollTop and returns focus; the background is inert under the existing overlay.
- **Prevention rule:** hold a genuine transport stream after readable text but before terminal completion. Assert distance from bottom before/after viewport resize, manually scroll back, open/close inspection and assert exact position/focus. Include keyboard-sized mobile viewport and no overflow; distinguish that from a physical software-keyboard test. Inspect every bounded screenshot, not just file existence.

### React direction comments need emitted-production checks (Terminally Product, 2026-09-11)
- **Symptom:** a production smoke assertion requiring an inert direction template immediately after body failed despite the comment and seed surviving.
- **Root cause:** Next 16 inserted its hidden suspense marker before the first authored body child; JSX itself cannot emit an HTML comment node directly.
- **Resolution:** with explicit approval, use a compile-time constant HTML comment inside the first authored inert template, and permit only the exact observed optional framework marker plus whitespace before it. Verify every contract block, seed and word bound against genuine production HTML.
- **Prevention rule:** inspect framework output before inventing response rewriting or hydration workarounds for inert metadata. Never broadly skip arbitrary preceding elements or interpolate user/env/model data into the comment. Record the narrow approved equivalence.

### Awaiting refresh does not replace React's captured state or authorize further work (Terminally Product, 2026-09-09; refined 2026-09-11)
- **Symptom:** `/status` showed an old revision after the header refreshed to a newer HTTP/MCP checkpoint.
- **Root cause:** the command awaited a state setter flow then formatted its notice from the previous render's closure.
- **Resolution:** return the fetched status from refresh and format the notice from that response. For user-authorized automatic progression, await each bounded operation and use its authoritative final status/revision, never a captured render, current stage label or effect rerun. Count saved validated milestones/panel checkpoints for native progress; leave current work indeterminate and label reframe resets.
- **Prevention rule:** test refresh commands by advancing through a second transport while the browser remains stale; awaiting a function that sets React state does not update its caller's captured variables. Exercise actual HTTP+SQL+SDK transport mocks in Chromium: exactly one explicit adaptive start before input, partial questions, Pause between operations, no hidden failure retry, cross-tab duplicate refusal, conflict/disconnect/unmount, and no spending on load/select/visibility. A stage label indicates location, not validated completion or permission to call another model.
- **Draft identity variant (2026-09-11):** an unscoped composer carried review A's unsent answer into review B's different question, where Enter could save it using B's current revision and trigger automatic work. Bind drafts to session ID and exact active question (plus answer/override mode), resetting before committing a changed target rather than relying on every navigation caller to clear text. Browser regression: type without submitting, refresh the same question (retain), switch reviews (clear), and refresh after a second transport advances the question (clear); pressing Enter then sends zero action requests and leaves SQL state unchanged. Revisions prevent stale writes, not reassociation of a draft with a different current target.

- **Mutation/refresh variant (NewsBreef, 2026-09-11):** a successful free-activation POST followed by a failed subscription GET left stale delivery/editor state under a success message. Return an explicit refresh outcome, distinguish confirmed mutation from unavailable refreshed state, hide stale editing/active summaries, and offer GET-only retry. Synthetic browser regression requires failed then successful refresh retries, restored confirmed selections, and exactly one activation POST; matching desktop/mobile recovery captures were independently accepted. A successful write is not proof that reconciliation succeeded; do not repeat the write to recover a failed read.

### Same-URL navigation still replaces the document (NewsBreef, 2026-09-11)

- **Symptom:** `page.evaluate: Execution context was destroyed, most likely because of a navigation` in a health assertion after the second synthetic billing-portal click.
- **Root cause:** the fixture returned the current billing URL; waiting for the POST response alone raced the ensuing same-URL document navigation.
- **Resolution:** arm the navigation wait before the click, await both navigation and the response, then wait for the new document's billing control before checking health. The final nine browser groups passed after this supervisor-authorized harness-only correction.
- **Prevention rule:** a matching current URL or completed API response is not a document-ready signal. Await the action's actual navigation lifecycle; do not add sleeps or swallow evaluation errors. If the task requires stop/report on tooling failure, get authorization before fixing the harness.

### Passing branch assertions are not visual proof of that branch (NewsBreef, 2026-09-11)

- **Symptom:** visual re-review could not score canceled-account billing access or activation-refresh recovery although browser assertions passed; the seven required screenshots showed only ordinary states.
- **Root cause:** the capture batch did not render the two repaired edge branches.
- **Resolution:** retain and recapture the seven required images, adding desktop/mobile no-paid-tier home, billing, and activation-refresh states in the same synthetic batch. Open all thirteen; record dimensions, hashes, and fixture provenance. Independent visual re-review accepted those two fixes, without broadening its verdict to live providers or the entire surface.
- **Prevention rule:** map each scored visual finding to evidence that visibly exercises it; do not substitute unrelated happy-path captures or claim screenshot existence alone as acceptance. Label local provider fixtures as local, not external-provider screenshots.

### Host spoof tests must verify bytes sent by the HTTP client (Terminally Product, 2026-09-10)

- **Symptom:** a Node fetch test reported HTTP 200 for a forged Host even though the actual loopback listener correctly compared `req.headers.host` with its bound address.
- **Root cause:** the installed fetch/Undici path did not send the requested Host override; the test exercised the valid default Host, not the attack.
- **Resolution:** use native `node:http.request` for raw Host tests; keep browser/fetch tests for Origin/JSON/forwarded-header cases. The native forged-Host request is refused before any SDK message call.
- **Prevention rule:** a request-header object is not evidence of transmitted bytes. When testing transport security, use a client that permits the target header and check the real listener, not only an in-memory Request adapter. Use fake payloads and zero provider network calls.
- **Also seen (PLAA Activity Bot, 2026-09-25):** Node's `fetch` *rejects* a `Host` override outright (the probe threw "fetch failed", which an `assert(status === 403)` helper reported as a generic failure and aborted the remaining checks). Same resolution — `node:http.request` for the rebinding probe, `fetch` for Origin/token/size probes — plus: a guard-probe helper must distinguish "refused" from "never sent".

### A spawned real server writes real files — redirect its side effects per test run (PLAA Activity Bot, 2026-09-25)

- **Symptom:** the moment a dev server gained an append-only transcript file (`evals.md`, human-edited ratings inside), every suite that spawns that server for e2e/bench checks would have appended dozens of synthetic interactions into the operator's real data file.
- **Root cause:** tests reuse the real process for fidelity, and "real process" includes its real output paths. Fixtures were isolated; *side-effect files* were not.
- **Resolution:** the file path is an env var (`PLAA_EVAL_FILE`), every spawn site passes a `mkdtemp` path (or `PLAA_EVAL_LOG=0` where capture is irrelevant), and the suite asserts the real file is byte-identical before/after a full run.
- **Prevention rule:** when adding any persistent write to a tool that tests spawn, make its destination an env var in the same commit, point every existing spawn site at a temp path, and verify the production-path file is unchanged after the suite — do not rely on the test happening to use a different directory.
- **Second variant, same root (PLAA, 2026-09-25, independent review F1):** spawning with `{ ...process.env, PORT }` also inherits *credentials*. Once the dev server gained a "if `PLAA_WEBHOOK_URL`/`PLAA_CLIENT_TOKEN` are set, forward upstream" mode, running the suite from a live-credentialed shell (`node --env-file=.env.cloud.local …`) made test turns hit the production webhook — measured as 7 forwarded requests against a stand-in upstream. **Rule:** a spawned test server must *clear* every env var that could switch it into a production-talking mode, and the suite must assert the mode it believes it is in (here: `/base` returns the mock viewer, not a redirect to the real base) before driving any traffic.

### Wait for the appended interaction, not just the transcript file (PLAA, 2026-09-30)

- **Symptom:** the eval-restart Playwright check failed intermittently in the full suite but passed alone.
- **Root cause:** the server responds before asynchronous capture finishes. The test waited for file existence, then edited ratings and killed the server; a header-only file satisfied that wait before the first interaction was appended.
- **Resolution:** retain the existence check, then poll for one complete interaction before editing or restarting.
- **Prevention rule:** wait for the authoritative durable content a test depends on, not an earlier artifact-creation event. Never make production submissions wait/retry just to satisfy a logging test.

### Keep a public live evaluation separate from confidential incidental reads (2026-09-14)

- **Symptom:** Terminally Product's eval-only browser guard stopped after creating a public test review because routine refresh also fetched the entire unrelated private learning inbox. No private body was read and no model call had started.
- **Root cause:** one shared refresh coupled review progression to a separate confidential inspection surface.
- **Resolution:** load candidates on explicit Help/private-learning inspection, not selection/start/answer/status refresh. Preserve extraction/review refreshes and keyboard focus; opening the overlay synchronously avoids losing the trigger while awaiting data. The synthetic browser regression first observed one forbidden incidental request, then zero after the fix; deliberate Help still loads once and existing learning actions pass.
- **Prevention:** freeze preexisting metadata exclusions before a paid eval, restrict all content reads/mutations to journal-created eval IDs, keep live runners opt-in/out of CI, and never mock an incidental live response to conceal private access. Authorized metadata counts or server-side hashes are different from inspecting original bodies. Journal exact requests, source commits, failures and explicit retries; deduplicate usage by provider message ID and flag missing-ID costs as unknown. Thin public comment highlights and votes are heldout descriptive signals, not proof of business quality.

### A diagnostic-only branch nobody tests will silently degrade to "unknown"

- **Symptom:** PLAA's read-only Airtable readiness probe reported `email_column_present: n/a` where it should have reported `false`, and its documented negative control ("flip the probe to a nonexistent column, expect `UNKNOWN_FIELD_NAME`") could not have passed. The probe looked healthy on every green run — the bug lived only on the failure path.
- **Root cause:** the error classifier was a regex built inside a template literal, and the escaping collapsed one level: the intended `\\*` ("zero or more backslashes", to match the `\"type\"` of a JSON-string-inside-a-JSON-string error envelope) emitted `\*` — a literal asterisk that never matches. Every vendor error fell through to a generic `HTTP_422`, so "missing column" and "missing scope" became indistinguishable from each other and from "unknown".
- **Resolution:** unit-test the classifier by feeding it the **real** failure envelope the vendor/orchestrator produces (not a hand-simplified object) and asserting the specific classification and the booleans derived from it.
- **Prevention:** a readiness/diagnostic tool's *failure* branch is its actual product — test it at least as hard as the success branch. Two concrete rules: (1) any regex that is generated as a string (template literal, code-node source, config) must be asserted against the emitted code, not the source you wrote; (2) treat a classifier that can return "unknown" as untested until a test proves each known class is reached. A green report from an instrument that cannot detect the failure is worse than no report.

### Save the instrument's raw output, not your summary of it

- **Symptom:** an evidence folder for a live readiness check contained a careful hand-written README and **no raw probe response**. Every claim in it was true, but an independent reviewer could not confirm any of them without re-running a probe that was outside their read-only scope — so the finding had to be logged as an accepted verification gap rather than a verification.
- **Root cause:** the tool already had a `--json` mode; the run that produced the conclusion used the human-readable mode and the numbers were transcribed into prose.
- **Resolution:** re-run with `--json`, save the sanitized response next to the write-up, and keep the prose as interpretation *of* that artifact.
- **Prevention rule:** for any one-shot check against a system you do not control (live config read, third-party schema, deploy dry-run), persist the machine output. A report that cannot be re-derived from stored evidence is a claim, not a result — and the evidence has to be sanitized at the source (booleans, ids, business config) so that saving it is never a privacy decision made under time pressure.

## The One Rule

If you're unsure whether to write a test, ask:

> "If this broke silently, would I notice within a day from normal usage?"

- **Yes** → don't test it, you'll catch it naturally
- **No** → it's a background process, a data migration, an async operation — **test it**

## Related

- [[workflows/feature-dev]] — Where BDD scenarios fit in the 8-step pipeline
- [[principles/mvp-philosophy]] — Why shipping beats coverage metrics
- [[principles/anti-patterns]] — Gold-plating error handling is the same trap as over-testing

## Sources

- [[raw/articles/vibes-knowledge-base/09-testing-philosophy]]


### Evaluator transport failure is not a durable workflow gate (2026-09-14)
A public-case browser evaluator resubmitted108 Continue requests after an SSE error left saved revision57 ready. The application rejected before provider I/O at its unchanged state cap; no additional retained message IDs/tokens appeared. Fix the runner, not the budget: sticky HTTP/SSE error, visible UI error and non-advancing-revision guards before another mutation. Preserve every rejected request. An actual CLI/no-model HTTP regression reproduced a second request before the guard and exactly one after; exercise unavailable Playwright SSE bodies with independent UI/revision checks. A browser body's retrieval failure is not proof that the application disconnected. Reconcile failed checkpoints separately from accepted pipeline usage; no-ID timeout cost stays unknown.

The same pass exposed a separate authorization bug: retry permission survived an initially ready state and was spent on a new failure, producing one unauthorized additional paid repair. Consume permission at the initial snapshot whether or not it is failed; HTTP and browser share the tested policy. The red ready→failure sequence granted a retry, green denies it. All spending then stopped pending independent source/test confirmation and explicit new approval. Do not normalize this protocol deviation as an ordinary retry.
