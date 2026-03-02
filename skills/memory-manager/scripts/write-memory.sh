#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"

ALLOWED_FILES=("SOUL.md" "USER.md")

usage() {
    echo "Usage: $0 <filename> <content>"
    echo ""
    echo "Allowed files (security restricted):"
    for f in "${ALLOWED_FILES[@]}"; do
        echo "  - $f"
    done
    echo ""
    echo "Examples:"
    echo "  $0 SOUL.md \"content here\""
    echo "  $0 USER.md \"content here\""
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

FILENAME="$1"
CONTENT="$2"

is_allowed() {
    local file="$1"
    for allowed in "${ALLOWED_FILES[@]}"; do
        if [[ "$file" == "$allowed" ]]; then
            return 0
        fi
    done
    return 1
}

if ! is_allowed "$FILENAME"; then
    echo "Error: '$FILENAME' is not in the allowed file list."
    echo ""
    echo "Allowed files:"
    for f in "${ALLOWED_FILES[@]}"; do
        echo "  - $f"
    done
    echo ""
    echo "For history files, use append-history.sh instead."
    exit 1
fi

FILEPATH="$MEMORY_DIR/$FILENAME"

if [ ! -d "$MEMORY_DIR" ]; then
    echo "Error: Memory directory not initialized. Run init-memory.sh first."
    exit 1
fi

echo "$CONTENT" > "$FILEPATH"

echo "Written to: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"
