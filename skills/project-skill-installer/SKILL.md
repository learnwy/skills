---
name: project-skill-installer
description: "当用户想要在项目中安装、添加或配置技能时使用此技能。分析项目的技术栈和工作流，然后推荐并安装最匹配的技能。触发词：'install skill'、'add skill'、'configure skill'、'set up skill'、'enable skill'、'use skill in project'、'project skill'，或当用户询问如何将现有技能能力引入当前工作区时触发。"
metadata:
  author: "learnwy"
  version: "3.0"
---

# 项目技能安装器

分析项目的技术栈、工作流和痛点，然后**推荐**最佳技能进行安装。在安装任何内容之前，始终通过 `AskUserQuestion` 与用户确认。

> **核心原则**：先理解项目，再推荐，仅在用户确认后安装。

> **共享原则：** 本技能与 `project-skill-writer` / `project-agent-writer` / `project-rules-writer` 共享 5 条 writer 通用纪律。详见 [../project-skill-writer/references/writer-discipline.md](../project-skill-writer/references/writer-discipline.md)。

## 使用场景

**触发条件：**

- 用户说"install a skill"、"find a skill for X"、"what skills would help this project"
- 用户描述能力缺口（"I wish AI would automatically..."）
- 用户想用技能设置新项目

**不触发条件：**

- 用户想**创建**新技能（委托给 `project-skill-writer`）
- 用户想**创建**智能体（委托给 `project-agent-writer`）
- 用户想**创建**规则（委托给 `project-rules-writer`）

## 前置条件

- Node.js >= 18
- 需要全局可用的 `find-skills` 或 `trae-skill-finder` 技能
- 如果缺失，提示用户：`npx skills add find-skills -g -y`

## 工作流

```
[L1: 理解目标]
         ↓
[L2: 项目分析]
         ↓
[L3: 技能发现]
         ↓
[L4: 推荐]  ← AskUserQuestion（必须确认）
         ↓
[L5: 安装]
         ↓
[L6: 验证]
```

## L1: 理解目标

提取用户需求——不要问"你想要什么技能？"而是理解：

| 用户说的 | 真实需求 |
|----------|----------|
| "install a skill" | 模糊——进入 L2 分析寻找缺口 |
| "find a skill for testing" | 特定领域——搜索测试技能 |
| "set up this project with skills" | 全面审计——分析项目并推荐套件 |
| "I keep doing X manually" | 自动化缺口——查找解决 X 的技能 |

## L2: 项目分析

扫描项目构建技术画像。并行使用搜索工具：

### 检测目标

| 信号 | 查找内容 | 工具 |
|------|----------|------|
| 语言 | 文件扩展名（`.ts`、`.py`、`.swift`、`.go`） | Glob |
| 框架 | package.json 依赖、Podfile、go.mod、Cargo.toml | Read |
| 构建工具 | Makefile、webpack.config、vite.config、Bazel | Glob |
| 测试 | jest.config、pytest.ini、XCTest、go test | Glob |
| CI/CD | .github/workflows/、Jenkinsfile、.gitlab-ci.yml | Glob |
| 现有技能 | .agents/skills/、.trae/skills/、.cursor/skills/ | Glob |
| 现有规则 | .agents/rules/、.trae/rules/ | Glob |

### 技术画像输出

```
项目: {name}
语言: TypeScript, Swift
框架: React 18, UIKit
构建: Vite, Bazel
测试: Jest, XCTest
CI: GitHub Actions
现有技能: [列表]
现有规则: [列表]
```

## L3: 技能发现

基于技术画像和用户目标，搜索匹配的技能：

### 搜索策略

1. **直接匹配**：按用户的精确请求搜索 → `npx skills find "<user_query>"`
2. **技术匹配**：按检测到的技术栈搜索 → `npx skills find "react"`、`npx skills find "swift"`
3. **缺口匹配**：按检测到的工作流缺口搜索 → 如果没有测试技能，搜索 `npx skills find "testing"`

### 技能来源（优先级顺序）

1. **本地注册表**：检查 `~/.trae/skills/` 和 `~/.trae-cn/skills/` 中已安装的全局技能
2. **社区注册表**：`npx skills find "<query>"` — 搜索 skills.sh 市场
3. **字节跳动注册表**：`npx @tiktok-fe/skills find "<query>"` — 搜索内部注册表（如可用）

