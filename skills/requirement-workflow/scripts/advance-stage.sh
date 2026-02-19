#!/bin/bash
# =============================================================================
# advance-stage.sh - Advance workflow to the next stage
# =============================================================================
#
# DESCRIPTION:
#   Transitions a workflow to the next stage with validation checks.
#   Supports auto-advance (determines next stage based on level) or manual target.
#   By default operates on the active workflow.
#
# USAGE:
#   ./scripts/advance-stage.sh -r <root> [-t <stage>] [--validate] [--force]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   -t, --to STAGE          Target stage (auto-advance if not specified)
#   --validate              Only validate, don't actually transition
#   --force                 Force transition even if validation fails
#   -h, --help              Show help message
#
# STAGES:
#   INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
#
# INPUT:
#   - Project root directory
#   - Reads active workflow from {root}/.trae/active_workflow
#
# OUTPUT:
#   - Updates workflow.yaml status and state_history
#   - Executes pre/post stage hooks
#   - Prints transition result
#
# EXAMPLES:
#   # Auto-advance active workflow to next stage
#   ./scripts/advance-stage.sh -r /path/to/project
#   # OUTPUT:
#   # 📍 Auto-determined next stage: ANALYZING
#   # 📋 Workflow: 20240115_001_feature_auth
#   # 🔄 Transition: INIT → ANALYZING
#   # ✅ Successfully transitioned to ANALYZING
#
#   # Advance to specific stage
#   ./scripts/advance-stage.sh -r /path/to/project --to IMPLEMENTING
#
#   # Validate only (no changes)
#   ./scripts/advance-stage.sh -r /path/to/project --validate
#
#   # Force transition despite validation errors
#   ./scripts/advance-stage.sh -r /path/to/project --to DESIGNING --force
#
#   # Operate on a specific workflow (not active one)
#   ./scripts/advance-stage.sh -r /path/to/project -p /path/to/.trae/workflow/xxx
#
# =============================================================================
set -euo pipefail

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> [OPTIONS]

Advance workflow to the next stage with validation.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    -t, --to STAGE          Target stage (auto-advance if not specified)
    --validate              Only validate, don't actually transition
    --force                 Force transition even if validation fails
    -h, --help              Show this help message

Stages: INIT, ANALYZING, PLANNING, DESIGNING, IMPLEMENTING, TESTING, DELIVERING, DONE

Examples:
    $(basename "$0") -r /path/to/project
    $(basename "$0") -r /path/to/project --to IMPLEMENTING
    $(basename "$0") -r /path/to/project --validate
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

get_next_stage() {
  local current="$1"
  local level="$2"

  case "$current" in
    INIT)
      if [[ "$level" == "L1" ]]; then
        echo "PLANNING"
      else
        echo "ANALYZING"
      fi
      ;;
    ANALYZING) echo "PLANNING" ;;
    PLANNING)
      if [[ "$level" == "L1" ]]; then
        echo "IMPLEMENTING"
      else
        echo "DESIGNING"
      fi
      ;;
    DESIGNING) echo "IMPLEMENTING" ;;
    IMPLEMENTING) echo "TESTING" ;;
    TESTING)
      if [[ "$level" == "L1" ]]; then
        echo "DONE"
      else
        echo "DELIVERING"
      fi
      ;;
    DELIVERING) echo "DONE" ;;
    *) echo "" ;;
  esac
}

validate_transition() {
  local current="$1"
  local target="$2"
  local level="$3"

  local valid_next=$(get_next_stage "$current" "$level")

  if [[ "$target" == "$valid_next" ]]; then
    return 0
  fi

  case "$current" in
    INIT)
      [[ "$target" == "ANALYZING" || "$target" == "PLANNING" ]] && return 0
      ;;
    PLANNING)
      [[ "$target" == "DESIGNING" || "$target" == "IMPLEMENTING" ]] && return 0
      ;;
    TESTING)
      [[ "$target" == "DELIVERING" || "$target" == "DONE" ]] && return 0
      ;;
  esac

  return 1
}

update_workflow_state() {
  local workflow_file="$1"
  local new_state="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local temp_file=$(mktemp)

  sed "s/^status: \".*\"/status: \"$new_state\"/" "$workflow_file" > "$temp_file"
  sed -i '' "s/^updated_at: \".*\"/updated_at: \"$timestamp\"/" "$temp_file"

  local history_entry="  - state: \"$new_state\"\n    entered_at: \"$timestamp\"\n    current: true"

  if grep -q "^state_history:" "$temp_file"; then
    sed -i '' "s/current: true/current: false/g" "$temp_file"
    sed -i '' "/^state_history:/a\\
$history_entry" "$temp_file"
  fi

  mv "$temp_file" "$workflow_file"
}

main() {
  local project_root=""
  local workflow_dir=""
  local target_stage=""
  local validate_only=0
  local force=0

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
      -t | --to)
        target_stage="$2"
        shift 2
        ;;
      --validate)
        validate_only=1
        shift
        ;;
      --force)
        force=1
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

  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
    exit 1
  fi

  local current_status=$(read_yaml_value "$workflow_file" "status")
  local level=$(read_yaml_value "$workflow_file" "level")

  if [[ -z "$target_stage" ]]; then
    target_stage=$(get_next_stage "$current_status" "$level")
    if [[ -z "$target_stage" ]]; then
      echo "Error: Cannot determine next stage from $current_status" >&2
      exit 1
    fi
    echo "📍 Auto-determined next stage: $target_stage"
  fi

  echo "📋 Workflow: $workflow_id"
  echo "📊 Level: $level"
  echo "🔄 Transition: $current_status → $target_stage"

  if ! validate_transition "$current_status" "$target_stage" "$level"; then
    if [[ $force -eq 0 ]]; then
      echo "❌ Validation failed: Invalid transition from $current_status to $target_stage for level $level" >&2
      exit 1
    else
      echo "⚠️  Validation failed but forcing transition..."
    fi
  else
    echo "✅ Validation passed"
  fi

  if [[ $validate_only -eq 1 ]]; then
    echo "✅ Validation complete (no changes made)"
    exit 0
  fi

  update_workflow_state "$workflow_file" "$target_stage"
  echo "✅ Successfully transitioned to $target_stage"

  case "$target_stage" in
    ANALYZING) echo "Next: Complete requirement analysis in spec.md" ;;
    PLANNING) echo "Next: Break down tasks in tasks.md" ;;
    DESIGNING) echo "Next: Document technical design in design.md" ;;
    IMPLEMENTING) echo "Next: Implement the solution" ;;
    TESTING) echo "Next: Run tests and complete checklist.md" ;;
    DELIVERING) echo "Next: Prepare for delivery" ;;
    DONE) echo "🎉 Workflow completed!" ;;
  esac
}

main "$@"
