# Phase: TESTING

**Purpose:** verify every AC; checklist.md must be fully checked.

**Default agent:** `test-strategist` — Crispin's testing quadrants.
**Optional:** `test-strategy-advisor` (change-based prioritisation), `code-reviewer`, `error-analyzer`.

## Brief contents

`briefs/TESTING.md` includes:
- Files touched in this workflow (deduplicated from all tasks)
- AC list with current verified state
- Detected lint and test commands for the project

## Producing checklist.md

The init command scaffolds checklist.md. Tick each box as you verify:

```markdown
## Code Quality
- [x] Implementation complete
- [x] Lint clean
- [x] Type check pass

## Tests
- [x] Unit tests pass
- [x] Integration tests pass

## Acceptance Criteria
- [x] AC-01 verified by tests/auth/login.test.ts:42
- [x] AC-02 verified manually via README demo

## Review
- [x] Self-review complete
- [x] No TODO/FIXME left unresolved
```

Tip: in the AC section, write *evidence* (test name, manual step) — that's what DELIVERING will summarise.

## Gate criteria

- Every checkbox in checklist.md is `[x]`.
- traceability matrix shows every AC with `Tasks done: ✓`.

## Always a checkpoint

TESTING is always a checkpoint phase. The user must confirm before advancing to DELIVERING (or DONE in lite/standard).

## Common pitfalls

- Ticking AC boxes without evidence — defeats the audit trail.
- Skipping the lint/typecheck rows because "the editor would have caught it" — record the actual command output.
- Fixing bugs by editing tests — escalate back to IMPLEMENTING and add a new task.
