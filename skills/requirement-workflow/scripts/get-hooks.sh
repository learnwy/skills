#!/bin/bash
# =============================================================================
# get-hooks.sh - Get injected skills for a specific hook point
# =============================================================================
#
# DESCRIPTION:
#   Retrieves all injected skills for a specific hook point by merging
#   configurations from global, project, and workflow levels.
#
# USAGE:
#   ./scripts/get-hooks.sh -r <root> --hook <hook_point>
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   --hook HOOK             Hook point to query (e.g., pre_stage_DESIGNING)
#   --stage STAGE           Get all hooks for a stage (pre, post, quality_gate)
#   --format FORMAT         Output format: text|json|skills-only (default: text)
#   -h, --help              Show help message
#
# HOOK POINTS:
#   pre_stage_{STAGE}       Before entering a stage
#   post_stage_{STAGE}      After completing a stage
#   quality_gate            Before quality checks
#   pre_delivery            Before final delivery
#   on_blocked              When workflow blocked
#   on_error                On any error
#
# EXAMPLES:
#   # Get skills for pre_stage_DESIGNING
#   ./scripts/get-hooks.sh -r /project --hook pre_stage_DESIGNING
#
#   # Get all hooks for DESIGNING stage
#   ./scripts/get-hooks.sh -r /project --stage DESIGNING
#
#   # Get skills only (for LLM to invoke)
#   ./scripts/get-hooks.sh -r /project --hook quality_gate --format skills-only
#
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common-utils.sh"

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> --hook <hook_point> [OPTIONS]

Get injected skills for a specific hook point.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    --hook HOOK             Hook point to query
    --stage STAGE           Get all hooks for a stage
    --format FORMAT         Output format: text|json|skills-only (default: text)
    -h, --help              Show this help message

Hook Points:
    pre_stage_{STAGE}       Before entering a stage
    post_stage_{STAGE}      After completing a stage
    quality_gate            Before quality checks
    pre_delivery            Before final delivery

Examples:
    $(basename "$0") -r /project --hook pre_stage_DESIGNING
    $(basename "$0") -r /project --stage DESIGNING
    $(basename "$0") -r /project --hook quality_gate --format skills-only
EOF
}

get_skills_from_file() {
  local file="$1"
  local hook="$2"
  local scope="$3"
  
  if [[ ! -f "$file" ]]; then
    return
  fi
  
  local in_hooks=0
  local in_target_hook=0
  local in_skill_entry=0
  local current_skill=""
  local current_required="false"
  local current_order="0"
  local current_config=""
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "hooks:" ]]; then
      in_hooks=1
      continue
    fi
    
    if [[ $in_hooks -eq 1 && "$line" == "  ${hook}:" ]]; then
      in_target_hook=1
      continue
    fi
    
    if [[ $in_target_hook -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]{2}[a-z_] && ! "$line" =~ ^[[:space:]]{4} ]]; then
        if [[ -n "$current_skill" ]]; then
          echo "${scope}|${current_skill}|${current_required}|${current_order}|${current_config}"
        fi
        in_target_hook=0
        current_skill=""
        continue
      fi
      
      if [[ "$line" =~ ^[a-z] ]]; then
        if [[ -n "$current_skill" ]]; then
          echo "${scope}|${current_skill}|${current_required}|${current_order}|${current_config}"
        fi
        in_target_hook=0
        in_hooks=0
        current_skill=""
        continue
      fi
      
      if [[ "$line" =~ "- skill:" ]]; then
        if [[ -n "$current_skill" ]]; then
          echo "${scope}|${current_skill}|${current_required}|${current_order}|${current_config}"
        fi
        current_skill=$(echo "$line" | sed 's/.*skill: *//' | tr -d '"')
        current_required="false"
        current_order="0"
        current_config=""
      elif [[ "$line" =~ "required:" ]]; then
        current_required=$(echo "$line" | sed 's/.*required: *//')
      elif [[ "$line" =~ "order:" ]]; then
        current_order=$(echo "$line" | sed 's/.*order: *//')
      elif [[ "$line" =~ "config:" ]]; then
        current_config=$(echo "$line" | sed 's/.*config: *//')
      fi
    fi
  done < "$file"
  
  if [[ -n "$current_skill" && $in_target_hook -eq 1 ]]; then
    echo "${scope}|${current_skill}|${current_required}|${current_order}|${current_config}"
  fi
}

