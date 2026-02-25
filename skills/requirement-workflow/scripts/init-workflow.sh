#!/bin/bash
# =============================================================================
# init-workflow.sh - Initialize a new requirement workflow
# =============================================================================
#
# DESCRIPTION:
#   Creates a new workflow directory with all necessary templates and state files.
#   Sets the new workflow as the active workflow for the project.
#
# USAGE:
#   ./scripts/init-workflow.sh -r <root> -n <name> [-t <type>] [-l <level>] [-d <desc>] [--tags <tags>]
#
# OPTIONS:
#   -r, --root DIR          Project root directory (REQUIRED)
#   -n, --name NAME         Requirement name (REQUIRED)
#   -t, --type TYPE         Type: feature|bugfix|refactor|hotfix (default: feature)
#   -l, --level LEVEL       Force level: L1|L2|L3 (default: L2)
#   -d, --description DESC  Brief description
#   --tags TAGS             Comma-separated tags
#   -h, --help              Show help message
#
# INPUT:
#   Command line arguments only
#
# OUTPUT:
#   Creates directory: {root}/.trae/workflow/{date}_{seq}_{type}_{name}/
#   Updates: {root}/.trae/active_workflow (records current active workflow path)
#   Generated files:
#     - workflow.yaml   (state file)
#     - spec.md         (requirement spec template)
#     - tasks.md        (task breakdown template)
#     - checklist.md    (verification checklist template)
#     - logs/           (log directory)
#     - artifacts/      (output directory)
#
# EXAMPLES:
#   # Create a new feature workflow
#   ./scripts/init-workflow.sh -r /path/to/project -n "user-authentication" -t feature
#   # OUTPUT:
#   # ✅ Workflow initialized successfully!
#   # 📋 Workflow ID: 20240115_001_feature_user-authentication
#   # 📁 Directory: /path/to/project/.trae/workflow/20240115_001_feature_user-authentication
#   # 📊 Level: L2
#
#   # Create a quick bugfix workflow (L1)
#   ./scripts/init-workflow.sh -r . -n "fix-login-bug" -t bugfix -l L1
#
#   # Create with description and tags
#   ./scripts/init-workflow.sh -r ~/projects/myapp -n "api-refactor" -t refactor -l L3 \
#     -d "Refactor payment API" --tags "breaking,api"
#
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
source "$SCRIPT_DIR/lib/common-utils.sh"

show_help() {
    cat << EOF
Usage: $(basename "$0") -r <root> -n <name> [OPTIONS]

Initialize a new requirement workflow.

Options:
    -r, --root DIR          Project root directory (REQUIRED)
    -n, --name NAME         Requirement name (REQUIRED)
    -t, --type TYPE         Type: feature|bugfix|refactor|hotfix (default: feature)
    -l, --level LEVEL       Force level: L1|L2|L3 (default: L2)
    -d, --description DESC  Brief description
    --tags TAGS             Comma-separated tags
    -h, --help              Show this help message

Examples:
    $(basename "$0") -r /path/to/project -n "user-authentication" -t feature
    $(basename "$0") -r . -n "fix-login-bug" -t bugfix -l L1
    $(basename "$0") -r ~/myapp -n "api-refactor" -t refactor -l L3 --tags "breaking,api"
EOF
}

sanitize_name() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

get_next_seq() {
    local workflow_base="$1"
    local date_prefix="$2"
    local max_seq=0
    
    if [[ -d "$workflow_base" ]]; then
        shopt -s nullglob
        for dir in "$workflow_base"/"${date_prefix}"_*/; do
            if [[ -d "$dir" ]]; then
                local seq_num
                seq_num=$(basename "$dir" | cut -d'_' -f2)
                if [[ "$seq_num" =~ ^[0-9]+$ ]] && [[ "$seq_num" -gt "$max_seq" ]]; then
                    max_seq=$seq_num
                fi
            fi
        done
        shopt -u nullglob
    fi
    
    printf "%03d" $((max_seq + 1))
}

create_workflow_yaml() {
    local workflow_dir="$1"
    local workflow_id="$2"
    local level="$3"
    local req_type="$4"
    local name="$5"
    local description="$6"
    local tags="$7"
    local project_root="$8"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$workflow_dir/workflow.yaml" << EOF
id: "$workflow_id"
name: "$name"
type: "$req_type"
level: "$level"
status: "INIT"
description: "$description"
tags: [$tags]
project_root: "$project_root"
created_at: "$timestamp"
updated_at: "$timestamp"

current_stage:
  name: null
  progress: 0
  current_task: null

state_history:
  - state: "INIT"
    entered_at: "$timestamp"
    current: true

hooks: {}

artifacts: []
EOF
}

