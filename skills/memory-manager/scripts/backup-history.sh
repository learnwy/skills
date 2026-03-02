#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/history"
ARCHIVE_DIR="$MEMORY_DIR/archive"

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Backup history files to archive directory."
    echo ""
    echo "Options:"
    echo "  --all          Archive all history files"
    echo "  --before DATE  Archive files before DATE (YYYY-MM-DD)"
    echo "  --dry-run      Show what would be archived without doing it"
    echo ""
    echo "Examples:"
    echo "  $0 --all"
    echo "  $0 --before 2024-01-01"
    echo "  $0 --before 2024-01-01 --dry-run"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

DRY_RUN=false
ARCHIVE_ALL=false
BEFORE_DATE=""

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
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

if [ ! -d "$HISTORY_DIR" ]; then
    echo "No history directory found."
    exit 0
fi

mkdir -p "$ARCHIVE_DIR"

archived_count=0

for filepath in "$HISTORY_DIR"/history-*.md; do
    [ -f "$filepath" ] || continue
    
    filename=$(basename "$filepath")
    
    if [[ "$filename" =~ ^history-([0-9]{4}-[0-9]{2}-[0-9]{2})-[0-9]+\.md$ ]]; then
        file_date="${BASH_REMATCH[1]}"
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
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would archive: $filename"
        else
            mv "$filepath" "$ARCHIVE_DIR/"
            echo "Archived: $filename"
        fi
        ((archived_count++))
    fi
done

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Dry run complete. $archived_count file(s) would be archived."
else
    echo ""
    echo "Backup complete. $archived_count file(s) archived to: $ARCHIVE_DIR"
fi
