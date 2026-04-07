#!/bin/bash
# Hook: UserPromptSubmit — Remind about BDD workflow for features/bugfixes

PROMPT=$(cat)

FEATURE_SIGNALS="add|build|create|implement|make|new feature|set up|integrate"
BUGFIX_SIGNALS="fix|bug|broken|crash|error|not working|failing"

if echo "$PROMPT" | grep -qiE "$FEATURE_SIGNALS"; then
  echo "REMINDER: Feature workflow requires BDD scenarios (Given/When/Then) before implementation. Follow the 8-step workflow: brainstorm → specify → plan → implement → test → debug → review → record."
elif echo "$PROMPT" | grep -qiE "$BUGFIX_SIGNALS"; then
  echo "REMINDER: Bug fix workflow starts with reproducing the bug as a BDD scenario and Playwright test. Follow: reproduce → diagnose → fix → test → record."
fi

exit 0
