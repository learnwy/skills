---
name: english-learner
description: "Use this skill on EVERY user message written in English to auto-detect grammar, word choice, and expression issues — teach corrections before proceeding with the task. Also use when the user looks up a single word, asks about a phrase like 'break the ice', requests translation, or asks for quiz/review. Triggers on: any English message, single English words, idioms, '查单词', '学英语', 'what does X mean', vocabulary review. Stores vocabulary in ~/.english-learner/ with mastery tracking and spaced repetition."
metadata:
  author: "learnwy"
  version: "3.1"
  trigger: "always"
---

# English Learner

Personal vocabulary learning assistant with persistent storage, mastery tracking, and spaced review.

## When to Use

**Invoke when:**

- User inputs a single English word (e.g. `run`, `ephemeral`)
- User inputs an English phrase or idiom (e.g. `break the ice`, `by and large`)
- User inputs a sentence to translate or analyze (English or Chinese)
- User asks to learn, review, or quiz vocabulary (`学习`, `review`, `quiz`)
- User asks for vocabulary stats (`stats`, `统计`)
- User says `查单词`, `学英语`, or similar learning-intent phrases
- **Auto-intercept**: User writes in English with detectable grammar/expression issues (passive mode — no explicit trigger needed)

**Do NOT invoke when:**

- User is asking about code, programming, or technical concepts
- User is having a general conversation not related to language learning
- Input is clearly a command or file path, not language content
- User's English is already fluent and natural in the current message (auto-intercept: skip silently)
- The message is clearly copy-pasted content, code, or technical output

## Auto-Intercept Mode

This mode runs **automatically** when the user writes in English. It does NOT require explicit invocation.

### How It Works

```
[1. User sends message in English]
       ↓
[2. Scan for issues]  → grammar, word choice, awkward expressions, spelling
       ↓
[3. Issues found?]
   ├── NO  → Proceed with user's task normally
   └── YES → Show brief teaching moment, THEN proceed with task
```

### Teaching Moment Format

When issues are found, prepend this to your response BEFORE doing the user's actual task:

```
💡 **English Tip:**

| Your Expression | Better Expression | Why |
|----------------|-------------------|-----|
| {original} | {corrected} | {brief grammar/usage explanation} |

---
```

### Rules

1. **Never block the task** — always complete the user's original request after the teaching moment
2. **Max 3 corrections per message** — don't overwhelm; pick the most important ones
3. **Be encouraging** — frame as tips, not errors
4. **Skip trivial issues** — don't correct informal style, abbreviations, or intentional slang
5. **Skip when user is copy-pasting** — if the text is clearly copied content (code, quotes, etc.), don't correct
6. **Auto-save new vocabulary** — any corrected words/phrases should be saved to the vocabulary store via `batch_save`
7. **Track teaching frequency** — don't repeat the same correction within the same session

### Issue Detection Categories

| Category | Examples | Priority |
|----------|----------|----------|
| Grammar | Subject-verb agreement, tense errors, article misuse | High |
| Word Choice | Wrong preposition, confusable words (affect/effect) | High |
| Awkward Expression | Unnatural phrasing, Chinglish patterns | Medium |
| Spelling | Typos, common misspellings | Low (skip if clearly a typo) |

### Chinglish Patterns to Watch For

| Pattern | Example | Correction |
|---------|---------|------------|
| Missing articles | "I need go store" | "I need to go to the store" |
| Verb form errors | "I suggest to do" | "I suggest doing" / "I suggest we do" |
| Preposition misuse | "discuss about" | "discuss" (no preposition needed) |
| Double subject | "This problem it is" | "This problem is" |
| Word order | "I very like it" | "I really like it" / "I like it very much" |

## Prerequisites

- Node.js >= 24 (uses built-in `node:sqlite`)
- Writable home directory for `~/.english-learner/data.db`

If you have legacy JSON data under `~/.english-learner/{words,phrases,history}/`, run the importer once:

