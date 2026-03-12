#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
CONFIG_FILE="$MEMORY_DIR/.memoryrc"

init_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        cat > "$CONFIG_FILE" << 'EOF'
# Memory Manager Configuration

# Load Triggers
LOAD_ON_START=true

# Save Triggers
AUTO_SAVE_CONVERSATION=true
AUTO_SAVE_INTERVAL=3

# Consolidation
CONSOLIDATE_AFTER=3
CONSOLIDATE_ON_EXIT=true

# Reflection
ENABLE_REFLECTION=true
REFLECTION_INTERVAL=5

# Limits
MAX_CONVERSATION=5
EOF
        echo "Created: $CONFIG_FILE"
    fi
}

load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    fi
}

show_config() {
    echo "=== Memory Configuration ==="
    echo ""
    load_config
    echo "Load on start:     $LOAD_ON_START"
    echo "Auto-save conv:    $AUTO_SAVE_CONVERSATION"
    echo "Save interval:     $AUTO_SAVE_INTERVAL"
    echo "Consolidate after: $CONSOLIDATE_AFTER"
    echo "Enable reflection: $ENABLE_REFLECTION"
    echo "Max conversation: $MAX_CONVERSATION"
    echo ""
    echo "Config file: $CONFIG_FILE"
}

case "${1:-show}" in
    init)
        init_config
        ;;
    show)
        show_config
        ;;
    *)
        echo "Usage: $0 [init|show]"
        exit 1
        ;;
esac
