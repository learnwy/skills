# 快速参考——需求工作流（SDD）

## 模式选择

```
是否为缺陷修复且规模为 tiny/small？  →  Agent 模式（快速路径）
是否为 medium+ 或 elevated+ 风险？    →  Spec 模式（完整 SDD）
不确定？                              →  默认 Agent 模式，范围扩大时升级
```

## 阶段流程

```
Agent 模式：INIT → IMPLEMENTING → TESTING → DONE
Spec 模式：  INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

## 分类快速表

| 关键词 | 类型 | 默认规模 | 默认风险 |
|--------|------|----------|----------|
| fix、bug、broken、crash、error | bugfix | small | normal |
| add、create、implement、build、feature | feature | small | normal |
| refactor、clean、reorganize、simplify | refactor | small | normal |
| upgrade、migrate、tech-debt、deprecate | tech-debt | medium | elevated |
| auth、payment、security、PII、encrypt | any | any | critical |

## SDD 产物模板

### spec.md（EARS 格式）

```
When <条件>, the system shall <响应>
While <状态>, the system shall <行为>
Where <约束>, the system shall <限制>
```

### tasks.md（按阶段）

```
## Phase 1: Foundation
- [ ] Task 1.1 [files: x]
## Phase 2: Core
- [ ] Task 2.1 [files: y]
```

### checklist.md

```
- [ ] 实现完成
- [ ] Lint 检查通过
- [ ] 类型检查通过
- [ ] 测试通过
- [ ] 验收标准已验证
```

## 检查点决策

| 阶段 | 暂停条件 |
|------|----------|
| DEFINING | 风险 ≥ elevated |
| PLANNING | 规模 = large 或 风险 ≥ elevated |
| DESIGNING | 规模 ≥ medium 或 风险 ≥ elevated |
| TESTING | 始终 |

## 脚本命令

```bash
node scripts/cli.cjs init -r . -n "name" -t feature -s medium -k normal
node scripts/cli.cjs advance -r .
node scripts/cli.cjs status -r .
node scripts/cli.cjs hooks -r . list
```

## Agent 快速查找

| 需求 | Agent |
|------|-------|
| 审计 PRD | iron-audit-pm |
| 定义真正的问题 | problem-definer |
| 扫描风险 | risk-auditor |
| 映射用户故事 | story-mapper |
| 冻结 MVP 范围 | mvp-freeze-architect |
| 建模领域实体 | domain-modeler |
| 架构质量分析 | architecture-advisor |
| TDD 指导 | tdd-coach |
| 测试策略 | test-strategist |
| 代码审查 | code-reviewer |
| 设计审查 | tech-design-reviewer |
| 解除阻塞 | blocker-resolver |
