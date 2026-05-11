---
name: learnwy-dispatch
description: "Internal single-process coordinator for the three IDE-hook events used by the learnwy-* skills. UserPromptSubmit aggregates english-learner + llm-wiki + prompt-optimizer scans; Stop aggregates english-learner + knowledge-consolidation scans; SessionStart aggregates llm-wiki + english-learner + learnwy-status scans. Not user-invokable — installed automatically alongside the underlying skills. Triggers on every UserPromptSubmit / Stop / SessionStart event in Claude Code / Trae."
metadata:
  author: "learnwy"
  version: "2.0"
---

# learnwy-dispatch

Single-process coordinator for the three IDE-hook events shared by the learnwy-* skills.

## Why

Before this skill, every event fired N separate hook commands — one Node process per skill — and the user saw N back-to-back `<system-reminder>` blocks per turn. That multiplies the per-turn hook startup cost (~50 ms × N vs ~50 ms) and clutters context.

This skill replaces those entries with **one hook per event** that imports each skill's pure scanner function, runs them in-process, and emits a single combined reminder.

## What runs per event

### UserPromptSubmit (`hooks/user-prompt-submit.cjs`)

| Order | Module | Returns reminder when |
|---|---|---|
| 1 | `english-learner/lib/prompt-scan.scanPrompt` | English ratio ≥ 0.6 OR Chinese learn-intent OR Chinese ratio ≥ 0.3 |
| 2 | `llm-wiki/lib/prompt-scan.scanPrompt` | wiki/topics.txt has any keyword overlapping a 4+ char word in the message |
| 3 | `prompt-optimizer/lib/prompt-scan.scanPrompt` | explicit "optimize my prompt" trigger OR long structured prompt-shape |

### Stop (`hooks/stop.cjs`)

| Order | Module | Returns reminder when |
|---|---|---|
| 1 | `english-learner/lib/stop-scan.scanStop` | Assistant response has 2–4 advanced English words worth surfacing |
| 2 | `knowledge-consolidation/lib/stop-scan.scanStop` | Response shows substantive resolution signals (race condition / regression / "subtle"), not session-local trivia |

### SessionStart (`hooks/session-start.cjs`)

| Order | Module | Returns reminder when |
|---|---|---|
| 1 | `llm-wiki/lib/session-scan.scanSession` | wiki/topics.txt exists — inject ≤30 topics |
| 2 | `english-learner/lib/session-scan.scanSession` | First session of the day — push 3 due-for-review cards |
| 3 | `learnwy-status/lib/session-scan.scanSession` | First session of the ISO week — prepend a compact cross-skill digest |

Each scanner is a pure `(message | payload) => string | null` (a couple have minor side effects: prompt-optimizer appends to `~/.learnwy/prompt-optimizer/events.jsonl`; KC writes a debounce stamp).

If any scanner throws, the failure is swallowed and the others still run.

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
