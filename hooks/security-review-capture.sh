#!/bin/bash
# Hook: PostToolUse (Agent/Task/Skill) — capture security review findings into the KB

INPUT=$(cat)

HAYSTACK=$(printf '%s' "$INPUT" | jq -r '
  .tool_input // {}
  | [.subagent_type, .description, .skill, .args, .prompt]
  | map(select(. != null) | tostring)
  | join(" ")' 2>/dev/null)

if printf '%s' "$HAYSTACK" | grep -qiE 'security|vulnerab|pentest|penetration test|threat model'; then
  cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Security review detected. Follow Security Review Capture (~/Obsidian/VibeCoding/wiki/architecture/security-findings.md): if you have not already, check the recorded vulnerability classes on that page against the code under review. When the review completes, record every CONFIRMED finding there under its category (class, found-in, severity, vulnerability, fix, prevention rule, detection hint). Dedup gate applies — same class in a new context extends the existing finding. No live secrets or working exploit payloads in the vault. Log the review in wiki/log.md (including dismissed false positives, even if zero findings) and record via kb_log."}}
EOF
fi
exit 0
