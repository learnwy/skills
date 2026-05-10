---
name: requirement-workflow
description: "当用户需要构建、实现或开发功能时使用此技能，基于结构化工作流进行编排。编排规格驱动开发（SDD）：spec.md → tasks.md → 实现 → 验证。触发词：'开发功能'、'实现这个'、'build this feature'、'implement'、'add new module'、'fix bug'、'develop'、'create feature'、'new feature'、'build this'，或当模糊需求需要分解为可执行任务时。"
metadata:
  author: "learnwy"
  version: "4.0"
  methodology: "SDD (Spec-Driven Development)"
---

# 需求工作流（SDD）

基于 **规格驱动开发** 的结构化开发编排器：先定义规格，分解为任务，通过质量门禁执行，依据验收标准进行验证。

> **核心原则**：规格是唯一的事实来源。代码遵循规格，而非反过来。

## 前置条件

- Node.js >= 18
- 可写的项目目录，用于存放工作流状态文件（`.trae/workflow/`）

## 快速开始

```
用户说任何关于构建/实现/修复的内容 →
  1. AI 对请求进行分类（类型 + 规模 + 风险）
  2. AI 执行：node scripts/cli.cjs init -r <root> -n <name> -t <type> -s <size> -k <risk>
  3. AI 用结构化需求（EARS 格式）填写 spec.md
  4. AI 将 spec.md 分解为 tasks.md
  5. AI 逐任务实现，推进阶段
  6. AI 依据 checklist.md 进行验证
```

## 工作模式

此技能支持两种模式，根据分类结果选择：

### Agent 模式（默认）

适用于 **小型/微型** 范围或 **缺陷修复** 类型：跳过规格阶段，直接进入实现。

```
INIT → IMPLEMENTING → TESTING → DONE
```

### Spec 模式（SDD）

适用于 **中型/大型** 范围或 **升高/关键** 风险：完整 SDD 生命周期。

```
INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

## 分类矩阵

| 信号 | 类型 | 规模 | 风险 |
|------|------|------|------|
| "fix bug"、"broken"、"crash" | bugfix | tiny-small | normal |
| "add feature"、"implement"、"build" | feature | small-large | normal |
| "refactor"、"clean up"、"reorganize" | refactor | small-medium | normal |
| "tech debt"、"upgrade"、"migrate" | tech-debt | medium-large | elevated |
| 认证、支付、数据、安全相关 | any | any | elevated-critical |
| 预估 >15 个文件 | any | large | elevated |

### 规模启发式

| 规模 | 文件数 | 时长 | 阶段 |
|------|--------|------|------|
| tiny | ≤2 | <30分钟 | INIT → IMPLEMENTING → DONE |
| small | 3-5 | 30分钟-2小时 | INIT → IMPLEMENTING → TESTING → DONE |
| medium | 6-15 | 2小时-1天 | 完整 SDD |
| large | >15 | >1天 | 完整 SDD + 所有检查点 |

## SDD 生命周期

### 阶段 1：INIT

对请求进行分类，初始化工作流，创建产物目录。

```bash
node scripts/cli.cjs init -r <project_root> -n "<name>" -t <type> -s <size> -k <risk>
```

**输出**：`workflow.yaml`、空的 `spec.md`、`tasks.md`、`checklist.md`

### 阶段 2：DEFINING（仅 Spec 模式）

使用 EARS 格式填写 `spec.md` 的结构化需求：

```markdown
# 功能名称

## 背景
{为什么需要这个功能——问题陈述}

## 范围
- 包含：{哪些内容在范围内}
- 排除：{哪些内容不在范围内}

## 验收标准（EARS 格式）
- [ ] When <条件>, the system shall <响应>
- [ ] While <状态>, the system shall <行为>
- [ ] Where <约束>, the system shall <限制>

## 约束
- {性能、安全、兼容性要求}

## 超出范围
- {明确延期的事项}
```

**检查点**：如果风险为 elevated/critical，暂停等待用户审核 spec.md。

**钩子**：`pre_stage_DEFINING` → iron-audit-pm、problem-definer、risk-auditor

### 阶段 3：PLANNING（仅 Spec 模式）

将 spec.md 分解为 `tasks.md`——每个验收标准映射到 ≥1 个任务：

```markdown
# 任务

## 阶段 1：基础
- [ ] 任务 1.1：{描述} [files: x, y]
- [ ] 任务 1.2：{描述} [files: z]

## 阶段 2：核心逻辑
- [ ] 任务 2.1：{描述} [files: a, b]

## 阶段 3：集成与打磨
- [ ] 任务 3.1：{描述} [files: c]

## 验证
- [ ] 所有验收标准通过
- [ ] Lint 检查通过
- [ ] 类型检查通过
```

**规则**：每个任务必须是原子性的（可独立完成）且可追溯到某个规格项。

**钩子**：`pre_stage_PLANNING` → story-mapper、mvp-freeze-architect

### 阶段 4：DESIGNING（仅 Spec 模式）

创建 `design.md`（仅限 medium+ 规模），记录架构决策：

- 组件结构
- 数据流
- API 契约
- 关键权衡

**检查点**：如果风险为 elevated/critical，暂停等待用户审核。

**钩子**：`pre_stage_DESIGNING` → domain-modeler、architecture-advisor、responsibility-modeler

### 阶段 5：IMPLEMENTING

按顺序执行 tasks.md 中的任务。对于每个任务：

1. 阅读任务描述
2. 实现变更
3. 在 tasks.md 中将任务标记为 `[x]`
4. 如果有可用测试则运行

**钩子**：`pre_stage_IMPLEMENTING` → tdd-coach

### 阶段 6：TESTING

运行完整测试套件。更新 `checklist.md`：

```markdown
# 检查清单

