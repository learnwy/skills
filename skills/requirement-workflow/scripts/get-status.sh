#!/bin/bash
# =============================================================================
# get-status.sh - Get workflow status and progress information
# =============================================================================
#
# DESCRIPTION:
#   Displays workflow status, progress, and optionally state history.
#
# USAGE:
#   ./scripts/get-status.sh -p <workflow_dir> [--history] [--json]
#
# OPTIONS:
#   -p, --path DIR          Workflow directory path (REQUIRED)
#                           e.g., /project/.trae/workflow/20240115_001_feature_auth
#   --history               Show state transition history
#   --json                  Output in JSON format
#   -h, --help              Show help message
#
# INPUT:
#   - Workflow directory path (contains workflow.yaml)
#
# OUTPUT (text format):
#   ═══════════════════════════════════════════════════════
#   📋 Workflow: user-authentication
#   ═══════════════════════════════════════════════════════
#   🆔 ID: 20240115_001_feature_user-authentication
#   📊 Level: L2 (Standard)
#   🏷️  Type: feature
#   💻 Status: IMPLEMENTING
#   📈 Progress: 62%
#   ⏰ Duration: 2h 30m
#   
#   Progress: [████████████░░░░░░░░] 62%
#
# OUTPUT (json format):
#   {
#     "id": "20240115_001_feature_user-authentication",
#     "name": "user-authentication",
#     "status": "IMPLEMENTING",
#     "progress": 62,
#     ...
#   }
#
# EXAMPLES:
#   # Show workflow status
#   ./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_auth
#
#   # Show status with history
#   ./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_auth --history
#
#   # JSON output
#   ./scripts/get-status.sh -p /project/.trae/workflow/20240115_001_feature_auth --json
#
# =============================================================================
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") -p <workflow_dir> [OPTIONS]

Get workflow status and progress information.

Options:
    -p, --path DIR          Workflow directory path (REQUIRED)
    --history               Show state transition history
    --json                  Output in JSON format
    -h, --help              Show this help message

Examples:
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth --history
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth --json
EOF
}

read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^${key}:" "$file" 2> /dev/null | head -1 | sed "s/^${key}: *//" | tr -d '"'
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
  local workflow_dir="$1"
  local show_history="${2:-0}"
  local json_output="${3:-0}"

  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
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

main() {
  local workflow_dir=""
  local show_history=0
  local json_output=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      -p | --path)
        workflow_dir="$2"
        shift 2
        ;;
      --history)
        show_history=1
        shift
        ;;
      --json)
        json_output=1
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

  if [[ -z "$workflow_dir" ]]; then
    echo "Error: --path is required" >&2
    show_help
    exit 1
  fi

  workflow_dir="${workflow_dir%/}"

  show_workflow_status "$workflow_dir" "$show_history" "$json_output"
}

main "$@"
