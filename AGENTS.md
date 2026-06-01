# AGENTS.md

本文件为 AI 代理（Claude Code、Codex、Cursor 等）在本仓库中工作提供指引。

## 项目概述

个人技能仓库，遵循 [Agent Skills Specification](https://agentskills.io/specification) 规范，包含可复用的 AI 能力。每个技能是一个独立目录，通过 `SKILL.md` 文件定义其功能、触发条件和使用模式。

> **设计哲学**：所有 skill 均按"条件反射（Conditional Reflection）"范式组织——明确刺激 → 确定响应。三级反射强度模型、各级最佳实践、强/弱模型适配方案见 [.agents/docs/conditional-reflection.md](.agents/docs/conditional-reflection.md)。新增 skill 前请先对照该文档第 7 节的检查表。
>
> 该目录下所有 `.md` 文档为"共享文档"，会通过 `pnpm run sync-docs` 自动复制到每个 `skills/*/references/` 下，确保 skill 单独发布安装后仍可访问。`pnpm run release` 在 push 前会自动执行同步并由 preflight 检测漂移。**只编辑 `.agents/docs/` 下的源文件**，不要直接编辑 `references/` 下带 AUTO-GENERATED 头的副本。

## 仓库结构

```
skills/                                    # 仓库根目录
├── AGENTS.md                              # 本文件 — 项目指引
├── CLAUDE.md                              # Claude 专用指引（→ AGENTS.md）
├── LICENSE                                # MIT 许可证
├── agents/                                # 通用方法论代理（权威副本）
│   ├── AGENTS.md
│   ├── problem-definer/
│   ├── story-mapper/
│   ├── domain-modeler/
│   ├── architecture-advisor/
│   ├── responsibility-modeler/
│   ├── spec-by-example/
│   ├── tdd-coach/
│   ├── refactoring-guide/
│   ├── legacy-surgeon/
│   └── test-strategist/
└── skills/                                # 可运行的技能模块
    ├── lwy-knowledge-consolidation/           # 对话洞察持久化（含 Stop 自动 nudge）
    ├── lwy-dispatch/                  # UserPromptSubmit/Stop/SessionStart 单进程调度器
    ├── lwy-status/                    # 跨子系统数据综合视图 + doctor 健康体检
    ├── lwy-llm-wiki/                          # Karpathy 式知识库
    ├── on-contradiction/                  # 矛盾论方法论
    ├── on-practice/                       # 实践论方法论
    ├── on-protracted-war/                 # 论持久战方法论
    ├── lwy-project-agent-writer/              # 创建项目级代理
    ├── lwy-project-skill-installer/           # 将技能安装到项目中
    ├── lwy-project-skill-writer/              # 创建项目级技能
    ├── lwy-requirement-workflow/              # SDD 开发编排器
    ├── lwy-software-methodology-toolkit/      # 10 个方法论代理（兜底）
    ├── lwy-prompt-optimizer/                  # 提示词预检分析与优化
    └── trae-rules-writer/                 # 创建 Trae IDE 规则
```

## 技能分类

### 方法论技能（无脚本 — 纯代理框架）

| 技能 | 说明 | 代理 |
|------|------|------|
| **on-contradiction** | 毛泽东《矛盾论》— 对立力量的结构分析 | decision-maker, problem-analyzer, report-writer |
| **on-practice** | 毛泽东《实践论》— 实践-认知螺旋式验证 | decision-maker, problem-analyzer, report-writer |
| **on-protracted-war** | 毛泽东《论持久战》— 长期博弈的阶段性战略 | decision-maker, problem-analyzer, report-writer |
| **lwy-llm-wiki** | Karpathy 式 LLM Wiki — 复利式知识库 | ingestor, querier, linter, schema-writer |
| **lwy-software-methodology-toolkit** | 10 个方法论代理（当无特定技能匹配时作为兜底） | problem-definer, story-mapper, domain-modeler 等 |

### 开发工作流技能

| 技能 | 说明 | 包含脚本 |
|------|------|----------|
| **lwy-requirement-workflow** | 规格驱动开发：spec.md → tasks.md → 实现 → 验证 | 是 (shell) |
| **lwy-project-skill-writer** | 带约定检测的项目级技能创建 | 否 |
| **lwy-project-agent-writer** | 创建项目级代理 | 否 |
| **lwy-project-skill-installer** | 将技能安装到项目中 | 否 |
| **trae-rules-writer** | 创建 Trae IDE 规则 | 否 |

### 工具类技能

| 技能 | 说明 | 包含脚本 |
|------|------|----------|
| **lwy-knowledge-consolidation** | 将对话洞察持久化到项目 knowledges/；Stop 钩子自动 nudge | 是 (CJS) |
| **lwy-prompt-optimizer** | 提示词预检分析与优化（7 维度评分）；事件落盘 + `trends` 聚合 | 是；子命令 `trends` |
| **lwy-llm-wiki** | Karpathy 式知识库；`health-check` 一键体检 + JSON 快照 | 是；子命令 `lint`、`generate-index`、`generate-topics`、`init`、`freshness-check`、`health-check`、`stats` |
| **lwy-status** | 跨子系统综合视图（wiki/optimizer/kc/logs）；周度自动摘要；自动刷新过期 health.json；`doctor` 系统体检 | 是；子命令 `status`、`doctor` |
| **lwy-dispatch** | 内部协调器：UserPromptSubmit + Stop + SessionStart 三类钩子合并到单 Node 进程 | 是（仅 install/uninstall）|

### 钩子调度器（Dispatcher Trio）

每个事件都由 **`lwy-dispatch`** 集中触发，避免每个技能单独 spawn 进程：

| 事件 | 调度器入口 | 调度的子扫描函数 |
|------|------------|------------------|
| `UserPromptSubmit` | `skills/lwy-dispatch/scripts/hooks/user-prompt-submit.cjs` | `lwy-llm-wiki/lib/prompt-scan` + `lwy-prompt-optimizer/lib/prompt-scan` |
| `Stop` | `skills/lwy-dispatch/scripts/hooks/stop.cjs` | `lwy-knowledge-consolidation/lib/stop-scan` |
| `SessionStart` | `skills/lwy-dispatch/scripts/hooks/session-start.cjs` | `lwy-llm-wiki/lib/session-scan` + `lwy-status/lib/session-scan` |

每个子扫描函数都是纯 `(payload | message) => string | null`，副作用（DB 写、状态持久化）封装在自己的 lib 里。一个扫描器抛错不会影响其它扫描器。原本各技能下的同名 hooks/`<event>`.cjs 入口被保留作为备用入口，但生产路径上只走 dispatcher。

## 技能规范

### 目录结构

```
{skill-name}/
├── SKILL.md              # 必需：技能定义
├── scripts/              # 可选：可执行代码
├── references/           # 可选：详细文档
├── assets/               # 可选：模板和资源
└── agents/               # 可选：子代理定义
    ├── thinking/         #   分析/决策代理
    ├── writing/          #   报告/文档代理
    └── operations/       #   工作流操作代理
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name              # 1-64 字符，小写，仅允许连字符
description: "功能描述及使用场景（1-1024 字符）"
metadata:
  author: "learnwy"
  version: "1.0"
  source: "可选的来源引用"
---
```

### 渐进式加载

| 层级 | Token 预算 | 加载时机 |
|------|-----------|---------|
| Metadata | ~100 tokens | 启动时（所有技能） |
| Instructions | < 5000 tokens | 技能激活时 |
| Resources | 按需 | 按需加载 |

### 脚本约定

- **TypeScript 源码**位于仓库根目录的 `src/<skill-name>/` 和 `src/shared/`
- **构建产物**提交在 `skills/<skill-name>/scripts/*.cjs`（请勿手动编辑）
- 每个技能遵循 1:1 布局，由 `rslib.config.ts` 扫描器自动识别：
  ```
  src/<skill>/
  ├── cli.ts              ← 可选；打包为 scripts/cli.cjs（单入口，子命令分发器）
  ├── cmd/<verb>.ts       ← 导出 `command: Command`，由 cli.ts 消费
  ├── lib/*.ts            ← 内部辅助函数（打包到上述文件中；不作为入口）
  └── hooks/<event>.ts    ← 可选；每个文件打包为一个 scripts/hooks/<event>.cjs
  ```
  `src/shared/cli.ts` 提供 `dispatch({ name, commands })` 和 `parseArgs`。包含 hooks 的技能通过从 `src/shared/install-entry.ts` 导入来添加 `install` / `uninstall` 子命令。
- 所有脚本以打包 CJS 形式发布，目标 Node.js ≥ 22
- **路径约定**：SKILL.md 中所有脚本路径相对于 `{skill_root}`（即 SKILL.md 所在目录）。标准调用形式为 `node scripts/cli.cjs <subcommand> [args]`（命令类技能）和 `node scripts/hooks/<event>.cjs`（hook 入口）。
- 所有技能文档使用英文

## 开发指南

### 创建新技能

1. 创建目录：`skills/{skill-name}/`
2. 创建包含有效 frontmatter 的 `SKILL.md`
3. 确认名称与目录名一致（小写，仅连字符）
4. 包含：何时使用、何时不使用、前置条件
5. 如有子代理，添加到 `agents/`
6. 如需脚本，添加到 `scripts/`

### 代码风格

- 除非明确要求，不添加注释
- 所有技能文档和代码使用英文
- 使用命名导出、箭头函数
- 遵循相邻技能中的现有模式

### 测试

没有自动化测试框架。通过以下方式测试技能：
1. 在 AI 助手中加载
2. 验证触发条件按预期工作
3. 检查脚本正确执行
4. 验证输出格式

## 常用工作流

### 结构化开发
使用 `lwy-requirement-workflow` 进行多阶段软件开发：
```
ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING
```

### 方法论分析
毛泽东三论提供三个互补视角：
```
on-contradiction   → 力量是什么？      （结构）
on-practice        → 如何验证？        （过程）
on-protracted-war  → 何时行动与演进？  （时间/战略）
```

### 知识管理
```
lwy-knowledge-consolidation  → 保存单次对话洞察
lwy-llm-wiki                 → 构建完整的复利式知识库
```

### 创建项目级扩展
```
lwy-project-skill-writer     → 为项目创建可复用技能
lwy-project-agent-writer     → 创建专用代理
trae-rules-writer        → 创建 AI 行为规则
lwy-project-skill-installer  → 将已有技能安装到项目中
```

### 构建系统（rslib + pnpm）

仓库使用 [`@rslib/core`](https://rslib.rs) 和 [pnpm](https://pnpm.io)。`rslib.config.ts` 自动扫描 `src/<skill>/` 目录，为每个 `cli.ts` 和每个 `hooks/<event>.ts` 各生成一个打包后的 CJS 入口 — 无需维护逐技能的入口列表。

```
src/                          ← 源码（TypeScript）
├── shared/
│   ├── cli.ts                ← 命令分发器 + parseArgs 辅助函数
│   ├── hooks-lib.ts          ← Hook 工具函数（stdin、injectContext、install/uninstall 原语）
│   ├── install-entry.ts      ← `installCommand` / `uninstallCommand` 作为子命令导出
├── lwy-llm-wiki/{cli,cmd/,lib/,hooks/}
├── lwy-prompt-optimizer/{cli,hooks/}
├── lwy-requirement-workflow/{cli,cmd/,lib/}
├── lwy-knowledge-consolidation/{cli,cmd/}
├── project-{agent,skill}-writer/{cli,cmd/}
└── trae-rules-writer/{cli,cmd/}

skills/<name>/scripts/        ← 打包产物，已提交，请勿手动编辑
├── cli.cjs                   ← 每个技能的单一入口
└── hooks/<event>.cjs         ← 每个 src/<skill>/hooks/*.ts 对应一个

scripts/manage-hooks.mjs      ← 编排器，为每个包含 hooks.json 的技能运行 `cli.cjs install`
```

**构建命令**：
```bash
pnpm install                  # 一次性安装
pnpm run build                # 打包所有技能
pnpm run watch                # 开发监听模式
pnpm run typecheck            # 仅类型检查不生成文件
pnpm run check                # typecheck + build（CI 门禁）
```

**技能命令**（统一的逐技能 CLI）：
```bash
pnpm run install:hooks                                     # 全局注册所有技能 hooks
pnpm run uninstall:hooks                                   # 移除所有技能 hooks
node skills/lwy-llm-wiki/scripts/cli.cjs init                  # 初始化知识库（任何子命令可用 --help 查看用法）
node skills/lwy-llm-wiki/scripts/cli.cjs health-check          # 单技能安装（由 manage-hooks 调用）
```

**发布命令**：
```bash
pnpm run release              # git push + pnpm dlx skills install + 注册 IDE hooks
```

发布按以下三个步骤顺序执行：
1. `git push origin main` — 将新的打包文件发布到 GitHub
2. `pnpm dlx skills install -g -y learnwy/skills` — 拉取最新版到 `~/.agents/skills/<name>/`，并向所有 15 个支持的 AI 代理注册每个技能
3. `pnpm run install:hooks` — `scripts/manage-hooks.mjs` 遍历每个包含 `hooks.json` 的技能，运行其 `cli.cjs install --scope global --target both`，在 `~/.claude/settings.json`、`~/.trae/hooks.json`、`~/.trae-cn/hooks.json` 和 `~/.codex/hooks.json` 中注册条目，并确保 `~/.codex/config.toml` 使用 canonical `[features].hooks = true`。幂等操作。

**Pre-commit 守卫**：`.githooks/pre-commit` 在 `src/`、`scripts/`、`rslib.config.ts`、`tsconfig.json` 或 `package.json` 被暂存时运行 `pnpm run check`，如果 `skills/*/scripts/` 不同步则拒绝提交。然后运行 `node scripts/lint-skill-docs.mjs` 检查 `SKILL.md` 中提到的 `cli.cjs <subcommand>` 是否都能在 `src/<skill>/cli.ts` 的 `commands` map 里解析到，未对齐就拒绝提交。`pnpm install` 通过 `prepare` 脚本（`git config core.hooksPath .githooks`）将这两个守卫接入。

**Hook 安装幂等性**：`scripts/manage-hooks.mjs install` 现在先做一次 uninstall 扫描再 install，因此重复运行 `pnpm run install:hooks` 不会留下旧拓扑（例如旧版本曾在每个技能下注册 UserPromptSubmit，新版本统一走 dispatcher 后多次执行 install 会自然清理）。`pnpm run release --dry-run` 展示每一步将要执行的命令，但不实际推送或安装。

### 自动数据演进 (Auto-Evolution)

围绕 `~/.learnwy/` 的数据流由四类钩子驱动，逐步把"沉淀的数据"转换成"主动作用于用户的反馈"：

1. **数据采集**（`UserPromptSubmit` 经 dispatcher）：
   - lwy-prompt-optimizer 把每次触发记录到 `~/.learnwy/lwy-prompt-optimizer/events.jsonl`
   - lwy-llm-wiki 扫描关键词命中，注入相关 wiki topic 列表
2. **数据回流**（`Stop` 经 dispatcher）：
   - lwy-knowledge-consolidation 在检测到 "解决问题" 信号时一次性 nudge `/save`
3. **数据呈现**（`SessionStart` 经 dispatcher）：
   - lwy-llm-wiki 注入相关主题
   - lwy-status 每 ISO 周首次会话推送综合摘要 + 自动后台刷新过期的 health.json
4. **手动检视**：
   - `lwy-status status` — 全局综合面板
   - `lwy-status doctor` — 系统体检（hook 注册、目录结构、Node 版本）
   - `lwy-llm-wiki health-check` / `lwy-prompt-optimizer trends` — 子系统快照

新加子系统应遵循同一模式：lib 函数纯化、副作用包裹在 lib、入口仅 readStdin + 调用 lib + injectContext。

### 依赖策略

当技能需要运行时依赖时，选择合适的层级 — 切勿默认让消费者执行 `pnpm install`：

| 依赖类型 | 策略 |
|----------|------|
| **内置 Node 模块**（`node:fs`、`node:path` 等） | 添加到 `rslib.config.ts` 的 `output.externals` 中。在技能的 SKILL.md `## Prerequisites` 中记录所需的 Node 版本。 |
| **纯 JS 依赖**（如 `yaml`、`zod`、`chalk`） | 打包到产物中（rslib 默认行为）。消费端无需安装。 |
| **原生依赖**（如 `better-sqlite3`、`sharp`） | 为技能提供一个小型 `skills/<name>/package.json` 包含运行时依赖。在 SKILL.md 的 Prerequisites 中告知用户执行一次 `cd skills/<name> && pnpm install`。 |

每个有非平凡运行时需求的技能都必须在其 SKILL.md `## Prerequisites` 章节中列出，以便 AI 助手（和人类读者）在运行前了解。

**构建理念**：
- 每个共享工具一份源码 — hook 辅助函数、CLI 分发器和安装入口从 `src/shared/` 打包引入，从不复制粘贴。
- 打包产物**可读**（不压缩、不混淆），便于 AI 助手内省。
- `cleanDistPath: false` — 构建不会删除 `SKILL.md`、`hooks.json`、`agents/` 或 `references/`。只在 `scripts/` 下写入 `*.cjs` 文件。
- 每次修改 `src/` 的提交都必须附带相应重建的 `skills/*/scripts/`。提交前运行 `pnpm run build` — `pre-commit` 钩子也会强制执行此规则。

### IDE Hooks

技能可以注册确定性 hooks，在 IDE 生命周期事件（SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、Stop）时触发。兼容 Trae、Claude Code 和 Codex。

```
skills/<name>/hooks.json                       → 逐技能 hook 配置（手写）
skills/<name>/scripts/cli.cjs                  → install/uninstall 子命令（通过共享 install-entry）
skills/<name>/scripts/hooks/<event>.cjs        → 打包后的 hook 事件处理器
```

**作用域约定**：
- 全局存储数据的技能（`~/...`）→ 全局安装 hooks（`--scope global`）
- 项目级操作的技能 → 项目级安装 hooks（`--scope project`）

**Hook 安装**：
```bash
# 安装（从技能目录执行）
node scripts/cli.cjs install --scope global --target both

# 卸载
node scripts/cli.cjs uninstall --scope global --target both
```

**安装位置**：
- Trae: `~/.trae/hooks.json`（独立 hooks 文件）
- Claude Code: `~/.claude/settings.json`（合并到 `hooks` 键中）
- Codex: `~/.codex/hooks.json`（独立 hooks 文件）；`~/.codex/config.toml` 中使用 `[features].hooks = true`，不要再写 deprecated `codex_hooks`
