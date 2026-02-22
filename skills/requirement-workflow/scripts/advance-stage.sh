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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common-utils.sh"

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

get_next_stage() {
  local current="$1"
  local level="$2"

  case "$current" in
    INIT) echo "ANALYZING" ;;
    ANALYZING) echo "PLANNING" ;;
    PLANNING) echo "DESIGNING" ;;
    DESIGNING) echo "IMPLEMENTING" ;;
    IMPLEMENTING) echo "TESTING" ;;
    TESTING) echo "DELIVERING" ;;
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

  return 1
}

update_workflow_state() {
  local workflow_file="$1"
  local new_state="$2"
  local timestamp
  timestamp=$(get_timestamp)

  yaml_write "$workflow_file" "status" "$new_state"
  yaml_write "$workflow_file" "updated_at" "$timestamp"
  yaml_append_history "$workflow_file" "$new_state" "$timestamp" "true"
}

_get_skills_for_hook() {
  local hook="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  get_hooks_for_point "$hook" \
    "$(get_global_hooks_file)" \
    "$(get_project_hooks_file "$project_root")" \
    "$(get_workflow_hooks_file "$workflow_dir")"
}

_get_agents_for_hook() {
  local hook="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  get_agents_for_point "$hook" \
    "$(get_global_hooks_file)" \
    "$(get_project_hooks_file "$project_root")" \
    "$(get_workflow_hooks_file "$workflow_dir")"
}

output_stage_skills_and_agents() {
  local stage="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  local pre_skills post_skills quality_skills
  pre_skills=$(_get_skills_for_hook "pre_stage_${stage}" "$project_root" "$workflow_dir")
  post_skills=$(_get_skills_for_hook "post_stage_${stage}" "$project_root" "$workflow_dir")
  quality_skills=$(_get_skills_for_hook "quality_gate" "$project_root" "$workflow_dir")
  
  local pre_agents post_agents
  pre_agents=$(_get_agents_for_hook "pre_stage_${stage}" "$project_root" "$workflow_dir")
  post_agents=$(_get_agents_for_hook "post_stage_${stage}" "$project_root" "$workflow_dir")
  
  local has_skills=0
  local has_agents=0
  
  if [[ -n "$pre_skills" || -n "$post_skills" || -n "$quality_skills" ]]; then
    has_skills=1
  fi
  
  if [[ -n "$pre_agents" || -n "$post_agents" ]]; then
    has_agents=1
  fi
  
  if [[ $has_agents -eq 1 ]]; then
    echo ""
    echo "🤖 Injected Agents for $stage:"
    echo "─────────────────────────────────────────"
    
    if [[ -n "$pre_agents" ]]; then
      echo "  📥 Before stage (pre_stage_${stage}):"
      for agent in $pre_agents; do
        echo "     → Launch agent: $agent"
      done
    fi
    
    if [[ -n "$post_agents" ]]; then
      echo "  📤 After stage (post_stage_${stage}):"
      for agent in $post_agents; do
        echo "     → Launch agent: $agent"
      done
    fi
  fi
  
  if [[ $has_skills -eq 1 ]]; then
    echo ""
    echo "🔌 Injected Skills for $stage:"
    echo "─────────────────────────────────────────"
    
    if [[ -n "$pre_skills" ]]; then
      echo "  📥 Before stage (pre_stage_${stage}):"
      for skill in $pre_skills; do
        echo "     → Invoke skill: $skill"
      done
    fi
    
    if [[ -n "$quality_skills" ]]; then
      echo "  🔍 Quality gate:"
      for skill in $quality_skills; do
        echo "     → Invoke skill: $skill"
      done
    fi
    
    if [[ -n "$post_skills" ]]; then
      echo "  📤 After stage (post_stage_${stage}):"
      for skill in $post_skills; do
        echo "     → Invoke skill: $skill"
      done
    fi
  fi
  
  if [[ $has_skills -eq 1 || $has_agents -eq 1 ]]; then
    echo ""
  fi
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

  local current_status=$(yaml_read "$workflow_file" "status")
  local level=$(yaml_read "$workflow_file" "level")

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

  output_stage_skills_and_agents "$target_stage" "$project_root" "$workflow_dir"

  case "$target_stage" in
    ANALYZING) echo "📝 Next: Complete requirement analysis in spec.md" ;;
    PLANNING) echo "📝 Next: Break down tasks in tasks.md" ;;
    DESIGNING) echo "📝 Next: Document technical design in design.md" ;;
    IMPLEMENTING) echo "📝 Next: Implement the solution" ;;
    TESTING) echo "📝 Next: Run tests and complete checklist.md" ;;
    DELIVERING) echo "📝 Next: Prepare for delivery" ;;
    DONE) echo "🎉 Workflow completed!" ;;
  esac
}

main "$@"
