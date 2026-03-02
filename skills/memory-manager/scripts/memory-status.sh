#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/history"
ARCHIVE_DIR="$MEMORY_DIR/archive"

echo "=== Memory Status ==="
echo ""

if [ -f "$MEMORY_DIR/SOUL.md" ]; then
    soul_size=$(wc -c < "$MEMORY_DIR/SOUL.md")
    echo "SOUL.md: $soul_size bytes"
else
    echo "SOUL.md: not found"
fi

if [ -f "$MEMORY_DIR/USER.md" ]; then
    user_size=$(wc -c < "$MEMORY_DIR/USER.md")
    echo "USER.md: $user_size bytes"
else
    echo "USER.md: not found"
fi

echo ""

if [ -d "$HISTORY_DIR" ]; then
    history_count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    history_size=$(du -sh "$HISTORY_DIR" 2>/dev/null | cut -f1)
    echo "History files: $history_count ($history_size)"
    
    if [ "$history_count" -gt 0 ]; then
        oldest=$(ls -1 "$HISTORY_DIR"/history-*.md 2>/dev/null | head -1 | xargs basename)
        newest=$(ls -1 "$HISTORY_DIR"/history-*.md 2>/dev/null | tail -1 | xargs basename)
        echo "  Oldest: $oldest"
        echo "  Newest: $newest"
    fi
else
    echo "History files: 0 (directory not found)"
fi

echo ""

if [ -d "$ARCHIVE_DIR" ]; then
    archive_count=$(find "$ARCHIVE_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    archive_size=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
    echo "Archived files: $archive_count ($archive_size)"
else
    echo "Archived files: 0 (directory not found)"
fi
