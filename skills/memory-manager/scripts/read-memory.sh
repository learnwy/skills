#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"

usage() {
    echo "Usage: $0 [file]"
    echo ""
    echo "Read memory file(s)."
    echo ""
    echo "Examples:"
    echo "  $0                 # List all memory files"
    echo "  $0 identity/AI.md  # Read AI identity"
    echo "  $0 identity/you.md  # Read user profile"
    exit 1
}

if [ $# -lt 1 ]; then
    echo "=== Memory Files ==="
    echo ""
    echo "Identity:"
    for f in "$MEMORY_DIR/identity"/*.md 2>/dev/null; do
        [ -f "$f" ] && echo "  $f"
    done
    echo ""
    echo "Conversation:"
    for f in "$MEMORY_DIR/conversation/history"/history-*.md 2>/dev/null; do
        [ -f "$f" ] && echo "  $f"
    done
    echo ""
    echo "Archive:"
    for f in "$MEMORY_DIR/archive/by-month"/**/history-*.md 2>/dev/null; do
        [ -f "$f" ] && echo "  $f"
    done
    echo ""
    echo "Deeper:"
    for f in "$MEMORY_DIR/deeper"/**/*.md 2>/dev/null; do
        [ -f "$f" ] && echo "  $f"
    done
    exit 0
fi

FILE="$1"

if [[ "$FILE" == /* ]]; then
    filepath="$FILE"
else
    filepath="$MEMORY_DIR/$FILE"
fi

if [ ! -f "$filepath" ]; then
    echo "Error: File not found: $filepath"
    exit 1
fi

echo "=== $filepath ==="
echo ""
cat "$filepath"
