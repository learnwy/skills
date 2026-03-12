#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"
ARCHIVE_DIR="$MEMORY_DIR/archive/by-month"

usage() {
    echo "Usage: $0 <type> <name>"
    echo ""
    echo "Create deeper memory from conversations."
    echo ""
    echo "Types:"
    echo "  project <name>   Create project memory in deeper/projects/"
    echo "  pattern <name>   Create pattern memory in deeper/patterns/"
    echo ""
    echo "Examples:"
    echo "  $0 project tiktok-bff"
    echo "  $0 pattern debugging-workflow"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

TYPE="$1"
NAME="$2"

if [ "$TYPE" = "project" ]; then
    TARGET_DIR="$MEMORY_DIR/deeper/projects"
    FILENAME="$NAME.md"
elif [ "$TYPE" = "pattern" ]; then
    TARGET_DIR="$MEMORY_DIR/deeper/patterns"
    FILENAME="$NAME.md"
else
    echo "Error: Unknown type '$TYPE'"
    usage
fi

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "Error: Memory not initialized. Run: bash $SCRIPT_DIR/init-memory.sh"
    exit 1
fi

mkdir -p "$TARGET_DIR"

FILEPATH="$TARGET_DIR/$FILENAME"

if [ -f "$FILEPATH" ]; then
    echo "Error: $FILEPATH already exists."
    exit 1
fi

cat > "$FILEPATH" << EOF
# $NAME

**Created**: $(date +%Y-%m-%d)
**Type**: $TYPE

## Overview

## Key Details

## Decisions

## Learnings

## Related Conversations

EOF

echo "Created: $FILEPATH"
echo ""
echo "Edit this file to add deeper memory content."
