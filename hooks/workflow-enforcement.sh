#!/bin/bash
# Hook: UserPromptSubmit — Remind about BDD workflow for features/bugfixes

PROMPT=$(cat)

FEATURE_SIGNALS="add|build|create|implement|make|new feature|set up|integrate"
BUGFIX_SIGNALS="fix|bug|broken|crash|error|not working|failing"
SECURITY_SIGNALS="security review|security-review|security audit|security scan|vulnerab|pentest|penetration test"

if echo "$PROMPT" | grep -qiE "$SECURITY_SIGNALS"; then
  echo "REMINDER: Security Review Capture applies (wiki/architecture/security-findings.md). BEFORE reviewing: read that page and check its recorded vulnerability classes against this code first. AFTER: record every confirmed finding there under its category (class, found-in, severity, vulnerability, fix, prevention rule, detection hint), dedup against existing findings, and log the review in log.md + kb_log even if zero findings. No live secrets or exploit payloads in the vault."
elif echo "$PROMPT" | grep -qiE "$FEATURE_SIGNALS"; then
  echo "REMINDER: Feature workflow requires BDD scenarios (Given/When/Then) before implementation. Follow the 8-step workflow: brainstorm → specify → plan → implement → test → debug → review → record."
elif echo "$PROMPT" | grep -qiE "$BUGFIX_SIGNALS"; then
  echo "REMINDER: Bug fix workflow starts with reproducing the bug as a BDD scenario and Playwright test. Follow: reproduce → diagnose → fix → test → record. The record step is mandatory: after the fix is verified, run the Lesson Capture workflow (wiki/workflows/lesson-capture.md) — add the lesson to the owning wiki page's Gotchas/Rules, update index.md, append to log.md, record via kb_log — so this error is avoided in the future."
fi

exit 0
