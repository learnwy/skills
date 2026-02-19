---
name: "requirement-workflow"
description: "状态机驱动的软件功能开发编排器。当用户要开发新功能、修复 bug、重构代码时触发。关键词: 开发需求、新功能、开始开发、继续开发、feature、bugfix、refactor。"
---

# Requirement Workflow Orchestrator

状态机驱动的软件功能开发编排器，为不同复杂度的需求提供结构化的开发流程。

## When to Use / 何时使用

**触发此 Skill:**
- 用户说 "开发一个新功能" / "实现 xxx 功能"
- 用户说 "修复这个 bug" / "fix this issue"
- 用户说 "重构 xxx" / "refactor xxx"
- 用户询问 "当前开发进度" / "流程状态"
- 关键词: feature, bugfix, refactor, hotfix, 开发需求, 新功能

**不要触发此 Skill:**
- 简单问答或代码解释（无需流程跟踪）
- 单行代码修改（太简单不需要工作流）
- 已有活动工作流时只需查看状态（直接用 `get-status.sh`）
- 用户明确说"不需要工作流"

## Quick Start / 快速开始

### Step 1: 判断需求级别

| 级别 | 名称 | 适用场景 | 预估时间 |
|------|------|----------|----------|
| **L1** | Quick | Bug 修复、配置修改、小调整 | < 1h |
| **L2** | Standard | 常规功能开发、API 变更 | 1-8h |
| **L3** | Full | 复杂功能、跨模块、安全敏感 | > 8h |

> 📖 详细判断标准见 [Level Selection Guide](references/LEVEL_SELECTION.md)

### Step 2: 初始化工作流

```bash
./scripts/init-workflow.sh -r <项目根目录> -n <需求名称> -t <类型> [-l <级别>]
```

**输入参数:**
- `-r, --root` (必需): 项目根目录
- `-n, --name` (必需): 需求名称（英文，用短横线连接）
- `-t, --type`: feature | bugfix | refactor | hotfix (默认: feature)
- `-l, --level`: L1 | L2 | L3 (默认: L2)

**输出:**
- 创建 `.trae/workflow/{date}_{seq}_{type}_{name}/` 目录
- 设置为活动工作流 (`.trae/active_workflow`)

### Step 3: 执行对应级别的工作流

根据级别执行不同的流程:

| 级别 | 流程 | 详细文档 |
|------|------|----------|
| L1 | 规划 → 实现 → 验证 | [L1 Workflow](references/WORKFLOW_L1.md) |
| L2 | 分析 → 设计 → 实现 → 验证 → 交付 | [L2 Workflow](references/WORKFLOW_L2.md) |
| L3 | 深度分析 → 架构设计 → 实现 → 测试 → 审批 → 交付 | [L3 Workflow](references/WORKFLOW_L3.md) |

### Step 4: 推进与状态管理

```bash
# 查看当前状态
./scripts/get-status.sh -r <项目根目录>

# 推进到下一阶段
./scripts/advance-stage.sh -r <项目根目录>

# 生成报告
./scripts/generate-report.sh -r <项目根目录>
```

## Stage Execution Pattern / 阶段执行模式

**每个阶段必须遵循以下结构:**

### 1. 阶段开始 (Planning)

```
📍 [STAGE_NAME] 阶段开始

🎯 本阶段目标:
- {目标1}
- {目标2}

📋 本阶段任务:
1. {任务1}
2. {任务2}
3. {任务3}

📄 本阶段产出:
- {产出文件1}
- {产出文件2}
```

### 2. 阶段执行

- 使用 TodoWrite 跟踪每个任务进度
- 按任务列表顺序执行
- 实时更新产出文件

### 3. 阶段完成 (Summary)

```
✅ [STAGE_NAME] 阶段完成

📊 执行摘要:
- 完成任务: {N}/{M}
- 耗时: {duration}

📄 产出物:
- {文件1}: {简要说明}
- {文件2}: {简要说明}

➡️ 下一阶段: {NEXT_STAGE}
准备工作: {下一阶段需要的前置条件}
```

### 阶段文档定义 (Stage Documents)

每个阶段都有明确的**入口文档**和**出口文档**：

| 阶段 | 入口文档 (前置条件) | 出口文档 (必须产出) |
|------|---------------------|---------------------|
| **ANALYZING** | 用户需求描述 | `spec.md` (PRD/需求规格) |
| **PLANNING** | `spec.md` | `tasks.md` (任务拆分) |
| **DESIGNING** | `spec.md`, `tasks.md` | `design.md` (技术方案) |
| **IMPLEMENTING** | `design.md`, `tasks.md` | 代码文件, `logs/impl.md` |
| **TESTING** | 代码文件 | `checklist.md` (测试报告) |
| **DELIVERING** | `checklist.md` (全部通过) | `artifacts/report.md` (交付报告) |

### 文档详细说明

#### 1. spec.md - 需求规格/PRD
**产出阶段:** ANALYZING
**内容:**
- 背景与目标
- 用户故事
- 功能范围（In/Out Scope）
- 验收标准
- 约束条件

#### 2. tasks.md - 任务拆分
**产出阶段:** PLANNING
**内容:**
- 任务列表（按优先级）
- 估时
- 依赖关系
- 负责人（如适用）

#### 3. design.md - 技术设计方案
**产出阶段:** DESIGNING
**内容:**
- 方案概述
- 架构设计
- API 设计（如适用）
- 数据模型
- 风险评估

