#!/bin/bash
# =============================================================================
# workflow-utils.sh - Workflow path and state operations
# =============================================================================
#
# DESCRIPTION:
#   Provides workflow-specific utility functions for path resolution,
#   active workflow management, and workflow state queries.
#
# USAGE:
#   source "$(dirname "$0")/lib/workflow-utils.sh"
#   # Or use common-utils.sh which sources all utils
#
# FUNCTIONS:
#   get_active_workflow <project_root>        - Get active workflow directory path
#   get_workflow_base <project_root>          - Get workflow base directory
#   set_active_workflow <project_root> <path> - Set active workflow path
#   workflow_exists <project_root>            - Check if active workflow exists
#
# =============================================================================

get_active_workflow() {
  local project_root="$1"
  local active_file="$project_root/.trae/active_workflow"
  
  if [[ -f "$active_file" ]]; then
    cat "$active_file"
  else
    echo ""
  fi
}

get_workflow_base() {
  local project_root="$1"
  echo "$project_root/.trae/workflow"
}

set_active_workflow() {
  local project_root="$1"
  local workflow_path="$2"
  local active_file="$project_root/.trae/active_workflow"
  
  mkdir -p "$(dirname "$active_file")"
  echo "$workflow_path" > "$active_file"
}

workflow_exists() {
  local project_root="$1"
  local workflow_dir
  workflow_dir=$(get_active_workflow "$project_root")
  
  if [[ -n "$workflow_dir" && -d "$workflow_dir" && -f "$workflow_dir/workflow.yaml" ]]; then
    return 0
  else
    return 1
  fi
}

get_workflow_id() {
  local workflow_dir="$1"
  basename "$workflow_dir"
}

get_workflow_file() {
  local workflow_dir="$1"
  echo "$workflow_dir/workflow.yaml"
}
