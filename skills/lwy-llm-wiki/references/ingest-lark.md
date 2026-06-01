# 飞书收录工作流（ingest-lark）

把飞书群聊与文档作为**一类原始来源**接入 llm-wiki。`lark-context` CLI 只负责拉数据；
编译/沉淀逻辑由本工作流拥有，产物写入统一的 `~/.learnwy/llm-wiki/` wiki，而**不再**写
独立的 `~/.claude/lark-memory/`（该库已退役并迁入本 wiki）。

> 全过程由 Claude 本地完成，不调任何外部 LLM API。

## 前置依赖

- `lark-context` ≥ 0.1.0（`bnpm i -g @tiktok-fe/lark-context`）
- `lark-cli` 已 `auth login`
- 第一步先自检：`lark-context --version`；未装/未登录则透传 stderr，不替用户登录。

## 触发

- "沉淀一下飞书群 / 把最近聊的整理进 wiki"
- "收下这个飞书文档 <url>"
- "最近 X 群聊了啥，记进知识库"

## Step 1 — 决定时间窗口

```bash
sqlite3 ~/.lark-context/raw.db "SELECT value FROM kv WHERE key='last_digest_at'"
```

| 情况 | 窗口 |
|---|---|
| `last_digest_at` 有值且用户没说窗口 | `--since 24h` |
| `last_digest_at` 为空 + 用户点名特定群 | `--since 90d`（首次沉淀兜底） |
| 用户明确说了窗口 | 按用户说的 |

## Step 2 — 解析 chat 过滤

```bash
lark-context groups list
```

把用户说的群名/别名匹配成一个具体 alias。说"所有群"或不点名 → 不加 `--chat`。
新群未关注 → 提示走 `groups add` + `pull`，沉淀本身不主动加群。

## Step 3 — 拉取并落 raw（不可变层）

```bash
lark-context pull [--chat <alias>] [--since <window>]      # 同步到 SQLite
lark-context show [--chat <alias>] --since <window>        # 取原文
```

把本次 `show` 原文**原样**存档到 `raw/lark/<alias>-<ISO-date>.md`（带 `**Source**:`、
`**Pulled**:`、`**Chat**:` 头）。这是本次沉淀的**唯一事实来源**——不捏造、不从记忆补 show 里没有的事。

`show` 为空 → 告诉用户"窗口内无新消息"，不写任何编译页，结束（可按需仍更新时间戳）。

文档场景：`lark-context show-doc <token-or-url>` → 存 `raw/lark/doc-<slug>.md`。

## Step 4 — 编译进 wiki（编译层）

读 `raw/lark/` 的本次存档，增量 merge 到对应实体/来源页。映射：

| 飞书内容 | 目标 | slug 示例 |
|---|---|---|
| 群聊会话沉淀（一次 digest 一页或按群累积） | `wiki/threads/<alias>.md` | `threads/gec-search.md` |
| 编年流水（按 ISO 周） | `wiki/diaries/<ISO-week>.md` | `diaries/2026-W22.md` |
| 出现的人 | `wiki/people/<slug>.md` | `people/hou-yu.md` |
| 项目 / 产品 | `wiki/products/<slug>.md` | `products/toko-standalone.md` |
| 决策 / 有日期的事件 | `wiki/events/<slug>.md` | `events/mira-router.md` |
| 组织 / 团队 | `wiki/organizations/<slug>.md` | |
| 术语 / 概念 | `wiki/concepts/<slug>.md` | |
| 文档摘要 | `wiki/articles/<slug>.md` | |

**增量 merge 规则**：
- 保留用户手写段落**原封不动**，新事实带日期标签追加
- summary 过时可改写
- 价值判断：第一次出现的短暂提及不建新实体；出现 ≥2 次 / 用户说"记一下" / 可执行决策 → 建。宁缺毋滥
- 冲突（同一事实两个来源说法不同）：两条都列，标注来源（群 + 日期 + 发言人）
- 交叉引用：thread/diary 页用 `[[people/...]]`、`[[products/...]]`、`[[events/...]]` 链到实体

## Step 5 — 更新索引 + 时间戳 + 日志

```bash
cd skills/llm-wiki && node scripts/cli.cjs generate-index && node scripts/cli.cjs generate-topics
sqlite3 ~/.lark-context/raw.db "INSERT INTO kv(key,value) VALUES('last_digest_at', datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
```

往 `log.md` 追加一行：`<date> ingest-lark <alias> — N 条消息 → X 实体 / Y 来源页`。

## Step 6 — 回报用户

> 沉淀了 N 条消息，更新 X 个实体（P 人 / Pr 产品 / E 事件）和 Y 个来源页（threads/diaries）。

可附"新建 A / 修改 B 文件"的简要列表。

## 注意事项

- **不要 fabricate**：只记 show 输出里的事实
- **保留用户手写内容**：实体页手写段落永不动，只在机器可识别区域（dated bullet / summary）追加
- **CLI 非零退出**：透传 stderr，命中已知场景（未装 / 未 auth / 被踢出群）补一句建议；否则纯透传
- **窗口太窄无消息**：报告窗口太窄，不硬写
