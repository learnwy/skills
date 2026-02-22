# State Machine Specification

# 状态机规范

> **Note:** All `./scripts/` paths below are relative to `{skill_root}` (the directory containing SKILL.md). Use absolute path in actual execution.

## Overview / 概述

The requirement-workflow uses a finite state machine (FSM) to manage workflow progression. This document defines all states, transitions, and rules.

## State Definitions / 状态定义

### Primary States / 主要状态

| State          | Description            | Entry Condition         | Exit Condition   |
| -------------- | ---------------------- | ----------------------- | ---------------- |
| `INIT`         | Initial state          | Workflow created        | Level determined |
| `ANALYZING`    | Requirement analysis   | From INIT (L2/L3)       | Spec completed   |
| `PLANNING`     | Task planning          | From INIT/ANALYZING     | Tasks defined    |
| `DESIGNING`    | Technical design       | From PLANNING (L2/L3)   | Design approved  |
| `IMPLEMENTING` | Code implementation    | From PLANNING/DESIGNING | All tasks done   |
| `TESTING`      | Testing & verification | From IMPLEMENTING       | All tests pass   |
| `DELIVERING`   | Final delivery         | From TESTING (L2/L3)    | Report generated |
| `DONE`         | Workflow complete      | From TESTING/DELIVERING | Terminal state   |

### Secondary States / 次要状态

| State     | Description          | Trigger            | Resolution          |
| --------- | -------------------- | ------------------ | ------------------- |
| `BLOCKED` | Cannot proceed       | Blocker detected   | Blocker removed     |
| `WAITING` | Awaiting external    | Dependency pending | Dependency resolved |
| `PAUSED`  | User requested pause | User action        | User resume         |
| `FAILED`  | Unrecoverable error  | Critical failure   | Manual intervention |

## State Diagram / 状态图

```
                              ┌─────────────────────────────────────────┐
                              │                                         │
                              ▼                                         │
┌──────┐    L2/L3    ┌───────────┐    ┌──────────┐    L2/L3    ┌───────────┐
│ INIT │ ──────────► │ ANALYZING │ ──►│ PLANNING │ ──────────► │ DESIGNING │
└──────┘             └───────────┘    └──────────┘             └───────────┘
    │                                       │                         │
    │ L1                                    │ L1                      │
    │                                       ▼                         ▼
    │                              ┌──────────────┐           ┌──────────────┐
    └─────────────────────────────►│ IMPLEMENTING │◄──────────┤ IMPLEMENTING │
                                   └──────────────┘           └──────────────┘
                                           │
                                           ▼
                                    ┌─────────┐
                                    │ TESTING │
                                    └─────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │ L1              │ L2/L3           │
                         ▼                 ▼                 │
                     ┌──────┐       ┌────────────┐           │
                     │ DONE │◄──────┤ DELIVERING │           │
                     └──────┘       └────────────┘           │
                         ▲                                   │
                         └───────────────────────────────────┘

         Any State                 Any State                 Any State
             │                         │                         │
             ▼                         ▼                         ▼
        ┌─────────┐              ┌─────────┐              ┌────────┐
        │ BLOCKED │              │ WAITING │              │ PAUSED │
        └─────────┘              └─────────┘              └────────┘
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       │
                                       ▼
                               [Previous State]
```

## Transition Rules / 转换规则

### Valid Transitions / 有效转换

```yaml
transitions:
  INIT:
    - to: ANALYZING
      condition: "level in [L2, L3]"
    - to: PLANNING
      condition: "level == L1"

  ANALYZING:
    - to: PLANNING
      condition: "spec.md completed"
    - to: BLOCKED
      condition: "blocker detected"
    - to: WAITING
      condition: "external dependency"

  PLANNING:
    - to: DESIGNING
      condition: "level in [L2, L3] AND tasks.md completed"
    - to: IMPLEMENTING
      condition: "level == L1 AND tasks.md completed"
    - to: BLOCKED
      condition: "blocker detected"

  DESIGNING:
    - to: IMPLEMENTING
      condition: "design.md completed AND approved"
    - to: BLOCKED
      condition: "blocker detected"
    - to: WAITING
      condition: "external review pending"

  IMPLEMENTING:
    - to: TESTING
      condition: "all tasks completed"
    - to: BLOCKED
      condition: "blocker detected"
    - to: WAITING
      condition: "external dependency"

  TESTING:
    - to: DELIVERING
      condition: "level in [L2, L3] AND all tests pass"
    - to: DONE
      condition: "level == L1 AND all tests pass"
    - to: IMPLEMENTING
      condition: "test failures require code changes"

  DELIVERING:
    - to: DONE
      condition: "report generated"

  BLOCKED:
    - to: "{previous_state}"
      condition: "blocker resolved"
    - to: FAILED
      condition: "blocker unresolvable"

  WAITING:
    - to: "{previous_state}"
      condition: "dependency resolved"

  PAUSED:
    - to: "{previous_state}"
      condition: "user resume"
```

