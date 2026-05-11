# Intercept Modes — Detailed Rules

The two passive intercept modes fire automatically when the user writes a message. Both run through `learnwy-dispatch` UserPromptSubmit hook.

## English intercept

Triggered when the user message has English ratio ≥ 60% AND non-prose ratio is low (filters out paths, commands, code).

### Flow

```
[1. User sends English message]
       ↓
[2. Scan]  → grammar, word choice, awkward phrasing, spelling
       ↓
[3. Issues found?]
   ├── No   → handle the task normally
   └── Yes  → show short tip first, then handle the task
```

### Format

```
💡 **English Tip:**

| Your Expression | Better Expression | Why |
|----------------|-------------------|-----|
| {original}     | {correction}      | {short grammar/usage note} |

---
```

### Rules

1. **Never block the task** — show the tip, then complete the request
2. **Max 3 corrections per message** — pick the most important
3. **Encourage, don't lecture** — frame as tips not errors
4. **Skip trivia** — informal style, contractions, intentional slang
5. **Skip pasted content** — code, quotes, output blocks
6. **Auto-save corrected items** — corrected words/phrases go to `vocab batch_save`
7. **Per-session de-duplication** — don't repeat the same correction in one session

### Issue categories

| Category | Examples | Priority |
|---|---|---|
| Grammar | subject-verb agreement, tense, articles | high |
| Word choice | preposition errors, affect/effect | high |
| Awkward phrasing | unnatural wording, Chinglish patterns | medium |
| Spelling | typos, common misspellings (skip if obviously a slip) | low |

### Common Chinglish patterns

| Pattern | Example | Correction |
|---|---|---|
| Missing article | "I need go store" | "I need to go to the store" |
| Wrong verb form | "I suggest to do" | "I suggest doing" / "I suggest we do" |
| Misused preposition | "discuss about" | "discuss" (no preposition) |
| Double subject | "This problem it is" | "This problem is" |
| Word order | "I very like it" | "I really like it" / "I like it very much" |

## Chinese intercept

Triggered when Chinese chars ratio > 30% AND none of the exclusion filters fire (code keywords, length > 500, `Use Skill:` prefix).

### Flow

```
[1. User sends Chinese message]
       ↓
[2. Detect Chinese ratio]  → > 30%?
       ↓
[3. Exclusion filters]    → code keywords / too long / Use Skill? → silent skip
       ↓
[4. Correct Chinese]      → check grammar, typos, awkward expression
       ↓
[5. Translate to English] → 2-3 natural variants
       ↓
[6. Extract key vocabulary] → phonetic + usage hint
       ↓
[7. Auto-save]            → batch_save into vocab DB
       ↓
[8. Handle the actual task]
```

### Format

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
| {word}  | {phonetic} | {释义} | {简要用法提示} |

📊 已保存 {N} 个新词汇

---
{然后处理用户的实际任务}
```

### Rules

1. **Teach first, then handle the task** — symmetric with English intercept
2. **Chinese corrections** — typos, grammar errors, unnatural phrasing (max 3)
3. **Multiple translations** — give 2–3 different English variants
4. **Auto-save** — new vocab goes straight to `batch_save` (no confirmation)
5. **Skip very short Chinese** — < 4 characters won't trigger
6. **Skip technical messages** — code-related keywords filter them out

### Common Chinese issue categories

| Category | Example | Correction |
|---|---|---|
| 错别字 | "以经" | "已经" |
| 语法 | "我建议你应该要去" | "我建议你去" |
| 赘余 | "大概可能也许" | pick one |
| 搭配不当 | "提高水平" vs "改善水平" | choose by context |
