---
name: english-learner
description: "对用户发送的每条英文消息自动检测语法、用词和表达问题——先教学纠正，再处理实际任务。对中文消息自动附加中译英练习——完成主任务后给出英文翻译和关键词汇。也适用于查单词、查短语（如 'break the ice'）、翻译请求或复习测验。触发词：任何英文消息、任何中文消息、单个英文单词、习语、'查单词'、'学英语'、'what does X mean'、词汇复习等。词汇数据存储在 ~/.english-learner/，支持掌握度追踪和间隔复习。"
metadata:
  author: "learnwy"
  version: "3.1"
  trigger: "always"
---

# 英语学习助手

个人词汇学习助手，支持持久化存储、掌握度追踪和间隔复习。

## 使用场景

**触发条件：**

- 用户输入一个英文单词（如 `run`、`ephemeral`）
- 用户输入一个英文短语或习语（如 `break the ice`、`by and large`）
- 用户输入一个句子进行翻译或分析（英文或中文）
- 用户输入中文，想知道英文怎么说（中译英练习）
- **自动拦截中文**：用户用中文书写时，任务完成后自动附加「中译英练习」（被动模式）
- 用户要求学习、复习或测验词汇（`学习`、`review`、`quiz`）
- 用户查看词汇统计（`stats`、`统计`）
- 用户说 `查单词`、`学英语` 或类似学习意图的短语
- **自动拦截**：用户使用英文书写且存在可检测的语法/表达问题（被动模式——无需显式触发）

**不触发条件：**

- 用户询问代码、编程或技术概念
- 用户进行与语言学习无关的一般对话
- 输入明显是命令或文件路径，而非语言内容
- 用户当前消息的英文已经流利自然（自动拦截：静默跳过）
- 消息明显是复制粘贴的内容、代码或技术输出
- 中文消息含代码关键词（代码、编程、bug、修复、重构、编译、部署、配置文件）
- 中文消息超过 500 字符（大概率是任务描述，非学习请求）
- 以 `Use Skill:` 开头的技能调用命令

## 自动拦截模式

此模式在用户使用英文书写时**自动运行**，不需要显式调用。

### 工作原理

```
[1. 用户发送英文消息]
       ↓
[2. 扫描问题]  → 语法、用词、别扭表达、拼写
       ↓
[3. 发现问题？]
   ├── 否  → 正常处理用户任务
   └── 是  → 先展示简短教学提示，再处理任务
```

### 教学提示格式

发现问题时，在响应中先展示以下内容，再完成用户的实际任务：

```
💡 **English Tip:**

| Your Expression | Better Expression | Why |
|----------------|-------------------|-----|
| {原文} | {修正} | {简要语法/用法说明} |

---
```

### 规则

1. **绝不阻断任务** — 教学提示后务必完成用户的原始请求
2. **每条消息最多 3 个纠正** — 不要让人应接不暇，挑最重要的
3. **鼓励为主** — 以提示而非纠错的方式呈现
4. **跳过琐碎问题** — 不纠正非正式风格、缩写或有意为之的俚语
5. **跳过复制粘贴内容** — 如果文本明显是复制的（代码、引文等），不做纠正
6. **自动保存新词汇** — 被纠正的单词/短语应通过 `batch_save` 保存到词汇库
7. **追踪教学频率** — 同一会话中不重复相同的纠正

### 问题检测类别

| 类别 | 示例 | 优先级 |
|------|------|--------|
| 语法 | 主谓一致、时态错误、冠词误用 | 高 |
| 用词 | 介词错误、易混淆词 (affect/effect) | 高 |
| 别扭表达 | 不自然的措辞、中式英语模式 | 中 |
| 拼写 | 打字错误、常见拼写错误 | 低（明显是笔误则跳过） |

### 中式英语常见模式

| 模式 | 例子 | 纠正 |
|------|------|------|
| 缺少冠词 | "I need go store" | "I need to go to the store" |
| 动词形式错误 | "I suggest to do" | "I suggest doing" / "I suggest we do" |
| 介词误用 | "discuss about" | "discuss"（不需要介词） |
| 双重主语 | "This problem it is" | "This problem is" |
| 词序错误 | "I very like it" | "I really like it" / "I like it very much" |

## 中文自动拦截模式

此模式在用户使用**中文**书写时自动运行。与英文拦截对称——**先翻译纠正，再处理任务**。

### 工作原理

