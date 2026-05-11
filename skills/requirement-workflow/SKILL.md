---
name: requirement-workflow
description: "Use when the user wants to build, implement, or develop a feature. Orchestrates evidence-driven Spec-Driven Development. Default lifecycle is `lite` (INIT → IMPLEMENTING → TESTING → DONE); auto-promote to `standard` or `full` when scope, risk, or AC traceability demands it. Triggers: 'develop feature', 'implement this', 'build feature', 'add module', 'fix bug', '开发功能', '实现这个'."
metadata:
  author: "learnwy"
  version: "5.0"
  methodology: "SDD with evidence-driven escalation"
---

# Requirement Workflow (v5)

A minimal orchestrator for spec-driven development. The CLI keeps state, runs gates, and writes a curated **brief** for the next phase — read the brief instead of re-discovering the codebase.

## Core idea

| Concept | Where | Purpose |
|---|---|---|
| **Lifecycle** | `lite` / `standard` / `full` | Phase ladder — start small, escalate on evidence |
| **Brief** | `briefs/<PHASE>.md` | Curated context the next agent reads |
| **Gate** | TS validator per phase | Blocks `advance` until artifacts meet criteria |
| **Traceability** | `traceability.md` | Auto-rebuilt AC ↔ task ↔ files matrix |

## Lifecycles

```
lite      INIT → IMPLEMENTING → TESTING → DONE
standard  INIT → PLANNING → IMPLEMENTING → TESTING → DONE
full      INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

Use `lite` by default. Promote with:

```bash
node scripts/cli.cjs escalate -r . --to standard --reason "scope grew past 5 files"
node scripts/cli.cjs escalate -r . --to full     --reason "auth code touched"
```

Common escalation triggers:
- A task touches >5 files → bump to **standard** (need PLANNING)
- Auth, payment, crypto, or PII keyword → bump to **full** (need DEFINING + DESIGNING)
- AC failures repeat in TESTING → bump to **full** to formalise spec

## The three commands you need

```bash
node scripts/cli.cjs init    -r . -n "<name>" [-l lite|standard|full]
node scripts/cli.cjs advance -r .                # gate-checked transition
node scripts/cli.cjs status  -r .                # phase, brief, last gate, AC/task counts
```

Plus three useful auxiliaries:

```bash
node scripts/cli.cjs brief -r . --print          # show current-phase brief
node scripts/cli.cjs brief -r . --regen          # rebuild brief from current artifacts
node scripts/cli.cjs trace -r .                  # rebuild traceability.md
```

## Workflow loop

```
1. cli.cjs init -r . -n "..."                     ← scaffolds .agents/workflow/<id>/
2. cli.cjs advance -r .                           ← runs gate, writes next brief
3. AI reads briefs/<NEW PHASE>.md                 ← single context source
4. AI edits the artifact named in the brief       (spec.md / tasks.md / design.md / code / checklist.md)
5. Repeat 2-4 until DONE
```

If the gate fails, `advance` exits 2 and prints which criterion failed. Fix the artifact and retry, or pass `--force` to bypass.

## Per-phase reference (load on demand)

| Phase | When | Reference |
|---|---|---|
| INIT | Always | n/a |
| DEFINING | full only | [references/phases/DEFINING.md](references/phases/DEFINING.md) |
| PLANNING | standard, full | [references/phases/PLANNING.md](references/phases/PLANNING.md) |
| DESIGNING | full only | [references/phases/DESIGNING.md](references/phases/DESIGNING.md) |
| IMPLEMENTING | Always | [references/phases/IMPLEMENTING.md](references/phases/IMPLEMENTING.md) |
| TESTING | Always | [references/phases/TESTING.md](references/phases/TESTING.md) |
| DELIVERING | full only | [references/phases/DELIVERING.md](references/phases/DELIVERING.md) |

## Default agents

Each phase has one **default agent** (run first) and a list of **optional agents** (opt-in when needed). See [agents/AGENTS.md](agents/AGENTS.md) for the full registry.

| Phase | Default | Optional |
|---|---|---|
| DEFINING | `problem-definer` | `iron-audit-pm`, `risk-auditor`, `spec-by-example` |
| PLANNING | `story-mapper` | `mvp-freeze-architect` |
| DESIGNING | `architecture-advisor` | `domain-modeler`, `responsibility-modeler` |
| IMPLEMENTING | `tdd-coach` | `refactoring-guide`, `legacy-surgeon` |
| TESTING | `test-strategist` | `test-strategy-advisor`, `code-reviewer`, `error-analyzer` |
| DELIVERING | `tech-design-reviewer` | `code-reviewer` |

## IDE hooks (optional)

```bash
node scripts/cli.cjs hooks generate -r .         # print hooks.json
node scripts/cli.cjs hooks install  -r .         # write hooks.json to .trae/ and .claude/ (IDE-owned config). Workflow state itself lives in `.agents/`.
```

Installs a `SessionStart` hook that surfaces the active workflow + brief path, and a `Stop` quality gate that blocks premature stopping in IMPLEMENTING/TESTING.

## See also

- [references/QUICKREF.md](references/QUICKREF.md) — one-page cheat sheet
- [references/hooks-standard.md](references/hooks-standard.md) — IDE hook spec