### Invalid Transitions / 无效转换

```yaml
invalid_transitions:
  - from: DONE
    to: any
    reason: "Terminal state"

  - from: FAILED
    to: any
    reason: "Terminal state, requires new workflow"

  - from: IMPLEMENTING
    to: ANALYZING
    reason: "Cannot go back to analysis"

  - from: TESTING
    to: PLANNING
    reason: "Must complete implementation cycle"
```

## State Persistence / 状态持久化

### workflow.yaml Structure / 结构

```yaml
id: "20240115_001_feature_user-auth"
level: L2
status: IMPLEMENTING
previous_status: DESIGNING
created_at: "2024-01-15T09:00:00Z"
updated_at: "2024-01-15T14:30:00Z"

state_history:
  - state: INIT
    entered_at: "2024-01-15T09:00:00Z"
    exited_at: "2024-01-15T09:05:00Z"
    duration_seconds: 300

  - state: ANALYZING
    entered_at: "2024-01-15T09:05:00Z"
    exited_at: "2024-01-15T09:30:00Z"
    duration_seconds: 1500
    artifacts:
      - spec.md

  - state: PLANNING
    entered_at: "2024-01-15T09:30:00Z"
    exited_at: "2024-01-15T10:00:00Z"
    duration_seconds: 1800
    artifacts:
      - tasks.md

  - state: DESIGNING
    entered_at: "2024-01-15T10:00:00Z"
    exited_at: "2024-01-15T14:00:00Z"
    duration_seconds: 14400
    artifacts:
      - design.md
    blocked_periods:
      - reason: "Waiting for API spec clarification"
        started_at: "2024-01-15T11:00:00Z"
        resolved_at: "2024-01-15T13:00:00Z"

  - state: IMPLEMENTING
    entered_at: "2024-01-15T14:00:00Z"
    current: true

current_stage:
  name: IMPLEMENTING
  progress: 45
  current_task: "task_003"
  tasks_completed: 2
  tasks_total: 5
```

## State Hooks / 状态钩子

### Hook Execution Order / 钩子执行顺序

```
1. pre_transition_{from}_{to}
2. on_exit_{from}
3. [State Transition]
4. on_enter_{to}
5. post_transition_{from}_{to}
```

### Hook Definition / 钩子定义

```yaml
hooks:
  on_enter_ANALYZING:
    - action: "log"
      message: "Starting requirement analysis"
    - action: "notify"
      template: "stage_started"

  on_exit_DESIGNING:
    - action: "validate"
      check: "design.md exists"
    - action: "invoke_skill"
      skill: "code-reviewer"
      target: "design.md"

  pre_transition_TESTING_DONE:
    - action: "validate"
      check: "all_tests_passed"
    - action: "validate"
      check: "checklist_complete"

  on_enter_BLOCKED:
    - action: "log"
      level: "warn"
      message: "Workflow blocked"
    - action: "notify"
      template: "blocked_alert"
```

## Error States / 错误状态

### BLOCKED State / 阻塞状态

```yaml
blocked_info:
  blocker_type: technical|external|resource|unknown
  description: "Detailed blocker description"
  detected_at: "2024-01-15T11:00:00Z"
  affected_task: "task_003"
  suggested_actions:
    - "Review dependency X"
    - "Contact team Y"
  resolution_status: pending|in_progress|resolved
```

### WAITING State / 等待状态

```yaml
waiting_info:
  dependency_type: review|approval|resource|external_api
  description: "Waiting for design review"
  waiting_since: "2024-01-15T10:00:00Z"
  expected_resolution: "2024-01-15T12:00:00Z"
  contact: "reviewer@example.com"
```

### FAILED State / 失败状态

```yaml
failure_info:
  failure_type: unrecoverable_error|user_cancelled|timeout
  description: "Database migration failed"
  failed_at: "2024-01-15T15:00:00Z"
  last_successful_state: IMPLEMENTING
  error_details:
    code: "DB_MIGRATION_001"
    message: "Schema conflict detected"
  recovery_options:
    - "Create new workflow from IMPLEMENTING state"
    - "Manual database fix required"
```

## State Queries / 状态查询

### Query Examples / 查询示例

```bash
# Get current state
./scripts/get-status.sh -r /project

# Check if transition is valid
./scripts/advance-stage.sh -r /project --validate --to TESTING

# Get state history
./scripts/get-status.sh -r /project --history

# Specify a particular workflow
./scripts/get-status.sh -r /project -p /project/.trae/workflow/20240115_001_feature_user-auth
```

## Concurrent Workflows / 并发工作流

Multiple workflows can run concurrently. Each maintains independent state:

```
.trae/workflow/
├── 20240115_001_feature_user-auth/
│   └── workflow.yaml  # State: IMPLEMENTING
├── 20240115_002_bugfix_login-error/
│   └── workflow.yaml  # State: TESTING
└── 20240115_003_refactor_api-layer/
    └── workflow.yaml  # State: BLOCKED
```

State isolation is guaranteed by workflow ID.
