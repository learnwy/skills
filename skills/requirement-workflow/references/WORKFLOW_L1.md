# L1: Quick Workflow / 快速流程

快速修复和小改动的精简工作流。

## Overview / 概览

```
INIT → PLANNING → IMPLEMENTING → TESTING → DONE
```

| 属性 | 值 |
|------|-----|
| 目标时间 | < 1 小时 |
| 产出物 | tasks.md, checklist.md |
| 跳过 | spec.md, design.md |
| 适用 | Bug 修复, 小改动, 配置变更 |

## Stages / 阶段详情

### Stage 1: INIT → PLANNING

**触发:** 工作流初始化完成后

**AI 执行:**
1. 快速分析问题/需求
2. 直接规划修复方案
3. 创建简单任务列表 (`tasks.md`)

**产出:**
```markdown
# Tasks

- [ ] 定位问题位置
- [ ] 实现修复
- [ ] 验证修复效果
```

**状态转换:**
```bash
./scripts/advance-stage.sh -r /project --to PLANNING
```

### Stage 2: PLANNING → IMPLEMENTING

**触发:** 任务规划完成

**AI 执行:**
1. 按任务列表逐项执行
2. 使用 TodoWrite 跟踪进度
3. 每完成一项标记 ✅

**注意事项:**
- L1 不需要详细设计文档
- 直接进入编码

**状态转换:**
```bash
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
```

### Stage 3: IMPLEMENTING → TESTING

**触发:** 所有任务完成

**AI 执行:**
1. 运行相关测试
2. 执行基础质量检查:
   - Lint check
   - Type check (如适用)
3. 更新 `checklist.md`

**产出:**
```markdown
# Checklist

- [x] 代码修改完成
- [x] 本地测试通过
- [ ] Lint 检查通过
- [ ] 相关单元测试通过
```

**状态转换:**
```bash
./scripts/advance-stage.sh -r /project --to TESTING
```

### Stage 4: TESTING → DONE

**触发:** 所有检查通过

**AI 执行:**
1. 确认所有 checklist 项目已完成
2. 简要总结变更
3. 标记工作流完成

**状态转换:**
```bash
./scripts/advance-stage.sh -r /project --to DONE
```

## Complete Example / 完整示例

### 场景: 修复登录按钮点击无响应

```
User: 登录按钮点击没反应，帮我修一下

AI: 这是一个明确的 bug，我使用 L1 快速流程。

📊 需求分析:
- 类型: bugfix  
- 级别: L1
- 影响: 1 个文件

正在初始化工作流...

✅ Workflow: 20240115_001_bugfix_fix-login-button
📁 .trae/workflow/20240115_001_bugfix_fix-login-button/

---

[PLANNING] 分析问题并规划修复

让我检查登录按钮的代码...

发现问题: onClick handler 中有 typo，调用了不存在的函数

📋 任务列表:
1. 修复 LoginButton.tsx 中的函数名 typo
2. 验证按钮点击正常

推进到 IMPLEMENTING...

---

[IMPLEMENTING] 执行修复

修改文件: src/components/LoginButton.tsx
- 将 `handleLgoin` 改为 `handleLogin`

✅ 任务 1 完成

推进到 TESTING...

---

[TESTING] 验证修复

执行检查:
- ✅ TypeScript 编译通过
- ✅ ESLint 无新错误
- ✅ 相关测试通过

推进到 DONE...

---

[DONE] 工作流完成

📋 修复总结:
- 修复了 LoginButton.tsx 中的函数名 typo
- 变更文件: 1 个
- 用时: ~5 分钟

✅ Bug 已修复，登录按钮现在可以正常点击了。
```

## Skip Conditions / 跳过条件

L1 流程可以跳过:

| 阶段 | 可跳过? | 原因 |
|------|---------|------|
| ANALYZING | ✅ 跳过 | 问题已明确 |
| DESIGNING | ✅ 跳过 | 不需要设计 |
| DELIVERING | ✅ 跳过 | 无需正式交付 |

## Quality Gate / 质量门禁

L1 的最小质量检查:

```yaml
quality_gate:
  lint: required
  type_check: required (if applicable)
  unit_tests: optional
  integration_tests: skip
```

## Hooks / 可用钩子

```
quality_gate           # 测试前执行
on_error              # 出错时执行
```

## Escalation / 升级条件

如果在 L1 执行过程中发现:

- 问题比预期复杂
- 需要修改多个模块
- 需要设计讨论

**应升级到 L2:**

```bash
# 在 workflow.yaml 中记录
escalated_from: L1
escalation_reason: "发现问题涉及多个模块"
level: L2
```
