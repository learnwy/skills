#!/bin/bash
# =============================================================================
# inject-skill.sh - Inject skills at workflow hook points (3-level support)
# =============================================================================
#
# DESCRIPTION:
#   Manages skill injection at hook points with 3 configuration levels:
#   - Global:   {skill_dir}/hooks.yaml (all projects using this skill)
#   - Project:  {root}/.trae/workflow/hooks.yaml (all workflows in project)
#   - Workflow: {workflow}/workflow.yaml (specific workflow only)
#
#   Hooks are resolved by merging all levels (workflow > project > global).
#
# USAGE:
#   ./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [options]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   --scope SCOPE           Injection scope: global|project|workflow (default: workflow)
#   --hook HOOK             Hook point to inject at (REQUIRED for inject/remove)
#   --skill SKILL           Skill name to inject (REQUIRED for inject/remove)
#   --config CONFIG         Skill configuration (JSON string)
#   --required              Make the skill required (blocks on failure)
#   --order N               Execution order (lower = earlier)
#   --remove                Remove the skill from the hook
#   --list                  List all injected skills (merged from all levels)
#   --list-scope SCOPE      List skills for specific scope only
#   -h, --help              Show help message
#
# AVAILABLE HOOKS:
#   pre_stage_{STAGE}       Before entering a stage (e.g., pre_stage_TESTING)
#   post_stage_{STAGE}      After completing a stage
#   quality_gate            Before quality verification checks
#   pre_delivery            Before final delivery
#   on_blocked              When workflow enters BLOCKED state
#   on_error                When any error occurs
#
# CONFIG FILES:
#   Global:   {skill_dir}/hooks.yaml
#   Project:  {project_root}/.trae/workflow/hooks.yaml
#   Workflow: {workflow_dir}/workflow.yaml (hooks section)
#
# EXAMPLES:
#   # Inject at workflow level (default)
#   ./scripts/inject-skill.sh -r /project --hook quality_gate --skill lint-checker
#
#   # Inject at project level (applies to all workflows)
#   ./scripts/inject-skill.sh -r /project --scope project --hook quality_gate --skill lint-checker
#
#   # Inject at global level (applies to all projects)
#   ./scripts/inject-skill.sh -r /project --scope global --hook pre_stage_TESTING --skill test-runner
#
#   # List all hooks (merged from all levels)
#   ./scripts/inject-skill.sh -r /project --list
#
#   # List hooks for specific scope
#   ./scripts/inject-skill.sh -r /project --list-scope project
#
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common-utils.sh"

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> --hook <hook> --skill <skill> [OPTIONS]

Inject skills at workflow hook points with 3-level configuration support.

Scope Levels (resolution order: workflow > project > global):
    global      {skill_dir}/hooks.yaml
    project     {project_root}/.trae/workflow/hooks.yaml
    workflow    {workflow_dir}/workflow.yaml

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    --scope SCOPE           Injection scope: global|project|workflow (default: workflow)
    --hook HOOK             Hook point to inject at (REQUIRED for inject/remove)
    --skill SKILL           Skill name to inject (REQUIRED for inject/remove)
    --config CONFIG         Skill configuration (JSON string)
    --required              Make the skill required (blocks on failure)
    --order N               Execution order (lower = earlier)
    --remove                Remove the skill from the hook
    --list                  List all injected skills (merged from all levels)
    --list-scope SCOPE      List skills for specific scope only
    -h, --help              Show this help message

Available Hooks:
    pre_stage_{STAGE}       Before entering a stage
    post_stage_{STAGE}      After completing a stage
    quality_gate            Before quality checks
    pre_delivery            Before final delivery
    on_blocked              When workflow blocked
    on_error                On any error

Examples:
    $(basename "$0") -r /project --hook quality_gate --skill lint-checker --required
    $(basename "$0") -r /project --scope project --hook post_stage_DESIGNING --skill code-reviewer
    $(basename "$0") -r /project --scope global --hook pre_stage_TESTING --skill test-runner
    $(basename "$0") -r /project --list
    $(basename "$0") -r /project --list-scope global
EOF
}

ensure_hooks_file() {
  local file="$1"
  local dir
  dir=$(dirname "$file")
  
  if [[ ! -d "$dir" ]]; then
    mkdir -p "$dir"
  fi
  
  if [[ ! -f "$file" ]]; then
    cat > "$file" << 'EOF'
# Skill Hooks Configuration
# This file defines skills to be injected at specific hook points
hooks: {}
EOF
  fi
}

