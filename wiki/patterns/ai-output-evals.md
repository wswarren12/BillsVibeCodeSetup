# AI Output Evals (local capture + manual grading)

Status: Active
Applies to: **every project with an AI element that produces output or holds a conversation.**

---

## The rule

If a build has a model in it — a chatbot, an agent, a generator, a summariser, a
classifier that writes prose — then **in local/manual testing every output and
every conversation turn is captured to an `evals/` folder**, and each captured
item is graded **Pass / Fail** with a short **Why**.

No model output should be evaluated from memory, from a screenshot, or from
"it looked right in the terminal". If it was worth generating, it is worth
writing down and rating.

This is a *house rule*, not a per-project decision. It does not need an ADR to
apply; it needs an ADR to be skipped.

---

## What the folder looks like

```
<project>/
  evals/                  # or tests/evals/, app/evals/ — near the thing it tests
    eval.md               # how evals work here — written ONCE, read first
    <conversation-id>.md  # one file per conversation / per run
    rubric.json           # optional: machine-readable criteria + score template
```

Placement follows the code: a bot's evals sit with its tests (`tests/evals/`),
a pipeline's sit with the app (`app/evals/`). What matters is that it is one
folder, discoverable, and named `evals`.

### `eval.md` — the explainer

Written once per project, at the top of the folder. It answers, for someone who
has never graded before:

1. **What is being evaluated** — which surface, which model, which mode
   (fixture / mock / live).
2. **How to rate** — the exact edit to make (`Unrated` → `Pass` / `Fail`) and
   that a reason is required, not optional.
3. **What the fields mean** — outcome codes, message kinds, anything ambiguous.
4. **What a Fail looks like here** — a short failure taxonomy beats a vague
   quality bar. *Sycophantic verdict; fabricated citation; dropped risk; wrong
   persona; unanswered question.*
5. **Handling rules** — PII, gitignore status, permissions, "don't paste this
   into a third-party tool".

A rubric with named failure modes is worth more than a 1–5 score with no
vocabulary. Scores without a taxonomy drift between sessions.

### The entry format

One atomic entry per exchange or per generated artefact:

```markdown
## 2026-09-25T19:35:02.848Z · `<stable-id>`

- **Rating:** Unrated
- **Why:**
- **Outcome:** ok
- **Kind:** user_message

> preceding model message

```text
what the user sent
```

```text
what the model replied
```
```

`Unrated` is the default so an ungraded item is visibly ungraded — never
silently "fine".

---

## Why this earns its place

- **A model's failure is a content failure.** Tests assert shape: status 200,
  valid JSON, field present. None of that catches a confident wrong answer, a
  fabricated citation, or a tonally hostile reply. Only reading the output
  catches those, and only writing the verdict down makes it comparable to last
  week's.
- **Regressions in generated text are invisible without a baseline.** A prompt
  edit that fixes one case quietly breaks three others. A folder of graded
  conversations is the only cheap way to notice.
- **"Why" is the actual artefact.** Pass/Fail alone cannot be acted on. The
  sentence explaining *why* is what becomes a prompt fix, a validator, or a new
  deterministic gate.

---

## Implementation rules (learned, not theoretical)

These come from real builds — see [[projects/plaa-activity-bot]] and
[[projects/terminally-product]].

- **Capture at a transport boundary you already own**, never in the client. A
  logging hook in the shipped widget puts observability code in users' browsers.
  The local dev server already sits in the flow; make *that* the capture point,
  and production changes by zero lines.
- **Respond first, log second, and never let the log fail the turn.** A
  submission that succeeded upstream must not become a retryable error because a
  Markdown append failed. Capture must not throw at the caller.
- **Append-only is the whole strategy for surviving human edits.** The grader
  edits `Rating:`/`Why:` in place. Any read-modify-write risks clobbering that:
  create the header once, append entries, serialise concurrent appends.
- **Arbitrary user text in a Markdown log is an injection surface.** Quote every
  message in a fence sized to `max(3, longest backtick run + 1)` so headings,
  fences and HTML stay inert — and make any parser fence-aware.
- **An in-memory counter is not an id.** A restart re-mints `…-t1` in the same
  append-only file, so two exchanges share a "stable" id. Mix a per-boot run
  nonce into the id.
- **Persist the instrument's raw sanitised output, not a prose summary.** A
  paraphrase of what the model said is not evidence of what the model said.
- **Archive before restarting an eval run** under the same id, or the previous
  evidence is overwritten.

---

## Privacy and hygiene

Conversations contain real user text — emails, answers, sometimes PII.

- The `evals/` folder is **gitignored**, `0700`, files `0600`.
- **Never served over HTTP.** Assert the 404 in a test if a local server is
  anywhere near it.
- Never pasted into third-party tools, telemetry, or a public repo.
- Diagnostic/developer conversations are archived **separately** from real user
  evaluations — mixing them corrupts the sample.

---

## What this is not

- **Not a judge.** No LLM grades these by default. If a judge is ever added, it
  must be calibrated against human scores first, and the human scores stay the
  source of truth.
- **Not a CI gate** (yet). These are read by a person. Deterministic assertions
  belong in tests; see [[architecture/testing]] and
  [[patterns/llm-bot-structural-defense]] for what to encode in code instead.
- **Not a substitute for structural defense.** Anything that can be guaranteed
  in code should be — evals are for what genuinely cannot be asserted.

---

## Related

- [[architecture/testing]] — testing strategy; evals sit alongside, not inside
- [[patterns/llm-bot-structural-defense]] — code-layer guarantees vs prompt-layer
  persuasion; deterministic-first testing with zero live API calls
- [[patterns/agent-automation]] — plan-execute-validate loop
- [[projects/plaa-activity-bot]] — bench-proxy capture, append-only ratings
- [[projects/terminally-product]] — fixture pipeline evals, rubric + taxonomy
