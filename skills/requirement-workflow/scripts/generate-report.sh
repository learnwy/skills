#!/bin/bash
# =============================================================================
# generate-report.sh - Generate workflow summary report
# =============================================================================
#
# DESCRIPTION:
#   Generates a comprehensive report of the workflow including status,
#   progress, task completion, state history, and artifacts.
#   By default operates on the active workflow.
#
# USAGE:
#   ./scripts/generate-report.sh -r <root> [--format <fmt>] [--output <file>]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   --format FORMAT         Output format: markdown|json|text (default: markdown)
#   --output FILE           Output file (default: artifacts/report.md)
#   --include-logs          Include stage logs in the report
#   --notify                Send notification after generation
#   -h, --help              Show help message
#
# INPUT:
#   - Project root directory
#   - Reads active workflow from {root}/.trae/active_workflow
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
#   ./scripts/generate-report.sh -r /path/to/project
#   # OUTPUT: ✅ Report generated: .../artifacts/report.md
#
#   # Generate JSON report
#   ./scripts/generate-report.sh -r /path/to/project --format json
#
#   # Include logs in report
#   ./scripts/generate-report.sh -r /path/to/project --include-logs
#
#   # Custom output file
#   ./scripts/generate-report.sh -r /path/to/project \
#     --format markdown --output ./reports/auth-report.md
#
#   # Generate and notify
#   ./scripts/generate-report.sh -r /path/to/project --notify
#
# =============================================================================
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> [OPTIONS]

Generate a workflow summary report.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    --format FORMAT         Output format: markdown|json|text (default: markdown)
    --output FILE           Output file (default: artifacts/report.md)
    --include-logs          Include stage logs in report
    --notify                Send notification after generation
    -h, --help              Show this help message

Examples:
    $(basename "$0") -r /path/to/project
    $(basename "$0") -r /path/to/project --format json
    $(basename "$0") -r /path/to/project --include-logs --notify
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

format_duration() {
  local seconds="$1"
  local hours=$((seconds / 3600))
  local minutes=$(((seconds % 3600) / 60))
  local secs=$((seconds % 60))

  if [[ $hours -gt 0 ]]; then
    echo "${hours}h ${minutes}m ${secs}s"
  elif [[ $minutes -gt 0 ]]; then
    echo "${minutes}m ${secs}s"
  else
    echo "${secs}s"
  fi
}

count_tasks() {
  local tasks_file="$1"
  local pattern="$2"

  if [[ -f "$tasks_file" ]]; then
    grep -c "$pattern" "$tasks_file" 2> /dev/null || echo "0"
  else
    echo "0"
  fi
}

generate_markdown_report() {
  local workflow_dir="$1"
  local include_logs="$2"
  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")
  local updated_at=$(read_yaml_value "$workflow_file" "updated_at")
  local description=$(read_yaml_value "$workflow_file" "description")

  local now=$(date +%s)
  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2> /dev/null || echo "$now")
  local duration=$((now - created_ts))
  local duration_str=$(format_duration "$duration")

  local total_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[")
  local done_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[x\]")

  local total_checks=$(count_tasks "$workflow_dir/checklist.md" "^\- \[")
  local done_checks=$(count_tasks "$workflow_dir/checklist.md" "^\- \[x\]")

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
- Total: $total_tasks
- Completed: $done_tasks
- Completion Rate: $(( total_tasks > 0 ? done_tasks * 100 / total_tasks : 0 ))%

### Checklist / 检查清单
- Total: $total_checks
- Completed: $done_checks
- Completion Rate: $(( total_checks > 0 ? done_checks * 100 / total_checks : 0 ))%

## Files / 文件

- [Spec](spec.md)
- [Tasks](tasks.md)
- [Checklist](checklist.md)

EOF

  if [[ $include_logs -eq 1 && -d "$workflow_dir/logs" ]]; then
    echo "## Logs / 日志"
    echo ""
    for log in "$workflow_dir/logs"/*.log 2> /dev/null; do
      if [[ -f "$log" ]]; then
        echo "### $(basename "$log")"
        echo '```'
        head -50 "$log"
        echo '```'
        echo ""
      fi
    done
  fi

  echo "---"
  echo "*Report generated at $(date -u +"%Y-%m-%dT%H:%M:%SZ")*"
}

generate_json_report() {
  local workflow_dir="$1"
  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")
  local updated_at=$(read_yaml_value "$workflow_file" "updated_at")

  local now=$(date +%s)
  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2> /dev/null || echo "$now")
  local duration=$((now - created_ts))

  local total_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[")
  local done_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[x\]")
  local total_checks=$(count_tasks "$workflow_dir/checklist.md" "^\- \[")
  local done_checks=$(count_tasks "$workflow_dir/checklist.md" "^\- \[x\]")

  cat << EOF
{
  "workflow_id": "$workflow_id",
  "name": "$name",
  "type": "$req_type",
  "level": "$level",
  "status": "$status",
  "duration_seconds": $duration,
  "created_at": "$created_at",
  "updated_at": "$updated_at",
  "progress": {
    "tasks": {
      "total": $total_tasks,
      "completed": $done_tasks,
      "completion_rate": $(( total_tasks > 0 ? done_tasks * 100 / total_tasks : 0 ))
    },
    "checklist": {
      "total": $total_checks,
      "completed": $done_checks,
      "completion_rate": $(( total_checks > 0 ? done_checks * 100 / total_checks : 0 ))
    }
  },
  "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

generate_text_report() {
  local workflow_dir="$1"
  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  local name=$(read_yaml_value "$workflow_file" "name")
  local req_type=$(read_yaml_value "$workflow_file" "type")
  local level=$(read_yaml_value "$workflow_file" "level")
  local status=$(read_yaml_value "$workflow_file" "status")
  local created_at=$(read_yaml_value "$workflow_file" "created_at")

  local now=$(date +%s)
  local created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2> /dev/null || echo "$now")
  local duration=$((now - created_ts))
  local duration_str=$(format_duration "$duration")

  local total_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[")
  local done_tasks=$(count_tasks "$workflow_dir/tasks.md" "^\- \[x\]")

  echo "═══════════════════════════════════════════════════════"
  echo "              WORKFLOW REPORT"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  echo "Workflow: $name"
  echo "ID: $workflow_id"
  echo "Type: $req_type"
  echo "Level: $level"
  echo "Status: $status"
  echo "Duration: $duration_str"
  echo "Tasks: $done_tasks / $total_tasks completed"
  echo ""
  echo "═══════════════════════════════════════════════════════"
}

main() {
  local project_root=""
  local workflow_dir=""
  local format="markdown"
  local output=""
  local include_logs=0
  local notify=0

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

  local workflow_id=$(basename "$workflow_dir")
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
    exit 1
  fi

  local ext="md"
  case "$format" in
    json) ext="json" ;;
    text) ext="txt" ;;
  esac

  if [[ -z "$output" ]]; then
    output="$workflow_dir/artifacts/report.$ext"
  fi

  mkdir -p "$(dirname "$output")"

  case "$format" in
    markdown)
      generate_markdown_report "$workflow_dir" "$include_logs" > "$output"
      ;;
    json)
      generate_json_report "$workflow_dir" > "$output"
      ;;
    text)
      generate_text_report "$workflow_dir" > "$output"
      ;;
    *)
      echo "Error: Unknown format: $format" >&2
      exit 1
      ;;
  esac

  echo "✅ Report generated: $output"

  if [[ $notify -eq 1 ]]; then
    local status=$(read_yaml_value "$workflow_file" "status")
    echo "📧 Notification would be sent for workflow: $workflow_id (status: $status)"
  fi
}

main "$@"