get_hooks_file_for_scope() {
  local scope="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  case "$scope" in
    global)
      get_global_hooks_file
      ;;
    project)
      get_project_hooks_file "$project_root"
      ;;
    workflow)
      get_workflow_hooks_file "$workflow_dir"
      ;;
  esac
}

inject_skill_to_file() {
  local target_file="$1"
  local hook="$2"
  local skill="$3"
  local config="${4:-}"
  local required="${5:-false}"
  local order="${6:-0}"
  local is_workflow_file="${7:-false}"
  local timestamp
  timestamp=$(get_timestamp)

  if [[ "$is_workflow_file" == "false" ]]; then
    ensure_hooks_file "$target_file"
  fi

  local temp_file
  local output_file
  temp_file=$(mktemp)
  output_file=$(mktemp)
  
  sed 's/^hooks: {}$/hooks:/' "$target_file" > "$temp_file"

  local hooks_found=0
  local hook_found=0
  local skill_inserted=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "hooks:" && $hooks_found -eq 0 ]]; then
      hooks_found=1
      echo "$line" >> "$output_file"
      continue
    fi
    
    if [[ $hooks_found -eq 1 && "$line" == "  ${hook}:" && $skill_inserted -eq 0 ]]; then
      hook_found=1
      echo "$line" >> "$output_file"
      continue
    fi
    
    if [[ $hook_found -eq 1 && $skill_inserted -eq 0 ]]; then
      echo "    - skill: \"$skill\"" >> "$output_file"
      [[ -n "$config" ]] && echo "      config: $config" >> "$output_file"
      echo "      required: $required" >> "$output_file"
      echo "      order: $order" >> "$output_file"
      echo "      added_at: \"$timestamp\"" >> "$output_file"
      skill_inserted=1
      hook_found=0
    fi
    
    echo "$line" >> "$output_file"
  done < "$temp_file"

  if [[ $hooks_found -eq 0 ]]; then
    echo "" >> "$output_file"
    echo "hooks:" >> "$output_file"
  fi

  if [[ $skill_inserted -eq 0 ]]; then
    local final_output
    final_output=$(mktemp)
    local hooks_line_found=0
    while IFS= read -r line || [[ -n "$line" ]]; do
      echo "$line" >> "$final_output"
      if [[ "$line" == "hooks:" && $hooks_line_found -eq 0 ]]; then
        echo "  ${hook}:" >> "$final_output"
        echo "    - skill: \"$skill\"" >> "$final_output"
        [[ -n "$config" ]] && echo "      config: $config" >> "$final_output"
        echo "      required: $required" >> "$final_output"
        echo "      order: $order" >> "$final_output"
        echo "      added_at: \"$timestamp\"" >> "$final_output"
        hooks_line_found=1
      fi
    done < "$output_file"
    mv "$final_output" "$output_file"
  fi

  if [[ "$is_workflow_file" == "true" ]]; then
    yaml_write "$output_file" "updated_at" "$timestamp"
  fi
  
  mv "$output_file" "$target_file"
  rm -f "$temp_file"
}

list_hooks_from_file() {
  local file="$1"
  local scope="$2"
  local indent="${3:-}"
  
  if [[ ! -f "$file" ]]; then
    echo "${indent}(no hooks configured)"
    return
  fi
  
  local in_hooks=0
  local has_hooks=0
  while IFS= read -r line; do
    if [[ "$line" == "hooks:" ]]; then
      in_hooks=1
      continue
    fi
    if [[ "$line" == "hooks: {}" ]]; then
      continue
    fi
    if [[ $in_hooks -eq 1 ]]; then
      if [[ "$line" =~ ^[a-z] && ! "$line" =~ ^[[:space:]] ]]; then
        break
      fi
      if [[ -n "$line" && "$line" != "hooks: {}" ]]; then
        echo "${indent}$line"
        has_hooks=1
      fi
    fi
  done < "$file"
  
  if [[ $has_hooks -eq 0 ]]; then
    echo "${indent}(no hooks configured)"
  fi
}