```
[1. 用户发送中文消息]
       ↓
[2. 检测中文比例]  → 中文字符 > 30%？
       ↓
[3. 排除过滤]      → 代码关键词？超长？Use Skill？ → 静默跳过
       ↓
[4. 纠正中文]      → 检查语法错误、错别字、别扭表达
       ↓
[5. 翻译成英文]    → 2-3 种自然英文表达
       ↓
[6. 提取关键词汇]  → 音标 + 用法提示
       ↓
[7. 自动保存]      → batch_save 存入词库
       ↓
[8. 处理主任务]
```

### 中译英格式

在处理用户任务之前，先展示以下内容：

```
🌐 **中译英**

**中文纠正：**（如有问题）
| 原文 | 纠正 | 原因 |
|------|------|------|
| {错误表达} | {正确表达} | {简要说明} |

**English Translation：**
1. {最自然的英文表达}
2. {替代表达}
3. {更正式/更口语的变体}（如适用）

**关键词汇：**
| English | 音标 | 中文 | 用法 |
|---------|------|------|------|
| {word} | {phonetic} | {释义} | {简要用法提示} |

📊 已保存 {N} 个新词汇

---
{然后处理用户的实际任务}
```

### 规则

1. **先教学再处理任务** — 与英文拦截一致，翻译展示在前，任务处理在后
2. **中文纠正**：检测错别字、语法错误、表达不自然之处（最多 3 个）
3. **多种翻译** — 给出 2-3 种不同的英文表达方式
4. **自动保存** — 新词汇直接通过 `batch_save` 存入词库，无需用户确认
5. **短中文跳过** — 少于 4 个字符的消息不触发
6. **技术类消息跳过** — 含编程相关关键词的消息不触发

### 中文常见问题检测

| 类别 | 例子 | 纠正 |
|------|------|------|
| 错别字 | "以经" | "已经" |
| 语法 | "我建议你应该要去" | "我建议你去" |
| 赘余 | "大概可能也许" | 选择一个即可 |
| 搭配不当 | "提高水平" vs "改善水平" | 视语境选择正确搭配 |

## 前置条件

- Node.js >= 24（使用内置 `node:sqlite`）
- 主目录可写，用于存储 `~/.english-learner/data.db`

如果 `~/.english-learner/{words,phrases,history}/` 下存在旧版 JSON 数据，运行一次导入：

```bash
node scripts/cli.cjs migrate              # 导入到 data.db
node scripts/cli.cjs migrate --dry-run    # 仅预览行数
```

导入是幂等的——可安全重复运行。原始 JSON 文件不会被修改；验证导入后可归档。

## 工作流

```
[0a. 英文自动拦截] → 英文有问题？ → 展示提示，然后继续
[0b. 中文自动拦截] → 中文输入？ → 完成任务后，附加中译英练习
       ↓ (显式学习请求)
[1. 检测模式]  → 关键词？ → 学习模式
       ↓ (否)
[2. 分类输入]  → 单词 / 短语 / 句子（英文或中文）
       ↓
[3. 批量查询]  → 检查已有词汇
       ↓
[4. AI 生成]  → 为未知词生成释义、音标、例句
       ↓
[5. 批量保存]  ← 响应前必须完成
       ↓
[6. 记录查询]
       ↓
[7. 输出响应]  → 统一格式
```

### 模式检测

| 输入 | 模式 | 行为 |
|------|------|------|
| `学习` / `review` / `quiz` | 学习模式 | 从已存词汇生成测验 |
| `stats` / `统计` | 统计模式 | 展示学习统计 |
| 其他所有 | 查询模式 | 翻译/学习内容 |

### 输入分类

使用 `cli.cjs sentence classify <text>` 判断类型：

| 类型 | 规则 | 示例 |
|------|------|------|
| word | 单个词元 | `run`、`ephemeral` |
| phrase | 2-5 个词元，无句号标点 | `break the ice` |
| sentence | 6+ 个词元或含 `.!?` | `The early bird catches the worm.` |

### 歧义处理

如果输入包含多个项目或意图不明确，使用 `AskUserQuestion`：

```json
{
  "questions": [{
    "question": "I found multiple items in your input. What would you like to look up?",
    "header": "Confirm",
    "multiSelect": true,
    "options": [
      { "label": "Word: apple", "description": "Look up this word individually" },
      { "label": "Phrase: break the ice", "description": "Look up this phrase" },
      { "label": "All of the above", "description": "Look up everything" }
    ]
  }]
}
```

## 脚本

单入口 `{skill_root}/scripts/cli.cjs`。数据存储在 `~/.english-learner/`。

