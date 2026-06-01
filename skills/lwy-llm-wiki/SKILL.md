---
name: lwy-llm-wiki
description: "当用户提到'知识库'、'llm wiki'、'个人wiki'、'收录来源'、'编译知识'、'第二大脑'、'构建wiki'、'知识管理'，或想要将书籍、文章、笔记、播客、视频、飞书群聊/文档添加到持久化存储时，使用此技能构建和维护持续复利的知识库。当 ~/.learnwy/llm-wiki/ 存在时，在回答复杂问题前先检查wiki——若目录不存在则跳过。"
metadata:
  author: "learnwy"
  version: "4.0"
  source: "Andrej Karpathy, LLM Wiki (GitHub Gist, April 2026)"
  trigger: "always"
---

# LLM Wiki

构建和维护持续复利的个人知识库。LLM 负责所有繁重工作——摘要、交叉引用、归档和记账——而你专注于搜集来源、探索和提出好问题。

> **核心原则**: 不要把 LLM 当搜索引擎用。要把它当知识编译器用。不是每次查询都从原始文档重新推导知识（RAG），而是由 LLM 增量构建持久化 wiki——结构化、互相链接的 markdown 文件，随着每个来源的添加和每个问题的提出而持续增值。

## 前置条件

- 具备文件读写能力的 LLM Agent
- 用于存储 markdown 文件的文件系统
- Node.js >= 18（管理脚本需要）
- 可选：飞书来源需要 `lark-context` + `lark-cli`（见「飞书来源」一节）；Obsidian 浏览/图谱视图；Git 版本控制

## 使用时机

| 信号 | 动作 |
|------|------|
| "收录这个"、"添加这个来源"、"处理这份文档/文章/播客/视频" | 收录 |
| "沉淀飞书群"、"把最近聊的整理进 wiki"、"收下这个飞书文档" | 飞书收录（见下） |
| "wiki 里怎么说X"、复杂知识问题 | 查询 / 自动查询 |
| "保存到wiki"、"记录下来" | 快捷捕获 |
| "健康检查"、"lint wiki"、"查找矛盾" | 检查 |
| "建一个新wiki"、"初始化知识库" | 初始化（`cli.cjs init`） |
| "从这些文件构建wiki" | 初始化 → 批量收录 |

**不应调用的场景：** 单次对话洞察（→ `knowledge-consolidation`），方法论分析（矛盾/实践/持久战 → `mao-methodology`），代码实现（→ `requirement-workflow`）。

## 自动模式

### 自动查询

当 `~/.learnwy/llm-wiki/` 存在时，回答复杂问题前主动检查：

1. 扫描 `wiki/topics.txt`（关键词平面文件）匹配主题
2. 若匹配 → 阅读相关 wiki 页面
3. 在回答前附上 wiki 洞见并标注 `[[folder/slug]]` 引用
4. 如果回答贡献了新知识，提议回写

对以下情况跳过自动查询：简单事实、wiki不存在。

### 快捷捕获

当用户说"保存这个"或分享有价值知识时，轻量保存到 `raw/notes/{date}-{slug}.md`。不创建 wiki 页面——稍后运行收录。

## 双层架构

| 层级 | 所有者 | 路径 | 用途 |
|------|--------|------|------|
| **原始层** | 你 | `raw/` | 不可变的源材料——LLM 只读，绝不修改 |
| **Wiki层** | LLM | `wiki/` | 编译页面：实体（人/组织/地点/产品/事件/概念）+ 来源（文章/播客/视频/日记/会话） |
| **Schema层** | 共同演进 | `CLAUDE.md` | 结构规则、约定、模板 |

> **不可变 `raw/` 是核心安全属性**：所有外部材料（书、文章、播客逐字稿、飞书拉取）先落到 `raw/<source>/`，LLM 只读不改；编译产物写入 `wiki/`。`inbox/` 是"已拉取但未编译"的中转区，`archived/` 存放退役页面。

### 存储位置