output_text() {
  local skills="$1"
  local hook="$2"
  
  if [[ -z "$skills" ]]; then
    echo "No skills injected for hook: $hook"
    return
  fi
  
  echo "═══════════════════════════════════════════════════════"
  echo "🔌 Injected Skills for Hook: $hook"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  
  echo "$skills" | sort -t'|' -k4 -n | while IFS='|' read -r scope skill required order config; do
    local scope_icon
    case "$scope" in
      global) scope_icon="🌍" ;;
      project) scope_icon="📁" ;;
      workflow) scope_icon="📄" ;;
    esac
    
    echo "$scope_icon [$scope] $skill"
    [[ "$required" == "true" ]] && echo "   Required: yes (blocks on failure)"
    [[ -n "$config" ]] && echo "   Config: $config"
    echo ""
  done
}

output_skills_only() {
  local skills="$1"
  
  if [[ -z "$skills" ]]; then
    return
  fi
  
  echo "$skills" | sort -t'|' -k4 -n | while IFS='|' read -r scope skill required order config; do
    echo "$skill"
  done | sort -u
}

output_json() {
  local skills="$1"
  local hook="$2"
  
  echo "{"
  echo "  \"hook\": \"$hook\","
  echo "  \"skills\": ["
  
  local first=1
  echo "$skills" | sort -t'|' -k4 -n | while IFS='|' read -r scope skill required order config; do
    if [[ $first -eq 0 ]]; then
      echo ","
    fi
    first=0
    echo -n "    {\"skill\": \"$skill\", \"scope\": \"$scope\", \"required\": $required, \"order\": $order"
    if [[ -n "$config" ]]; then
      echo -n ", \"config\": $config"
    fi
    echo -n "}"
  done
  
  echo ""
  echo "  ]"
  echo "}"
}

main() {
  local project_root=""
  local workflow_dir=""
  local hook=""
  local stage=""
  local format="text"

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
      --hook)
        hook="$2"
        shift 2
        ;;
      --stage)
        stage="$2"
        shift 2
        ;;
      --format)
        format="$2"
        shift 2
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

  local global_hooks_file
  local project_hooks_file
  local workflow_hooks_file=""
  
  global_hooks_file=$(get_global_hooks_file)
  project_hooks_file=$(get_project_hooks_file "$project_root")
  [[ -n "$workflow_dir" ]] && workflow_hooks_file=$(get_workflow_hooks_file "$workflow_dir")

  if [[ -n "$stage" ]]; then
    local hooks=("pre_stage_${stage}" "post_stage_${stage}" "quality_gate")
    for h in "${hooks[@]}"; do
      local all_skills=""
      all_skills+=$(get_skills_from_file "$global_hooks_file" "$h" "global")
      all_skills+=$'\n'
      all_skills+=$(get_skills_from_file "$project_hooks_file" "$h" "project")
      all_skills+=$'\n'
      [[ -n "$workflow_hooks_file" ]] && all_skills+=$(get_skills_from_file "$workflow_hooks_file" "$h" "workflow")
      all_skills=$(echo "$all_skills" | grep -v '^$' || true)
      
      if [[ -n "$all_skills" ]]; then
        case "$format" in
          text) output_text "$all_skills" "$h" ;;
          json) output_json "$all_skills" "$h" ;;
          skills-only) 
            echo "# $h"
            output_skills_only "$all_skills" 
            ;;
        esac
      fi
    done
    exit 0
  fi

  if [[ -z "$hook" ]]; then
    echo "Error: --hook or --stage is required" >&2
    show_help
    exit 1
  fi

  local all_skills=""
  all_skills+=$(get_skills_from_file "$global_hooks_file" "$hook" "global")
  all_skills+=$'\n'
  all_skills+=$(get_skills_from_file "$project_hooks_file" "$hook" "project")
  all_skills+=$'\n'
  [[ -n "$workflow_hooks_file" ]] && all_skills+=$(get_skills_from_file "$workflow_hooks_file" "$hook" "workflow")
  all_skills=$(echo "$all_skills" | grep -v '^$' || true)

  case "$format" in
    text) output_text "$all_skills" "$hook" ;;
    json) output_json "$all_skills" "$hook" ;;
    skills-only) output_skills_only "$all_skills" ;;
  esac
}

main "$@"
