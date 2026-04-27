---
name: requirement-workflow
description: "Use this skill when the user wants to build, implement, or develop a feature using a structured workflow. Orchestrates Spec-Driven Development (SDD): spec.md → tasks.md → implementation → verification. Triggers on: '开发功能', '实现这个', 'build this feature', 'implement', 'add new module', 'fix bug', 'develop', 'create feature', 'new feature', 'build this', or when a vague requirement needs to be decomposed into actionable tasks."
metadata:
  author: "learnwy"
  version: "4.0"
  methodology: "SDD (Spec-Driven Development)"
---

# Requirement Workflow (SDD)

Structured development orchestrator based on **Spec-Driven Development**: define specs first, decompose into tasks, execute with quality gates, verify against acceptance criteria.

> **Core principle**: Spec is the single source of truth. Code follows spec, not the other way around.

## Prerequisites

- Node.js >= 18
- Writable project directory for workflow state files (`.trae/workflow/`)

## Quick Start

```
User says anything about building/implementing/fixing →
  1. AI classifies the request (type + size + risk)
  2. AI runs: node init.cjs -r <root> -n <name> -t <type> -s <size> -k <risk>
  3. AI fills spec.md with structured requirements (EARS format)
  4. AI decomposes spec.md into tasks.md
  5. AI implements task by task, advancing stages
  6. AI verifies against checklist.md
```

## Working Modes

This skill supports two modes, selected based on classification:

### Agent Mode (Default)

For **small/tiny** scope or **bugfix** type: skip spec phase, go straight to implementation.

```
INIT → IMPLEMENTING → TESTING → DONE
```

### Spec Mode (SDD)

For **medium/large** scope or **elevated/critical** risk: full SDD lifecycle.

```
INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

## Classification Matrix

| Signal | Type | Size | Risk |
|--------|------|------|------|
| "fix bug", "broken", "crash" | bugfix | tiny-small | normal |
| "add feature", "implement", "build" | feature | small-large | normal |
| "refactor", "clean up", "reorganize" | refactor | small-medium | normal |
| "tech debt", "upgrade", "migrate" | tech-debt | medium-large | elevated |
| auth, payments, data, security | any | any | elevated-critical |
| >15 files estimated | any | large | elevated |

### Size Heuristics

| Size | Files | Duration | Stages |
|------|-------|----------|--------|
| tiny | ≤2 | <30min | INIT → IMPLEMENTING → DONE |
| small | 3-5 | 30min-2h | INIT → IMPLEMENTING → TESTING → DONE |
| medium | 6-15 | 2h-1d | Full SDD |
| large | >15 | >1d | Full SDD + all checkpoints |

## SDD Lifecycle

### Stage 1: INIT

Classify request, initialize workflow, create artifact directory.

```bash
node init.cjs -r <project_root> -n "<name>" -t <type> -s <size> -k <risk>
```

**Output**: `workflow.yaml`, empty `spec.md`, `tasks.md`, `checklist.md`

### Stage 2: DEFINING (Spec Mode only)

Fill `spec.md` with structured requirements using EARS format:

```markdown
# Feature Name

## Background
{Why this is needed — problem statement}

## Scope
- In: {what IS included}
- Out: {what is NOT included}

## Acceptance Criteria (EARS format)
- [ ] When <condition>, the system shall <response>
- [ ] While <state>, the system shall <behavior>
- [ ] Where <constraint>, the system shall <limit>

## Constraints
- {Performance, security, compatibility requirements}

## Out of Scope
- {Explicitly deferred items}
```

**Checkpoint**: If risk is elevated/critical, pause for user review of spec.md.

**Hooks**: `pre_stage_DEFINING` → iron-audit-pm, problem-definer, risk-auditor

### Stage 3: PLANNING (Spec Mode only)

Decompose spec.md into `tasks.md` — every acceptance criterion maps to ≥1 task:

```markdown
# Tasks

## Phase 1: Foundation
- [ ] Task 1.1: {description} [files: x, y]
- [ ] Task 1.2: {description} [files: z]

## Phase 2: Core Logic
- [ ] Task 2.1: {description} [files: a, b]

## Phase 3: Integration & Polish
- [ ] Task 3.1: {description} [files: c]

## Verification
- [ ] All acceptance criteria pass
- [ ] Lint clean
- [ ] Type check pass
```

**Rule**: Each task must be atomic (completable independently) and traceable to a spec item.

**Hooks**: `pre_stage_PLANNING` → story-mapper, mvp-freeze-architect

### Stage 4: DESIGNING (Spec Mode only)

Create `design.md` (only for medium+ size) with architecture decisions:

- Component structure
- Data flow
- API contracts
- Key trade-offs

**Checkpoint**: If risk is elevated/critical, pause for user review.

**Hooks**: `pre_stage_DESIGNING` → domain-modeler, architecture-advisor, responsibility-modeler

### Stage 5: IMPLEMENTING

Execute tasks from tasks.md sequentially. For each task:

1. Read the task description
2. Implement the change
3. Mark task as `[x]` in tasks.md
4. Run relevant tests if available

**Hooks**: `pre_stage_IMPLEMENTING` → tdd-coach

### Stage 6: TESTING

Run full test suite. Update `checklist.md`:

```markdown
# Checklist

