#!/bin/bash
# =============================================================================
# yaml-utils.sh - YAML utility functions for bash scripts
# =============================================================================
#
# DESCRIPTION:
#   Provides simple YAML read/write/update operations for bash scripts.
#   Designed for workflow.yaml manipulation without external dependencies.
#
# USAGE:
#   source "$(dirname "$0")/lib/yaml-utils.sh"
#
# FUNCTIONS:
#   yaml_read <file> <key>                    - Read a top-level key value
#   yaml_write <file> <key> <value>           - Write/update a top-level key
#   yaml_append_list <file> <list_key> <item> - Append item to a YAML list
#   yaml_insert_after <file> <after_key> <content> - Insert content after a key
#
# =============================================================================

yaml_read() {
  local file="$1"
  local key="$2"
  grep "^${key}:" "$file" 2>/dev/null | head -1 | sed "s/^${key}: *//" | tr -d '"'
}

yaml_write() {
  local file="$1"
  local key="$2"
  local value="$3"
  local temp_file
  temp_file=$(mktemp)
  
  if grep -q "^${key}:" "$file" 2>/dev/null; then
    sed "s/^${key}: .*/${key}: \"${value}\"/" "$file" > "$temp_file"
    mv "$temp_file" "$file"
  else
    rm -f "$temp_file"
    echo "${key}: \"${value}\"" >> "$file"
  fi
  return 0
}

yaml_append_history() {
  local file="$1"
  local state="$2"
  local timestamp="$3"
  local is_current="${4:-true}"
  
  local temp_file
  local output_file
  temp_file=$(mktemp)
  output_file=$(mktemp)
  
  cp "$file" "$temp_file"
  
  if [[ "$is_current" == "true" ]]; then
    sed -i '' "s/current: true/current: false/g" "$temp_file"
  fi
  
  local history_inserted=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    echo "$line" >> "$output_file"
    if [[ "$line" == "state_history:" && $history_inserted -eq 0 ]]; then
      echo "  - state: \"$state\"" >> "$output_file"
      echo "    entered_at: \"$timestamp\"" >> "$output_file"
      echo "    current: $is_current" >> "$output_file"
      history_inserted=1
    fi
  done < "$temp_file"
  
  mv "$output_file" "$file"
  rm -f "$temp_file"
}

yaml_append_to_list() {
  local file="$1"
  local list_key="$2"
  shift 2
  local items=("$@")
  
  local temp_file
  local output_file
  temp_file=$(mktemp)
  output_file=$(mktemp)
  
  cp "$file" "$temp_file"
  
  local list_found=0
  local item_inserted=0
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    echo "$line" >> "$output_file"
    if [[ "$line" == "${list_key}:" && $item_inserted -eq 0 ]]; then
      list_found=1
    elif [[ $list_found -eq 1 && $item_inserted -eq 0 ]]; then
      for item in "${items[@]}"; do
        echo "$item" >> "$output_file"
      done
      item_inserted=1
      list_found=0
    fi
  done < "$temp_file"
  
  mv "$output_file" "$file"
  rm -f "$temp_file"
}

yaml_update_nested() {
  local file="$1"
  local parent_key="$2"
  local child_key="$3"
  local value="$4"
  
  local temp_file
  local output_file
  temp_file=$(mktemp)
  output_file=$(mktemp)
  
  cp "$file" "$temp_file"
  
  local in_parent=0
  local updated=0
  
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "${parent_key}:" ]]; then
      in_parent=1
      echo "$line" >> "$output_file"
    elif [[ $in_parent -eq 1 && "$line" =~ ^[[:space:]]+${child_key}: && $updated -eq 0 ]]; then
      local indent="${line%%[^[:space:]]*}"
      echo "${indent}${child_key}: $value" >> "$output_file"
      updated=1
    elif [[ $in_parent -eq 1 && ! "$line" =~ ^[[:space:]] ]]; then
      in_parent=0
      echo "$line" >> "$output_file"
    else
      echo "$line" >> "$output_file"
    fi
  done < "$temp_file"
  
  mv "$output_file" "$file"
  rm -f "$temp_file"
}

yaml_get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

yaml_get_hooks_for_point() {
  local hook_point="$1"
  local global_file="$2"
  local project_file="$3"
  local workflow_file="$4"
  
  local all_skills=""
  
  for file in "$global_file" "$project_file" "$workflow_file"; do
    if [[ -f "$file" ]]; then
      local in_hooks=0
      local in_target_hook=0
      while IFS= read -r line; do
        if [[ "$line" == "hooks:" ]]; then
          in_hooks=1
          continue
        fi
        if [[ $in_hooks -eq 1 && "$line" == "  ${hook_point}:" ]]; then
          in_target_hook=1
          continue
        fi
        if [[ $in_target_hook -eq 1 ]]; then
          if [[ "$line" =~ ^[[:space:]]{2}[a-z] && ! "$line" =~ ^[[:space:]]{4} ]]; then
            in_target_hook=0
            continue
          fi
          if [[ "$line" =~ ^[a-z] ]]; then
            in_target_hook=0
            in_hooks=0
            continue
          fi
          if [[ "$line" =~ "skill:" ]]; then
            local skill_name
            skill_name=$(echo "$line" | sed 's/.*skill: *//' | tr -d '"')
            if [[ -n "$skill_name" ]]; then
              all_skills="$all_skills $skill_name"
            fi
          fi
        fi
      done < "$file"
    fi
  done
  
  echo "$all_skills" | tr ' ' '\n' | grep -v '^$' | sort -u | tr '\n' ' '
}
