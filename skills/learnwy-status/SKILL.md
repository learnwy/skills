---
name: learnwy-status
description: "Cross-subsystem digest for the ~/.learnwy/ data root. Aggregates vocab progress (english-learner), wiki health (llm-wiki), prompt-optimizer trigger trends, knowledge-consolidation nudges, and log size into one report. Use when the user asks for: 'what is my learnwy status', 'show me my vocab/wiki/optimizer stats', 'weekly digest', 'how am I doing on my personal data', or runs `cli.cjs status`. Also installs a once-per-ISO-week SessionStart hook that prepends a compact summary to the first session of each week."
metadata:
  author: "learnwy"
  version: "1.0"
---

# learnwy-status

One-screen dashboard across every subsystem that writes under `~/.learnwy/`.

## When to use

- User says `/learnwy-status`, "show me my status", "what's in my data", "weekly digest"
- User wants to know vocab progress, wiki health, or prompt-optimizer trends without invoking each skill separately
- AI-driven check-in at the start of a fresh week (handled by the SessionStart hook below)

## Subsystems covered

| Subsystem | Source file | Reported |
|---|---|---|
| Vocab | `~/.learnwy/english-learner/data.db` | total / mastered / learning / new + top 3 review candidates |
| Wiki health | `~/.learnwy/llm-wiki/health.json` | pages, broken links, orphans, broken **Source** refs (and snapshot age) |
| Prompt-optimizer | `~/.learnwy/prompt-optimizer/events.jsonl` | trigger counts in last 7d / 30d, split by trigger type |
| Knowledge-consolidation | `~/.learnwy/knowledge-consolidation/last-nudge.json` | timestamp + hours-ago of last nudge |
| Logs | `~/.learnwy/logs/` | largest log file + size, rotated-generation count |

If a subsystem has no data, that section degrades to "(empty)" rather than failing.

## Commands

| Command | Purpose |
|---|---|
| `cli.cjs status` | Human-readable report (default) |
| `cli.cjs status --compact` | One-line summary used by the SessionStart hook |
| `cli.cjs status --json` | Machine-readable digest for downstream tooling |
| `cli.cjs doctor` | System health check — Node version, hook registration in `~/.claude/settings.json`, `~/.trae/hooks.json`, and `~/.codex/hooks.json`, Codex `[features].hooks` state, ~/.learnwy/ subdir layout, dispatcher bundle presence under `~/.agents/skills/`. Exits non-zero on any error. |
| `cli.cjs doctor --json` | Same as above, machine-readable. |

## Hooks

| Event | Behavior |
|---|---|
| `SessionStart` | At most once per ISO week, emits `[learnwy-status] Weekly digest (YYYY-Www): ...` with a compact summary and a wiki broken-link alert if any. State stored in `~/.learnwy/learnwy-status/state.json` (key: `last_status_week`). |

## Prerequisites

- Node.js ≥ 24 (uses `node:sqlite` indirectly via `english-learner` DB).
- The other subsystems need not be initialised — missing data files are tolerated.

## Storage

| Path | Purpose |
|---|---|
| `~/.learnwy/learnwy-status/state.json` | Tracks `last_status_week` for the SessionStart debounce. |

This skill writes only to the path above. All other reads are non-destructive.
