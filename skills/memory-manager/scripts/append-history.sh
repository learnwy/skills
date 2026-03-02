#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/history"

usage() {
    echo "Usage: $0 <history-filename> <content>"
    echo ""
    echo "Filename format: history-YYYY-MM-DD-N.md"
    echo "  YYYY-MM-DD: date (e.g., 2024-01-15)"
    echo "  N: session number for that day (1, 2, 3...)"
    echo ""
    echo "Examples:"
    echo "  $0 history-2024-01-15-1.md \"session content\""
    echo "  $0 history-2024-01-15-2.md \"another session\""
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

FILENAME="$1"
CONTENT="$2"

if [[ ! "$FILENAME" =~ ^history-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]+\.md$ ]]; then
    echo "Error: Invalid filename format."
    echo ""
    echo "Expected format: history-YYYY-MM-DD-N.md"
    echo "  Got: $FILENAME"
    echo ""
    echo "Examples of valid filenames:"
    echo "  history-2024-01-15-1.md"
    echo "  history-2024-12-31-2.md"
    exit 1
fi

if [ ! -d "$MEMORY_DIR" ]; then
    echo "Error: Memory directory not initialized. Run init-memory.sh first."
    exit 1
fi

mkdir -p "$HISTORY_DIR"

FILEPATH="$HISTORY_DIR/$FILENAME"

echo "$CONTENT" > "$FILEPATH"

echo "History saved to: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"
