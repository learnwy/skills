---
description: 在通用、适配和独立副本之间同步代理
globs: agents/*.md,agents/**/agent.md
alwaysApply: false
---

# 代理同步规则

## 架构

```
agents/{name}/agent.md                          # 通用版（权威）
skills/{skill}/agents/{name}.md                 # 适配版（技能专属）
skills/software-methodology-toolkit/agents/     # 独立版（按阶段分组）
```

## 同步规则

**更新通用版** → 同步到适配版 + 独立版。

**更新适配版** → 如果是方法论变更：先更新通用版。如果仅是上下文调整：保持本地修改。

**更新独立版** → 从通用版完整复制，不做修改。

## 当前映射关系

| 通用版 | 适配版（所属技能） | 独立版（phase/） |
|--------|-------------------|------------------|
| problem-definer | requirement-workflow | analyzing/ |
| spec-by-example | requirement-workflow | analyzing/ |
| story-mapper | requirement-workflow | planning/ |
| domain-modeler | requirement-workflow | designing/ |
| architecture-advisor | requirement-workflow | designing/ |
| responsibility-modeler | requirement-workflow | designing/ |
| tdd-coach | requirement-workflow | implementing/ |
| refactoring-guide | requirement-workflow | implementing/ |
| legacy-surgeon | requirement-workflow | implementing/ |
| test-strategist | requirement-workflow | testing/ |

## 检查清单

编辑任何代理时：

- [ ] 通用版已更新？
- [ ] 技能中的适配版已同步？
- [ ] software-methodology-toolkit 中的独立版已同步？
- [ ] 适配版中的钩子点已保留？

**注意：** software-methodology-toolkit 是兜底技能（优先级低于 requirement-workflow）。
