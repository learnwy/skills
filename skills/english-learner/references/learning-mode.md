# Learning Mode — Response Formats

When the user explicitly invokes the learner (lookup / quiz / stats), use these unified formats.

## Input classification

Use `cli.cjs sentence classify <text>` to pick the right path:

| Type | Rule | Example |
|---|---|---|
| word | single token | `run`, `ephemeral` |
| phrase | 2–5 tokens, no end punctuation | `break the ice` |
| sentence | 6+ tokens or contains `.!?` | `The early bird catches the worm.` |

If multiple items / unclear intent → use `AskUserQuestion` to disambiguate.

## Word card

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

## Phrase card

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

## Sentence breakdown

```
📝 **句子分析**

**原文:** {original}
**译文:** {translation}
**朗读:** {phonetic_guide}

---

**词汇拆解:**

{For each key word/phrase, render with the Word/Phrase card above}

---
📊 新增词汇: {new_words_list}
```

## Quiz mode (`学习` / `review` / `quiz`)

```
1. cli.cjs quiz generate 5 all low_mastery
2. If empty → show "词库为空" + usage hints
3. For each quiz item:

   AskUserQuestion:
     question: "📖 **{word}** 的意思是什么？"
     header: "Quiz"
     options:
       - "认识" — "我知道这个词的意思"
       - "模糊" — "有点印象但不确定"
       - "不认识" — "完全不知道"

4. Show the answer (Word/Phrase card)

5. AskUserQuestion:
     question: "掌握程度如何？"
     header: "Mastery"
     options:
       - "完全掌握" — "+10 mastery"
       - "基本掌握" — "+5 mastery"
       - "需要加强" — "-5 mastery"

6. cli.cjs vocab update_mastery <item> true <result>
7. Continue or show summary
```

### Empty vocab fallback

```
📚 **词库为空**

还没有添加任何词汇。试试查询一些单词或句子吧！

示例:
- 输入 `apple` 查询单词
- 输入 `break the ice` 查询短语
- 输入一句英文或中文来翻译和学习
```

## Stats mode (`stats` / `统计`)

```
📊 **学习统计**

| 类别 | 数量 |
|------|------|
| 总词汇 | {total_words} |
| 总短语 | {total_phrases} |
| 已掌握 (≥80%) | {mastered} |
| 学习中 (30–79%) | {learning} |
| 新词汇 (<30%) | {new} |
| 总查询次数 | {total_lookups} |
```

## Pre-response checklist

Before responding to the user, confirm:

- [ ] English intercept: scanned for issues if user wrote in English
- [ ] English intercept: showed corrections (max 3) and tip table
- [ ] English intercept: saved corrected items via `batch_save`
- [ ] Chinese intercept: checked grammar/typos and showed corrections (if any)
- [ ] Chinese intercept: translated to 2–3 English variants
- [ ] Chinese intercept: extracted key vocab and `batch_save`d it
- [ ] Extracted all words/phrases from input
- [ ] Ran `batch_get` for batch lookups
- [ ] Saved new words via `batch_save` (mandatory — not optional)
- [ ] Logged the query via `log_query`
- [ ] Response uses the unified format above
