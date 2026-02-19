#!/bin/bash
set -euo pipefail

WORKFLOW_BASE=".trae/workflow"

show_help() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Get workflow status and progress information.

Options:
    -w, --workflow-id ID    Workflow ID (required unless --latest or --list)
    --latest                Show status of most recent workflow
    --list                  List all workflows
    --history               Show state transition history
    --filter STATUS         Filter workflows by status (for --list)
    --json                  Output in JSON format
    --debug-logs            Show debug logs
    -h, --help              Show this help message

Examples:
    $(basename "$0") --latest
    $(basename "$0") --list --filter IMPLEMENTING
    $(basename "$0") -w 20240115_001_feature_auth --history
EOF
}

read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^${key}:" "$file" 2> /dev/null | head -1 | sed "s/^${key}: *//" | tr -d '"'
}

get_latest_workflow() {
  if [[ -d "$WORKFLOW_BASE" ]]; then
    ls -1d "$WORKFLOW_BASE"/*/ 2> /dev/null | sort -r | head -1 | xargs basename 2> /dev/null || echo ""
  fi
}

format_duration() {
  local seconds=$1
  local hours=$((seconds / 3600))
  local minutes=$(((seconds % 3600) / 60))

  if [[ $hours -gt 0 ]]; then
    echo "${hours}h ${minutes}m"
  elif [[ $minutes -gt 0 ]]; then
    echo "${minutes}m"
  else
    echo "${seconds}s"
  fi
}

get_progress() {
  local status="$1"
  local level="$2"

  local stages_l1=("INIT" "PLANNING" "IMPLEMENTING" "TESTING" "DONE")
  local stages_l2=("INIT" "ANALYZING" "PLANNING" "DESIGNING" "IMPLEMENTING" "TESTING" "DELIVERING" "DONE")

  local stages=()
  if [[ "$level" == "L1" ]]; then
    stages=("${stages_l1[@]}")
  else
    stages=("${stages_l2[@]}")
  fi

  local total=${#stages[@]}
  local current=0

  for i in "${!stages[@]}"; do
    if [[ "${stages[$i]}" == "$status" ]]; then
      current=$((i + 1))
      break
    fi
  done

  echo "$((current * 100 / total))"
}

show_workflow_status() {
  local workflow_id="$1"
  local show_history="${2:-0}"
  local json_output="${3:-0}"

  local workflow_dir="$WORKFLOW_BASE/$workflow_id"
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: Workflow not found: $workflow_id" >&2
    return 1
  fi

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")
  local updated_at=$(read_yaml_value "$workflow_file" "updated_at")
  local description=$(read_yaml_value "$workflow_file" "description")

  local progress=$(get_progress "$status" "$level")

  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" "+%s" 2> /dev/null || echo "0")
  local now_ts=$(date "+%s")
  local duration=$((now_ts - created_ts))
  local duration_str=$(format_duration $duration)

  if [[ $json_output -eq 1 ]]; then
    cat << EOF
{
  "id": "$workflow_id",
  "name": "$name",
  "type": "$req_type",
  "level": "$level",
  "status": "$status",
  "progress": $progress,
  "created_at": "$created_at",
  "updated_at": "$updated_at",
  "duration_seconds": $duration
}
EOF
    return 0
  fi

  local level_name=""
  case "$level" in
    L1) level_name="Quick" ;;
    L2) level_name="Standard" ;;
    L3) level_name="Full" ;;
  esac

  local status_emoji=""
  case "$status" in
    INIT) status_emoji="🆕" ;;
    ANALYZING) status_emoji="🔍" ;;
    PLANNING) status_emoji="📝" ;;
    DESIGNING) status_emoji="🎨" ;;
    IMPLEMENTING) status_emoji="💻" ;;
    TESTING) status_emoji="🧪" ;;
    DELIVERING) status_emoji="📦" ;;
    DONE) status_emoji="✅" ;;
    BLOCKED) status_emoji="🚫" ;;
    WAITING) status_emoji="⏳" ;;
    PAUSED) status_emoji="⏸️" ;;
    FAILED) status_emoji="❌" ;;
  esac

  echo "═══════════════════════════════════════════════════════"
  echo "📋 Workflow: $name"
  echo "═══════════════════════════════════════════════════════"
  echo "🆔 ID: $workflow_id"
  echo "📊 Level: $level ($level_name)"
  echo "🏷️  Type: $req_type"
  echo "$status_emoji Status: $status"
  echo "📈 Progress: $progress%"
  echo "⏰ Duration: $duration_str"
  echo "📁 Directory: $workflow_dir"

  if [[ -n "$description" ]]; then
    echo ""
    echo "📝 Description: $description"
  fi

  local progress_bar=""
  local filled=$((progress / 5))
  local empty=$((20 - filled))
  progress_bar="["
  for ((i = 0; i < filled; i++)); do progress_bar+="█"; done
  for ((i = 0; i < empty; i++)); do progress_bar+="░"; done
  progress_bar+="]"
  echo ""
  echo "Progress: $progress_bar $progress%"

  if [[ $show_history -eq 1 ]]; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "📜 State History"
    echo "═══════════════════════════════════════════════════════"

    local in_history=0
    local state="" entered="" current=""

    while IFS= read -r line; do
      if [[ "$line" =~ ^state_history: ]]; then
        in_history=1
        continue
      fi

      if [[ $in_history -eq 1 ]]; then
        if [[ "$line" =~ ^[[:space:]]+-[[:space:]]state:[[:space:]]*\"?([^\"]+)\"? ]]; then
          if [[ -n "$state" ]]; then
            local marker="  "
            [[ "$current" == "true" ]] && marker="▶ "
            echo "$marker$state @ $entered"
          fi
          state="${BASH_REMATCH[1]}"
          entered=""
          current=""
        elif [[ "$line" =~ entered_at:[[:space:]]*\"?([^\"]+)\"? ]]; then
          entered="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ current:[[:space:]]*(true|false) ]]; then
          current="${BASH_REMATCH[1]}"
        elif [[ ! "$line" =~ ^[[:space:]] && "$line" != "" ]]; then
          in_history=0
        fi
      fi
    done < "$workflow_file"

    if [[ -n "$state" ]]; then
      local marker="  "
      [[ "$current" == "true" ]] && marker="▶ "
      echo "$marker$state @ $entered"
    fi
  fi

  echo ""
  echo "═══════════════════════════════════════════════════════"
}

list_workflows() {
  local filter="${1:-}"
  local json_output="${2:-0}"

  if [[ ! -d "$WORKFLOW_BASE" ]]; then
    echo "No workflows found"
    return 0
  fi

  local workflows=()
  for dir in "$WORKFLOW_BASE"/*/; do
    [[ -d "$dir" ]] && workflows+=("$(basename "$dir")")
  done

  if [[ ${#workflows[@]} -eq 0 ]]; then
    echo "No workflows found"
    return 0
  fi

  if [[ $json_output -eq 1 ]]; then
    echo "["
    local first=1
    for wf in "${workflows[@]}"; do
      local workflow_file="$WORKFLOW_BASE/$wf/workflow.yaml"
      [[ ! -f "$workflow_file" ]] && continue

      local status=$(read_yaml_value "$workflow_file" "status")
      [[ -n "$filter" && "$status" != "$filter" ]] && continue

      [[ $first -eq 0 ]] && echo ","
      first=0

      show_workflow_status "$wf" 0 1
    done
    echo "]"
    return 0
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "📋 Workflow List"
  echo "═══════════════════════════════════════════════════════"
  echo ""

  printf "%-40s %-12s %-6s %-15s\n" "ID" "STATUS" "LEVEL" "TYPE"
  printf "%-40s %-12s %-6s %-15s\n" "----------------------------------------" "------------" "------" "---------------"

  for wf in "${workflows[@]}"; do
    local workflow_file="$WORKFLOW_BASE/$wf/workflow.yaml"
    [[ ! -f "$workflow_file" ]] && continue

    local status=$(read_yaml_value "$workflow_file" "status")
    local level=$(read_yaml_value "$workflow_file" "level")
    local req_type=$(read_yaml_value "$workflow_file" "type")

    [[ -n "$filter" && "$status" != "$filter" ]] && continue

    printf "%-40s %-12s %-6s %-15s\n" "$wf" "$status" "$level" "$req_type"
  done

  echo ""
  echo "Total: ${#workflows[@]} workflow(s)"
}

main() {
  local workflow_id=""
  local use_latest=0
  local list_all=0
  local show_history=0
  local filter=""
  local json_output=0
  local debug_logs=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      -w | --workflow-id)
        workflow_id="$2"
        shift 2
        ;;
      --latest)
        use_latest=1
        shift
        ;;
      --list)
        list_all=1
        shift
        ;;
      --history)
        show_history=1
        shift
        ;;
      --filter)
        filter="$2"
        shift 2
        ;;
      --json)
        json_output=1
        shift
        ;;
      --debug-logs)
        debug_logs=1
        shift
        ;;
      -h | --help)
        show_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        show_help
        exit 1
        ;;
    esac
  done

  if [[ $list_all -eq 1 ]]; then
    list_workflows "$filter" "$json_output"
    exit 0
  fi

  if [[ $use_latest -eq 1 ]]; then
    workflow_id=$(get_latest_workflow)
  fi

  if [[ -z "$workflow_id" ]]; then
    echo "Error: No workflow specified" >&2
    echo "Use --latest, --list, or --workflow-id" >&2
    exit 1
  fi

  show_workflow_status "$workflow_id" "$show_history" "$json_output"
}

main "$@"
