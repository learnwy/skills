#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/conversation/history"
ARCHIVE_DIR="$MEMORY_DIR/archive/by-month"

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --all          Archive all conversation files"
    echo "  --before DATE  Archive files before DATE (YYYY-MM-DD)"
    echo "  --dry-run      Show what would be archived"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

ARCHIVE_ALL=false
BEFORE_DATE=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            ARCHIVE_ALL=true
            shift
            ;;
        --before)
            BEFORE_DATE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown: $1"
            usage
            ;;
    esac
done

if [ ! -d "$HISTORY_DIR" ]; then
    echo "No conversation directory."
    exit 0
fi

mkdir -p "$ARCHIVE_DIR"

archived=0

for filepath in "$HISTORY_DIR"/history-*.md; do
    [ -f "$filepath" ] || continue

    filename=$(basename "$filepath")

    if [[ "$filename" =~ ^history-([0-9]{4}-[0-9]{2}-[0-9]{2})-[0-9]+\.md$ ]]; then
        file_date="${BASH_REMATCH[1]}"
        month_dir="${file_date%%-*}-${file_date:5:2}"
    else
        continue
    fi

    should_archive=false

    if [ "$ARCHIVE_ALL" = true ]; then
        should_archive=true
    elif [ -n "$BEFORE_DATE" ]; then
        if [[ "$file_date" < "$BEFORE_DATE" ]]; then
            should_archive=true
        fi
    fi

    if [ "$should_archive" = true ]; then
        target_dir="$ARCHIVE_DIR/$month_dir"
        mkdir -p "$target_dir"

        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would move: $filename → $month_dir/"
        else
            mv "$filepath" "$target_dir/"
            echo "Archived: $filename → $month_dir/"
        fi
        ((archived++))
    fi
done

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Dry run: $archived file(s) would be archived."
else
    echo ""
    echo "✓ Archived $archived file(s) to $ARCHIVE_DIR"
fi