#### 4. logs/impl.md - 开发日志
**产出阶段:** IMPLEMENTING
**内容:**
- 实现进度
- 遇到的问题及解决方案
- 代码变更摘要

#### 5. checklist.md - 测试检查清单
**产出阶段:** TESTING
**内容:**
- 代码质量检查（Lint, Type）
- 测试结果
- 覆盖率
- 安全检查（如适用）

#### 6. artifacts/report.md - 交付报告
**产出阶段:** DELIVERING
**内容:**
- 工作流摘要
- 完成的任务
- 变更列表
- 测试结果
- 后续建议

## Workflow Levels Overview / 流程级别概览

### L1: Quick Workflow (快速流程)

```
INIT → PLANNING → IMPLEMENTING → TESTING → DONE
```

- **不需要**: spec.md, design.md
- **需要**: tasks.md, checklist.md
- **适合**: 明确的小修改，风险低

### L2: Standard Workflow (标准流程)

```
INIT → ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

- **全部产出物**: spec.md, design.md, tasks.md, checklist.md, report.md
- **适合**: 大多数功能开发

### L3: Full Workflow (完整流程)

```
INIT → ANALYZING(extended) → PLANNING(extended) → DESIGNING(extended) → IMPLEMENTING → TESTING → DELIVERING → DONE
```

- **扩展阶段**: 威胁建模、架构审查、合规检查
- **强制审批**: 安全团队 / Tech Lead 签字
- **适合**: 安全敏感、跨模块、破坏性变更

## Working Directory / 工作目录结构

```
.trae/
├── active_workflow          # 当前活动工作流路径
└── workflow/
    └── {date}_{seq}_{type}_{name}/
        ├── workflow.yaml    # 流程状态
        ├── spec.md          # 需求规格 (L2, L3)
        ├── design.md        # 技术设计 (L2, L3)
        ├── tasks.md         # 任务列表
        ├── checklist.md     # 验收清单
        ├── logs/            # 阶段日志
        └── artifacts/       # 产出物
```

## Scripts Reference / 脚本参考

| 脚本 | 功能 | 必需参数 |
|------|------|----------|
| `init-workflow.sh` | 初始化工作流 | `-r ROOT`, `-n NAME` |
| `get-status.sh` | 查看状态 | `-r ROOT` |
| `advance-stage.sh` | 推进阶段 | `-r ROOT` |
| `inject-skill.sh` | 注入技能 | `-r ROOT` |
| `generate-report.sh` | 生成报告 | `-r ROOT` |

> 📖 详细用法见 [Scripts Reference](references/SCRIPTS_REFERENCE.md)

## Examples / 使用示例

### Example 1: Bug Fix (L1)

```
User: 帮我修复登录页面的空指针问题

AI: 这是一个明确的 bug 修复，我选择 L1 快速流程。

📊 需求分析:
- 类型: bugfix
- 级别: L1 (Quick)
- 影响范围: 1个文件

正在初始化工作流...
✅ Workflow: 20240115_001_bugfix_fix-login-null

开始 L1 流程:
1. [PLANNING] 定位问题并规划修复方案
2. [IMPLEMENTING] 执行修复
3. [TESTING] 验证修复

---详见 L1 工作流执行---
```

### Example 2: New Feature (L2)

```
User: 我需要实现一个用户头像上传功能

AI: 这是一个标准功能开发，我选择 L2 标准流程。

📊 需求分析:
- 类型: feature
- 级别: L2 (Standard)
- 影响模块: 用户模块, 存储模块

正在初始化工作流...
✅ Workflow: 20240115_002_feature_user-avatar-upload

开始 L2 流程:
1. [ANALYZING] 需求澄清
2. [PLANNING] 技术方案
3. [DESIGNING] 详细设计
4. [IMPLEMENTING] 编码实现
5. [TESTING] 测试验证
6. [DELIVERING] 交付

---详见 L2 工作流执行---
```

### Example 3: Security Feature (L3)

```
User: 需要集成 OAuth 2.0 第三方登录

AI: 这是安全敏感的功能，我选择 L3 完整流程。

📊 需求分析:
- 类型: feature
- 级别: L3 (Full)
- 安全等级: 高
- 需要: 威胁建模、安全审查

正在初始化工作流...
✅ Workflow: 20240115_003_feature_oauth-integration

开始 L3 流程:
1. [ANALYZING] 深度需求分析 + 威胁建模
2. [PLANNING] 资源规划 + 风险评估
3. [DESIGNING] 架构设计 + 安全审查
4. [IMPLEMENTING] 编码实现
5. [TESTING] 安全测试 + 渗透测试
6. [DELIVERING] 合规签字 + 交付

---详见 L3 工作流执行---
```

> 📖 更多示例见 [Usage Examples](examples/)

## References / 参考文档

### Workflow Details / 工作流详情
- [L1 Quick Workflow](references/WORKFLOW_L1.md)
- [L2 Standard Workflow](references/WORKFLOW_L2.md)
- [L3 Full Workflow](references/WORKFLOW_L3.md)

### Technical References / 技术参考
- [Level Selection Guide](references/LEVEL_SELECTION.md)
- [Scripts Reference](references/SCRIPTS_REFERENCE.md)
- [State Machine Specification](references/STATE_MACHINE.md)
- [Skill Injection Guide](references/INJECTION_GUIDE.md)

### Templates / 模板
- [Workflow Templates](assets/)
- [Example Configurations](examples/)
