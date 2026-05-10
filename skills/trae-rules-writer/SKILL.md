---
name: trae-rules-writer
description: "当用户需要创建或更新 Trae IDE 规则（.trae/rules/*.md）以约束 AI 行为时使用此技能。适用于：代码风格强制、命名约定、提交信息格式，或让 AI 始终遵循特定模式。不适用于技能（请使用 project-skill-writer）或智能体（请使用 project-agent-writer）。触发词：'创建规则'、'添加规则'、'设置代码风格'、'强制约定'、'配置 AI 行为'、'AI 规则'、'始终做 X'，或当用户需要跨会话一致的 AI 行为时。"
metadata:
  author: "learnwy"
  version: "3.0"
---

# Trae 规则编写器

创建解决具体问题的规则——而非泛化规则。分析项目的结构和约定，然后**设计**一条约束 AI 行为的规则。始终在生成文件前通过 `AskUserQuestion` 与用户确认。

> **核心原则**：先理解问题，再分析项目，第三步设计规则，仅在用户确认后生成。

## 适用场景

**适合调用：**

- 用户说"创建一条规则"、"为……创建规则"、"设置代码风格"
- 用户说"让 AI 始终……"、"强制命名约定"、"配置 AI 行为"
- 用户引用了 `.trae/rules/...` 或使用 `#RuleName` 语法
- 用户想为特定项目或文件模式约束 AI 行为

**不适合调用：**

- 用户想创建**技能** → 转交 `project-skill-writer`
- 用户想创建**智能体** → 转交 `project-agent-writer`
- 用户想**安装**现有技能 → 转交 `project-skill-installer`
- 用户询问 Trae 规则文档（直接回答，无需生成）

## 前置条件

- Node.js >= 18
- Trae IDE（支持 `.trae/rules/`）

## 工作流

```
[L1: 问题理解]
       ↓
[L2: 项目分析]  ← 并行子智能体
       ↓
[L3: 规则设计]
       ↓
[L4: 确认]  ← AskUserQuestion（必须确认）
       ↓
[L5: 生成 & 验证]
```

## L1：问题理解

提取用户需要什么——不要问"你想要什么规则？"而是从问题推断：

### 问题分类

| 问题模式 | 规则类型 | 应用模式 | 示例 |
|---------|---------|---------|------|
| "AI 总用错误的命名" | 约定 | 文件特定（`globs`） | `.ts` 用 camelCase，`.py` 用 snake_case |
| "AI 应该始终做 X" | 行为 | 始终应用（`alwaysApply: true`） | 始终使用项目的日志库 |
| "AI 忽略我们的架构" | 结构 | 智能（`description`） | 强制分层架构边界 |
| "AI 生成错误的导入" | 风格 | 文件特定（`globs`） | 在 `.tsx` 文件中使用 `@/` 路径别名 |
| "我想手动切换规则" | 手动 | 手动（`#RuleName`） | 临时代码审查清单 |

### 提取规则规格

从用户的问题中提取：
- **问题**：AI 做错了什么（或应该开始做什么）
- **范围**：规则适用于哪些文件或上下文
- **行为**：AI 应该有什么不同的行为
- **例外**：规则不应适用的情况

## L2：项目分析

扫描项目以理解上下文。通过 Task 工具并行启动这些智能体：

| 智能体 | 用途 | 工具调用 |
|-------|------|---------|
| [项目扫描器](agents/project-scanner.md) | 结构、现有规则、模式 | `Task(subagent_type="search", query="...")` |
| [约定检测器](agents/convention-detector.md) | 命名、风格和模式约定 | `Task(subagent_type="search", query="...")` |

### 检测目标

