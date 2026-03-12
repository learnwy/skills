#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
CONFIG_FILE="$MEMORY_DIR/.memoryrc"

init_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        cat > "$CONFIG_FILE" << 'EOF'
# Memory Manager Configuration
# Generated: 2026-03-12

# === Load Triggers ===
# When to load memory at session start
LOAD_ON_START=true

# === Save Triggers ===
# When to auto-save memory
AUTO_SAVE_CONVERSATION=true
AUTO_SAVE_INTERVAL=3  # Save after N conversations
AUTO_SAVE_ON_EXIT=true

# === Consolidation Triggers ===
CONSOLIDATE_AFTER=3   # Consolidate after N conversations
CONSOLIDATE_ON_EXIT=true

# === Reflection ===
ENABLE_REFLECTION=true
REFLECTION_INTERVAL=5  # Reflect after N conversations

# === Memory Limits ===
MAX_CONVERSATION=5    # Max conversations before archive
MAX_TOKEN_IDENTITY=2000

# === Model/IDE/Agent Specific ===
# Per-model settings (override above)
# MODEL_TRAE="CONSOLIDATE_AFTER=2"
# MODEL_CLAUDE="CONSOLIDATE_AFTER=3"
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
    echo "Enable reflection:$ENABLE_REFLECTION"
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
