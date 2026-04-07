#!/bin/bash
# Hook: SessionStart — Load relevant knowledge base context

VAULT="$HOME/Obsidian/VibeCoding"
INDEX="$VAULT/wiki/index.md"

if [ ! -f "$INDEX" ]; then
  echo "Knowledge base index not found at $INDEX"
  exit 0
fi

# Detect project type from current directory
PROJECT_TYPE=""
if [ -f "package.json" ]; then
  if grep -q "react-native\|expo" package.json 2>/dev/null; then
    PROJECT_TYPE="mobile"
  elif grep -q "wagmi\|viem\|hardhat\|foundry" package.json 2>/dev/null; then
    PROJECT_TYPE="web3"
  elif grep -q "next\|react" package.json 2>/dev/null; then
    PROJECT_TYPE="web"
  fi
elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
  PROJECT_TYPE="agents"
fi

echo "## Knowledge Base Context"
echo ""
echo "Vault: $VAULT"

if [ -n "$PROJECT_TYPE" ]; then
  echo "Detected project type: $PROJECT_TYPE"
  echo ""
  STACK_FILE="$VAULT/wiki/stacks/$PROJECT_TYPE.md"
  if [ -f "$STACK_FILE" ]; then
    echo "### Stack Preferences ($PROJECT_TYPE)"
    head -20 "$STACK_FILE"
    echo "..."
    echo ""
  fi
fi

echo "### Key Rules"
echo "- Follow workflows in wiki/workflows/ (BDD scenarios before implementation)"
echo "- Check wiki/architecture/ decision trees before making tech choices"
echo "- Check wiki/decisions/ before making architectural choices"
echo "- Record significant decisions as ADRs via kb_record_decision"
echo "- Use kb_search to find relevant wiki pages"
echo ""
echo "Use MCP tools (kb_search, kb_query, kb_check_architecture) for wiki operations."
