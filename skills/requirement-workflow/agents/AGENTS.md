# Agent 注册表

按 SDD 生命周期阶段组织的 Agent。

## 阶段：DEFINING（需求）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [iron-audit-pm](iron-audit-pm.md) | PRD 审计、DNA 提取、范围裁剪 | `pre_stage_DEFINING` |
| [risk-auditor](risk-auditor.md) | 策略、成本、执行风险扫描 | `pre_stage_DEFINING` |
| [problem-definer](problem-definer.md) | Weinberg 问题定义 | `pre_stage_DEFINING` |
| [spec-by-example](spec-by-example.md) | Adzic 实例化需求 | `pre_stage_DEFINING` |

## 阶段：PLANNING（任务分解）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [story-mapper](story-mapper.md) | Patton 故事地图 | `pre_stage_PLANNING` |
| [mvp-freeze-architect](mvp-freeze-architect.md) | 范围冻结、V1 提取 | `pre_stage_PLANNING` |

## 阶段：DESIGNING（架构）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [domain-modeler](domain-modeler.md) | DDD/Evans 领域建模 | `pre_stage_DESIGNING` |
| [architecture-advisor](architecture-advisor.md) | 质量属性分析（Bass/Clements） | `pre_stage_DESIGNING` |
| [responsibility-modeler](responsibility-modeler.md) | CRC 卡片（Wirfs-Brock） | `pre_stage_DESIGNING` |

## 阶段：IMPLEMENTING（编码）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [tdd-coach](tdd-coach.md) | Beck TDD：Red → Green → Refactor | `pre_stage_IMPLEMENTING` |
| [refactoring-guide](refactoring-guide.md) | Fowler 重构模式 | `pre_stage_IMPLEMENTING` |
| [legacy-surgeon](legacy-surgeon.md) | Feathers 遗留代码技术 | `pre_stage_IMPLEMENTING` |

## 阶段：TESTING（验证）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [test-strategist](test-strategist.md) | Crispin 测试象限 | `pre_stage_TESTING` |
| [test-strategy-advisor](test-strategy-advisor.md) | 基于变更的测试优先级 | `pre_stage_TESTING` |
| [code-reviewer](code-reviewer.md) | 结构化代码审查 | `pre_stage_TESTING` |
| [error-analyzer](error-analyzer.md) | 运行时错误分析 | `pre_stage_TESTING` |

## 阶段：DELIVERING（最终审查）

| Agent | 方法论 | 钩子触发点 |
|-------|--------|-----------|
| [tech-design-reviewer](tech-design-reviewer.md) | 架构审查 | `post_stage_DELIVERING` |

## 跨阶段（任何阶段可用）

| Agent | 用途 | 触发条件 |
|-------|------|----------|
| [blocker-resolver](blocker-resolver.md) | 解除工作流阻塞 | 按需 |

## Agent 调用方式

Agent 通过 Task 工具作为子 agent 调用：

```
Task(subagent_type="<agent-type>", query="<来自工作流的上下文>")
```

方法论类 agent（只读分析）使用 `subagent_type="search"`。
操作类 agent（代码审查、错误分析）使用 `subagent_type="general_purpose_task"`。
