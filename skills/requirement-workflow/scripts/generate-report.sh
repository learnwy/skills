#!/bin/bash
# =============================================================================
# generate-report.sh - Generate workflow summary report
# =============================================================================
#
# DESCRIPTION:
#   Generates a comprehensive report of the workflow including status,
#   progress, task completion, state history, and artifacts.
#
# USAGE:
#   ./scripts/generate-report.sh -p <workflow_dir> [--format <fmt>] [--output <file>]
#
# OPTIONS:
#   -p, --path DIR          Workflow directory path (REQUIRED)
#                           e.g., /project/.trae/workflow/20240115_001_feature_auth
#   --format FORMAT         Output format: markdown|json|text (default: markdown)
#   --output FILE           Output file (default: artifacts/report.md)
#   --include-logs          Include stage logs in the report
#   --notify                Send notification after generation
#   -h, --help              Show help message
#
# INPUT:
#   - Workflow directory path (contains workflow.yaml)
#
# OUTPUT (markdown):
#   # Workflow Report
#   ## Summary
#   | Field | Value |
#   |-------|-------|
#   | Workflow ID | `20240115_001_feature_auth` |
#   | Status | DONE |
#   | Duration | 4h 30m 15s |
#   ...
#
# OUTPUT (json):
#   {
#     "workflow_id": "20240115_001_feature_auth",
#     "status": "DONE",
#     "duration_seconds": 16215,
#     "progress": { "tasks": {...}, "checklist": {...} }
#   }
#
# OUTPUT (text):
#   ═══════════════════════════════════════════════════════
#                 WORKFLOW REPORT
#   ═══════════════════════════════════════════════════════
#   Workflow: user-authentication
#   Status: DONE
#   Tasks: 12 / 12 completed
#   ...
#
# EXAMPLES:
#   # Generate markdown report (default)
#   ./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth
#   # OUTPUT: ✅ Report generated: .../artifacts/report.md
#
#   # Generate JSON report
#   ./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth --format json
#
#   # Include logs in report
#   ./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth --include-logs
#
#   # Custom output file
#   ./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth \
#     --format markdown --output ./reports/auth-report.md
#
#   # Generate and notify
#   ./scripts/generate-report.sh -p /project/.trae/workflow/20240115_001_feature_auth --notify
#
# =============================================================================
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") -p <workflow_dir> [OPTIONS]

Generate a workflow summary report.

Options:
    -p, --path DIR          Workflow directory path (REQUIRED)
    --format FORMAT         Output format: markdown|json|text (default: markdown)
    --output FILE           Output file (default: artifacts/report.md)
    --include-logs          Include stage logs in report
    --notify                Send notification after generation
    -h, --help              Show this help message

Examples:
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth --format json
    $(basename "$0") -p /project/.trae/workflow/20240115_001_feature_auth --include-logs --notify
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
  local secs=$((seconds % 60))

  if [[ $hours -gt 0 ]]; then
    printf "%dh %dm %ds" $hours $minutes $secs
  elif [[ $minutes -gt 0 ]]; then
    printf "%dm %ds" $minutes $secs
  else
    printf "%ds" $secs
  fi
}

count_tasks() {
  local tasks_file="$1"
  local status="$2"

  if [[ ! -f "$tasks_file" ]]; then
    echo "0"
    return
  fi

  case "$status" in
    total)
      grep -c "^\s*- \[" "$tasks_file" 2> /dev/null || echo "0"
      ;;
    done)
      grep -c "^\s*- \[x\]" "$tasks_file" 2> /dev/null || echo "0"
      ;;
    pending)
      grep -c "^\s*- \[ \]" "$tasks_file" 2> /dev/null || echo "0"
      ;;
  esac
}

count_checklist() {
  local checklist_file="$1"
  local status="$2"

  if [[ ! -f "$checklist_file" ]]; then
    echo "0"
    return
  fi

  case "$status" in
    total)
      grep -c "^\s*- \[" "$checklist_file" 2> /dev/null || echo "0"
      ;;
    done)
      grep -c "^\s*- \[x\]" "$checklist_file" 2> /dev/null || echo "0"
      ;;
  esac
}

