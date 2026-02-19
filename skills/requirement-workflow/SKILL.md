---
name: "requirement-workflow"
description: "状态机驱动的软件功能开发总控编排器。当需要启动或推进一个完整的、遵循现代化软件工程实践的功能开发流程时使用。"
---

# Requirement Workflow Orchestrator

# 需求开发流程编排器

A state-machine driven orchestrator for software feature development lifecycle.

## When to Use / 触发条件

Invoke this skill when:

- User wants to start developing a new feature or requirement
- User needs to continue an existing development workflow
- User asks about development process status
- Keywords: "开发需求", "新功能", "开始开发", "继续开发", "流程状态"

## Core Concepts / 核心概念

### 1. Workflow Levels / 流程级别

根据需求复杂度自动选择合适的流程级别：

| Level  | Name     | Stages                                       | Use When              |
| ------ | -------- | -------------------------------------------- | --------------------- |
| **L1** | Quick    | 规划 → 实现 → 验证                           | 简单 bug 修复，小改动 |
| **L2** | Standard | 需求澄清 → 技术方案 → 任务拆分 → 实现 → 验证 | 常规功能开发          |
| **L3** | Full     | 需求分析 → 设计 → 开发 → 测试 → 交付         | 复杂功能，跨模块变更  |

### 2. State Machine / 状态机

```
[INIT] → [ANALYZING] → [PLANNING] → [DESIGNING] → [IMPLEMENTING] → [TESTING] → [DELIVERING] → [DONE]
           ↓              ↓             ↓              ↓              ↓
        [BLOCKED]     [BLOCKED]     [BLOCKED]      [BLOCKED]      [BLOCKED]
           ↓              ↓             ↓              ↓              ↓
        [WAITING]     [WAITING]     [WAITING]      [WAITING]      [WAITING]
```

### 3. Working Directory / 工作目录

All workflow artifacts are stored in:

```
.trae/workflow/{date}_{seq}_{type}_{name}/
├── workflow.yaml          # 流程状态和元数据
├── spec.md                # 需求规格说明
├── design.md              # 技术设计文档
├── tasks.md               # 任务拆分清单
├── checklist.md           # 验收检查清单
├── logs/                  # 阶段执行日志
└── artifacts/             # 产出物存档
```

## Execution Steps / 执行步骤

### Phase 0: Initialization / 初始化

1. **Analyze Requirement Complexity**

   ```
   Read user's requirement description
   Evaluate: scope, affected modules, risk level, estimated effort
   Determine workflow level: L1 | L2 | L3
   ```

2. **Create Working Directory**

   ```bash
   # Execute: scripts/init-workflow.sh
   DATE=$(date +%Y%m%d)
   SEQ=$(next_sequence_number)
   TYPE=feature|bugfix|refactor|hotfix
   NAME=sanitized_requirement_name

   mkdir -p .trae/workflow/${DATE}_${SEQ}_${TYPE}_${NAME}
   ```

3. **Initialize workflow.yaml**
   ```yaml
   id: {DATE}_{SEQ}_{TYPE}_{NAME}
   level: L1|L2|L3
   status: INIT
   created_at: {timestamp}
   updated_at: {timestamp}
   current_stage: null
   stages: []
   hooks: {}
   injected_skills: []
   ```

### Phase 1: Requirement Analysis / 需求分析

**Applicable Levels:** L2, L3

1. Read and parse user's requirement
2. Generate clarifying questions if needed
3. Document in `spec.md`:
   - Background / 背景
   - Goals / 目标
   - Scope / 范围
   - Constraints / 约束条件
   - Acceptance Criteria / 验收标准
4. Update state: `ANALYZING → PLANNING`

### Phase 2: Technical Design / 技术设计

**Applicable Levels:** L2, L3

1. Analyze existing codebase for related components
2. Design solution architecture
3. Document in `design.md`:
   - Solution Overview / 方案概述
   - Component Interactions / 组件交互
   - Data Flow / 数据流
   - API Changes / API 变更
   - Risk Assessment / 风险评估
4. **Hook Point: `pre_design_review`**
5. Update state: `PLANNING → DESIGNING`

### Phase 3: Task Breakdown / 任务拆分

**Applicable Levels:** L1, L2, L3

