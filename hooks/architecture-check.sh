#!/bin/bash
# Hook: PreToolUse — Check architecture before git commits

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

VAULT="$HOME/Obsidian/VibeCoding"

echo "## Pre-Commit Architecture Check"
echo ""

if [ ! -f "Dockerfile" ] && [ ! -f "docker-compose.yml" ]; then
  echo "WARNING: No Dockerfile or docker-compose.yml found. Wiki standard requires Docker for all projects."
fi

if git diff --cached --name-only | grep -q "package.json"; then
  DIFF=$(git diff --cached package.json 2>/dev/null)

  if echo "$DIFF" | grep -q "prisma"; then
    echo "WARNING: Prisma detected. Wiki preference is Drizzle (see wiki/architecture/database.md). Record an ADR if intentionally deviating."
  fi
  if echo "$DIFF" | grep -q "redux"; then
    echo "WARNING: Redux detected. Wiki preference is Zustand (see wiki/architecture/state-management.md). Record an ADR if intentionally deviating."
  fi
  if echo "$DIFF" | grep -q "styled-components\|@emotion"; then
    echo "WARNING: CSS-in-JS detected. Wiki preference is Tailwind (see wiki/architecture/styling.md). Record an ADR if intentionally deviating."
  fi
  if echo "$DIFF" | grep -q "next-auth\|@auth"; then
    echo "WARNING: NextAuth/Auth.js detected. Wiki preference is Supabase Auth or Privy (see wiki/architecture/auth.md). Record an ADR if intentionally deviating."
  fi
fi

exit 0
