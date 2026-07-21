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

<!-- No findings recorded yet. -->

### Authorization & Access Control (IDOR, RLS gaps)

<!-- No findings recorded yet. -->

### Input Validation & Injection

<!-- No findings recorded yet. -->

### Secrets & Configuration

<!-- No findings recorded yet. -->

### Client-Side Exposure

<!-- No findings recorded yet. -->

### API & Webhook Hardening

<!-- No findings recorded yet. -->

### Dependencies & Supply Chain

<!-- No findings recorded yet. -->

### Web3 / Smart Contracts

<!-- No findings recorded yet. -->

---

## Related

- [[architecture/security]] — the prescriptive baseline every project starts from
- [[workflows/lesson-capture]] — general lesson capture; its dedup hard gate governs this page too
- [[patterns/data-modeling]] — RLS policy patterns
