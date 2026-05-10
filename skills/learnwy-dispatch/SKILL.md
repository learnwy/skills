---
name: learnwy-dispatch
description: "Internal coordinator that runs english-learner, llm-wiki, and prompt-optimizer UserPromptSubmit scans in a single Node process and emits one consolidated system reminder. Not user-invokable — installed automatically alongside the underlying skills. Triggers on every UserPromptSubmit event in Claude Code / Trae."
metadata:
  author: "learnwy"
  version: "1.0"
---

# learnwy-dispatch

Single-process coordinator for the three UserPromptSubmit hooks shipped by this repo.

## Why

Before this skill, every user prompt fired three separate hook commands — one Node process per skill — and the user saw three back-to-back `<system-reminder>` blocks per turn (one for each skill that had something to say). That triples the per-turn hook startup cost (~150 ms vs. ~50 ms) and clutters context.

This skill replaces those three entries with **one** UserPromptSubmit hook that imports each skill's `scanPrompt(message)` function, runs them in-process, and emits a single combined reminder.

## What runs

The dispatcher invokes, in order:

| Order | Module | Returns reminder when |
|---|---|---|
| 1 | `english-learner/hooks/user-prompt-scan.scanPrompt` | English ratio ≥ 0.6 OR Chinese learn-intent OR Chinese ratio ≥ 0.3 |
| 2 | `llm-wiki/hooks/auto-query.scanPrompt` | wiki/topics.txt has any keyword overlapping a 4+ char word in the message |
| 3 | `prompt-optimizer/hooks/user-prompt-scan.scanPrompt` | explicit "optimize my prompt" trigger OR long structured prompt-shape |

Each scanner is a pure `(message) => string | null` function (the prompt-optimizer scanner has one side effect: appending to `~/.learnwy/prompt-optimizer/events.jsonl`).

If a scanner throws, the failure is swallowed and the others still run.

## Installation

This skill is installed by `pnpm run install:hooks` like any other skill. The corresponding `UserPromptSubmit` entries in `english-learner`, `llm-wiki`, and `prompt-optimizer` `hooks.json` files have been removed — only this skill registers a UserPromptSubmit handler now.

After upgrading from a version without `learnwy-dispatch`, run:

```bash
pnpm run uninstall:hooks   # remove the old per-skill UserPromptSubmit entries
pnpm run install:hooks     # install the dispatcher (and re-register the others)
```

The `pnpm run install:hooks` orchestrator performs an uninstall sweep before installing, so you can re-run it any time as a one-shot, idempotent operation.

## Not for direct invocation

There is no user-facing slash command and no `cli.cjs <subcommand>` other than `install` / `uninstall`. The skill description's trigger keywords exist purely so the AI surface area knows it is registered — direct invocation has no value.
