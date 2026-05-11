# Phase: PLANNING

**Purpose:** decompose the spec (or raw request, in `standard` lifecycle) into atomic, traceable tasks.

**Default agent:** `story-mapper` — Patton story mapping.
**Optional:** `mvp-freeze-architect` (MVP scope freeze).

## Brief contents

`briefs/PLANNING.md` includes:
- Spec summary (background + scope + AC list with IDs)
- Top-level directories of the project (code map)
- Constraints from gate (max files per task, AC coverage requirement)

## Producing tasks.md

```markdown
# Tasks

## Phase 1: Foundation
- [ ] 1.1: Add login route handler [files: src/routes/login.ts, src/types.ts]
- [ ] 1.2: Wire session middleware [files: src/middleware/session.ts]

## Phase 2: Core
- [ ] 2.1: Form component [files: src/components/LoginForm.tsx]

## Phase 3: Polish
- [ ] 3.1: Error states [files: src/components/LoginForm.tsx]
```

Rules:
1. Every AC in spec.md → ≥1 task.
2. Each task → ≤5 files (split if more).
3. Use IDs like `1.1`, `1.2` so the traceability matrix can map them.
4. Annotate `[files: …]` even if the file doesn't exist yet — the brief downstream uses this.

## Gate criteria

- ≥1 task in tasks.md.
- No task lists more than 5 files.
- ≥1 task has a `[files: …]` annotation.
- If spec.md has ACs: every AC mapped to ≥1 task in `traceability.md`.

The gate auto-rebuilds `traceability.md` so the AC↔task mapping is always fresh.

## Override the auto-mapping

Auto-map is by order (AC-01 → first task, AC-02 → second, etc.). Override by editing the `## AC → Tasks` section of `traceability.md`:

```markdown
- AC-01 → 1.1, 2.1
- AC-02 → 1.2
```

## Common pitfalls

- "Refactor X" with no files listed → bounce back, annotate.
- One mega-task touching 12 files → split.
- ACs added later without a task → re-run `cli.cjs trace` and the gate will catch it.
