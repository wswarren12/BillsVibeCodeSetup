#!/bin/bash
# Hook: PostToolUseFailure (Bash) — nudge lesson capture when a command Claude ran fails

# Consume stdin (hook input JSON); the reminder is unconditional but self-filtering.
cat > /dev/null

cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PostToolUseFailure","additionalContext":"A command just failed. If diagnosing this reveals a genuine lesson — an error in prior work, a required workaround, or surprising behavior — you MUST run the Lesson Capture workflow (~/Obsidian/VibeCoding/wiki/workflows/lesson-capture.md) after resolving it: dedup-check first (skip or refine in place if already recorded), then add the lesson to the owning wiki page's Gotchas/Rules, update index.md, append to log.md, record via kb_log. Trivial failures (typos, wrong paths, clearly-messaged errors) do not qualify."}}
EOF
exit 0