## Code Quality
- [ ] Implementation complete
- [ ] Lint clean (run lint command)
- [ ] Type check pass (run typecheck command)

## Tests
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)

## Acceptance Criteria
- [ ] AC 1: {criterion from spec} — verified
- [ ] AC 2: {criterion from spec} — verified

## Review
- [ ] Self-review complete
- [ ] No TODO/FIXME left unresolved
```

**Hooks**: `pre_stage_TESTING` → test-strategy-advisor, test-strategist, code-reviewer

### Stage 7: DELIVERING (Spec Mode only)

Final verification against spec.md. Ensure every acceptance criterion has been met.

**Hooks**: `post_stage_DELIVERING` → code-reviewer, tech-design-reviewer

### Stage 8: DONE

Workflow complete. Summary output:
- What was delivered
- Files changed
- Tests passed
- Time elapsed

## Stage Advancement

```bash
# Check current status
node status.cjs -r <project_root>

# Advance to next stage
node advance.cjs -r <project_root>

# Force advance (skip checkpoint)
node advance.cjs -r <project_root> --force
```

## Hooks System

Hooks are agents/skills that run at stage transitions. Three scopes:

| Scope | File | Priority |
|-------|------|----------|
| Global | `hooks.yaml` (skill dir) | Lowest |
| Project | `.trae/workflow/hooks.yaml` | Medium |
| Workflow | `workflow.yaml` (in workflow dir) | Highest |

### Hook Points

| Hook | When | Default Agents |
|------|------|----------------|
| `pre_stage_DEFINING` | Before filling spec | iron-audit-pm, risk-auditor |
| `pre_stage_PLANNING` | Before task decomposition | story-mapper, mvp-freeze-architect |
| `pre_stage_DESIGNING` | Before architecture | domain-modeler, architecture-advisor |
| `pre_stage_IMPLEMENTING` | Before coding | tdd-coach |
| `pre_stage_TESTING` | Before test phase | test-strategy-advisor, code-reviewer |
| `post_stage_DELIVERING` | After final check | tech-design-reviewer |

```bash
# List hooks
node hooks.cjs -r <project_root> list

# Add a hook
node hooks.cjs -r <project_root> add pre_stage_TESTING -n my-validator --type skill
```

## Quality Gates

### Checkpoint Rules

| Stage | Checkpoint When |
|-------|----------------|
| DEFINING | risk = elevated or critical |
| PLANNING | size = large or risk ≥ elevated |
| DESIGNING | size ≥ medium or risk ≥ elevated |
| TESTING | always (all risk levels) |

At checkpoints, AI **pauses and asks user** for confirmation before advancing.

### SDD Traceability Rule

Every line of code must trace back to:
1. A task in `tasks.md`
2. Which traces to an acceptance criterion in `spec.md`

If you find yourself writing code not covered by any task — **stop and update tasks.md first**.

## Error Handling

| Issue | Solution |
|-------|----------|
| User gives vague request | Classify as feature/small, use Agent Mode, refine during implementation |
| Spec is incomplete | Add missing acceptance criteria before advancing to PLANNING |
| Task is too large | Break into sub-tasks, each ≤1 file change |
| Tests fail during TESTING | Stay in TESTING, fix issues, re-run |
| Checkpoint rejected by user | Stay in current stage, revise artifacts per feedback |
| Workflow abandoned | No cleanup needed, state persists in `.trae/workflow/` |

## Scripts

| Script | Purpose |
|--------|---------|
| [init.cjs](scripts/init.cjs) | Initialize workflow with classification |
| [advance.cjs](scripts/advance.cjs) | Advance to next stage |
| [status.cjs](scripts/status.cjs) | Show current workflow status |
| [hooks.cjs](scripts/hooks.cjs) | Manage hook registrations |
| [lib/common.cjs](scripts/lib/common.cjs) | Shared YAML utilities |

## Agents

See [AGENTS.md](agents/AGENTS.md) for the full registry. Key agents by phase:

| Phase | Agent | Methodology |
|-------|-------|-------------|
| DEFINING | [iron-audit-pm](agents/iron-audit-pm.md) | PRD audit, DNA extraction |
| DEFINING | [risk-auditor](agents/risk-auditor.md) | Risk scanning |
| DEFINING | [problem-definer](agents/problem-definer.md) | Weinberg problem analysis |
| PLANNING | [story-mapper](agents/story-mapper.md) | Patton story mapping |
| PLANNING | [mvp-freeze-architect](agents/mvp-freeze-architect.md) | Scope freezing |
| DESIGNING | [domain-modeler](agents/domain-modeler.md) | DDD/Evans modeling |
| DESIGNING | [architecture-advisor](agents/architecture-advisor.md) | Quality attributes |
| IMPLEMENTING | [tdd-coach](agents/tdd-coach.md) | Beck TDD cycle |
| TESTING | [test-strategist](agents/test-strategist.md) | Crispin test strategy |
| TESTING | [code-reviewer](agents/code-reviewer.md) | Code review |
| DELIVERING | [tech-design-reviewer](agents/tech-design-reviewer.md) | Architecture review |

## References

- [Quick Reference](references/QUICKREF.md) - Condensed decision tables