| 信号 | 查找内容 | 工具 |
|------|---------|------|
| 语言 | 文件扩展名（`.ts`、`.py`、`.swift`、`.go`） | Glob |
| 框架 | package.json deps、Podfile、go.mod、Cargo.toml | Read |
| 现有规则 | `.trae/rules/*.md` 文件及其 frontmatter | Glob + Read |
| 代码风格 | ESLint、Prettier、EditorConfig、Ruff 配置 | Glob |
| 命名模式 | 变量大小写、文件命名、目录结构 | Grep |
| 架构 | 分层、模块边界、导入模式 | LS + Grep |

### 分析输出

```
项目：{name}
语言：{检测到的语言}
现有规则：{列出应用模式，或"无"}
代码风格工具：{检查器、格式化器}
约定：{命名、导入、架构模式}
冲突：{与提议规则重叠的现有规则}
```

## L3：规则设计

基于问题（L1）+ 分析（L2），设计规则：

### 应用模式选择

参考[应用模式](examples/application-modes.md)和[规则类型](references/rule-types.md)获取详细指导。

| 模式 | 适用场景 | Frontmatter |
|------|---------|-------------|
| 始终应用 | 规则适用于每次 AI 交互 | `alwaysApply: true` |
| 文件特定 | 规则仅适用于特定文件类型 | `globs: *.tsx,*.ts` + `alwaysApply: false` |
| 智能 | AI 根据描述判断规则是否相关 | `description: "..."` + `alwaysApply: false` |
| 手动 | 用户通过 `#RuleName` 显式调用 | 无 frontmatter，使用 `#RuleName` |

### 设计规格

```
规则：{name}
问题：{用户原话描述的问题}
应用模式：{始终应用|文件特定|智能|手动}
范围：{哪些文件/上下文}

内容摘要：
- {约束 1}
- {约束 2}

Frontmatter：
  description: {此规则何时应用}
  globs: {文件模式，如适用}
  alwaysApply: {true|false}

要创建的文件：
  - .trae/rules/{rule-name}.md
```

### 设计原则

1. **单一问题** — 一条规则 = 解决一个问题
2. **遵循约定** — 使用项目现有的风格工具作为事实来源
3. **最小范围** — 将规则应用到覆盖问题的最窄文件集
4. **无冲突** — 验证新规则不与现有规则矛盾

### 关键格式规则

| 错误写法 | 正确写法 |
|---------|---------|
| `globs: "*.ts"` | `globs: *.ts,*.tsx` |
| `globs: ["*.ts"]` | `globs: *.ts` |
| `/Users/.../src/` | `src/` |
| 缺少 `description` | 始终包含 `description` |
| `alwaysApply: true` 和 `globs:` 同时激活 | 只用其一 |

## L4：确认（必须使用 AskUserQuestion）

**关键**：在生成任何文件之前，通过 `AskUserQuestion` 展示设计。

### AskUserQuestion 调用

使用 `AskUserQuestion`：

```json
{
  "questions": [{
    "question": "我已根据您的项目设计了此规则。是否创建？",
    "header": "规则",
    "multiSelect": false,
    "options": [
      {
        "label": "创建 {rule-name}（推荐）",
        "description": "{应用模式}规则 — {1 句话行为描述}。输出：.trae/rules/{rule-name}.md"
      },
      {
        "label": "调整设计",
        "description": "在生成前让我调整规则设计"
      },
      {
        "label": "跳过",
        "description": "暂不创建规则"
      }
    ]
  }]
}
```

**规则**：
- 始终展示设计的规则名称和应用模式
- 包含输出路径以便用户知道文件位置
- 如果多种应用模式有效，提供备选：

```json
{
  "questions": [{
    "question": "此规则可以用不同模式运行。哪种最合适？",
    "header": "应用模式",
    "multiSelect": false,
    "options": [
      {
        "label": "始终启用规则（推荐）",
        "description": "alwaysApply: true — 在每次 AI 交互中生效"
      },
      {
        "label": "文件特定规则",
        "description": "globs: *.tsx — 仅当匹配文件参与时生效"
      },
      {
        "label": "跳过",
        "description": "暂不创建规则"
      }
    ]
  }]
}
```

