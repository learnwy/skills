#!/bin/bash
set -euo pipefail

show_help() {
    cat << 'EOF'
Usage: get-knowledge-path.sh -r <project_root> -a <ai_type> -t <type> -n <filename>

Generate a knowledge document path based on project and AI IDE context.

Arguments:
  -r, --root      Project root directory (required)
  -a, --ai-type   AI/LLM type: trae, trae-cn, claude-code, cursor, windsurf (required)
  -t, --type      Knowledge type: debug, architecture, pattern, config, api, workflow, lesson, reference (required)
  -n, --name      Filename (without extension, required)
  -h, --help      Show this help message

AI Type to Path Mapping:
  trae, trae-cn      -> .trae/knowledges/
  claude-code        -> .claude/knowledges/
  cursor             -> .cursor/knowledges/
  windsurf           -> .windsurf/knowledges/

Output Format:
  {project_root}/{ai_path}/knowledges/{YYYYMMDD}_{daily_seq}_{type}_{filename}.md

Examples:
  get-knowledge-path.sh -r /project -a trae-cn -t debug -n memory-leak-fix
  # Output: /project/.trae/knowledges/20260223_001_debug_memory-leak-fix.md

  get-knowledge-path.sh -r /project -a claude-code -t pattern -n singleton-impl
  # Output: /project/.claude/knowledges/20260223_001_pattern_singleton-impl.md
EOF
}

PROJECT_ROOT=""
AI_TYPE=""
KNOWLEDGE_TYPE=""
FILENAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--root)
            PROJECT_ROOT="$2"
            shift 2
            ;;
        -a|--ai-type)
            AI_TYPE="$2"
            shift 2
            ;;
        -t|--type)
            KNOWLEDGE_TYPE="$2"
            shift 2
            ;;
        -n|--name)
            FILENAME="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Error: Unknown option: $1" >&2
            show_help
            exit 1
            ;;
    esac
done

if [[ -z "$PROJECT_ROOT" || -z "$AI_TYPE" || -z "$KNOWLEDGE_TYPE" || -z "$FILENAME" ]]; then
    echo "Error: Missing required arguments" >&2
    show_help
    exit 1
fi

if [[ ! -d "$PROJECT_ROOT" ]]; then
    echo "Error: Project root does not exist: $PROJECT_ROOT" >&2
    exit 1
fi

case "$AI_TYPE" in
    trae|trae-cn|TraeAI|TraeCN)
        AI_PATH=".trae"
        ;;
    claude-code|claude|ClaudeCode)
        AI_PATH=".claude"
        ;;
    cursor|Cursor)
        AI_PATH=".cursor"
        ;;
    windsurf|Windsurf)
        AI_PATH=".windsurf"
        ;;
    *)
        echo "Error: Unknown AI type: $AI_TYPE" >&2
        echo "Supported types: trae, trae-cn, claude-code, cursor, windsurf" >&2
        exit 1
        ;;
esac

VALID_TYPES="debug architecture pattern config api workflow lesson reference"
if ! echo "$VALID_TYPES" | grep -qw "$KNOWLEDGE_TYPE"; then
    echo "Error: Unknown knowledge type: $KNOWLEDGE_TYPE" >&2
    echo "Supported types: $VALID_TYPES" >&2
    exit 1
fi

KNOWLEDGE_DIR="$PROJECT_ROOT/$AI_PATH/knowledges"
mkdir -p "$KNOWLEDGE_DIR"

TODAY=$(date +%Y%m%d)
EXISTING_COUNT=$(find "$KNOWLEDGE_DIR" -maxdepth 1 -name "${TODAY}_*" -type f 2>/dev/null | wc -l | tr -d ' ')
DAILY_SEQ=$(printf "%03d" $((EXISTING_COUNT + 1)))

SAFE_FILENAME=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

OUTPUT_PATH="$KNOWLEDGE_DIR/${TODAY}_${DAILY_SEQ}_${KNOWLEDGE_TYPE}_${SAFE_FILENAME}.md"

echo "$OUTPUT_PATH"