list_all_hooks() {
  local project_root="$1"
  local workflow_dir="$2"
  
  echo "═══════════════════════════════════════════════════════"
  echo "📋 Injected Skills Configuration"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  
  local global_file
  global_file=$(get_global_hooks_file)
  echo "🌍 Global Level ($global_file):"
  echo "-----------------------------------------------------------"
  list_hooks_from_file "$global_file" "global" "  "
  echo ""
  
  local project_file
  project_file=$(get_project_hooks_file "$project_root")
  echo "📁 Project Level ($project_file):"
  echo "-----------------------------------------------------------"
  list_hooks_from_file "$project_file" "project" "  "
  echo ""
  
  if [[ -n "$workflow_dir" && -d "$workflow_dir" ]]; then
    local workflow_id
    workflow_id=$(basename "$workflow_dir")
    echo "📄 Workflow Level ($workflow_id):"
    echo "-----------------------------------------------------------"
    list_hooks_from_file "$workflow_dir/workflow.yaml" "workflow" "  "
  else
    echo "📄 Workflow Level: (no active workflow)"
  fi
  echo ""
}

list_scope_hooks() {
  local scope="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  local file
  file=$(get_hooks_file_for_scope "$scope" "$project_root" "$workflow_dir")
  
  local scope_label
  case "$scope" in
    global) scope_label="Global ($(get_global_hooks_file))" ;;
    project) scope_label="Project ($(get_project_hooks_file "$project_root"))" ;;
    workflow) scope_label="Workflow ($(basename "$workflow_dir"))" ;;
  esac
  
  echo "═══════════════════════════════════════════════════════"
  echo "📋 $scope_label Hooks"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  list_hooks_from_file "$file" "$scope" ""
  echo ""
}

main() {
  local project_root=""
  local workflow_dir=""
  local scope="workflow"
  local hook=""
  local skill=""
  local config=""
  local required="false"
  local order="0"
  local remove=0
  local list=0
  local list_scope=""

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
      --scope)
        scope="$2"
        shift 2
        ;;
      --hook)
        hook="$2"
        shift 2
        ;;
      --skill)
        skill="$2"
        shift 2
        ;;
      --config)
        config="$2"
        shift 2
        ;;
      --required)
        required="true"
        shift
        ;;
      --order)
        order="$2"
        shift 2
        ;;
      --remove)
        remove=1
        shift
        ;;
      --list)
        list=1
        shift
        ;;
      --list-scope)
        list_scope="$2"
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

  if [[ ! "$scope" =~ ^(global|project|workflow)$ ]]; then
    echo "Error: Invalid scope. Must be global|project|workflow" >&2
    exit 1
  fi

  if [[ -n "$list_scope" ]]; then
    if [[ ! "$list_scope" =~ ^(global|project|workflow)$ ]]; then
      echo "Error: Invalid list-scope. Must be global|project|workflow" >&2
      exit 1
    fi
    if [[ "$list_scope" == "workflow" && -z "$workflow_dir" ]]; then
      echo "Error: No active workflow found for workflow scope" >&2
      exit 1
    fi
    list_scope_hooks "$list_scope" "$project_root" "$workflow_dir"
    exit 0
  fi

  if [[ $list -eq 1 ]]; then
    list_all_hooks "$project_root" "$workflow_dir"
    exit 0
  fi

  if [[ "$scope" == "workflow" && -z "$workflow_dir" ]]; then
    echo "Error: No active workflow found. Use --scope project or --scope global, or run init-workflow.sh first." >&2
    exit 1
  fi

  if [[ -z "$hook" ]]; then
    echo "Error: --hook is required" >&2
    exit 1
  fi

  if [[ -z "$skill" ]]; then
    echo "Error: --skill is required" >&2
    exit 1
  fi

  local target_file
  target_file=$(get_hooks_file_for_scope "$scope" "$project_root" "$workflow_dir")
  
  local is_workflow_file="false"
  [[ "$scope" == "workflow" ]] && is_workflow_file="true"

  if [[ $remove -eq 1 ]]; then
    echo "⚠️  Remove functionality not fully implemented yet"
    echo "   Please manually edit: $target_file"
    echo "   Remove skill '$skill' from hook '$hook'"
    exit 0
  fi

  inject_skill_to_file "$target_file" "$hook" "$skill" "$config" "$required" "$order" "$is_workflow_file"

  local scope_label
  case "$scope" in
    global) scope_label="global" ;;
    project) scope_label="project" ;;
    workflow) scope_label="workflow" ;;
  esac

  echo "✅ Injected skill '$skill' at hook '$hook' (scope: $scope_label)"
  [[ "$required" == "true" ]] && echo "   Required: yes" || true
  [[ -n "$config" ]] && echo "   Config: $config" || true
  echo "   File: $target_file"
}

main "$@"
