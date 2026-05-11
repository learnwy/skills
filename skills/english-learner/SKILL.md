---
name: english-learner
description: "Auto-intercepts English messages for grammar / word-choice / expression issues (max 3 per message); auto-translates Chinese messages with vocabulary extraction. Also handles word lookups, phrase lookups (e.g. 'break the ice'), translation requests, and quiz/review. Pushes 3 due-for-review words at the first session of each day (spaced repetition: 1/3/7/14/30/90 days). Triggers: any English message, any Chinese message, single English word, idiom, '查单词', '学英语', 'what does X mean', vocabulary review. Data stored at ~/.learnwy/english-learner/ with mastery tracking."
metadata:
  author: "learnwy"
  version: "4.0"
  trigger: "always"
---

# English Learner

Personal vocabulary assistant with persistent storage, mastery tracking, and spaced repetition.

## Two auto-intercept modes (passive, hook-driven)

| Mode | Trigger | Action |
|---|---|---|
| **English intercept** | User writes in English with detectable grammar / word-choice issues | Show 1–3 corrections in a tip table FIRST, then handle the actual task |
| **Chinese intercept** | User writes in Chinese (Chinese chars > 30%) | After completing the task, append a 中译英 practice block with corrections + 2–3 translations + key vocabulary |

Both modes are wired through `learnwy-dispatch` (UserPromptSubmit + Stop hooks). They never block the user's actual task — corrections come first, work continues.

Detailed rules, exclusion filters, and Markdown formats: see [references/intercept-modes.md](references/intercept-modes.md).

## Active modes (explicit user request)

| Trigger | Mode | What happens |
|---|---|---|
| Single word / phrase / sentence | Lookup | `vocab batch_get` → AI generates if new → `batch_save` → render card |
| `学习` / `review` / `quiz` | Quiz | `quiz generate 5 all low_mastery` → ask user with `AskUserQuestion` per item |
| `stats` / `统计` | Stats | `vocab stats` → render summary |
| `查单词` / `学英语` / 翻译请求 | Lookup | Same as single-word path |

Response formats (word card, phrase card, sentence breakdown, quiz prompt, stats): see [references/learning-mode.md](references/learning-mode.md).

## When NOT to fire

- Code, programming, technical questions
- Inputs that look like commands or file paths
- English already fluent / natural (intercept silently skips)
- Chinese > 500 chars (likely a task description, not a learning request)
- Contains code keywords: `代码`, `编程`, `bug`, `修复`, `重构`, `编译`, `部署`, `配置文件`
- Starts with `Use Skill:`

## Prerequisites

- Node.js ≥ 24 (uses built-in `node:sqlite`)
- Writable home directory: data lives at `~/.learnwy/english-learner/data.db`

## Subcommands

Single CLI entry `scripts/cli.cjs` dispatches everything:

```bash
# vocab — CRUD + batch ops
node scripts/cli.cjs vocab batch_get '["word1","word2"]'
node scripts/cli.cjs vocab batch_save '[{"word":"...","definition":"...","phonetic":"...","examples":[]}]'
node scripts/cli.cjs vocab get_word|save_word|get_phrase|save_phrase|log_query|stats|update_mastery ...

# sentence — input classification + word extraction
node scripts/cli.cjs sentence classify <text>
node scripts/cli.cjs sentence parse <sentence>
node scripts/cli.cjs sentence batch_check <words>

# quiz — review session
node scripts/cli.cjs quiz generate [count] [type] [focus]
node scripts/cli.cjs quiz review [limit]
node scripts/cli.cjs quiz summary

# spaced repetition + linking
node scripts/cli.cjs link-wiki        # cross-link with llm-wiki

# install/uninstall hooks (registered with .claude/ + .trae/)
node scripts/cli.cjs install   --scope global --target both
node scripts/cli.cjs uninstall --scope global --target both
```

`vocab batch_*` are mandatory whenever ≥2 items are involved.

## Storage

```
~/.learnwy/english-learner/
├── data.db              # SQLite — words, phrases, history (schema in references/data-storage.md)
└── memory/
    ├── SOUL.md
    └── USER.md
```

Schema is migrated automatically by `src/shared/db.ts` (versioned migrations). Spaced-repetition columns (`next_review_at`, `interval_days`) drive the SessionStart push of 3 due cards per day.

## Hooks

Wired through `learnwy-dispatch` (single Node process — no per-skill spawn):

| Event | Lib function | Purpose |
|---|---|---|
| `UserPromptSubmit` | `lib/prompt-scan.ts` | Inject English/Chinese intercept reminder |
| `Stop` | `lib/stop-scan.ts` | After each assistant response, surface 2–4 advanced words found in the response (asks user; never auto-saves) |
| `SessionStart` | `lib/session-scan.ts` | Once per day, push 3 due-for-review cards (spaced-repetition algorithm) |

Each scanner is a pure `(payload | message) => string | null`. Side effects (DB writes) live behind `lib/*-store.ts`.

## Boundaries

This skill **only**: vocabulary capture, lookup, mastery, spaced repetition, intercept-driven correction.

This skill **does not**: full essay editing, grammar tutoring beyond the 3-issue cap, native-language tutoring beyond Chinese, or persistent memory of preferences (use `learnwy-status` for cross-skill stats).

## See also

- [references/intercept-modes.md](references/intercept-modes.md) — detailed English + Chinese intercept rules and formats
- [references/learning-mode.md](references/learning-mode.md) — quiz / lookup / stats response formats
- [references/data-storage.md](references/data-storage.md) — SQLite schema + record JSON shapes