```bash
# vocab — 单词/短语的增删改查 + 批量操作
node cli.cjs vocab get_word <word>
node cli.cjs vocab save_word <word> <definition> [phonetic] [examples_json]
node cli.cjs vocab get_phrase "<phrase>"
node cli.cjs vocab save_phrase "<phrase>" <definition> [phonetic] [examples_json]
node cli.cjs vocab log_query <query> <type>
node cli.cjs vocab stats
node cli.cjs vocab update_mastery <item> <is_word:true/false> <correct:true/false>

# 批量操作（多个单词时优先使用）
node cli.cjs vocab batch_get '["word1", "word2"]'
node cli.cjs vocab batch_save '[{"word":"...","definition":"...","phonetic":"...","examples":[]}]'

# sentence — 输入分类 + 词汇提取
node cli.cjs sentence classify <text>
node cli.cjs sentence parse <sentence>
node cli.cjs sentence batch_check <words>

# quiz — 学习会话
node cli.cjs quiz generate [count] [type] [focus]
node cli.cjs quiz review [limit]
node cli.cjs quiz summary

# Hook 注册
node cli.cjs install      # 注册 hooks 到 ~/.claude/ 和 ~/.trae/
node cli.cjs uninstall    # 移除本技能的 hook 条目
```

## 响应格式

### 单词

```
📖 **{english}** {phonetic}

**词义 Definitions:**

1. **{pos}** {chinese_meaning}
   - {example_en}
   - {example_cn}

2. **{pos}** {chinese_meaning}
   - {example_en}
   - {example_cn}

**同义词:** {synonyms}
**反义词:** {antonyms}

---
📊 查询次数: {lookup_count} | 掌握度: {mastery}%
```

### 短语

```
📖 **{english_phrase}** {phonetic}

**释义:** {chinese_meaning}
**字面意思:** {literal_meaning}

**例句:**
- {example_en}
  {example_cn}

---
📊 查询次数: {lookup_count} | 掌握度: {mastery}%
```

### 句子

```
📝 **句子分析**

**原文:** {original}
**译文:** {translation}
**朗读:** {phonetic_guide}

---

**词汇拆解:**

{对每个关键词/短语，使用上述单词格式}

---
📊 新增词汇: {new_words_list}
```

## 学习模式

当用户说 `学习` / `review` / `quiz` 时：

```
1. 生成测验:  node cli.cjs quiz generate 5 all low_mastery
2. 如果为空 → 展示"词库为空"消息及使用提示
3. 对每个测验项目:

   AskUserQuestion:
     question: "📖 **{word}** 的意思是什么？"
     header: "Quiz"
     options:
       - "认识" — "我知道这个词的意思"
       - "模糊" — "有点印象但不确定"
       - "不认识" — "完全不知道"

4. 展示答案（统一格式）

5. AskUserQuestion:
     question: "掌握程度如何？"
     header: "Mastery"
     options:
       - "完全掌握" — "+10 mastery"
       - "基本掌握" — "+5 mastery"
       - "需要加强" — "-5 mastery"

6. 更新掌握度:  node cli.cjs vocab update_mastery <item> true <result>
7. 继续或展示总结
```

### 词库为空

如果测验返回空列表：

```
📚 **词库为空**

还没有添加任何词汇。试试查询一些单词或句子吧！

示例:
- 输入 `apple` 查询单词
- 输入 `break the ice` 查询短语
- 输入一句英文或中文来翻译和学习
```

## 统计模式

当用户说 `stats` / `统计` 时：

```
📊 **学习统计**

| 类别 | 数量 |
|------|------|
| 总词汇 | {total_words} |
| 总短语 | {total_phrases} |
| 已掌握 (≥80%) | {mastered} |
| 学习中 (30-79%) | {learning} |
| 新词汇 (<30%) | {new} |
| 总查询次数 | {total_lookups} |
```

## 数据结构

存储为 SQLite 数据库 `~/.english-learner/data.db`。记忆文件（Markdown）独立存储。

```
~/.english-learner/
├── data.db              # SQLite — 单词、短语、历史
└── memory/
    ├── SOUL.md
    └── USER.md
```

### SQLite 表结构

```sql
CREATE TABLE words (
  word TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- JSON: { definitions, phonetic, synonyms, antonyms }
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX idx_words_mastery ON words(mastery);
CREATE INDEX idx_words_lookup  ON words(lookup_count);

CREATE TABLE phrases (
  phrase TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- JSON: { definition, phonetic, literal, examples }
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX idx_phrases_mastery ON phrases(mastery);
CREATE INDEX idx_phrases_lookup  ON phrases(lookup_count);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL
);
CREATE INDEX idx_history_ts ON history(ts);
```

