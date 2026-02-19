#!/bin/bash
# =============================================================================
# inject-skill.sh - Inject a skill into workflow hook points
# =============================================================================
#
# DESCRIPTION:
#   Adds or removes skills at specific workflow hook points.
#   Skills are executed when the workflow reaches the specified hook.
#   By default operates on the active workflow.
#
# USAGE:
#   ./scripts/inject-skill.sh -r <root> --hook <hook> --skill <skill> [options]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -p, --path DIR          Specific workflow path (overrides active workflow)
#   --hook HOOK             Hook point to inject at (REQUIRED for inject/remove)
#   --skill SKILL           Skill name to inject (REQUIRED for inject/remove)
#   --config CONFIG         Skill configuration (JSON string)
#   --required              Make the skill required (blocks on failure)
#   --order N               Execution order (lower = earlier)
#   --remove                Remove the skill from the hook
#   --list                  List all injected skills for the workflow
#   -h, --help              Show help message
#
# AVAILABLE HOOKS:
#   pre_stage_{STAGE}       Before entering a stage (e.g., pre_stage_TESTING)
#   post_stage_{STAGE}      After completing a stage
#   pre_task_{task_id}      Before executing a specific task
#   post_task_{task_id}     After completing a specific task
#   quality_gate            Before quality verification checks
#   pre_delivery            Before final delivery
#   on_blocked              When workflow enters BLOCKED state
#   on_error                When any error occurs
#
# INPUT:
#   - Project root directory
#   - Hook name and skill name
#   - Optional configuration
#
# OUTPUT:
#   - Updates workflow.yaml hooks section
#   - Confirmation message
#
# EXAMPLES:
#   # Inject code reviewer after design stage
#   ./scripts/inject-skill.sh -r /path/to/project --hook post_stage_DESIGNING --skill code-reviewer
#   # OUTPUT: ✅ Injected skill 'code-reviewer' at hook 'post_stage_DESIGNING'
#
#   # Inject required lint checker at quality gate
#   ./scripts/inject-skill.sh -r /path/to/project --hook quality_gate --skill lint-checker --required
#
#   # Inject with configuration
#   ./scripts/inject-skill.sh -r /path/to/project --hook pre_stage_TESTING \
#     --skill unit-test-runner --config '{"coverage": 80}'
#
#   # List all injected skills
#   ./scripts/inject-skill.sh -r /path/to/project --list
#
#   # Remove a skill
#   ./scripts/inject-skill.sh -r /path/to/project --hook quality_gate --skill lint-checker --remove
#
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/yaml-utils.sh"

show_help() {
  cat << EOF
Usage: $(basename "$0") -r <root> --hook <hook> --skill <skill> [OPTIONS]

Inject a skill into a workflow at a specific hook point.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -p, --path DIR          Specific workflow path (overrides active workflow)
    --hook HOOK             Hook point to inject at (REQUIRED for inject/remove)
    --skill SKILL           Skill name to inject (REQUIRED for inject/remove)
    --config CONFIG         Skill configuration (JSON string)
    --required              Make the skill required (blocks on failure)
    --order N               Execution order (lower = earlier)
    --remove                Remove the skill from the hook
    --list                  List injected skills for the workflow
    -h, --help              Show this help message

Available Hooks:
    pre_stage_{STAGE}       Before entering a stage
    post_stage_{STAGE}      After completing a stage
    pre_task_{task_id}      Before executing a task
    post_task_{task_id}     After completing a task
    quality_gate            Before quality checks
    pre_delivery            Before final delivery
    on_blocked              When workflow blocked
    on_error                On any error

Examples:
    $(basename "$0") -r /path/to/project --hook quality_gate --skill lint-checker --required
    $(basename "$0") -r /path/to/project --hook post_stage_DESIGNING --skill code-reviewer
    $(basename "$0") -r /path/to/project --hook quality_gate --skill lint-checker --remove
    $(basename "$0") -r /path/to/project --list
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

list_injected_skills() {
  local workflow_dir="$1"
  local workflow_file="$workflow_dir/workflow.yaml"
  local workflow_id=$(basename "$workflow_dir")

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
    return 1
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "📋 Injected Skills for: $workflow_id"
  echo "═══════════════════════════════════════════════════════"
  echo ""

  echo "📦 Configuration-based Injections:"
  echo "-----------------------------------"
  local in_injected=0
  while IFS= read -r line; do
    if [[ "$line" == "injected_skills:" ]]; then
      in_injected=1
      continue
    fi
    if [[ $in_injected -eq 1 ]]; then
      if [[ "$line" =~ ^[a-z] && ! "$line" =~ ^\ + ]]; then
        break
      fi
      if [[ "$line" =~ "- stage:" ]]; then
        echo "  $line"
      elif [[ "$line" =~ "skill:" || "$line" =~ "timing:" ]]; then
        echo "  $line"
      fi
    fi
  done < "$workflow_file"

  echo ""
  echo "🪝 Hook-based Injections:"
  echo "-------------------------"

  local in_hooks=0
  while IFS= read -r line; do
    if [[ "$line" == "hooks:" ]]; then
      in_hooks=1
      continue
    fi
    if [[ $in_hooks -eq 1 ]]; then
      if [[ "$line" =~ ^[a-z] && ! "$line" =~ ^\ + ]]; then
        break
      fi
      echo "  $line"
    fi
  done < "$workflow_file"
}

inject_skill() {
  local workflow_file="$1"
  local hook="$2"
  local skill="$3"
  local config="${4:-}"
  local required="${5:-false}"
  local order="${6:-0}"
  local timestamp
  timestamp=$(yaml_get_timestamp)

  local temp_file
  local output_file
  temp_file=$(mktemp)
  output_file=$(mktemp)
  
  sed 's/^hooks: {}$/hooks:/' "$workflow_file" > "$temp_file"

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

  yaml_write "$output_file" "updated_at" "$timestamp"
  mv "$output_file" "$workflow_file"
  rm -f "$temp_file"

  echo "✅ Injected skill '$skill' at hook '$hook'"
  [[ "$required" == "true" ]] && echo "   Required: yes" || true
  [[ -n "$config" ]] && echo "   Config: $config" || true
}

remove_skill() {
  local workflow_file="$1"
  local hook="$2"
  local skill="$3"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  echo "⚠️  Remove functionality not fully implemented yet"
  echo "   Please manually edit: $workflow_file"
  echo "   Remove skill '$skill' from hook '$hook'"
}

main() {
  local project_root=""
  local workflow_dir=""
  local hook=""
  local skill=""
  local config=""
  local required="false"
  local order="0"
  local remove=0
  local list=0

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

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: workflow.yaml not found in: $workflow_dir" >&2
    exit 1
  fi

  if [[ $list -eq 1 ]]; then
    list_injected_skills "$workflow_dir"
    exit 0
  fi

  if [[ -z "$hook" ]]; then
    echo "Error: --hook is required" >&2
    exit 1
  fi

  if [[ -z "$skill" ]]; then
    echo "Error: --skill is required" >&2
    exit 1
  fi

  if [[ $remove -eq 1 ]]; then
    remove_skill "$workflow_file" "$hook" "$skill"
  else
    inject_skill "$workflow_file" "$hook" "$skill" "$config" "$required" "$order"
  fi
}

main "$@"