- **全局（默认）**: `~/.learnwy/llm-wiki/` — 跨项目跨会话共享
- 可通过 `LLM_WIKI_ROOT` 环境变量覆盖

## 目录结构（实体优先）

```
~/.learnwy/llm-wiki/
├── raw/                    # 第1层（不可变）：books/ articles/ papers/ notes/
│                           #   podcasts/ vlogs/ transcripts/ snippets/ specs/
│                           #   lark/ docs/
├── wiki/                   # 第2层（编译）
│   ├── people/             #   实体：人物
│   ├── organizations/      #   实体：组织 / 团队
│   ├── places/             #   实体：地点
│   ├── products/           #   实体：产品 / 项目 / 倡议
│   ├── events/             #   实体：有日期的事件 / 决策
│   ├── concepts/           #   实体：概念 / 术语 / 领域知识（含代码模式）
│   ├── other-entities/     #   实体：其它未归类
│   ├── articles/           #   来源：文章摘要
│   ├── podcasts/           #   来源：播客摘要
│   ├── vlogs/              #   来源：视频摘要
│   ├── diaries/            #   来源：编年流水（含飞书周记）
│   ├── threads/            #   来源：会话沉淀（飞书群聊 digest）
│   ├── inbox/              #   生命周期：已拉取未编译
│   ├── archived/           #   生命周期：退役页面
│   ├── index.md            #   自动生成的主索引
│   └── topics.txt          #   自动生成的关键词列表
├── CLAUDE.md               # 第3层：Schema
└── log.md                  # 审计日志
```

> **代码知识去向**：代码片段 / 故障排除归入 `concepts/`（概念页），原始片段落 `raw/snippets/`。本布局以实体为中心，不再有独立的 `snippets/` / `troubleshooting/` 顶层目录。

## 飞书来源（合并自 lark-context）

飞书群聊与文档作为**一类原始来源**接入：`lark-context` CLI 退化为纯数据泵（pull → SQLite，show → 原文），编译/沉淀逻辑由本技能拥有。详见 [`references/ingest-lark.md`](references/ingest-lark.md)。

- 拉取：`lark-context pull` / `show` → 落 `raw/lark/`
- 编译：群聊会话 → `wiki/threads/`，人物 → `wiki/people/`，决策/事件 → `wiki/events/`，编年流水 → `wiki/diaries/`
- 旧的 `~/.claude/lark-memory/` 独立记忆库已退役并迁入本 wiki（见迁移说明）

## 操作与 Agent

| 操作 | Agent | 触发条件 | 模式 |
|------|-------|----------|------|
| **自动查询** | querier | 用户提出复杂问题 + wiki 存在 | 自动 |
| **快捷捕获** | (内联) | "保存到wiki"或检测到有价值知识 | 半自动 |
| **收录** | ingestor | 新的原始来源被添加 | 手动 |
| **飞书收录** | ingestor | 沉淀飞书群 / 文档 | 手动 |
| **查询** | querier | 用户明确询问 wiki | 手动 |
| **检查** | linter | 请求健康检查 | 手动 |
| **初始化** | schema-writer / `cli.cjs init` | 新建 wiki 项目 | 手动 |

Agent 定义：[收录器](agents/operations/ingestor.md)、[查询器](agents/operations/querier.md)、[检查器](agents/operations/linter.md)、[Schema编写器](agents/writing/schema-writer.md)。

## 管理脚本

单一 CLI 入口 `{skill_root}/scripts/cli.cjs` 分发所有维护子命令：

```sh
cd skills/llm-wiki
node scripts/cli.cjs init                       # 脚手架：创建 raw/ + wiki/ 目录、schema、index、log
node scripts/cli.cjs generate-index             # 从文件系统重新生成 wiki/index.md
node scripts/cli.cjs generate-topics            # 重新生成 wiki/topics.txt
node scripts/cli.cjs lint                       # 检查断链、孤立页面
node scripts/cli.cjs stats                      # 快速仪表板：原始层 + Wiki层统计
node scripts/cli.cjs freshness-check            # 标记过时/未验证的页面
node scripts/cli.cjs health-check               # 聚合健康报告 → health.json
node scripts/cli.cjs install / uninstall        # 注册/移除 IDE 钩子
```

