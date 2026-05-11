---
name: project-agent-writer
description: "当用户想要创建、更新或设计项目级智能体（.agents/agents/*.md）时使用此技能。分析用户问题和项目上下文来设计工作方案。触发词：'create agent'、'build an agent'、'add agent'、'design agent'、'update agent'、'project agent'、'subagent'、'worker agent'、'automated worker'，或当用户描述应由自治智能体处理的重复性任务时触发。"
metadata:
  author: "learnwy"
  version: "4.0"
---

# 项目智能体编写器

分析项目的结构、规范和自动化缺口，然后**设计**一个智能体来解决用户的问题。在生成任何文件之前，始终通过 `AskUserQuestion` 与用户确认。

> **核心原则**：先理解问题，再分析项目，然后设计智能体，仅在用户确认后才生成。

> **共享原则：** 本技能与 `project-skill-writer` / `project-skill-installer` / `project-rules-writer` 共享 5 条 writer 通用纪律。详见 [../project-skill-writer/references/writer-discipline.md](../project-skill-writer/references/writer-discipline.md)。

## 使用场景

**触发条件：**

- 用户说"create an agent"、"I need an agent that..."、"make AI do X every time"
- 用户描述自动化需求（"someone to automatically..."、"I want something that monitors..."）
- 用户想构建评分器、比较器、分析器、转换器、研究者或验证器

**不触发条件：**

- 用户想**安装**技能 → 委托给 `project-skill-installer`
- 用户想**创建**技能 → 委托给 `project-skill-writer`
- 用户想**创建**规则 → 委托给 `project-rules-writer`

## 前置条件

- Node.js >= 18
- 目标项目必须有可写目录用于智能体输出

## 工作流

```
[L1: 理解问题]
         ↓
[L2: 项目分析]
         ↓
[L3: 智能体设计]
         ↓
[L4: 确认]  ← AskUserQuestion（必须确认）
         ↓
[L5: 生成]
         ↓
[L6: 验证]
```

## L1: 理解问题

提取用户需求——不要问"你想让智能体做什么？"而是从他们的问题中推断：

### 问题分类

| 问题模式 | 智能体类型 | 示例 |
|----------|------------|------|
| "评估/评分/比较输出" | 评分器 | 代码审查者、PR 质量检查器 |
| "比较 A 和 B，选出更好的" | 比较器 | 技能版本对比、A/B 测试器 |
| "分析/发现模式/报告洞察" | 分析器 | Bug 查找器、性能诊断 |
| "转换/转化/标准化数据" | 转换器 | 格式转换器、Schema 映射器 |
| "研究/收集/综合信息" | 研究者 | 文档查找、最佳实践 |
| "检查/验证/执行规则" | 验证器 | Schema 检查器、合规验证器 |

### 提取智能体规格

从用户的问题中提取：
- **角色**：智能体做什么（从问题描述中提取）
- **输入**：什么触发智能体 / 需要什么数据
- **输出**：智能体产出什么
- **约束**：边界和限制

## L2: 项目分析

扫描项目以理解上下文。并行使用搜索工具：

### 检测目标

| 信号 | 查找内容 | 工具 |
|------|----------|------|
| 语言 | 文件扩展名（`.ts`、`.py`、`.swift`、`.go`） | Glob |
| 框架 | package.json 依赖、Podfile、go.mod、Cargo.toml | Read |
| 现有智能体 | `.agents/agents/`、`.trae/agents/`、`.claude/agents/`、`.cursor/agents/` | Glob |
| 现有技能 | `.agents/skills/`、`.trae/skills/`、`.cursor/skills/` | Glob |
| 自动化脚本 | `scripts/`、`tools/`、`Makefile` 目标 | Glob |
| API 接口 | REST 端点、GraphQL schema、gRPC protos | Grep |
| 规范 | 命名模式、输出格式、目录结构 | LS |

### 分析输出

```
项目: {name}
语言: {检测到的语言}
现有智能体: {列表或"无"}
现有技能: {列表或"无"}
自动化脚本: {列表或"无"}
集成点: {API、文件模式、工具}
规范: {命名、输出格式}
```

## L3: 智能体设计

基于问题（L1）+ 分析（L2），设计智能体：

