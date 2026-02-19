#!/bin/bash
set -euo pipefail

WORKFLOW_BASE=".trae/workflow"

show_help() {
  cat << EOF
Usage: $(basename "$0") [OPTIONS]

Advance workflow to the next stage with validation.

Options:
    -w, --workflow-id ID    Workflow ID (required unless --latest)
    --latest                Use the most recent workflow
    -t, --to STAGE          Target stage (auto-advance if not specified)
    --validate              Only validate, don't actually transition
    --force                 Force transition even if validation fails
    -h, --help              Show this help message

Stages: INIT, ANALYZING, PLANNING, DESIGNING, IMPLEMENTING, TESTING, DELIVERING, DONE

Examples:
    $(basename "$0") --latest --to IMPLEMENTING
    $(basename "$0") -w 20240115_001_feature_auth --validate
    $(basename "$0") --latest  # Auto-advance to next stage
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

update_yaml_value() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}:" "$file"; then
    sed -i '' "s/^${key}:.*/${key}: \"${value}\"/" "$file"
  fi
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
    ANALYZING)
      echo "PLANNING"
      ;;
    PLANNING)
      if [[ "$level" == "L1" ]]; then
        echo "IMPLEMENTING"
      else
        echo "DESIGNING"
      fi
      ;;
    DESIGNING)
      echo "IMPLEMENTING"
      ;;
    IMPLEMENTING)
      echo "TESTING"
      ;;
    TESTING)
      if [[ "$level" == "L1" ]]; then
        echo "DONE"
      else
        echo "DELIVERING"
      fi
      ;;
    DELIVERING)
      echo "DONE"
      ;;
    *)
      echo ""
      ;;
  esac
}