generate_markdown_report() {
  local workflow_id="$1"
  local workflow_dir="$2"
  local include_logs="$3"

  local workflow_file="$workflow_dir/workflow.yaml"

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local description=$(read_yaml_value "$workflow_file" "description")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")
  local updated_at=$(read_yaml_value "$workflow_file" "updated_at")

  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" "+%s" 2> /dev/null || echo "0")
  local updated_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$updated_at" "+%s" 2> /dev/null || echo "0")
  local duration=$((updated_ts - created_ts))
  local duration_str=$(format_duration $duration)

  local tasks_total=$(count_tasks "$workflow_dir/tasks.md" "total")
  local tasks_done=$(count_tasks "$workflow_dir/tasks.md" "done")
  local checklist_total=$(count_checklist "$workflow_dir/checklist.md" "total")
  local checklist_done=$(count_checklist "$workflow_dir/checklist.md" "done")

  cat << EOF
# Workflow Report / 工作流报告

## Summary / 概要

| Field | Value |
|-------|-------|
| **Workflow ID** | \`$workflow_id\` |
| **Name** | $name |
| **Type** | $req_type |
| **Level** | $level |
| **Status** | $status |
| **Duration** | $duration_str |
| **Created** | $created_at |
| **Updated** | $updated_at |

## Description / 描述

$description

## Progress / 进度

### Tasks / 任务

- Total: $tasks_total
- Completed: $tasks_done
- Completion Rate: $((tasks_total > 0 ? tasks_done * 100 / tasks_total : 0))%

### Verification Checklist / 验收清单

- Total Items: $checklist_total
- Completed: $checklist_done
- Completion Rate: $((checklist_total > 0 ? checklist_done * 100 / checklist_total : 0))%

## State History / 状态历史

| State | Entered At |
|-------|------------|
EOF

  local in_history=0
  local state="" entered=""

  while IFS= read -r line; do
    if [[ "$line" =~ ^state_history: ]]; then
      in_history=1
      continue
    fi

    if [[ $in_history -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]state:[[:space:]]*\"?([^\"]+)\"? ]]; then
        if [[ -n "$state" ]]; then
          echo "| $state | $entered |"
        fi
        state="${BASH_REMATCH[1]}"
        entered=""
      elif [[ "$line" =~ entered_at:[[:space:]]*\"?([^\"]+)\"? ]]; then
        entered="${BASH_REMATCH[1]}"
      elif [[ ! "$line" =~ ^[[:space:]] && "$line" != "" ]]; then
        in_history=0
      fi
    fi
  done < "$workflow_file"

  [[ -n "$state" ]] && echo "| $state | $entered |"

  cat << EOF

## Artifacts / 产出物

EOF

  for artifact in "$workflow_dir"/*.md; do
    [[ -f "$artifact" ]] && echo "- $(basename "$artifact")"
  done

  if [[ "$include_logs" == "1" && -d "$workflow_dir/logs" ]]; then
    cat << EOF

## Logs / 日志

EOF
    for log in "$workflow_dir/logs"/*.log; do
      if [[ -f "$log" ]]; then
        echo "### $(basename "$log")"
        echo ""
        echo '```'
        head -50 "$log"
        echo '```'
        echo ""
      fi
    done
  fi

  cat << EOF

---
*Report generated at $(date -u +"%Y-%m-%dT%H:%M:%SZ")*
EOF
}

generate_json_report() {
  local workflow_id="$1"
  local workflow_dir="$2"

  local workflow_file="$workflow_dir/workflow.yaml"

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local description=$(read_yaml_value "$workflow_file" "description")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")
  local updated_at=$(read_yaml_value "$workflow_file" "updated_at")

  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" "+%s" 2> /dev/null || echo "0")
  local updated_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$updated_at" "+%s" 2> /dev/null || echo "0")
  local duration=$((updated_ts - created_ts))

  local tasks_total=$(count_tasks "$workflow_dir/tasks.md" "total")
  local tasks_done=$(count_tasks "$workflow_dir/tasks.md" "done")
  local checklist_total=$(count_checklist "$workflow_dir/checklist.md" "total")
  local checklist_done=$(count_checklist "$workflow_dir/checklist.md" "done")

  cat << EOF
{
  "workflow_id": "$workflow_id",
  "name": "$name",
  "type": "$req_type",
  "level": "$level",
  "status": "$status",
  "description": "$description",
  "created_at": "$created_at",
  "updated_at": "$updated_at",
  "duration_seconds": $duration,
  "progress": {
    "tasks": {
      "total": $tasks_total,
      "completed": $tasks_done,
      "completion_rate": $((tasks_total > 0 ? tasks_done * 100 / tasks_total : 0))
    },
    "checklist": {
      "total": $checklist_total,
      "completed": $checklist_done,
      "completion_rate": $((checklist_total > 0 ? checklist_done * 100 / checklist_total : 0))
    }
  },
  "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

generate_text_report() {
  local workflow_id="$1"
  local workflow_dir="$2"

  local workflow_file="$workflow_dir/workflow.yaml"

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")

  local tasks_total=$(count_tasks "$workflow_dir/tasks.md" "total")
  local tasks_done=$(count_tasks "$workflow_dir/tasks.md" "done")

  cat << EOF
═══════════════════════════════════════════════════════
              WORKFLOW REPORT
═══════════════════════════════════════════════════════

Workflow: $name
ID: $workflow_id
Type: $req_type
Level: $level
Status: $status

Tasks: $tasks_done / $tasks_total completed

Created: $created_at
═══════════════════════════════════════════════════════
EOF
}

send_notification() {
  local workflow_id="$1"
  local status="$2"

  echo "📧 Notification would be sent for workflow: $workflow_id (status: $status)"
}

main() {
  local workflow_dir=""
  local format="markdown"
  local output=""
  local include_logs=0
  local notify=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      -p | --path)
        workflow_dir="$2"
        shift 2
        ;;
      --format)
        format="$2"
        shift 2
        ;;
      --output)
        output="$2"
        shift 2
        ;;
      --include-logs)
        include_logs=1
        shift
        ;;
      --notify)
        notify=1
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
  local workflow_id=$(basename "$workflow_dir")
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
    exit 1
  fi

  if [[ -z "$output" ]]; then
    case "$format" in
      markdown) output="$workflow_dir/artifacts/report.md" ;;
      json) output="$workflow_dir/artifacts/report.json" ;;
      text) output="$workflow_dir/artifacts/report.txt" ;;
    esac
  fi

  mkdir -p "$(dirname "$output")"

  case "$format" in
    markdown)
      generate_markdown_report "$workflow_id" "$workflow_dir" "$include_logs" > "$output"
      ;;
    json)
      generate_json_report "$workflow_id" "$workflow_dir" > "$output"
      ;;
    text)
      generate_text_report "$workflow_id" "$workflow_dir" > "$output"
      ;;
    *)
      echo "Error: Unknown format: $format" >&2
      exit 1
      ;;
  esac

  echo "✅ Report generated: $output"

  if [[ $notify -eq 1 ]]; then
    local status=$(read_yaml_value "$workflow_file" "status")
    send_notification "$workflow_id" "$status"
  fi
}

main "$@"
