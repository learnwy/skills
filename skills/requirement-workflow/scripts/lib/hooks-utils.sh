#!/bin/bash
# =============================================================================
# hooks-utils.sh - Hook point operations for skill/agent injection
# =============================================================================
#
# DESCRIPTION:
#   Provides functions for querying and manipulating hook points
#   across global, project, and workflow configuration levels.
#   Supports both skill injection and agent injection.
#
# USAGE:
#   source "$(dirname "$0")/lib/hooks-utils.sh"
#   # Or use common-utils.sh which sources all utils
#
# FUNCTIONS:
#   get_hooks_for_point <hook> <global> <project> <workflow>  - Get skills for hook
#   get_agents_for_point <hook> <global> <project> <workflow> - Get agents for hook
#   get_global_hooks_file                                     - Get global hooks path
#   get_project_hooks_file <project_root>                     - Get project hooks path
#   get_workflow_hooks_file <workflow_dir>                    - Get workflow hooks path
#
# =============================================================================

_HOOKS_UTILS_SKILL_DIR="${_HOOKS_UTILS_SKILL_DIR:-}"

_init_hooks_skill_dir() {
  if [[ -z "$_HOOKS_UTILS_SKILL_DIR" ]]; then
    local lib_dir
    lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    _HOOKS_UTILS_SKILL_DIR="$(cd "$lib_dir/../.." && pwd)"
  fi
}

get_global_hooks_file() {
  _init_hooks_skill_dir
  echo "$_HOOKS_UTILS_SKILL_DIR/hooks.yaml"
}

get_project_hooks_file() {
  local project_root="$1"
  echo "$project_root/.trae/workflow/hooks.yaml"
}

get_workflow_hooks_file() {
  local workflow_dir="$1"
  echo "$workflow_dir/workflow.yaml"
}

get_hooks_for_point() {
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
  
  echo "$all_skills" | tr ' ' '\n' | grep -v '^$' | sort -u | tr '\n' ' ' || true
}

get_all_hooks_files() {
  local project_root="$1"
  local workflow_dir="$2"
  
  echo "$(get_global_hooks_file)"
  echo "$(get_project_hooks_file "$project_root")"
  if [[ -n "$workflow_dir" ]]; then
    echo "$(get_workflow_hooks_file "$workflow_dir")"
  fi
}

get_agents_for_point() {
  local hook_point="$1"
  local global_file="$2"
  local project_file="$3"
  local workflow_file="$4"
  
  local all_agents=""
  
  for file in "$global_file" "$project_file" "$workflow_file"; do
    if [[ -f "$file" ]]; then
      local in_agents=0
      local in_target_hook=0
      while IFS= read -r line; do
        if [[ "$line" == "agents:" ]]; then
          in_agents=1
          continue
        fi
        if [[ $in_agents -eq 1 && "$line" == "  ${hook_point}:" ]]; then
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
            in_agents=0
            continue
          fi
          if [[ "$line" =~ "agent:" ]]; then
            local agent_name
            agent_name=$(echo "$line" | sed 's/.*agent: *//' | tr -d '"')
            if [[ -n "$agent_name" ]]; then
              all_agents="$all_agents $agent_name"
            fi
          fi
        fi
      done < "$file"
    fi
  done
  
  echo "$all_agents" | tr ' ' '\n' | grep -v '^$' | sort -u | tr '\n' ' ' || true
}

get_all_agents_for_stage() {
  local stage="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  local global_file project_file workflow_file
  global_file=$(get_global_hooks_file)
  project_file=$(get_project_hooks_file "$project_root")
  workflow_file=""
  [[ -n "$workflow_dir" ]] && workflow_file=$(get_workflow_hooks_file "$workflow_dir")
  
  local pre_agents post_agents
  pre_agents=$(get_agents_for_point "pre_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  post_agents=$(get_agents_for_point "post_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  
  echo "pre:$pre_agents"
  echo "post:$post_agents"
}

get_all_skills_and_agents_for_stage() {
  local stage="$1"
  local project_root="$2"
  local workflow_dir="$3"
  
  local global_file project_file workflow_file
  global_file=$(get_global_hooks_file)
  project_file=$(get_project_hooks_file "$project_root")
  workflow_file=""
  [[ -n "$workflow_dir" ]] && workflow_file=$(get_workflow_hooks_file "$workflow_dir")
  
  local pre_skills post_skills quality_skills
  pre_skills=$(get_hooks_for_point "pre_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  post_skills=$(get_hooks_for_point "post_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  quality_skills=$(get_hooks_for_point "quality_gate" "$global_file" "$project_file" "$workflow_file")
  
  local pre_agents post_agents
  pre_agents=$(get_agents_for_point "pre_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  post_agents=$(get_agents_for_point "post_stage_${stage}" "$global_file" "$project_file" "$workflow_file")
  
  echo "skills_pre:$pre_skills"
  echo "skills_post:$post_skills"
  echo "skills_quality:$quality_skills"
  echo "agents_pre:$pre_agents"
  echo "agents_post:$post_agents"
}
