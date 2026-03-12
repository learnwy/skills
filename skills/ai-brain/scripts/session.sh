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

    LOAD_ON_START=${LOAD_ON_START:-true}
    AUTO_SAVE_CONVERSATION=${AUTO_SAVE_CONVERSATION:-true}
    AUTO_SAVE_INTERVAL=${AUTO_SAVE_INTERVAL:-3}
    CONSOLIDATE_AFTER=${CONSOLIDATE_AFTER:-3}
    ENABLE_REFLECTION=${ENABLE_REFLECTION:-true}
    REFLECTION_INTERVAL=${REFLECTION_INTERVAL:-5}
    MAX_CONVERSATION=${MAX_CONVERSATION:-5}
}

session_start() {
    load_config

    echo "=== Memory: Session Start ==="

    if [ ! -d "$MEMORY_DIR/identity" ]; then
        echo "⚠️  Memory not initialized. Run: bash $SCRIPT_DIR/init-memory.sh"
        return 1
    fi

    echo "Loading identity..."
    echo ""
    echo "--- identity/AI.md ---"
    cat "$MEMORY_DIR/identity/AI.md" 2>/dev/null || echo "(not found)"
    echo ""
    echo "--- identity/you.md ---"
    cat "$MEMORY_DIR/identity/you.md" 2>/dev/null || echo "(not found)"
    echo ""

    conv_count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "Conversation count: $conv_count"

    if [ "$conv_count" -ge "$CONSOLIDATE_AFTER" ]; then
        echo "⚠️  $conv_count conversations - consider consolidate/summarize"
    fi

    if [ "$ENABLE_REFLECTION" = "true" ]; then
        if [ "$conv_count" -ge "$REFLECTION_INTERVAL" ]; then
            echo "⚠️  Reflection recommended (after $REFLECTION_INTERVAL conversations)"
        fi
    fi
}

session_end() {
    load_config

    echo "=== Memory: Session End ==="
    echo ""

    conv_count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "Current conversations: $conv_count"

    if [ "$conv_count" -ge "$MAX_CONVERSATION" ]; then
        echo "⚠️  Max conversations reached ($MAX_CONVERSATION)"
        echo "Recommend: Run summarize then backup"
    elif [ "$conv_count" -ge "$CONSOLIDATE_AFTER" ]; then
        echo "⚠️  Consolidation recommended (after $CONSOLIDATE_AFTER)"
        echo "Steps:"
        echo "  1. bash $SCRIPT_DIR/summarize.sh"
        echo "  2. bash $SCRIPT_DIR/write-memory.sh ai \"updated content\""
        echo "  3. bash $SCRIPT_DIR/backup-history.sh --all"
    fi

    if [ "$ENABLE_REFLECTION" = "true" ]; then
        if [ "$conv_count" -ge "$REFLECTION_INTERVAL" ]; then
            echo ""
            echo "⚠️  Reflection recommended:"
            echo "  bash $SCRIPT_DIR/reflection.sh init"
        fi
    fi

    echo ""
    echo "To save this conversation:"
    echo "  bash $SCRIPT_DIR/append-history.sh \"session content here\""
}

status() {
    load_config

    echo "=== Memory Status ==="
    echo ""

    echo "Identity:"
    for f in "$MEMORY_DIR/identity"/*.md; do
        [ -f "$f" ] && echo "  $(basename "$f")"
    done

    conv_count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "Conversations: $conv_count / $MAX_CONVERSATION"

    if [ "$conv_count" -ge "$CONSOLIDATE_AFTER" ]; then
        echo "⚠️  Consolidation needed"
    fi
}

case "${1:-status}" in
    start)
        session_start
        ;;
    end)
        session_end
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 [start|end|status]"
        echo ""
        echo "Session management:"
        echo "  start   - Load memory at session start"
        echo "  end     - Check what to do at session end"
        echo "  status  - Show current memory status"
        exit 1
        ;;
esac