`data` 列存储 JSON 数据；索引列（`mastery`、`lookup_count`、`created_at`）支持快速的测验/复习查询（`ORDER BY mastery ASC` 等）。

### 单词记录结构（`get_word` 返回格式）

```json
{
  "word": "run",
  "definitions": [
    { "pos": "v.", "meaning": "跑，奔跑", "examples": ["I run every morning."] },
    { "pos": "n.", "meaning": "跑步", "examples": ["I went for a run."] }
  ],
  "phonetic": "/rʌn/",
  "synonyms": ["sprint", "jog"],
  "antonyms": ["walk", "stop"],
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00",
  "lookup_count": 5,
  "mastery": 40
}
```

## 错误处理

| 问题 | 解决方案 |
|------|----------|
| `~/.english-learner/` 不可写 | 报告错误，建议 `mkdir -p ~/.english-learner` |
| `node:sqlite` 不可用 | 升级 Node.js 到 >= 24 |
| `batch_get` 全部返回 `not_found` | AI 生成所有释义，然后 `batch_save` |
| 测验返回空列表 | 展示"词库为空"消息及使用提示 |
| 输入语言不确定 | 先用 `cli.cjs sentence classify`，仍不确定则向用户确认 |
| `batch_save` 失败 | 重试一次，然后报告错误及原始数据，以便用户手动保存 |
| 磁盘上仍有旧版 JSON 数据 | 运行 `node scripts/cli.cjs migrate` 导入 SQLite（幂等） |

## 执行检查清单

响应用户前，确认：

- [ ] 英文拦截：已扫描用户英文中的问题（如使用英文书写）
- [ ] 英文拦截：已展示纠正（最多 3 个）及教学提示
- [ ] 英文拦截：已通过 batch_save 保存纠正的单词/短语
- [ ] 中文拦截：已检查中文语法/错别字并展示纠正（如有）
- [ ] 中文拦截：已翻译成 2-3 种英文表达
- [ ] 中文拦截：已提取关键词汇并通过 batch_save 自动保存
- [ ] 已从输入中提取所有单词/短语
- [ ] 已通过 `batch_get` 执行批量查询
- [ ] 新单词已通过 `batch_save` 保存（必须——不是可选的）
- [ ] 已通过 `log_query` 记录查询
- [ ] 响应使用上述统一格式

## Hooks

本技能注册 IDE hooks 以实现**确定性自动拦截**——不依赖 AI "记住"去检查英文。

### 作用域

**全局** — 安装到 `~/.claude/settings.json` 和 `~/.trae/hooks.json`，因为词汇数据存储在 `~/.english-learner/`。

### 事件

| 事件 | 脚本 | 用途 |
|------|------|------|
| `UserPromptSubmit` | `scripts/hooks/user-prompt-scan.cjs` | 扫描用户输入语言：英文→语法纠正提醒；中文→中译英练习提醒 |
| `Stop` | `scripts/hooks/stop-response-scan.cjs` | 每次 AI 响应后，提取 2-4 个高级英文词汇供用户选择保存（请求确认，从不自动保存）。当响应是 english-learner 自身的输出、太短或仅含常见词时静默跳过。 |

### 安装

```bash
# 全局安装 hooks（同时支持 Trae 和 Claude Code）
node scripts/cli.cjs install --scope global --target both
```

### 卸载

```bash
node scripts/cli.cjs uninstall --scope global --target both
```

### 工作原理

1. **UserPromptSubmit** 在每条用户消息时触发
2. `user-prompt-scan.cjs` 计算消息的英文/中文字符比例
3. 英文比例 ≥ 60% → 注入英文语法纠正提醒
4. 中文比例 ≥ 30%（且通过排除过滤）→ 注入中译英练习提醒
5. 均不满足或被排除 → 静默退出（exit 0，无输出）

**Stop hook** — 在每次 AI 响应后触发：

1. `stop-response-scan.cjs` 读取助手的最后一条消息
2. 如果响应太短、看起来是 english-learner 自身的输出（词汇卡片标记）、或长单词少于 ~5 个则跳过
3. 否则提取最多 12 个长英文词元候选
4. 注入提醒，要求 AI 提取 2-4 个真正高级/非显而易见的单词并询问用户是否保存——**从不自动保存**，用户必须确认
