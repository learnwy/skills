# Quick Reference — Requirement Workflow v5

## Pick a lifecycle

```
lite      INIT → IMPLEMENTING → TESTING → DONE                  ← default
standard  INIT → PLANNING → IMPLEMENTING → TESTING → DONE       ← multi-task work
full      INIT → DEFINING → PLANNING → DESIGNING →              ← formal SDD
          IMPLEMENTING → TESTING → DELIVERING → DONE
```

## Three commands

```bash
node scripts/cli.cjs init    -r . -n "<name>" [-l lite|standard|full]
node scripts/cli.cjs advance -r .
node scripts/cli.cjs status  -r .
```

## Per-phase exits

| Phase | Artifact | Gate (must satisfy) |
|---|---|---|
| DEFINING | spec.md | ≥3 real EARS ACs; Background filled; Out-of-Scope present |
| PLANNING | tasks.md | every AC mapped; ≤5 files/task; ≥1 file annotation |
| DESIGNING | design.md | sections: Components, Data Flow, API, Trade-offs, NFR |
| IMPLEMENTING | code + tasks.md | all tasks `[x]`; no unmapped tasks |
| TESTING | checklist.md | all boxes `[x]`; matrix shows every AC tasksDone |
| DELIVERING | summary.md | sections: What shipped, Files, AC table, Open issues, Demo |

## Escalate when

| Signal | Promote to |
|---|---|
| Task touches >5 files | `standard` (need PLANNING) |
| Auth, payment, crypto, PII keyword in request | `full` (need DEFINING + DESIGNING) |
| AC failures repeat in TESTING | `full` (formalise spec) |

```bash
node scripts/cli.cjs escalate -r . --to standard --reason "..."
```

## Other commands

```bash
node scripts/cli.cjs brief -r . [--print|--regen|--phase X|--task ID]
node scripts/cli.cjs trace -r . [--print|--json]
node scripts/cli.cjs hooks generate -r .
node scripts/cli.cjs hooks install  -r . [--target trae|claude|both]
```

## Default agent per phase

| Phase | Default | First-line opt-ins |
|---|---|---|
| DEFINING | `problem-definer` | `iron-audit-pm`, `risk-auditor` |
| PLANNING | `story-mapper` | `mvp-freeze-architect` |
| DESIGNING | `architecture-advisor` | `domain-modeler` |
| IMPLEMENTING | `tdd-coach` | `refactoring-guide` |
| TESTING | `test-strategist` | `code-reviewer` |
| DELIVERING | `tech-design-reviewer` | `code-reviewer` |
