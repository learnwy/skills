#!/bin/bash
# =============================================================================
# validation-utils.sh - Input validation utility functions
# =============================================================================
#
# DESCRIPTION:
#   Provides validation functions for workflow-related inputs
#   including levels, types, stages, and common patterns.
#
# USAGE:
#   source "$(dirname "$0")/lib/validation-utils.sh"
#
# FUNCTIONS:
#   is_valid_level <level>   - Validate workflow level (L1|L2|L3)
#   is_valid_type <type>     - Validate workflow type (feature|bugfix|...)
#   is_valid_stage <stage>   - Validate workflow stage
#   is_valid_scope <scope>   - Validate injection scope
#   is_valid_hook <hook>     - Validate hook point name
#   is_non_empty <str>       - Check if string is non-empty
#
# =============================================================================

is_valid_level() {
  local level="$1"
  [[ "$level" =~ ^(L1|L2|L3)$ ]]
}

is_valid_type() {
  local type="$1"
  [[ "$type" =~ ^(feature|bugfix|refactor|hotfix|spike|migration)$ ]]
}

is_valid_stage() {
  local stage="$1"
  [[ "$stage" =~ ^(INIT|ANALYZING|PLANNING|DESIGNING|IMPLEMENTING|TESTING|DELIVERING|DONE|BLOCKED)$ ]]
}

is_valid_scope() {
  local scope="$1"
  [[ "$scope" =~ ^(global|project|workflow)$ ]]
}

is_valid_hook() {
  local hook="$1"
  [[ "$hook" =~ ^(pre_stage_|post_stage_|quality_gate|pre_delivery|on_blocked|on_error) ]]
}

is_non_empty() {
  [[ -n "$1" ]]
}

is_valid_name() {
  local name="$1"
  [[ "$name" =~ ^[a-z][a-z0-9-]*$ ]]
}

require_param() {
  local name="$1"
  local value="$2"
  
  if [[ -z "$value" ]]; then
    echo "Error: --$name is required" >&2
    return 1
  fi
  return 0
}

validate_path_exists() {
  local path="$1"
  local type="${2:-any}"
  
  case "$type" in
    file)
      [[ -f "$path" ]]
      ;;
    dir)
      [[ -d "$path" ]]
      ;;
    *)
      [[ -e "$path" ]]
      ;;
  esac
}
