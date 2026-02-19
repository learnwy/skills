#!/bin/bash
set -euo pipefail

WORKFLOW_BASE=".trae/workflow"

show_help() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Inject a skill into a workflow at a specific hook point.

Options:
    -w, --workflow-id ID    Workflow ID (required unless --latest)
    --latest                Use the most recent workflow
    --hook HOOK             Hook point to inject at (required)
    --skill SKILL           Skill name to inject (required unless --remove)
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
    $(basename "$0") --latest --hook quality_gate --skill lint-checker --required
    $(basename "$0") -w 20240115_001_feature_auth --hook post_stage_DESIGNING --skill code-reviewer
    $(basename "$0") --latest --hook quality_gate --skill lint-checker --remove
    $(basename "$0") --latest --list
EOF
}

get_latest_workflow() {
  if [[ -d "$WORKFLOW_BASE" ]]; then
    ls -1d "$WORKFLOW_BASE"/*/ 2> /dev/null | sort -r | head -1 | xargs basename 2> /dev/null || echo ""
  fi
}

read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^${key}:" "$file" 2> /dev/null | head -1 | sed "s/^${key}: *//" | tr -d '"'
}

list_injected_skills() {
  local workflow_id="$1"
  local workflow_dir="$WORKFLOW_BASE/$workflow_id"
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: Workflow not found: $workflow_id" >&2
    return 1
  fi

  echo "═══════════════════════════════════════════════════════"
  echo "📋 Injected Skills for: $workflow_id"
  echo "═══════════════════════════════════════════════════════"
  echo ""

  local in_skills=0
  local in_hooks=0
  local current_section=""

  while IFS= read -r line; do
    if [[ "$line" =~ ^injected_skills: ]]; then
      in_skills=1
      echo "📦 Configuration-based Injections:"
      echo "-----------------------------------"
      continue
    fi

    if [[ "$line" =~ ^hooks: ]]; then
      in_hooks=1
      in_skills=0
      echo ""
      echo "🪝 Hook-based Injections:"
      echo "-------------------------"
      continue
    fi

    if [[ $in_skills -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]stage: ]]; then
        echo "$line"
      elif [[ "$line" =~ ^[[:space:]]+skill: ]]; then
        echo "$line"
      elif [[ "$line" =~ ^[[:space:]]+timing: ]]; then
        echo "$line"
      elif [[ "$line" =~ ^[[:space:]]+required: ]]; then
        echo "$line"
      elif [[ ! "$line" =~ ^[[:space:]] && "$line" != "" && "$line" != "[]" ]]; then
        in_skills=0
      fi
    fi

    if [[ $in_hooks -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]+([a-z_]+): ]]; then
        current_section="${BASH_REMATCH[1]}"
        echo "  Hook: $current_section"
      elif [[ "$line" =~ ^[[:space:]]+-[[:space:]]skill: ]]; then
        echo "    $line"
      elif [[ ! "$line" =~ ^[[:space:]] && "$line" != "" && "$line" != "{}" ]]; then
        in_hooks=0
      fi
    fi
  done < "$workflow_file"

  echo ""
  echo "═══════════════════════════════════════════════════════"
}

