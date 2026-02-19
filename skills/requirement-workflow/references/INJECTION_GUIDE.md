# Skill Injection Guide

# 技能注入指南

## Overview / 概述

The requirement-workflow orchestrator supports external skill injection to extend functionality at various stages. This guide explains the injection mechanisms and best practices.

## Injection Mechanisms / 注入机制

### 1. Configuration-based Injection / 配置式注入

Define skills to be injected in `workflow.yaml`:

```yaml
injected_skills:
  - stage: DESIGNING
    skill: code-reviewer
    timing: post
    config:
      focus: ["architecture", "security"]
      severity: "important"

  - stage: IMPLEMENTING
    skill: unit-test-generator
    timing: during
    trigger: "on_file_change"
    config:
      coverage_target: 80

  - stage: TESTING
    skill: security-scanner
    timing: pre
    required: true
    config:
      scan_type: "full"
```

**Configuration Fields:**

| Field      | Type   | Description                      |
| ---------- | ------ | -------------------------------- |
| `stage`    | string | Target stage for injection       |
| `skill`    | string | Skill name to invoke             |
| `timing`   | enum   | `pre`, `during`, `post`          |
| `trigger`  | string | Optional trigger condition       |
| `required` | bool   | If true, blocks stage on failure |
| `config`   | object | Skill-specific configuration     |

### 2. Hook-based Injection / 钩子式注入

Register skills to specific hooks for fine-grained control:

```yaml
hooks:
  pre_stage_IMPLEMENTING:
    - skill: dependency-checker
      config:
        check_updates: true

  post_task_implement_api:
    - skill: api-doc-generator
      config:
        format: "openapi"

  quality_gate:
    - skill: lint-checker
      required: true
    - skill: type-checker
      required: true
    - skill: security-scanner
      required: false

  on_blocked:
    - skill: blocker-analyzer
      config:
        suggest_solutions: true
```

### 3. Runtime Injection / 运行时注入

Inject skills dynamically during workflow execution:

```bash
# Inject a skill at a specific hook
./scripts/inject-skill.sh \
  --workflow-id 20240115_001_feature_user-auth \
  --hook post_stage_DESIGNING \
  --skill code-reviewer \
  --config '{"focus": ["performance"]}'

# Remove an injected skill
./scripts/inject-skill.sh \
  --workflow-id 20240115_001_feature_user-auth \
  --hook post_stage_DESIGNING \
  --skill code-reviewer \
  --remove
```

## Available Hooks / 可用钩子

### Stage Hooks / 阶段钩子

| Hook Pattern             | Trigger Point          | Use Case                 |
| ------------------------ | ---------------------- | ------------------------ |
| `pre_stage_{STAGE}`      | Before entering stage  | Validation, preparation  |
| `post_stage_{STAGE}`     | After completing stage | Review, documentation    |
| `on_stage_{STAGE}_error` | On stage error         | Error handling, recovery |

### Task Hooks / 任务钩子

| Hook Pattern              | Trigger Point         | Use Case              |
| ------------------------- | --------------------- | --------------------- |
| `pre_task_{task_id}`      | Before task execution | Dependency check      |
| `post_task_{task_id}`     | After task completion | Verification, logging |
| `on_task_{task_id}_error` | On task error         | Error handling        |

### Global Hooks / 全局钩子

| Hook           | Trigger Point             | Use Case                |
| -------------- | ------------------------- | ----------------------- |
| `quality_gate` | Before quality checks     | Custom quality rules    |
| `pre_delivery` | Before final delivery     | Final review            |
| `on_blocked`   | When workflow blocked     | Blocker analysis        |
| `on_waiting`   | When waiting for external | Status notification     |
| `on_error`     | On any error              | Error logging, alerting |
| `on_complete`  | Workflow completion       | Cleanup, reporting      |

## Skill Interface / 技能接口

### Required Interface / 必需接口

Injected skills should follow this interface:

```yaml
# Skill Input
input:
  workflow_context:
    id: string           # Workflow ID
    level: string        # L1, L2, L3
    status: string       # Current state
    stage: string        # Current stage
    working_dir: string  # Workflow directory path

  hook_context:
    hook_name: string    # Hook that triggered
    timing: string       # pre, during, post
    previous_result: any # Result from previous skill

  skill_config: object   # Skill-specific config

# Skill Output
output:
  status: success|warning|error
  message: string
  artifacts: []string    # Generated files
  metrics: object        # Optional metrics
  recommendations: []string
  block_workflow: bool   # If true, blocks progression
```

### Example Skill Implementation / 示例实现