| 子命令 | 输出 | 运行时机 |
|--------|------|----------|
| `init` | 全套目录骨架 + CLAUDE.md / index.md / log.md | 首次建库 |
| `generate-index` | `wiki/index.md` — 按实体/来源分组的页面清单 | 批量收录后或索引漂移时 |
| `generate-topics` | `wiki/topics.txt` — 自动查询匹配用的关键词 | 新增主题后 |
| `lint` | 错误（断链）+ 警告（孤立页面） | 每周维护或提交前 |
| `stats` | 原始层 + Wiki层计数的方框图仪表板 | 随时——快速健康快照 |
| `freshness-check` | 过时页面（技术类90天，稳定类180天）、未验证、缺少日期 | 每月或重大版本发布后 |
| `health-check` | 断链 / 孤立 / 失效 **Source** 引用 → `health.json` | CI / 提交前 |

可通过 `LLM_WIKI_ROOT` 环境变量覆盖 wiki 位置。

## Agent 输出契约

| 允许 | 不允许 |
|------|--------|
| 读取原始来源（绝不修改） | 修改 `raw/` 中的任何内容 |
| 在 `wiki/` 中创建/更新文件 | 删除原始来源 |
| 操作后更新 `index.md` 和 `log.md` | 创建没有交叉引用的页面 |
| 标记来源间的矛盾 | 静默覆盖已有内容 |

每次操作必须：(1) 记录到 `log.md`，(2) 更新 `index.md`，(3) 检查矛盾，(4) 维护交叉引用。

## 执行检查清单

**操作前**: Wiki存在？ → CLAUDE.md存在？ → 原始来源在正确子目录（飞书 → `raw/lark/`）？ → 易过时内容设 `Verified: no`。

**操作后**: log.md已更新？ → index.md反映变更？ → 交叉引用已添加（上限5个，超出用"另见"）？ → 新主题时topics.txt已更新？

## 边界约束

本技能处理：wiki 初始化、收录（含飞书）、查询、检查、交叉引用、索引维护。

不处理：单次洞察（→ `knowledge-consolidation`），方法论分析（→ `mao-methodology`），代码实现（→ `requirement-workflow`）。

## 参考文档（按需加载）

- [页面模板](references/templates.md) — 实体与来源页模板：人物 / 组织 / 地点 / 产品 / 事件 / 概念 / 文章 / 播客 / 视频 / 日记 / 会话 / 索引
- [飞书收录工作流](references/ingest-lark.md) — 拉取 → 落 raw/lark → 编译进 threads/people/events/diaries
- [工作流与参考](references/workflows.md) — 组合工作流、错误处理、核心概念、扩展路线图

## 钩子

通过 `learnwy-dispatch` 注册 **全局** 钩子（`~/.claude/settings.json` + `~/.trae/hooks.json`），因为 wiki 位于 `~/.learnwy/llm-wiki/`。

| 事件 | Lib 函数 | 用途 |
|------|----------|------|
| `SessionStart` | `lib/session-scan.ts` | 注入最多 30 个 wiki 主题到会话上下文 |
| `UserPromptSubmit` | `lib/prompt-scan.ts` | 用户问题 ↔ topics 关键词匹配 → 注入相关页面提示 |

安装/卸载：`node scripts/cli.cjs install|uninstall --scope global --target both` （由 `src/shared/install-entry.ts` 提供，所有 hook 类技能共用）。

## 来自 knowledge-consolidation

KC 的 `promote` 子命令把项目级知识文档复制到 `raw/notes/<date>-<slug>.md`，附带 frontmatter 反向指针。下次收录时把它们当作普通原始来源处理（往往合并成 `wiki/concepts/` 页面，并和原 KC 文档建立 `[[link]]`）。这是从"项目本地修复日志"到"全局复利知识库"的单向流入通道。
