# Phase: IMPLEMENTING

**Purpose:** execute tasks one by one; every line of code traces to a task → AC.

**Default agent:** `tdd-coach` — Beck's red/green/refactor cycle.
**Optional:** `refactoring-guide` (Fowler), `legacy-surgeon` (Feathers — for working in old code).

## Brief contents

`briefs/IMPLEMENTING-<task-id>.md` is generated per-task. It contains:
- The single task to do
- Files it touches (from tasks.md `[files: …]`)
- Reading list (those files first)
- The constraint: only this task

## Per-task loop

```bash
# Read the brief for the next unchecked task
node scripts/cli.cjs brief -r . --print

# Implement, then mark the task complete in tasks.md:
#   - [x] 1.1: Add login route handler [files: ...]

# Refresh traceability and brief for the next task
node scripts/cli.cjs trace -r .
node scripts/cli.cjs brief -r . --regen
```

If you discover work outside the current task list, **stop**. Either:
- Edit tasks.md to add the new task, then re-run `cli.cjs trace`, or
- Escalate back: `cli.cjs escalate -r . --to standard --reason "..."` if you don't yet have PLANNING phase.

## Gate criteria (when leaving IMPLEMENTING)

- Every task in tasks.md is `[x]`.
- traceability.md has no `(unmapped)` entries.

## Common pitfalls

- Working on multiple tasks in one go — undermines the AC↔task↔commit chain.
- Editing files not listed in `[files: …]` — the brief is stale; regenerate it.
- Refactoring outside the task scope — open a new task first.
