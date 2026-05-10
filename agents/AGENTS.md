# 软件工程方法论 Agent

基于经典软件工程著作的通用 Agent。这些 Agent 封装了历久弥新的方法论，可应用于各种场景。

## 组织结构

每个 Agent 是一个文件夹，包含：
- `agent.md` — 核心方法论（通用，不含特定上下文逻辑）

在技能中使用时（如 `requirement-workflow`），请创建改编版本：
1. 引用核心方法论
2. 添加上下文相关逻辑（Hook Point、输出格式等）

## 可用 Agent

### 需求分析

| Agent | Based On | 用途 |
|-------|----------|------|
| [problem-definer](problem-definer/agent.md) | Are Your Lights On? (Weinberg) | 系统化问题定义 |
| [spec-by-example](spec-by-example/agent.md) | Specification by Example (Adzic) | 通过示例创建活文档 |
| [story-mapper](story-mapper/agent.md) | User Story Mapping (Patton) | 用户旅程可视化 |

### 对象与领域建模

| Agent | Based On | 用途 |
|-------|----------|------|
| [responsibility-modeler](responsibility-modeler/agent.md) | Object Design (Wirfs-Brock) | 职责驱动设计 |
| [domain-modeler](domain-modeler/agent.md) | Domain-Driven Design (Evans) | 战略与战术 DDD |

### 架构与设计

| Agent | Based On | 用途 |
|-------|----------|------|
| [architecture-advisor](architecture-advisor/agent.md) | Software Architecture in Practice, DDIA | 质量属性与权衡分析 |

### 实现

| Agent | Based On | 用途 |
|-------|----------|------|
| [refactoring-guide](refactoring-guide/agent.md) | Refactoring (Fowler) | 代码异味识别与重构技术 |
| [tdd-coach](tdd-coach/agent.md) | TDD by Example (Beck) | 测试驱动开发指导 |
| [legacy-surgeon](legacy-surgeon/agent.md) | Working Effectively with Legacy Code (Feathers) | 安全修改遗留代码 |

### 测试

| Agent | Based On | 用途 |
|-------|----------|------|
| [test-strategist](test-strategist/agent.md) | Agile Testing, xUnit Patterns | 测试策略与规划 |

## 使用模式

### 直接使用（通用）

```
AI: Use problem-definer agent to analyze this requirement...
```

### 通过技能使用（改编版）

```
# 在 requirement-workflow 技能中：
# 使用带有 Hook Point 和工作流集成的改编版本
AI: Launching problem-definer at pre_stage_ANALYZING...
```

## 贡献指南

更新 Agent 时：
1. 更新 `agents/{agent-name}/agent.md` 中的核心版本
2. 将变更同步到技能目录中的改编版本
3. 遵循同步规则：`.trae/rules/agent-sync.md`

## 参考资料

各 Agent 的 `agent.md` 中包含了对源材料的详细引用。
