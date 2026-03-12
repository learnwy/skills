#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"

usage() {
    echo "Usage: $0 [options] <content>"
    echo ""
    echo "Options:"
    echo "  -n, --name <name>   Custom session name (default: auto date)"
    echo ""
    echo "Examples:"
    echo "  $0 \"session content\""
    echo "  $0 -n my-session \"session content\""
    exit 1
}

NAME=""
CONTENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            NAME="$2"
            shift 2
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            CONTENT="$*"
            break
            ;;
    esac
done

if [ -z "$CONTENT" ]; then
    usage
fi

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "Error: Memory not initialized. Run: bash $SCRIPT_DIR/init-memory.sh"
    exit 1
fi

mkdir -p "$HISTORY_DIR"

if [ -z "$NAME" ]; then
    TODAY=$(date +%Y-%m-%d)
    COUNT=$(find "$HISTORY_DIR" -name "history-${TODAY}-*.md" 2>/dev/null | wc -l | tr -d ' ')
    FILENAME="history-${TODAY}-$(($COUNT + 1)).md"
else
    FILENAME="history-${NAME}.md"
fi

FILEPATH="$HISTORY_DIR/$FILENAME"
printf '%s\n' "$CONTENT" > "$FILEPATH"

echo "Saved: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"
