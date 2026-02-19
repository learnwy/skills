#!/bin/bash
set -euo pipefail

WORKFLOW_BASE=".trae/workflow"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Initialize a new requirement workflow.

Options:
    -n, --name NAME         Requirement name (required)
    -t, --type TYPE         Type: feature|bugfix|refactor|hotfix (default: feature)
    -l, --level LEVEL       Force level: L1|L2|L3 (auto-detected if not specified)
    -d, --description DESC  Brief description
    --tags TAGS             Comma-separated tags
    -h, --help              Show this help message

Examples:
    $(basename "$0") -n "user-authentication" -t feature
    $(basename "$0") -n "fix-login-bug" -t bugfix -l L1
    $(basename "$0") -n "api-refactor" -t refactor -l L3 --tags "breaking,api"
EOF
}

sanitize_name() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

get_next_seq() {
    local date_prefix="$1"
    local max_seq=0
    
    if [[ -d "$WORKFLOW_BASE" ]]; then
        for dir in "$WORKFLOW_BASE"/"${date_prefix}"_*/ 2>/dev/null; do
            if [[ -d "$dir" ]]; then
                seq=$(basename "$dir" | cut -d'_' -f2)
                if [[ "$seq" =~ ^[0-9]+$ ]] && [[ "$seq" -gt "$max_seq" ]]; then
                    max_seq=$seq
                fi
            fi
        done
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
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "$workflow_dir/workflow.yaml" << EOF
id: "$workflow_id"
name: "$name"
type: "$req_type"
level: "$level"
status: "INIT"
description: "$description"
tags: [$tags]
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

injected_skills: []

hooks: {}

artifacts: []
EOF
}

create_spec_template() {
    local workflow_dir="$1"
    local name="$2"
    local description="$3"
    
    cat > "$workflow_dir/spec.md" << EOF
# Requirement Specification / 需求规格说明
# $name

## Background / 背景

$description

## Goals / 目标

<!-- Define clear, measurable goals -->
<!-- 定义清晰、可衡量的目标 -->

- [ ] Goal 1
- [ ] Goal 2

## Scope / 范围

### In Scope / 范围内
- 

### Out of Scope / 范围外
- 

## Constraints / 约束条件

- 

## Acceptance Criteria / 验收标准

- [ ] Criterion 1
- [ ] Criterion 2

## Open Questions / 待澄清问题

- 
EOF
}

create_tasks_template() {
    local workflow_dir="$1"
    
    cat > "$workflow_dir/tasks.md" << EOF
# Task Breakdown / 任务拆分

## Overview / 概述

| Status | Count |
|--------|-------|
| Total  | 0     |
| Done   | 0     |
| In Progress | 0 |
| Pending | 0    |

## Tasks / 任务列表

<!-- Tasks will be populated during PLANNING phase -->
<!-- 任务将在规划阶段填充 -->

### High Priority / 高优先级

- [ ] 

### Medium Priority / 中优先级

- [ ] 

### Low Priority / 低优先级

- [ ] 
EOF
}

create_checklist_template() {
    local workflow_dir="$1"
    
    cat > "$workflow_dir/checklist.md" << EOF
# Verification Checklist / 验收检查清单

## Code Quality / 代码质量

- [ ] Lint check passed
- [ ] Type check passed
- [ ] No new warnings introduced

## Testing / 测试

- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed

## Documentation / 文档

- [ ] Code comments updated
- [ ] API documentation updated (if applicable)
- [ ] Changelog entry added

## Review / 审查

- [ ] Self-review completed
- [ ] Peer review completed (if required)

## Deployment / 部署

- [ ] No breaking changes OR migration documented
- [ ] Environment variables documented (if any)
EOF
}

main() {
    local name=""
    local req_type="feature"
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
    
    local date_str=$(date +%Y%m%d)
    local seq=$(get_next_seq "$date_str")
    local sanitized_name=$(sanitize_name "$name")
    local workflow_id="${date_str}_${seq}_${req_type}_${sanitized_name}"
    local workflow_dir="$WORKFLOW_BASE/$workflow_id"
    
    [[ -z "$level" ]] && level="L2"
    
    mkdir -p "$workflow_dir"/{logs,artifacts}
    
    create_workflow_yaml "$workflow_dir" "$workflow_id" "$level" "$req_type" "$name" "$description" "$tags"
    create_spec_template "$workflow_dir" "$name" "$description"
    create_tasks_template "$workflow_dir"
    create_checklist_template "$workflow_dir"
    
    cat << EOF
✅ Workflow initialized successfully!

📋 Workflow ID: $workflow_id
📁 Directory: $workflow_dir
📊 Level: $level
🏷️  Type: $req_type

Files created:
  - workflow.yaml (state file)
  - spec.md (requirement spec)
  - tasks.md (task breakdown)
  - checklist.md (verification checklist)

Next steps:
1. Review and complete spec.md
2. Run: ./scripts/advance-stage.sh --workflow-id $workflow_id --to ANALYZING
EOF
}

main "$@"
