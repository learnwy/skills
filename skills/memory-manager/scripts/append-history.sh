#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"

usage() {
    echo "Usage: \$0 <history-filename> <content>"
    echo ""
    echo "Filename format: history-YYYY-MM-DD-N.md"
    echo "  YYYY-MM-DD: date"
    echo "  N: session number for that day"
    echo ""
    echo "Examples:"
    echo "  \$0 history-2026-03-12-1.md \"session content\""
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

FILENAME="$1"
shift
CONTENT="$*"

if [[ ! "$FILENAME" =~ ^history-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]+\.md$ ]]; then
    echo "Error: Invalid filename format."
    echo "Expected: history-YYYY-MM-DD-N.md"
    exit 1
fi

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "Error: Memory not initialized. Run: bash $SCRIPT_DIR/init-memory.sh"
    exit 1
fi

mkdir -p "$HISTORY_DIR"

FILEPATH="$HISTORY_DIR/$FILENAME"
printf '%s\n' "$CONTENT" > "$FILEPATH"

echo "Saved: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"

HISTORY_COUNT=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "Total conversations: $HISTORY_COUNT"

if [ "$HISTORY_COUNT" -ge 3 ]; then
    echo ""
    echo "⚠️  3+ conversations - consider running: bash $SCRIPT_DIR/summarize.sh"
fi
