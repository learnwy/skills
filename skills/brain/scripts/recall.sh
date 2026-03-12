#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"

usage() {
    echo "Usage: $0 <keyword>"
    echo ""
    echo "Search across all memory layers for keyword."
    echo ""
    echo "Examples:"
    echo "  $0 swift"
    echo "  $0 preferences"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

KEYWORD="$1"

echo "=== Memory Recall: \"$KEYWORD\" ==="
echo ""

FOUND=false

if [ -d "$MEMORY_DIR/identity" ]; then
    echo "--- Identity ---"
    for f in "$MEMORY_DIR/identity"/*.md; do
        [ -f "$f" ] || continue
        if grep -qi "$KEYWORD" "$f"; then
            echo "★ $(basename "$f")"
            grep -ni "$KEYWORD" "$f" | head -3
            echo ""
            FOUND=true
        fi
    done
fi

if [ -d "$MEMORY_DIR/conversation/history" ]; then
    echo "--- Conversation ---"
    for f in "$MEMORY_DIR/conversation/history"/history-*.md; do
        [ -f "$f" ] || continue
        if grep -qi "$KEYWORD" "$f"; then
            echo "★ $(basename "$f")"
            grep -ni "$KEYWORD" "$f" | head -2
            echo ""
            FOUND=true
        fi
    done
fi

if [ -d "$MEMORY_DIR/archive/by-month" ]; then
    echo "--- Archive ---"
    for f in "$MEMORY_DIR/archive/by-month"/**/history-*.md; do
        [ -f "$f" ] || continue
        if grep -qi "$KEYWORD" "$f"; then
            rel_path="${f#$MEMORY_DIR/}"
            echo "★ $rel_path"
            grep -ni "$KEYWORD" "$f" | head -1
            FOUND=true
        fi
    done
fi

if [ -d "$MEMORY_DIR/deeper" ]; then
    echo "--- Deeper ---"
    for f in "$MEMORY_DIR/deeper"/**/*.md; do
        [ -f "$f" ] || continue
        if grep -qi "$KEYWORD" "$f"; then
            rel_path="${f#$MEMORY_DIR/}"
            echo "★ $rel_path"
            grep -ni "$KEYWORD" "$f" | head -1
            FOUND=true
        fi
    done
fi

if [ "$FOUND" = false ]; then
    echo "No matches found."
fi
