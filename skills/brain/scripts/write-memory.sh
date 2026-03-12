#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"

usage() {
    echo "Usage: $0 <type> <content-or-name>"
    echo ""
    echo "Types:"
    echo "  ai <content>      Write to AI identity"
    echo "  you <content>     Write to user profile"
    echo "  project <name>   Create/update project memory"
    echo "  pattern <name>   Create/update pattern memory"
    echo ""
    echo "Examples:"
    echo "  $0 ai \"**Identity** AI coding partner...\""
    echo "  $0 you \"**Profile** wangyang.learnwy...\""
    echo "  $0 project tiktok-bff"
    echo "  $0 pattern debugging"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

TYPE="$1"
shift

if [ ! -d "$MEMORY_DIR/identity" ]; then
    echo "Error: Memory not initialized. Run: bash $SCRIPT_DIR/init-memory.sh"
    exit 1
fi

case "$TYPE" in
    ai)
        FILEPATH="$MEMORY_DIR/identity/AI.md"
        ;;
    you)
        FILEPATH="$MEMORY_DIR/identity/you.md"
        ;;
    project)
        NAME="$1"
        if [ -z "$NAME" ]; then
            echo "Error: project requires a name"
            exit 1
        fi
        FILEPATH="$MEMORY_DIR/deeper/projects/$NAME.md"
        mkdir -p "$MEMORY_DIR/deeper/projects"
        ;;
    pattern)
        NAME="$1"
        if [ -z "$NAME" ]; then
            echo "Error: pattern requires a name"
            exit 1
        fi
        FILEPATH="$MEMORY_DIR/deeper/patterns/$NAME.md"
        mkdir -p "$MEMORY_DIR/deeper/patterns"
        ;;
    *)
        echo "Error: Unknown type '$TYPE'"
        usage
        ;;
esac

if [ "$TYPE" = "project" ] || [ "$TYPE" = "pattern" ]; then
    if [ -f "$FILEPATH" ]; then
        echo "Updating: $FILEPATH"
    else
        echo "Creating: $FILEPATH"
        cat > "$FILEPATH" << EOF
# $NAME

**Created**: $(date +%Y-%m-%d)
**Type**: $TYPE

## Overview

## Key Details

## Decisions

## Learnings

EOF
    fi
else
    CONTENT="$*"
    printf '%s\n' "$CONTENT" > "$FILEPATH"
fi

echo "Written: $FILEPATH"
echo "Size: $(wc -c < "$FILEPATH") bytes"
