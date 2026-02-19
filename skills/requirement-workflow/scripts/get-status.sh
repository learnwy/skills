#!/bin/bash
# =============================================================================
# get-status.sh - Get workflow status and progress information
# =============================================================================
#
# DESCRIPTION:
#   Displays workflow status, progress, and optionally state history.
#   By default operates on the active workflow.
#
# USAGE:
#   ./scripts/get-status.sh -r <root> [--history] [--json]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   --history               Show state transition history
#   --json                  Output in JSON format
#   -h, --help              Show help message
#
# INPUT:
#   - Project root directory
#   - Reads active workflow from {root}/.trae/active_workflow
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
#   # Show active workflow status
#   ./scripts/get-status.sh -r /path/to/project
#
#   # Show status with history
#   ./scripts/get-status.sh -r /path/to/project --history
#
#   # JSON output
#   ./scripts/get-status.sh -r /path/to/project --json
#
#   # Operate on a specific workflow
#   ./scripts/get-status.sh -r /path/to/project -p /path/to/.trae/workflow/xxx
#
# =============================================================================
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> [OPTIONS]

Get workflow status and progress information.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    --history               Show state transition history
    --json                  Output in JSON format
    -h, --help              Show this help message

Examples:
    $(basename "$0") -r /path/to/project
    $(basename "$0") -r /path/to/project --history
    $(basename "$0") -r /path/to/project --json
EOF
}

get_active_workflow() {
  local project_root="$1"
  local active_file="$project_root/.trae/active_workflow"
  
  if [[ -f "$active_file" ]]; then
    cat "$active_file"
  else
    echo ""
  fi
}

read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^${key}:" "$file" 2> /dev/null | head -1 | sed "s/^${key}: *//" | tr -d '"'
}

get_level_name() {
  case "$1" in
    L1) echo "Quick" ;;
    L2) echo "Standard" ;;
    L3) echo "Full" ;;
    *) echo "Unknown" ;;
  esac
}

get_stage_progress() {
  local status="$1"
  local level="$2"

  case "$status" in
    INIT) echo "0" ;;
    ANALYZING) echo "15" ;;
    PLANNING) echo "30" ;;
    DESIGNING) echo "45" ;;
    IMPLEMENTING) echo "60" ;;
    TESTING) echo "80" ;;
    DELIVERING) echo "95" ;;
    DONE) echo "100" ;;
    *) echo "0" ;;
  esac
}

format_duration() {
  local seconds="$1"
  local hours=$((seconds / 3600))
  local minutes=$(((seconds % 3600) / 60))

  if [[ $hours -gt 0 ]]; then
    echo "${hours}h ${minutes}m"
  else
    echo "${minutes}m"
  fi
}

draw_progress_bar() {
  local progress="$1"
  local width=20
  local filled=$((progress * width / 100))
  local empty=$((width - filled))

  printf "["
  for ((i = 0; i < filled; i++)); do printf "█"; done
  for ((i = 0; i < empty; i++)); do printf "░"; done
  printf "] %d%%" "$progress"
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

  local progress=$(get_stage_progress "$status" "$level")
  local level_name=$(get_level_name "$level")

  local now=$(date +%s)
  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2> /dev/null || echo "$now")
  local duration=$((now - created_ts))
  local duration_str=$(format_duration "$duration")

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
  "duration_seconds": $duration,
  "directory": "$workflow_dir"
}
EOF
    return 0
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "📋 Workflow: $name"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  echo "🆔 ID: $workflow_id"
  echo "📊 Level: $level ($level_name)"
  echo "🏷️  Type: $req_type"
  echo "💻 Status: $status"
  echo "📈 Progress: ${progress}%"
  echo "⏰ Duration: $duration_str"
  echo "📁 Directory: $workflow_dir"
  echo ""
  printf "Progress: "
  draw_progress_bar "$progress"
  echo ""

  if [[ $show_history -eq 1 ]]; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "📜 State History"
    echo "═══════════════════════════════════════════════════════"

    local in_history=0
    while IFS= read -r line; do
      if [[ "$line" == "state_history:" ]]; then
        in_history=1
        continue
      fi
      if [[ $in_history -eq 1 ]]; then
        if [[ "$line" =~ ^[a-z] ]]; then
          break
        fi
        if [[ "$line" =~ "state:" ]]; then
          local state=$(echo "$line" | sed 's/.*state: *//' | tr -d '"')
          read -r next_line
          local entered_at=$(echo "$next_line" | sed 's/.*entered_at: *//' | tr -d '"')
          read -r current_line
          local is_current=$(echo "$current_line" | grep -c "current: true" || true)

          if [[ $is_current -gt 0 ]]; then
            echo "▶ $state @ $entered_at"
          else
            echo "  $state @ $entered_at"
          fi
        fi
      fi
    done < "$workflow_file"
  fi
}

main() {
  local project_root=""
  local workflow_dir=""
  local show_history=0
  local json_output=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      -r | --root)
        project_root="$2"
        shift 2
        ;;
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

  if [[ -z "$project_root" ]]; then
    echo "Error: --root is required" >&2
    show_help
    exit 1
  fi

  project_root="${project_root%/}"
  project_root="$(cd "$project_root" && pwd)"

  if [[ -z "$workflow_dir" ]]; then
    workflow_dir=$(get_active_workflow "$project_root")
  fi

  if [[ -z "$workflow_dir" ]]; then
    echo "Error: No active workflow found. Run init-workflow.sh first." >&2
    exit 1
  fi

  show_workflow_status "$workflow_dir" "$show_history" "$json_output"
}

main "$@"