```bash
node scripts/migrate-from-json.cjs           # import into data.db
node scripts/migrate-from-json.cjs --dry-run # preview row counts only
```

The import is idempotent — safe to re-run. Original JSON files are not touched; you can archive them after verifying the import.

## Workflow

```
[0. Auto-Intercept Check] → English issues? → Show tip, then continue
       ↓ (no issues or explicit learning request)
[1. Detect Mode]  → keyword? → Learning Mode
       ↓ (no)
[2. Classify Input]  → word / phrase / sentence
       ↓
[3. Batch Lookup]  → check existing vocabulary
       ↓
[4. AI Generate]  → definitions, phonetics, examples for unknowns
       ↓
[5. Batch Save]  ← MANDATORY before responding
       ↓
[6. Log Query]
       ↓
[7. Respond]  → unified format
```

### Mode Detection

| Input | Mode | Action |
|-------|------|--------|
| `学习` / `review` / `quiz` | Learning Mode | Generate quiz from saved vocabulary |
| `stats` / `统计` | Stats Mode | Show learning statistics |
| Everything else | Lookup Mode | Translate/learn the content |

### Input Classification

Use `sentence-parser.cjs classify <text>` to determine type:

| Type | Rule | Example |
|------|------|---------|
| word | Single token | `run`, `ephemeral` |
| phrase | 2-5 tokens, no sentence punctuation | `break the ice` |
| sentence | 6+ tokens or has `.!?` | `The early bird catches the worm.` |

### Ambiguity Handling

If input contains multiple items or intent is unclear, use `AskUserQuestion`:

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

## Scripts

All scripts in `{skill_root}/scripts/`. Data stored in `~/.english-learner/`.

```bash
# vocab-manager.cjs — Word/Phrase CRUD + batch operations
node vocab-manager.cjs get_word <word>
node vocab-manager.cjs save_word <word> <definition> [phonetic] [examples_json]
node vocab-manager.cjs get_phrase "<phrase>"
node vocab-manager.cjs save_phrase "<phrase>" <definition> [phonetic] [examples_json]
node vocab-manager.cjs log_query <query> <type>
node vocab-manager.cjs stats
node vocab-manager.cjs update_mastery <item> <is_word:true/false> <correct:true/false>

# Batch operations (PREFERRED for multiple words)
node vocab-manager.cjs batch_get '["word1", "word2"]'
node vocab-manager.cjs batch_save '[{"word":"...","definition":"...","phonetic":"...","examples":[]}]'

# sentence-parser.cjs — Input classification + word extraction
node sentence-parser.cjs classify <text>
node sentence-parser.cjs parse <sentence>
node sentence-parser.cjs batch_check <words>

# quiz-manager.cjs — Learning sessions
node quiz-manager.cjs generate [count] [type] [focus]
node quiz-manager.cjs review [limit]
node quiz-manager.cjs summary
```

## Response Formats

### Word

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

### Phrase

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

### Sentence

```
📝 **句子分析**

**原文:** {original}
**译文:** {translation}
**朗读:** {phonetic_guide}

---

**词汇拆解:**

{For each key word/phrase, use Word format above}

---
📊 新增词汇: {new_words_list}
```

## Learning Mode

When user says `学习` / `review` / `quiz`:

```
1. Generate quiz:  node quiz-manager.cjs generate 5 all low_mastery
2. If empty → show "词库为空" message with usage hints
3. For EACH quiz item:

   AskUserQuestion:
     question: "📖 **{word}** 的意思是什么？"
     header: "Quiz"
     options:
       - "认识" — "我知道这个词的意思"
       - "模糊" — "有点印象但不确定"
       - "不认识" — "完全不知道"

4. Show answer (unified format)

5. AskUserQuestion:
     question: "掌握程度如何？"
     header: "Mastery"
     options:
       - "完全掌握" — "+10 mastery"
       - "基本掌握" — "+5 mastery"
       - "需要加强" — "-5 mastery"

6. Update mastery:  node vocab-manager.cjs update_mastery <item> true <result>
7. Continue or show summary
```

