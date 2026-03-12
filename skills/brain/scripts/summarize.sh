#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"

usage() {
    echo "Usage: $0"
    echo ""
    echo "Summarize recent conversations and update identity files."
    echo "Reads last 3 conversation files and extracts key insights."
    exit 1
}

if [ ! -d "$HISTORY_DIR" ]; then
    echo "No conversation history found."
    exit 0
fi

HISTORY_FILES=($(ls -t "$HISTORY_DIR"/history-*.md 2>/dev/null | head -3))

if [ ${#HISTORY_FILES[@]} -eq 0 ]; then
    echo "No conversation files found."
    exit 0
fi

echo "=== Memory Summarize ==="
echo ""
echo "Reading last ${#HISTORY_FILES[@]} conversations..."

for f in "${HISTORY_FILES[@]}"; do
    echo "- $(basename "$f")"
done
echo ""

echo "⚠️  This script extracts key points from conversation history."
echo "You (AI) should review the content and update AI.md/you.md manually."
echo ""
echo "To update identity after review:"
echo "  bash $SCRIPT_DIR/write-memory.sh identity/AI.md \"updated content\""
echo "  bash $SCRIPT_DIR/write-memory.sh identity/you.md \"updated content\""
echo ""
echo "Then archive the summarized conversations:"
echo "  bash $SCRIPT_DIR/backup-history.sh --all"