1. Break down into actionable tasks
2. Document in `tasks.md` with TodoWrite format
3. Estimate complexity for each task
4. **Hook Point: `post_task_breakdown`**
5. Update state: `DESIGNING → IMPLEMENTING`

### Phase 4: Implementation / 实现

**Applicable Levels:** L1, L2, L3

1. Execute tasks sequentially using TodoWrite
2. For each task:
   - **Hook Point: `pre_task_{task_id}`**
   - Execute implementation
   - Run relevant checks
   - **Hook Point: `post_task_{task_id}`**
   - Log completion in `logs/`
3. Update state: `IMPLEMENTING → TESTING`

### Phase 5: Testing & Verification / 测试验证

**Applicable Levels:** L1, L2, L3

1. Run automated tests
2. Execute quality gates:
   - Lint check
   - Type check
   - Unit tests
   - Integration tests (if applicable)
3. **Hook Point: `quality_gate`**
4. Update `checklist.md` status
5. Update state: `TESTING → DELIVERING`

### Phase 6: Delivery / 交付

**Applicable Levels:** L2, L3

1. Generate final report
2. Document in `artifacts/`:
   - Changes summary
   - Test results
   - Deployment notes
3. **Hook Point: `pre_delivery`**
4. Update state: `DELIVERING → DONE`

## Skill Injection / 技能注入

### Configuration-based Injection / 配置式注入

In `workflow.yaml`:

```yaml
injected_skills:
  - stage: DESIGNING
    skill: code-reviewer
    timing: post
  - stage: IMPLEMENTING
    skill: unit-test-generator
    timing: pre
  - stage: TESTING
    skill: security-scanner
    timing: during
```

### Hook-based Injection / 钩子式注入

Available hooks:

```
pre_stage_{stage_name}   # Before entering a stage
post_stage_{stage_name}  # After completing a stage
pre_task_{task_id}       # Before executing a task
post_task_{task_id}      # After completing a task
quality_gate             # Before quality verification
pre_delivery             # Before final delivery
on_blocked               # When workflow is blocked
on_error                 # When an error occurs
```

## Helper Tools / 辅助工具

### scripts/init-workflow.sh

Initialize new workflow directory and state file.

### scripts/advance-stage.sh

Advance workflow to next stage with validation.

### scripts/get-status.sh

Get current workflow status and progress.

### scripts/inject-skill.sh

Inject a skill into specific stage hook.

### scripts/generate-report.sh

Generate workflow summary report.

## State Transitions / 状态转换

Valid transitions:

```
INIT → ANALYZING (L2, L3)
INIT → PLANNING (L1)
ANALYZING → PLANNING
PLANNING → DESIGNING (L2, L3)
PLANNING → IMPLEMENTING (L1)
DESIGNING → IMPLEMENTING
IMPLEMENTING → TESTING
TESTING → DELIVERING (L2, L3)
TESTING → DONE (L1)
DELIVERING → DONE

Any → BLOCKED (on blocker)
Any → WAITING (on external dependency)
BLOCKED → Previous State (on unblock)
WAITING → Previous State (on dependency resolved)
```

## Output Format / 输出规范

When reporting status, use this format:

```
📋 Workflow: {name}
📊 Level: L{n} ({level_name})
🔄 Status: {current_state}
📍 Stage: {current_stage} ({progress}%)
📝 Current Task: {task_name}
⏰ Duration: {elapsed_time}

Next Steps:
1. {next_action_1}
2. {next_action_2}
```

## Error Handling / 错误处理

1. **Blocker Detected**
   - Log blocker details
   - Transition to BLOCKED state
   - Notify user with resolution options
   - **Trigger Hook: `on_blocked`**

2. **External Dependency**
   - Log dependency details
   - Transition to WAITING state
   - Document what's being waited for
   - Continue when resolved

3. **Quality Gate Failure**
   - Log failure details
   - Keep in TESTING state
   - Provide fix suggestions
   - Re-run after fixes

## References / 参考文档

- [Workflow Level Definitions](references/WORKFLOW_LEVELS.md)
- [State Machine Specification](references/STATE_MACHINE.md)
- [Skill Injection Guide](references/INJECTION_GUIDE.md)
- [Template Files](assets/)
