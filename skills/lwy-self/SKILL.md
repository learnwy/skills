---
name: lwy-self
description: "个人「分身/alter-ego」生活与工作记录。当用户想记录今天做了什么、与谁协作、推进了哪些项目/决策，或说『记一下』『今天』『周报』『我的同事/项目』『alter ego』『生活日志』时触发。把日常沉淀进私有的 self 知识库（diaries/people/products/events），让 AI 成为了解你的分身。与 lwy-llm-wiki（世界知识：书/概念）相对，本 skill 管理私人层。"
metadata:
  author: "learnwy"
  version: "1.0"
  privacy: "private — local-only, never pushed to the public repo"
---

# lwy-self — 个人分身 / Alter-Ego

记录你的**生活与工作**，构建一个了解你的私人自我模型——与 `lwy-llm-wiki`（世界知识）相对的**个人层**。

- **世界 wiki**（`~/.learnwy/llm-wiki/`，公开）："我对世界的认知"——书、概念、作者。
- **分身 / self**（`~/.learnwy/ai/private/self/`，私有 submodule，本地）："我是谁、做了什么、认识谁"——日志、同事、项目、决策。

## 存储与引擎

self 与 `lwy-llm-wiki` 共享**同一个引擎**（公共模块 `src/shared/wiki/`），只是默认 root 不同。`lwy-self` 现在有**自己的二进制**，默认就指向私有 self root（`~/.learnwy/ai/private/self`），所以日常命令**无需 `--root`**；如需指向别的库，`--root` 仍可覆盖。

```sh
# lwy-self 自带默认 root（私有 self 库），无需 --root
lwy-self stats
lwy-self lint
lwy-self generate-index
lwy-self generate-topics

# --root 仍可覆盖默认 root
lwy-self stats --root /some/other/wiki
```

完整操作手册见该 root 下的 `CLAUDE.md`（实体优先布局、采集节奏、隐私约定）。

## 何时用本 skill

| 信号 | 动作 |
|------|------|
| "记一下 / 今天 / 刚才和X聊了" | **每日速记**：在 `ai/private/self/wiki/diaries/<ISO-周>.md` 追加一条带日期的 bullet |
| "整理本周 / 周报 / 回顾这周" | **周回顾**：读本周 diary，把稳定事实提炼进 people/products/events 实体页 |
| "X是谁 / 我和谁在做Y / 这个项目什么情况" | **查询**：读 self 的 people/products/events 页并作答 |
| "把这个飞书群/文档沉淀进来" | **采集**：经 `lark-context` 落 `raw/lark/`，再编译进 threads/people/events（见 lwy-llm-wiki 的 ingest-lark 流程） |

## 三步工作流

1. **每日速记** → `diaries/<ISO-周>.md` 下按日期追加一行（事件 / 对话 / 决策）。一句一条，先落不丢。
2. **编译** → 当某条值得固化时，把它整合进相关 `[[people/slug]]` / `[[products/slug]]` / `[[events/slug]]` 实体页并交叉链接（编译是整合进网络，不是孤立摘要）。
3. **周回顾** → 读整周 diary，提炼持久事实进实体页，跑 lint 保持链接干净。

## 边界

- **隐私**：PII 与公司内部内容。仅本地 + 私有 submodule，**绝不**复制进公开的 `llm-wiki/` 世界库。
- **不负责**：世界知识（书/概念）→ 用 `lwy-llm-wiki`；通用对话洞察 → `lwy-knowledge-consolidation`。
- 中文内容在此完全 OK（单用户私人库）。