```markdown
---
name: "custom-validator"
description: "Custom validation skill for injection. Invoke during quality gates."
---

# Custom Validator

## Input Processing

1. Read `workflow_context` from injection
2. Access workflow directory: `{working_dir}/`
3. Read skill config for validation rules

## Execution

1. Load files to validate
2. Apply custom rules from config
3. Generate validation report

## Output

Return structured output:

- `status`: success/warning/error
- `message`: Validation summary
- `artifacts`: List of generated reports
- `block_workflow`: true if critical issues found
```

## Injection Patterns / 注入模式

### Pattern 1: Sequential Validation / 顺序验证

```yaml
injected_skills:
  - stage: IMPLEMENTING
    skill: lint-checker
    timing: post
    order: 1
    required: true

  - stage: IMPLEMENTING
    skill: type-checker
    timing: post
    order: 2
    required: true

  - stage: IMPLEMENTING
    skill: test-runner
    timing: post
    order: 3
    required: true
```

### Pattern 2: Parallel Execution / 并行执行

```yaml
injected_skills:
  - stage: TESTING
    skill: unit-test-runner
    timing: during
    parallel_group: "tests"

  - stage: TESTING
    skill: integration-test-runner
    timing: during
    parallel_group: "tests"

  - stage: TESTING
    skill: e2e-test-runner
    timing: during
    parallel_group: "tests"
```

### Pattern 3: Conditional Injection / 条件注入

```yaml
injected_skills:
  - stage: DESIGNING
    skill: security-review
    timing: post
    condition:
      when: "level == 'L3' OR tags contains 'security'"

  - stage: IMPLEMENTING
    skill: performance-profiler
    timing: post
    condition:
      when: "tags contains 'performance-critical'"
```

### Pattern 4: Fallback Chain / 降级链

```yaml
injected_skills:
  - stage: TESTING
    skill: primary-test-runner
    timing: during
    fallback:
      - skill: backup-test-runner
        on: "error"
      - skill: manual-test-prompt
        on: "all_failed"
```

## Configuration Templates / 配置模板

### Standard L2 Workflow / 标准 L2 工作流

```yaml
# .trae/skills/requirement-workflow/examples/l2-standard.yaml
injected_skills:
  - stage: ANALYZING
    skill: requirement-clarifier
    timing: during

  - stage: DESIGNING
    skill: code-reviewer
    timing: post
    config:
      focus: ["architecture"]

  - stage: IMPLEMENTING
    skill: lint-checker
    timing: post
    required: true

  - stage: TESTING
    skill: test-coverage-checker
    timing: pre
    config:
      min_coverage: 70

hooks:
  quality_gate:
    - skill: type-checker
      required: true

  pre_delivery:
    - skill: changelog-generator
```

### Security-focused L3 Workflow / 安全导向 L3 工作流

```yaml
# .trae/skills/requirement-workflow/examples/l3-security.yaml
injected_skills:
  - stage: ANALYZING
    skill: threat-modeler
    timing: post
    required: true

  - stage: DESIGNING
    skill: security-reviewer
    timing: post
    required: true
    config:
      check: ["injection", "auth", "crypto"]

  - stage: IMPLEMENTING
    skill: sast-scanner
    timing: during
    trigger: "on_file_save"

  - stage: TESTING
    skill: dast-scanner
    timing: during
    required: true

  - stage: DELIVERING
    skill: compliance-checker
    timing: pre
    required: true

hooks:
  on_blocked:
    - skill: security-incident-reporter
```

## Best Practices / 最佳实践

### DO / 推荐

1. **Keep skills focused** - Each skill should do one thing well
2. **Use required sparingly** - Only block workflow for critical checks
3. **Provide fallbacks** - Handle skill failures gracefully
4. **Document config options** - Make skill configuration clear
5. **Log skill execution** - Enable debugging and auditing

### DON'T / 避免

1. **Circular dependencies** - Skill A triggers B triggers A
2. **Long-running skills** - Keep skills under 5 minutes
3. **Silent failures** - Always return meaningful status
4. **Hardcoded paths** - Use workflow_context variables
5. **Modifying workflow state directly** - Use provided interfaces

## Troubleshooting / 故障排除

### Common Issues / 常见问题

| Issue                | Cause                         | Solution                           |
| -------------------- | ----------------------------- | ---------------------------------- |
| Skill not triggered  | Wrong hook name               | Check hook spelling                |
| Skill fails silently | Missing required config       | Add required config                |
| Workflow blocked     | `required: true` skill failed | Fix skill or set `required: false` |
| Duplicate execution  | Multiple hook registrations   | Check for duplicate configs        |

### Debug Mode / 调试模式

Enable debug mode for detailed injection logs:

```yaml
# In workflow.yaml
debug:
  injection_logs: true
  skill_traces: true
  hook_timeline: true
```

View logs:

```bash
./scripts/get-status.sh --debug-logs --workflow-id {id}
```
