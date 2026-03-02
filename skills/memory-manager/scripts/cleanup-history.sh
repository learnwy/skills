#!/bin/bash
set -e

MEMORY_DIR="$HOME/.learnwy/ai/memory"
HISTORY_DIR="$MEMORY_DIR/history"
ARCHIVE_DIR="$MEMORY_DIR/archive"

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Clean up old history files. By default, keeps recent files in history/"
    echo "and removes old files from archive/."
    echo ""
    echo "Options:"
    echo "  --keep-days N      Keep history files from last N days (default: 30)"
    echo "  --archive-days N   Delete archived files older than N days (default: 90)"
    echo "  --dry-run          Show what would be deleted without doing it"
    echo "  --status           Show current file counts and sizes"
    echo ""
    echo "Examples:"
    echo "  $0 --status"
    echo "  $0 --keep-days 7 --dry-run"
    echo "  $0 --keep-days 30 --archive-days 90"
    exit 1
}

KEEP_DAYS=30
ARCHIVE_DAYS=90
DRY_RUN=false
SHOW_STATUS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --keep-days)
            KEEP_DAYS="$2"
            shift 2
            ;;
        --archive-days)
            ARCHIVE_DAYS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --status)
            SHOW_STATUS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

if [ "$SHOW_STATUS" = true ]; then
    echo "=== Memory Status ==="
    echo ""
    
    if [ -f "$MEMORY_DIR/SOUL.md" ]; then
        soul_size=$(wc -c < "$MEMORY_DIR/SOUL.md")
        echo "SOUL.md: $soul_size bytes"
    else
        echo "SOUL.md: not found"
    fi
    
    if [ -f "$MEMORY_DIR/USER.md" ]; then
        user_size=$(wc -c < "$MEMORY_DIR/USER.md")
        echo "USER.md: $user_size bytes"
    else
        echo "USER.md: not found"
    fi
    
    echo ""
    
    if [ -d "$HISTORY_DIR" ]; then
        history_count=$(find "$HISTORY_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
        history_size=$(du -sh "$HISTORY_DIR" 2>/dev/null | cut -f1)
        echo "History files: $history_count ($history_size)"
        
        if [ "$history_count" -gt 0 ]; then
            oldest=$(ls -1 "$HISTORY_DIR"/history-*.md 2>/dev/null | head -1 | xargs basename)
            newest=$(ls -1 "$HISTORY_DIR"/history-*.md 2>/dev/null | tail -1 | xargs basename)
            echo "  Oldest: $oldest"
            echo "  Newest: $newest"
        fi
    else
        echo "History files: 0 (directory not found)"
    fi
    
    echo ""
    
    if [ -d "$ARCHIVE_DIR" ]; then
        archive_count=$(find "$ARCHIVE_DIR" -name "history-*.md" 2>/dev/null | wc -l | tr -d ' ')
        archive_size=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
        echo "Archived files: $archive_count ($archive_size)"
    else
        echo "Archived files: 0 (directory not found)"
    fi
    
    exit 0
fi

TODAY=$(date +%Y-%m-%d)

date_diff_days() {
    local date1=$1
    local date2=$2
    local d1=$(date -j -f "%Y-%m-%d" "$date1" "+%s" 2>/dev/null)
    local d2=$(date -j -f "%Y-%m-%d" "$date2" "+%s" 2>/dev/null)
    if [ -z "$d1" ] || [ -z "$d2" ]; then
        echo "0"
        return
    fi
    echo $(( (d2 - d1) / 86400 ))
}

archived_count=0
deleted_count=0

echo "=== Cleanup Starting ==="
echo "Keep history: last $KEEP_DAYS days"
echo "Delete archives older than: $ARCHIVE_DAYS days"
echo ""

if [ -d "$HISTORY_DIR" ]; then
    echo "--- Processing history/ ---"
    mkdir -p "$ARCHIVE_DIR"
    
    for filepath in "$HISTORY_DIR"/history-*.md; do
        [ -f "$filepath" ] || continue
        
        filename=$(basename "$filepath")
        
        if [[ "$filename" =~ ^history-([0-9]{4}-[0-9]{2}-[0-9]{2})-[0-9]+\.md$ ]]; then
            file_date="${BASH_REMATCH[1]}"
        else
            continue
        fi
        
        days_old=$(date_diff_days "$file_date" "$TODAY")
        
        if [ "$days_old" -gt "$KEEP_DAYS" ]; then
            if [ "$DRY_RUN" = true ]; then
                echo "[DRY-RUN] Would archive: $filename ($days_old days old)"
            else
                mv "$filepath" "$ARCHIVE_DIR/"
                echo "Archived: $filename ($days_old days old)"
            fi
            ((archived_count++))
        fi
    done
fi

if [ -d "$ARCHIVE_DIR" ]; then
    echo ""
    echo "--- Processing archive/ ---"
    
    for filepath in "$ARCHIVE_DIR"/history-*.md; do
        [ -f "$filepath" ] || continue
        
        filename=$(basename "$filepath")
        
        if [[ "$filename" =~ ^history-([0-9]{4}-[0-9]{2}-[0-9]{2})-[0-9]+\.md$ ]]; then
            file_date="${BASH_REMATCH[1]}"
        else
            continue
        fi
        
        days_old=$(date_diff_days "$file_date" "$TODAY")
        
        if [ "$days_old" -gt "$ARCHIVE_DAYS" ]; then
            if [ "$DRY_RUN" = true ]; then
                echo "[DRY-RUN] Would delete: $filename ($days_old days old)"
            else
                rm "$filepath"
                echo "Deleted: $filename ($days_old days old)"
            fi
            ((deleted_count++))
        fi
    done
fi

echo ""
echo "=== Cleanup Complete ==="
if [ "$DRY_RUN" = true ]; then
    echo "Dry run: $archived_count would be archived, $deleted_count would be deleted"
else
    echo "Archived: $archived_count files"
    echo "Deleted: $deleted_count files"
fi
