---
name: english-learner
description: "Auto-intercepts English messages for grammar / word-choice / expression issues (max 3 per message); auto-translates Chinese / Japanese / Korean / Spanish / other-language messages with vocabulary extraction. Also handles word lookups, phrase lookups (e.g. 'break the ice'), translation requests, and quiz/review. Logs every prose input (clean OR with issues) to `prose_log` so fluency rate is tracked over time. Pushes 3 due-for-review words at the first session of each day (spaced repetition: 1/3/7/14/30/90 days). Triggers: any English message, any Chinese message, any non-English-non-Chinese prose, single English word, idiom, '查单词', '学英语', 'what does X mean', vocabulary review. Data stored at ~/.learnwy/english-learner/ with mastery + fluency tracking."
metadata:
  author: "learnwy"
  version: "4.0"
  trigger: "always"
---

# English Learner

Personal vocabulary assistant with persistent storage, mastery tracking, and spaced repetition.

## Three auto-intercept modes (passive, hook-driven)

| Mode | Trigger | Action |
|---|---|---|
| **English intercept** | User writes in English (EN ratio ≥ 0.6) | If issues found: show 1–3 corrections in a "💡 English Tip" table. If clean: render exactly `"✅ English looks fluent — no issues found."` Always call `vocab record-input` with `had_issues` + `issue_count`. |
| **Chinese intercept** | User writes in Chinese (CN ratio ≥ 0.3, OR contains 翻译/怎么说/用英语 intent). **Always fires — never silently skipped.** Tiered output: full mode for normal messages; **light mode** when ≥ 500 chars OR contains code keywords (代码/编程/bug/修复/重构/编译/部署/配置文件). | Full: "🌐 中译英" block — corrections (if any) + 2–3 EN translations + 2–3 vocab + `batch_save`. Light: "🌐 中译英 (light)" — 1 EN translation + optional 1 vocab. Both call `record-input` with `language: zh`. |
| **Other-language intercept** | User writes prose in JA / KO / ES / FR / DE / RU / AR / etc. (low EN, low ZH ratios). **Always fires.** Tiered: full mode for normal, **light mode** when ≥ 800 chars. | Full: "🌐 Translate & Learn" — detect language, translate, 2–3 vocab, auto-save. Light: 1 EN translation + optional 1 vocab. Both call `record-input` with `language: ja/ko/other`. |

All modes wired through `learnwy-dispatch` (UserPromptSubmit + Stop hooks). They never block the user's actual task — corrections come first, work continues.

Every fired turn logs an entry to `prose_log` so we can compute fluency rate, by-language activity, and 30-day trend (`vocab prose-stats`).

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

The intercept skips entirely **only** for inputs that aren't prose at all:

- Pure code / shell commands / file-path-only lines (matched by `looksLikeNonProse`)
- Single-line `Use Skill:` directives
- Anything shorter than 4 chars (or 2 chars if it contains CJK)

**Tech-heavy or long Chinese is NOT skipped** — it falls into *light mode* instead (1-sentence translation, optional 1 vocab). See [feedback-learning-tools-fire-everywhere] in memory: silent gates hurt the long-term dataset, so we always fire, just adjust verbosity.

English fluency check is special: if no issues, render the one-line `✅ English looks fluent` ack — that *is* the fire, not a skip.

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

# corrections — persist usage tips from the English intercept
node scripts/cli.cjs vocab record-correction '[{"original":"imrpove","corrected":"improve","reason":"typo","words":[{"word":"improve","definition":"改进；改善","phonetic":"/ɪmˈpruːv/"}]}]'
node scripts/cli.cjs vocab top-corrections [limit=5]
node scripts/cli.cjs vocab corrections-stats

# prose log — log every prose input (clean or with issues), then aggregate fluency
node scripts/cli.cjs vocab record-input '{"language":"en","text":"<original>","had_issues":false,"issue_count":0}'
node scripts/cli.cjs vocab prose-stats          # totals, clean-rate, by-language, 30-day window
node scripts/cli.cjs vocab recent-prose [limit=20]

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

# report — generate a self-contained static HTML dashboard from the SQLite DB
#   sections: Overview · Due now · Activity · Words · Phrases · Corrections · Fluency · Materials
#   Fluency section shows overall + 30-day clean rate, by-language breakdown, and 20 most-recent inputs.
node scripts/cli.cjs report                       # writes ~/.learnwy/english-learner/report.html
node scripts/cli.cjs report --output <path>       # custom destination
node scripts/cli.cjs report --json                # also dump intermediate report.html.json
node scripts/cli.cjs report --open                # open in default browser after generation

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
