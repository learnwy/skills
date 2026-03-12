#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"

usage() {
    echo "Usage: $0 [init|check]"
    echo ""
    echo "Self-reflection for AI memory."
    echo "  init   - Start reflection (read recent conversations)"
    echo "  check  - Check if reflection needed"
    exit 1
}

check_reflection() {
    if [ ! -d "$HISTORY_DIR" ]; then
        echo "No history found."
        return 0
    fi

    count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')

    INTERVAL=${REFLECTION_INTERVAL:-5}

    if [ "$count" -ge "$INTERVAL" ]; then
        echo "REFLECTION_NEEDED:$count"
        return 1
    fi

    echo "OK:$count conversations since last reflection"
    return 0
}

init_reflection() {
    echo "=== AI Self-Reflection ==="
    echo ""
    echo "This script helps AI reflect on recent conversations."
    echo ""
    echo "Recent conversations:"
    for f in $(ls -t "$HISTORY_DIR"/history-*.md 2>/dev/null | head -5); do
        echo "  - $(basename "$f")"
    done
    echo ""
    echo "Reflection prompts:"
    echo "1. What patterns did I notice in user's behavior?"
    echo "2. What mistakes did I make? How to avoid?"
    echo "3. What new things did I learn about user?"
    echo "4. What can I improve for next session?"
    echo ""
    echo "After reflection, update AI.md with:"
    echo "  write-memory.sh identity/AI.md \"updated content\""
    echo ""
    echo "Consider creating deeper memory if needed:"
    echo "  consolidate.sh pattern <name>"
}

case "${1:-check}" in
    init)
        init_reflection
        ;;
    check)
        check_reflection
        ;;
    *)
        usage
        ;;
esac
