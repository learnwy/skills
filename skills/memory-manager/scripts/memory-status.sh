#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"

echo "=== Memory Status ==="
echo ""

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "⚠️  Memory not initialized. Run init-memory.sh"
    exit 0
fi

echo "--- Identity (Working Memory) ---"
for f in "$MEMORY_DIR/identity"/*.md; do
    [ -f "$f" ] || continue
    size=$(wc -c < "$f")
    lines=$(wc -l < "$f")
    echo "  $(basename "$f"): $size bytes, $lines lines"
done
echo ""

echo "--- Conversation (Short-term) ---"
if [ -d "$MEMORY_DIR/conversation/history" ]; then
    count=$(find "$MEMORY_DIR/conversation/history" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    size=$(du -sh "$MEMORY_DIR/conversation/history" 2>/dev/null | cut -f1)
    echo "  Files: $count ($size)"
    if [ "$count" -gt 0 ]; then
        newest=$(ls -t "$MEMORY_DIR/conversation/history"/history-*.md 2>/dev/null | head -1 | xargs basename)
        echo "  Newest: $newest"
    fi
    if [ "$count" -ge 3 ]; then
        echo "  ⚠️  3+ conversations - consider summarize"
    fi
else
    echo "  (empty)"
fi
echo ""

echo "--- Archive (Long-term) ---"
if [ -d "$MEMORY_DIR/archive/by-month" ]; then
    count=$(find "$MEMORY_DIR/archive/by-month" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    size=$(du -sh "$MEMORY_DIR/archive/by-month" 2>/dev/null | cut -f1)
    months=$(ls -d "$MEMORY_DIR/archive/by-month"/*/ 2>/dev/null | wc -l | tr -d ' ')
    echo "  Files: $count ($size)"
    echo "  Months: $months"
else
    echo "  (empty)"
fi
echo ""

echo "--- Deeper (Deep Memory) ---"
if [ -d "$MEMORY_DIR/deeper" ]; then
    proj_count=$(find "$MEMORY_DIR/deeper/projects" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    pat_count=$(find "$MEMORY_DIR/deeper/patterns" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "  Projects: $proj_count"
    echo "  Patterns: $pat_count"
else
    echo "  (empty)"
fi

echo ""
echo "Memory path: $MEMORY_DIR"
