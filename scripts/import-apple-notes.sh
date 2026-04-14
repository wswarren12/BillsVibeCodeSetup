#!/usr/bin/env bash
#
# import-apple-notes.sh
#
# Pull the contents of the "Claude Tips Inbox" Apple Note into
# raw/tips/inbox.md as a single timestamped entry, then clear the note.
#
# Usage: ./scripts/import-apple-notes.sh
#
# Safe to run when the note is empty or doesn't exist — no-ops gracefully.
# Called by the /process-tips slash command before it processes the inbox.

set -euo pipefail

VAULT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INBOX="$VAULT_DIR/raw/tips/inbox.md"
NOTE_NAME="Claude Tips Inbox"
TIMESTAMP="$(date +%Y-%m-%dT%H:%M)"

# Check the note exists
note_exists=$(osascript <<EOF 2>/dev/null || echo ""
tell application "Notes"
  set matchingNotes to notes whose name is "$NOTE_NAME"
  if (count of matchingNotes) > 0 then
    return "yes"
  else
    return ""
  end if
end tell
EOF
)

if [ -z "$note_exists" ]; then
  echo "No Apple Note named '$NOTE_NAME' found. Skipping Apple Notes import."
  echo "(Create an Apple Note with that exact name to enable mobile capture.)"
  exit 0
fi

# Fetch the body (HTML) of the note
note_body=$(osascript <<EOF
tell application "Notes"
  return body of first note whose name is "$NOTE_NAME"
end tell
EOF
)

# Strip HTML tags to plain text, unescape common entities, drop empty lines
plain=$(printf '%s\n' "$note_body" | perl -pe '
  s/<br[^>]*>/\n/gi;
  s/<\/(p|div|li|h[1-6])>/\n/gi;
  s/<[^>]+>//g;
  s/&nbsp;/ /g;
  s/&amp;/&/g;
  s/&lt;/</g;
  s/&gt;/>/g;
  s/&quot;/"/g;
  s/&#39;/'\''/g;
' | awk 'NF')

# After removing the note title (first non-empty line is usually the note name),
# check if there's any actual content to import.
content=$(printf '%s\n' "$plain" | tail -n +2)

if [ -z "$content" ]; then
  echo "Apple Note '$NOTE_NAME' is empty. Nothing to import."
  exit 0
fi

# Append as a single batch entry so /process-tips can parse one block.
{
  printf '\n'
  printf '## %s — apple-notes batch import\n' "$TIMESTAMP"
  printf '%s\n' "$content"
  printf '\n'
} >> "$INBOX"

echo "Imported Apple Note contents to $INBOX"
printf '%s\n' "$content" | sed 's/^/  /'

# Clear the Apple Note so the same entries are not re-imported next time.
# Leave a marker showing the last import time.
osascript <<EOF >/dev/null
tell application "Notes"
  set body of first note whose name is "$NOTE_NAME" to "<h1>$NOTE_NAME</h1><p>(last imported $TIMESTAMP)</p>"
end tell
EOF

echo "Cleared Apple Note '$NOTE_NAME' (leaving import timestamp marker)."