### Empty Vocabulary

If quiz returns empty list:

```
📚 **词库为空**

还没有添加任何词汇。试试查询一些单词或句子吧！

示例:
- 输入 `apple` 查询单词
- 输入 `break the ice` 查询短语
- 输入一句英文或中文来翻译和学习
```

## Stats Mode

When user says `stats` / `统计`:

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

## Data Structure

Storage is SQLite at `~/.english-learner/data.db`. Memory files (Markdown) stay separate.

```
~/.english-learner/
├── data.db              # SQLite — words, phrases, history
└── memory/
    ├── SOUL.md
    └── USER.md
```

### SQLite Schema

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

The `data` column carries the JSON shape; indexed columns (`mastery`, `lookup_count`, `created_at`) enable fast quiz/review queries (`ORDER BY mastery ASC`, etc.).

### Word Record Shape (returned by `get_word`)

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

## Error Handling

| Issue | Solution |
|-------|----------|
| `~/.english-learner/` not writable | Report error, suggest `mkdir -p ~/.english-learner` |
| `node:sqlite` not available | Upgrade Node.js to ≥ 24 |
| `batch_get` returns all `not_found` | AI generates all definitions, then `batch_save` |
| Quiz returns empty list | Show "词库为空" message with usage hints |
| Input language ambiguous | Use `sentence-parser.cjs classify` first, then confirm with user if still unclear |
| `batch_save` fails | Retry once, then report error with raw data so user can save manually |
| Legacy JSON data still on disk | Run `node scripts/migrate-from-json.cjs` to import into SQLite (idempotent) |

## Execution Checklist

Before responding to user, verify:

- [ ] Auto-intercept: scanned user's English for issues (if writing in English)
- [ ] Auto-intercept: corrections shown (max 3) with teaching moments
- [ ] Auto-intercept: corrected words/phrases saved via batch_save
- [ ] All words/phrases extracted from input
- [ ] Batch lookup executed via `batch_get`
- [ ] New words SAVED via `batch_save` (MANDATORY — not optional)
- [ ] Query logged via `log_query`
- [ ] Response uses unified format above

## Hooks

This skill registers IDE hooks to enable **deterministic auto-intercept** — no reliance on the AI "remembering" to check English.

### Scope

**Global** — installs to `~/.claude/settings.json` and `~/.trae/hooks.json` since vocabulary data lives at `~/.english-learner/`.

### Events

| Event | Script | Purpose |
|-------|--------|---------|
| `UserPromptSubmit` | `scripts/hooks/user-prompt-scan.cjs` | Scan user English input, inject skill activation reminder |
| `Stop` | `scripts/hooks/stop-response-scan.cjs` | After every AI response, surface 2–4 advanced English words the user might want to save (asks for confirmation, never auto-saves). Skips silently when the response is english-learner's own output, too short, or contains only common words. |

### Install

```bash
# Install hooks globally (supports both Trae and Claude Code)
node scripts/hooks/install.cjs install \
  --config ./hooks.json --scope global --target both
```

### Uninstall

```bash
node scripts/hooks/install.cjs uninstall \
  --skill-id english-learner --scope global --target both
```

### How It Works

1. **UserPromptSubmit** fires on every user message
2. `user-prompt-scan.cjs` checks if message is English (>60% ASCII alpha, not code/path/command)
3. If English detected → injects reminder context for the AI to activate the skill
4. If not English or too short → exits silently (exit 0, no output)

**Stop hook** — fires after every AI response:

1. `stop-response-scan.cjs` reads the assistant's last message
2. Bails out if response is too short, looks like english-learner's own output (vocabulary card markers), or has fewer than ~5 long words
3. Otherwise extracts up to 12 long English token candidates
4. Injects a reminder asking the AI to surface 2–4 genuinely advanced/non-obvious words and ask the user whether to save them — **never auto-save**, the user must confirm