add_skill_injection() {
  local workflow_file="$1"
  local hook="$2"
  local skill="$3"
  local config="${4:-}"
  local required="${5:-false}"
  local order="${6:-0}"

  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local injection_entry="    - skill: \"$skill\""
  [[ "$required" == "true" ]] && injection_entry+="\n      required: true"
  [[ -n "$config" ]] && injection_entry+="\n      config: $config"
  [[ "$order" != "0" ]] && injection_entry+="\n      order: $order"
  injection_entry+="\n      injected_at: \"$timestamp\""

  local temp_file=$(mktemp)
  local in_hooks=0
  local hook_found=0
  local added=0

  while IFS= read -r line; do
    echo "$line" >> "$temp_file"

    if [[ "$line" =~ ^hooks: ]]; then
      in_hooks=1
      continue
    fi

    if [[ $in_hooks -eq 1 && "$line" =~ ^[[:space:]]+${hook}: ]]; then
      hook_found=1
      continue
    fi

    if [[ $hook_found -eq 1 && $added -eq 0 ]]; then
      echo -e "$injection_entry" >> "$temp_file"
      added=1
      hook_found=0
    fi
  done < "$workflow_file"

  if [[ $added -eq 0 ]]; then
    if grep -q "^hooks: {}" "$temp_file"; then
      sed -i '' "s/^hooks: {}/hooks:\n  ${hook}:\n$(echo -e "$injection_entry" | sed 's/^/  /')/" "$temp_file"
    elif grep -q "^hooks:$" "$temp_file"; then
      sed -i '' "/^hooks:$/a\\
  ${hook}:\\
$(echo -e "$injection_entry" | sed 's/^/  /')" "$temp_file"
    else
      echo "hooks:" >> "$temp_file"
      echo "  ${hook}:" >> "$temp_file"
      echo -e "$injection_entry" >> "$temp_file"
    fi
  fi

  mv "$temp_file" "$workflow_file"
}

remove_skill_injection() {
  local workflow_file="$1"
  local hook="$2"
  local skill="$3"

  local temp_file=$(mktemp)
  local in_target_hook=0
  local skip_entry=0

  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]+${hook}: ]]; then
      in_target_hook=1
      echo "$line" >> "$temp_file"
      continue
    fi

    if [[ $in_target_hook -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]skill:[[:space:]]*\"?${skill}\"? ]]; then
        skip_entry=1
        continue
      fi

      if [[ $skip_entry -eq 1 ]]; then
        if [[ "$line" =~ ^[[:space:]]+-[[:space:]] || ! "$line" =~ ^[[:space:]] ]]; then
          skip_entry=0
        else
          continue
        fi
      fi

      if [[ ! "$line" =~ ^[[:space:]] && "$line" != "" ]]; then
        in_target_hook=0
      fi
    fi

    echo "$line" >> "$temp_file"
  done < "$workflow_file"

  mv "$temp_file" "$workflow_file"
}

main() {
  local workflow_id=""
  local use_latest=0
  local hook=""
  local skill=""
  local config=""
  local required="false"
  local order="0"
  local remove=0
  local list=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      -w | --workflow-id)
        workflow_id="$2"
        shift 2
        ;;
      --latest)
        use_latest=1
        shift
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

  if [[ $use_latest -eq 1 ]]; then
    workflow_id=$(get_latest_workflow)
  fi

  if [[ -z "$workflow_id" ]]; then
    echo "Error: No workflow specified" >&2
    exit 1
  fi

  local workflow_dir="$WORKFLOW_BASE/$workflow_id"
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: Workflow not found: $workflow_id" >&2
    exit 1
  fi

  if [[ $list -eq 1 ]]; then
    list_injected_skills "$workflow_id"
    exit 0
  fi

  if [[ -z "$hook" ]]; then
    echo "Error: --hook is required" >&2
    exit 1
  fi

  if [[ $remove -eq 1 ]]; then
    if [[ -z "$skill" ]]; then
      echo "Error: --skill is required for removal" >&2
      exit 1
    fi

    remove_skill_injection "$workflow_file" "$hook" "$skill"
    echo "✅ Removed skill '$skill' from hook '$hook'"
    exit 0
  fi

  if [[ -z "$skill" ]]; then
    echo "Error: --skill is required" >&2
    exit 1
  fi

  add_skill_injection "$workflow_file" "$hook" "$skill" "$config" "$required" "$order"

  echo "✅ Injected skill '$skill' at hook '$hook'"
  [[ "$required" == "true" ]] && echo "   Required: yes"
  [[ -n "$config" ]] && echo "   Config: $config"
  [[ "$order" != "0" ]] && echo "   Order: $order"
}

main "$@"