create_spec_template() {
    local workflow_dir="$1"
    local name="$2"
    local description="$3"
    
    cat > "$workflow_dir/spec.md" << EOF
# Requirement Specification: $name

## Background

$description

## Goals

- [ ] Goal 1
- [ ] Goal 2

## Scope

### In Scope
- 

### Out of Scope
- 

## Constraints

- 

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Open Questions

- 
EOF
}

create_tasks_template() {
    local workflow_dir="$1"
    
    cat > "$workflow_dir/tasks.md" << EOF
# Task Breakdown

## Overview

| Status      | Count |
|-------------|-------|
| Total       | 0     |
| Done        | 0     |
| In Progress | 0     |
| Pending     | 0     |

## Tasks

### High Priority

- [ ] 

### Medium Priority

- [ ] 

### Low Priority

- [ ] 
EOF
}

create_checklist_template() {
    local workflow_dir="$1"
    
    cat > "$workflow_dir/checklist.md" << EOF
# Verification Checklist

## Code Quality

- [ ] Lint check passed
- [ ] Type check passed
- [ ] No new warnings introduced

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed

## Documentation

- [ ] Code comments updated
- [ ] API documentation updated (if applicable)
- [ ] Changelog entry added

## Review

- [ ] Self-review completed
- [ ] Peer review completed (if required)

## Deployment

- [ ] No breaking changes OR migration documented
- [ ] Environment variables documented (if any)
EOF
}

set_active_workflow() {
    local project_root="$1"
    local workflow_dir="$2"
    
    echo "$workflow_dir" > "$project_root/.trae/active_workflow"
}

main() {
    local name=""
    local req_type="feature"
    local project_root=""
    local level=""
    local description=""
    local tags=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -n|--name)
                name="$2"
                shift 2
                ;;
            -t|--type)
                req_type="$2"
                shift 2
                ;;
            -r|--root)
                project_root="$2"
                shift 2
                ;;
            -l|--level)
                level="$2"
                shift 2
                ;;
            -d|--description)
                description="$2"
                shift 2
                ;;
            --tags)
                tags="$2"
                shift 2
                ;;
            -h|--help)
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

    if [[ -z "$name" ]]; then
        echo "Error: --name is required" >&2
        show_help
        exit 1
    fi
    
    if [[ ! "$req_type" =~ ^(feature|bugfix|refactor|hotfix)$ ]]; then
        echo "Error: Invalid type. Must be feature|bugfix|refactor|hotfix" >&2
        exit 1
    fi
    
    if [[ -n "$level" && ! "$level" =~ ^(L1|L2|L3)$ ]]; then
        echo "Error: Invalid level. Must be L1|L2|L3" >&2
        exit 1
    fi
    
    project_root="${project_root%/}"
    project_root="$(cd "$project_root" && pwd)"
    
    if [[ ! -d "$project_root" ]]; then
        echo "Error: Project root directory does not exist: $project_root" >&2
        exit 1
    fi
    
    local workflow_base="$project_root/.trae/workflow"
    local date_str=$(date +%Y%m%d)
    local seq=$(get_next_seq "$workflow_base" "$date_str")
    local sanitized_name=$(sanitize_name "$name")
    local workflow_id="${date_str}_${seq}_${req_type}_${sanitized_name}"
    local workflow_dir="$workflow_base/$workflow_id"
    
    [[ -z "$level" ]] && level="L2"
    
    mkdir -p "$workflow_dir"/{logs,artifacts}
    
    create_workflow_yaml "$workflow_dir" "$workflow_id" "$level" "$req_type" "$name" "$description" "$tags" "$project_root"
    create_spec_template "$workflow_dir" "$name" "$description"
    create_tasks_template "$workflow_dir"
    create_checklist_template "$workflow_dir"
    
    set_active_workflow "$project_root" "$workflow_dir"
    
    cat << EOF
✅ Workflow initialized successfully!

📋 Workflow ID: $workflow_id
📁 Directory: $workflow_dir
📊 Level: $level
🏷️  Type: $req_type
🔄 Active: Yes (set as active workflow)

Files created:
  - workflow.yaml (state file)
  - spec.md (requirement spec)
  - tasks.md (task breakdown)
  - checklist.md (verification checklist)

Next steps:
1. Review and complete spec.md
2. Run: ./scripts/advance-stage.sh -r "$project_root"
EOF
}

main "$@"