### 筛选标准

拒绝以下技能：
- 与已安装技能冲突（相同用途）
- 不匹配项目的语言/框架
- 仅限全局使用（此技能安装项目级别的）
- 没有描述或明显低质量

## L4: 推荐（必须使用 AskUserQuestion）

**关键**：在安装任何技能之前，通过 `AskUserQuestion` 展示推荐。

### 推荐格式

对每个推荐的技能，准备：

```
技能: {name}
用途: {做什么，一句话}
原因: {为什么适合这个项目}
安装: {命令}
```

### AskUserQuestion 调用

使用 `AskUserQuestion`：

```json
{
  "questions": [{
    "question": "Based on your {language/framework} project, I recommend these skills. Which would you like to install?",
    "header": "Skills",
    "multiSelect": true,
    "options": [
      {
        "label": "{skill-1-name} (Recommended)",
        "description": "{一句话：做什么 + 为什么适合}"
      },
      {
        "label": "{skill-2-name}",
        "description": "{一句话：做什么 + 为什么适合}"
      },
      {
        "label": "Skip",
        "description": "Don't install any skills right now"
      }
    ]
  }]
}
```

**规则**：
- 将最相关的技能放在最前面并标记"(Recommended)"
- 最多 4 个选项（3 个技能 + Skip）
- 将"Skip"作为最后一个选项
- 使用 `multiSelect: true` 允许多个安装
- 绝不在用户确认前安装

## L5: 安装

用户确认要安装哪些技能后：

### 安装路径发现

使用[路径发现](references/path-discovery.md)确定项目相对安装路径：

1. 检查项目根目录是否存在 `.agents/skills/`
2. 否则默认创建 `.agents/skills/`（不再写入 `.trae/`、`.cursor/`、`.claude/` —— 那些目录归 IDE 管）

### 安装命令

```bash
# 社区技能 (skills.sh)
npx skills add <package-name> --path <project-root>/.agents/skills/

# 字节跳动内部技能
npx @tiktok-fe/skills add <package-name> --path <project-root>/.agents/skills/
```

### 安装规则

- **始终**使用项目相对路径 — 绝不使用 `~/.trae/skills/`、`~/.claude/skills/` 或其他全局路径
- 不要安装到项目的 `.trae/`、`.claude/`、`.cursor/` —— 那是 IDE 自己写入的目录
- 逐个安装技能，每个验证后再继续下一个
- 如果安装失败，报告错误并建议手动安装步骤

## L6: 验证

安装后验证：

- [ ] 技能目录存在于预期路径
- [ ] SKILL.md 存在且可读
- [ ] 技能描述提及相关触发词
- [ ] 与现有技能无冲突

向用户报告：

```
已安装 {N} 个技能:
  ✓ {skill-1} → {path}
  ✓ {skill-2} → {path}

使用方式: 只需描述你的需求，技能会自动激活。
```

## 错误处理

| 问题 | 解决方案 |
|------|----------|
| `find-skills` 不可用 | 提示：`npx skills add find-skills -g -y` |
| 未找到匹配查询的技能 | 建议通过 `project-skill-writer` 创建自定义技能 |
| 用户请求全局安装 | 拒绝，解释项目范围限制，提供项目相对路径替代方案 |
| 用户请求创建智能体/规则 | 路由到 `project-agent-writer` 或 `project-rules-writer` |
| 安装命令失败 | 显示错误，建议手动 `npx skills add <name> --path <path>` |
| 技能与现有的冲突 | 展示对比，询问用户保留哪个 |

## 边界限定

此技能**仅**处理：
- ✅ 分析项目的技能需求
- ✅ 搜索技能注册表
- ✅ 带用户确认的技能推荐
- ✅ 将技能安装到项目相对路径
- ✅ 验证安装

此技能**不**处理：
- ❌ 创建新技能 → `project-skill-writer`
- ❌ 创建智能体 → `project-agent-writer`
- ❌ 创建规则 → `project-rules-writer`
- ❌ 全局安装（始终限定在项目范围内）

## 参考资料

- [路径发现](references/path-discovery.md) — 安装路径确定
- [Agent Skills 核心实践](references/agent-skills-core-practices.md) — AI 技能最佳实践