```
智能体: {name}
问题: {用户原话描述的问题}
角色: {一句话描述}
类型: {评分器|比较器|分析器|转换器|研究者|验证器}

触发条件: {智能体何时激活}
输入: {智能体需要什么数据}
流程: {高层步骤}
输出: {智能体产出什么 + 格式}
约束: {边界 + 不该做什么}

要创建的文件:
  - {path/to/agent.md}
```

## L4: 确认（必须使用 AskUserQuestion）

**关键**：在生成任何文件之前，通过 `AskUserQuestion` 展示设计方案。

### AskUserQuestion 调用

使用 `AskUserQuestion`：

```json
{
  "questions": [{
    "question": "I've designed this agent based on your project. Should I create it?",
    "header": "Agent",
    "multiSelect": false,
    "options": [
      {
        "label": "Create {agent-name} (Recommended)",
        "description": "{type} agent — {一句话角色}. Output: {path}"
      },
      {
        "label": "Adjust design",
        "description": "Let me refine the agent design before generating"
      },
      {
        "label": "Skip",
        "description": "Don't create an agent right now"
      }
    ]
  }]
}
```

**规则**：
- 始终展示设计的智能体名称和类型
- 包含输出路径让用户知道文件放在哪里
- 如果多种智能体类型都有效，提供备选方案：

```json
{
  "questions": [{
    "question": "Your problem could be solved by different agent types. Which approach fits best?",
    "header": "Agent type",
    "multiSelect": false,
    "options": [
      {
        "label": "Grader agent (Recommended)",
        "description": "Evaluates outputs against expectations with pass/fail evidence"
      },
      {
        "label": "Validator agent",
        "description": "Checks correctness against rules and suggests fixes"
      },
      {
        "label": "Skip",
        "description": "Don't create an agent right now"
      }
    ]
  }]
}
```

- 绝不在用户确认前生成文件
- 如果用户说"调整设计"，带着反馈回到 L3

## L5: 生成

用户确认后：

1. 使用[路径发现](references/path-discovery.md)确定输出路径
2. 使用 `scripts/cli.cjs init` 创建智能体脚手架
3. 从 L3 设计中填入角色、输入、流程、输出
4. 设置正确的项目相对输出路径
5. 包含质量门控和约束

### 生成命令

```bash
node scripts/cli.cjs init \
  --skill-dir <this-skill-dir> \
  --name <agent-name> \
  --role "<one-sentence-role>" \
  --output-dir <project>/.agents/agents/
```

## L6: 验证

交付前验证：

- [ ] 智能体有清晰、具体的角色（非模糊）
- [ ] 输入有明确定义和描述
- [ ] 输出 schema 是确定性的（JSON 带已知字段）
- [ ] 约束被强制执行（不该做什么）
- [ ] 输出路径是项目相对路径，非全局
- [ ] 智能体遵循 L2 分析中的规范

### 交付报告

```
已创建智能体:
  名称: {agent-name}
  类型: {评分器|比较器|分析器|...}
  路径: {项目相对路径}

使用方式: 通过 Task 工具使用其定义的输入来启动此智能体。
```

## 错误处理

| 问题 | 解决方案 |
|------|----------|
| 用户问题太模糊 | 从上下文推断最可能的智能体类型，在 L4 确认 |
| 多种有效的智能体类型 | 在 AskUserQuestion 中展示备选方案，让用户选择 |
| 不存在智能体目录 | 创建 `.agents/agents/` |
| 用户请求创建技能/规则 | 路由到 `project-skill-writer` 或 `project-rules-writer` |
| 用户在 L4 说"调整设计" | 回到 L3，纳入反馈 |
| 输出路径是全局的 | 拒绝，强制使用项目相对路径 |
| 智能体与现有的冲突 | 展示对比，询问用户是替换还是重命名 |

## 边界限定

此技能**仅**处理：
- 分析项目以获取智能体设计上下文
- 基于用户问题设计智能体
- 通过 AskUserQuestion 确认设计
- 将智能体文件生成到项目相对路径
- 验证已生成的智能体

此技能**不**处理：
- 创建技能 → `project-skill-writer`
- 安装技能 → `project-skill-installer`
- 创建规则 → `project-rules-writer`
- 全局智能体安装（始终限定在项目范围内）

## 参考资料

- [智能体模式](references/agent-patterns.md) — 架构模式（评分器、比较器、分析器、转换器、研究者、验证器）
- [路径发现](references/path-discovery.md) — 输出路径确定（设计完成后加载）
- [示例：评分器智能体](examples/grader-agent.md) — 创建评分器智能体的完整演练