## 代码质量
- [ ] 实现完成
- [ ] Lint 检查通过（运行 lint 命令）
- [ ] 类型检查通过（运行 typecheck 命令）

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过（如适用）

## 验收标准
- [ ] AC 1：{来自规格的标准}——已验证
- [ ] AC 2：{来自规格的标准}——已验证

## 审查
- [ ] 自审完成
- [ ] 无未解决的 TODO/FIXME
```

**钩子**：`pre_stage_TESTING` → test-strategy-advisor、test-strategist、code-reviewer

### 阶段 7：DELIVERING（仅 Spec 模式）

针对 spec.md 的最终验证。确保每个验收标准都已满足。

**钩子**：`post_stage_DELIVERING` → code-reviewer、tech-design-reviewer

### 阶段 8：DONE

工作流完成。输出摘要：
- 交付了什么
- 变更了哪些文件
- 测试通过情况
- 耗时

## 阶段推进

```bash
# 检查当前状态
node scripts/cli.cjs status -r <project_root>

# 推进到下一阶段
node scripts/cli.cjs advance -r <project_root>

# 强制推进（跳过检查点）
node scripts/cli.cjs advance -r <project_root> --force
```

## 钩子系统

钩子是在阶段转换时运行的 agent/skill。三个作用域：

| 作用域 | 文件 | 优先级 |
|--------|------|--------|
| 全局 | `hooks.yaml`（skill 目录） | 最低 |
| 项目 | `.trae/workflow/hooks.yaml` | 中等 |
| 工作流 | `workflow.yaml`（工作流目录内） | 最高 |

### 钩子触发点

| 钩子 | 触发时机 | 默认 Agent |
|------|----------|------------|
| `pre_stage_DEFINING` | 填写规格前 | iron-audit-pm、risk-auditor |
| `pre_stage_PLANNING` | 任务分解前 | story-mapper、mvp-freeze-architect |
| `pre_stage_DESIGNING` | 架构设计前 | domain-modeler、architecture-advisor |
| `pre_stage_IMPLEMENTING` | 编码前 | tdd-coach |
| `pre_stage_TESTING` | 测试阶段前 | test-strategy-advisor、code-reviewer |
| `post_stage_DELIVERING` | 最终检查后 | tech-design-reviewer |

```bash
# 列出钩子
node scripts/cli.cjs hooks -r <project_root> list

# 添加钩子
node scripts/cli.cjs hooks -r <project_root> add pre_stage_TESTING -n my-validator --type skill
```

## 质量门禁

### 检查点规则

| 阶段 | 何时触发检查点 |
|------|---------------|
| DEFINING | 风险 = elevated 或 critical |
| PLANNING | 规模 = large 或 风险 ≥ elevated |
| DESIGNING | 规模 ≥ medium 或 风险 ≥ elevated |
| TESTING | 始终（所有风险级别） |

在检查点，AI **暂停并询问用户** 确认后再推进。

### SDD 可追溯性规则

每行代码必须可追溯到：
1. `tasks.md` 中的一个任务
2. 该任务可追溯到 `spec.md` 中的一个验收标准

如果发现自己编写的代码未被任何任务覆盖——**停下来，先更新 tasks.md**。

## 错误处理

| 问题 | 解决方案 |
|------|----------|
| 用户给出模糊请求 | 分类为 feature/small，使用 Agent 模式，在实现过程中细化 |
| 规格不完整 | 在推进到 PLANNING 之前补充缺失的验收标准 |
| 任务过大 | 拆分为子任务，每个 ≤1 个文件变更 |
| TESTING 阶段测试失败 | 留在 TESTING，修复问题，重新运行 |
| 用户拒绝检查点 | 留在当前阶段，根据反馈修改产物 |
| 工作流被放弃 | 无需清理，状态持久化在 `.trae/workflow/` 中 |

## 脚本

单一 CLI 入口 `scripts/cli.cjs` 分发所有工作流命令。

| 子命令 | 用途 |
|--------|------|
| `init` | 带分类的工作流初始化 |
| `advance` | 推进到下一阶段 |
| `status` | 显示当前工作流状态 |
| `hooks` | 列出/添加内部工作流钩子；生成/安装 IDE hooks.json |

## Agent

完整注册表见 [AGENTS.md](agents/AGENTS.md)。各阶段关键 agent：

| 阶段 | Agent | 方法论 |
|------|-------|--------|
| DEFINING | [iron-audit-pm](agents/iron-audit-pm.md) | PRD 审计、DNA 提取 |
| DEFINING | [risk-auditor](agents/risk-auditor.md) | 风险扫描 |
| DEFINING | [problem-definer](agents/problem-definer.md) | Weinberg 问题分析 |
| PLANNING | [story-mapper](agents/story-mapper.md) | Patton 故事地图 |
| PLANNING | [mvp-freeze-architect](agents/mvp-freeze-architect.md) | 范围冻结 |
| DESIGNING | [domain-modeler](agents/domain-modeler.md) | DDD/Evans 建模 |
| DESIGNING | [architecture-advisor](agents/architecture-advisor.md) | 质量属性分析 |
| IMPLEMENTING | [tdd-coach](agents/tdd-coach.md) | Beck TDD 循环 |
| TESTING | [test-strategist](agents/test-strategist.md) | Crispin 测试策略 |
| TESTING | [code-reviewer](agents/code-reviewer.md) | 代码审查 |
| DELIVERING | [tech-design-reviewer](agents/tech-design-reviewer.md) | 架构审查 |

## 参考资料

- [快速参考](references/QUICKREF.md) - 精简决策表