validate_transition() {
  local workflow_dir="$1"
  local from_stage="$2"
  local to_stage="$3"
  local level="$4"
  local errors=()

  case "$to_stage" in
    ANALYZING)
      if [[ "$from_stage" != "INIT" ]]; then
        errors+=("Can only transition to ANALYZING from INIT")
      fi
      if [[ "$level" == "L1" ]]; then
        errors+=("L1 workflows skip ANALYZING stage")
      fi
      ;;
    PLANNING)
      if [[ "$from_stage" != "INIT" && "$from_stage" != "ANALYZING" ]]; then
        errors+=("Can only transition to PLANNING from INIT or ANALYZING")
      fi
      if [[ "$from_stage" == "ANALYZING" && ! -f "$workflow_dir/spec.md" ]]; then
        errors+=("spec.md not found - complete requirement analysis first")
      fi
      ;;
    DESIGNING)
      if [[ "$from_stage" != "PLANNING" ]]; then
        errors+=("Can only transition to DESIGNING from PLANNING")
      fi
      if [[ "$level" == "L1" ]]; then
        errors+=("L1 workflows skip DESIGNING stage")
      fi
      if [[ ! -f "$workflow_dir/tasks.md" ]]; then
        errors+=("tasks.md not found - complete task breakdown first")
      fi
      ;;
    IMPLEMENTING)
      if [[ "$from_stage" != "PLANNING" && "$from_stage" != "DESIGNING" ]]; then
        errors+=("Can only transition to IMPLEMENTING from PLANNING or DESIGNING")
      fi
      ;;
    TESTING)
      if [[ "$from_stage" != "IMPLEMENTING" ]]; then
        errors+=("Can only transition to TESTING from IMPLEMENTING")
      fi
      ;;
    DELIVERING)
      if [[ "$from_stage" != "TESTING" ]]; then
        errors+=("Can only transition to DELIVERING from TESTING")
      fi
      if [[ "$level" == "L1" ]]; then
        errors+=("L1 workflows skip DELIVERING stage")
      fi
      ;;
    DONE)
      if [[ "$from_stage" != "TESTING" && "$from_stage" != "DELIVERING" ]]; then
        errors+=("Can only transition to DONE from TESTING or DELIVERING")
      fi
      ;;
  esac

  if [[ ${#errors[@]} -gt 0 ]]; then
    echo "❌ Validation failed:"
    for err in "${errors[@]}"; do
      echo "   - $err"
    done
    return 1
  fi

  echo "✅ Validation passed"
  return 0
}

add_state_history() {
  local workflow_file="$1"
  local new_state="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local temp_file=$(mktemp)
  local in_history=0
  local added=0

  while IFS= read -r line; do
    if [[ "$line" =~ ^state_history: ]]; then
      echo "$line" >> "$temp_file"
      in_history=1
      continue
    fi

    if [[ $in_history -eq 1 && "$line" =~ ^[[:space:]]+-[[:space:]]state: ]]; then
      if [[ $added -eq 0 ]]; then
        echo "  - state: \"$new_state\"" >> "$temp_file"
        echo "    entered_at: \"$timestamp\"" >> "$temp_file"
        echo "    current: true" >> "$temp_file"
        echo "" >> "$temp_file"
        added=1
      fi
    fi

    if [[ $in_history -eq 1 && "$line" =~ current:[[:space:]]*true ]]; then
      line="${line/current: true/current: false}"
      line="${line/current:true/current: false}"
    fi

    if [[ $in_history -eq 1 && ! "$line" =~ ^[[:space:]] && "$line" != "" ]]; then
      in_history=0
    fi

    echo "$line" >> "$temp_file"
  done < "$workflow_file"

  mv "$temp_file" "$workflow_file"
}

run_hooks() {
  local workflow_dir="$1"
  local hook_name="$2"

  echo "🪝 Running hook: $hook_name"
}

main() {
  local workflow_id=""
  local use_latest=0
  local target_stage=""
  local validate_only=0
  local force=0

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

  if [[ $use_latest -eq 1 ]]; then
    workflow_id=$(get_latest_workflow)
  fi

  if [[ -z "$workflow_id" ]]; then
    echo "Error: No workflow specified and no workflows found" >&2
    exit 1
  fi

  local workflow_dir="$WORKFLOW_BASE/$workflow_id"
  local workflow_file="$workflow_dir/workflow.yaml"

  if [[ ! -f "$workflow_file" ]]; then
    echo "Error: Workflow not found: $workflow_id" >&2
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
  echo ""

  if ! validate_transition "$workflow_dir" "$current_status" "$target_stage" "$level"; then
    if [[ $force -eq 0 ]]; then
      exit 1
    fi
    echo "⚠️  Forcing transition despite validation errors"
  fi

  if [[ $validate_only -eq 1 ]]; then
    echo ""
    echo "✅ Validation complete (no changes made)"
    exit 0
  fi

  run_hooks "$workflow_dir" "pre_stage_$target_stage"

  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  update_yaml_value "$workflow_file" "status" "$target_stage"
  update_yaml_value "$workflow_file" "updated_at" "$timestamp"

  add_state_history "$workflow_file" "$target_stage"

  run_hooks "$workflow_dir" "post_stage_$current_status"

  echo ""
  echo "✅ Successfully transitioned to $target_stage"
  echo ""
  echo "📁 Log: $workflow_dir/logs/${target_stage,,}.log"

  case "$target_stage" in
    ANALYZING)
      echo ""
      echo "Next: Complete requirement analysis in spec.md"
      ;;
    PLANNING)
      echo ""
      echo "Next: Break down tasks in tasks.md"
      ;;
    DESIGNING)
      echo ""
      echo "Next: Create technical design in design.md"
      ;;
    IMPLEMENTING)
      echo ""
      echo "Next: Start implementing tasks"
      ;;
    TESTING)
      echo ""
      echo "Next: Run tests and complete checklist.md"
      ;;
    DELIVERING)
      echo ""
      echo "Next: Generate final report and deliver"
      ;;
    DONE)
      echo ""
      echo "🎉 Workflow completed!"
      ;;
  esac
}

main "$@"