- 绝不在用户确认前生成文件
- 如果用户说"调整设计"，回到 L3 并纳入反馈

## L5：生成 & 验证

用户确认后：

### 生成

1. 确定输出路径：目标项目根目录的 `.trae/rules/`
2. 使用 `scripts/cli.cjs init` 或 [rule.md.template](assets/rule.md.template) 创建规则文件
3. 从 L3 设计填入 frontmatter（`description`、`globs`、`alwaysApply`）
4. 编写规则内容——可操作的约束，而非模糊的指南
5. 确保规则内容中所有路径为项目相对路径，绝不使用绝对路径

### 生成命令

```bash
node scripts/cli.cjs init \
  --skill-dir <this-skill-dir> \
  --name <rule-name> \
  --description "<when-this-rule-applies>" \
  --output-dir <project>/.trae/rules/
```

回退方案：如果 `cli.cjs init` 失败或模板不适用，直接按模板结构编写 `.md` 文件。

### 验证

对生成的规则运行[质量验证器](agents/quality-validator.md)。

交付前的最低检查：

- [ ] `globs` 格式：逗号分隔，无引号，无数组
- [ ] 规则中无绝对路径
- [ ] `description` 存在且描述了规则何时应用
- [ ] `alwaysApply` 和 `globs` 不同时激活
- [ ] 不与现有规则冲突（来自 L2 分析）
- [ ] 规则内容可操作（具体约束，非模糊建议）
- [ ] 内容使用英文

### 交付报告

```
创建的规则：
  名称：{rule-name}
  模式：{始终应用|文件特定|智能|手动}
  路径：{项目相对路径}

Frontmatter：
  description: {value}
  globs: {value, 如适用}
  alwaysApply: {value}

使用方式：{基于应用模式的说明}
```

## 错误处理

| 问题 | 解决方案 |
|------|---------|
| 用户的问题太模糊 | 从上下文推断最可能的规则类型，在 L4 确认 |
| 多种有效的应用模式 | 在 AskUserQuestion 中展示备选，让用户选择 |
| 不存在 `.trae/rules/` 目录 | 在项目根目录创建 `.trae/rules/` |
| 用户请求创建技能/智能体 | 转路由到 `project-skill-writer` 或 `project-agent-writer` |
| 用户在 L4 说"调整设计" | 回到 L3，纳入反馈 |
| 规则包含绝对路径 | 拒绝，转换为项目相对路径 |
| 规则与现有规则冲突 | 展示对比，询问用户是合并、替换还是重命名 |
| `globs` 格式错误 | 自动修复：去除引号，展平数组，使用逗号分隔 |
| 项目无可检测的约定 | 回退到语言默认值，在交付报告中注明假设 |

## 边界约束

此技能**仅**处理：
- 分析项目以获取规则设计上下文
- 基于用户问题设计规则
- 通过 AskUserQuestion 确认设计
- 将 `.trae/rules/*.md` 文件生成到项目相对路径
- 针对质量门禁验证生成的规则

此技能**不**处理：
- 创建技能 → `project-skill-writer`
- 创建智能体 → `project-agent-writer`
- 安装技能 → `project-skill-installer`
- 全局规则安装（始终限定在项目范围）
- 编辑 Trae IDE 设置或配置文件

## 智能体

- [项目扫描器](agents/project-scanner.md)：结构、现有规则和模式分析
- [约定检测器](agents/convention-detector.md)：命名、风格和约定提取
- [质量验证器](agents/quality-validator.md)：生成后规则验证

## 参考文档

- [规则类型](references/rule-types.md)：根据问题选择规则类型
- [应用模式](examples/application-modes.md)：所有模式示例及 frontmatter
- [规则模板](assets/rule.md.template)：新规则脚手架
- [Trae 规则文档](assets/trae-rules-docs.md)：官方文档快照
