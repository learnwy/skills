#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"
CONFIG_FILE="$MEMORY_DIR/.memoryrc"

load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    fi
    REFLECTION_INTERVAL=${REFLECTION_INTERVAL:-5}
}

check_reflection() {
    if [ ! -d "$HISTORY_DIR" ]; then
        echo "No history found."
        return 0
    fi

    count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')

    if [ "$count" -ge "$REFLECTION_INTERVAL" ]; then
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

    if [ ! -d "$HISTORY_DIR" ]; then
        echo "No conversation history found."
        return
    fi

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
    echo "  bash $SCRIPT_DIR/write-memory.sh identity/AI.md \"updated content\""
    echo ""
    echo "Consider creating deeper memory if needed:"
    echo "  bash $SCRIPT_DIR/consolidate.sh pattern <name>"
}

case "${1:-check}" in
    init)
        init_reflection
        ;;
    check)
        check_reflection
        ;;
    *)
        echo "Usage: $0 [init|check]"
        exit 1
        ;;
esac
