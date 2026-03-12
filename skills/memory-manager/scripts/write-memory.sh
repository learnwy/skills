#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"

ALLOWED_FILES=("AI.md" "you.md")
ALLOWED_PATHS=("identity/AI.md" "identity/you.md" "deeper/projects/" "deeper/patterns/")

usage() {
    echo "Usage: $0 <filename> <content>"
    echo ""
    echo "Allowed files:"
    echo "  - identity/AI.md    (AI's identity)"
    echo "  - identity/you.md   (User profile)"
    echo "  - deeper/projects/<name>.md"
    echo "  - deeper/patterns/<name>.md"
    echo ""
    echo "Examples:"
    echo "  $0 identity/AI.md \"content\""
    echo "  $0 identity/you.md \"content\""
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

FILENAME="$1"
CONTENT="$2"

is_allowed() {
    local file="$1"
    for allowed in "${ALLOWED_PATHS[@]}"; do
        if [[ "$file" == "$allowed"* ]]; then
            return 0
        fi
    done
    return 1
}

if ! is_allowed "$FILENAME"; then
    echo "Error: '$FILENAME' not allowed."
    echo ""
    echo "Allowed:"
    for f in "${ALLOWED_FILES[@]}"; do
        echo "  - identity/$f"
    done
    echo "  - deeper/projects/*.md"
    echo "  - deeper/patterns/*.md"
    exit 1
fi

FILEPATH="$MEMORY_DIR/$FILENAME"

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "Error: Memory not initialized. Run init-memory.sh first."
    exit 1
fi

DIRPATH=$(dirname "$FILEPATH")
mkdir -p "$DIRPATH"

echo "$CONTENT" > "$FILEPATH"

echo "Written: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"
