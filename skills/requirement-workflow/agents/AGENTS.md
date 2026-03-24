# Agent Registry

Agents organized by SDD lifecycle phase.

## Phase: DEFINING (Requirements)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [iron-audit-pm](iron-audit-pm.md) | PRD audit, DNA extraction, scope pruning | `pre_stage_DEFINING` |
| [risk-auditor](risk-auditor.md) | Policy, cost, execution risk scanning | `pre_stage_DEFINING` |
| [problem-definer](problem-definer.md) | Weinberg problem definition | `pre_stage_DEFINING` |
| [spec-by-example](spec-by-example.md) | Adzic specification by example | `pre_stage_DEFINING` |

## Phase: PLANNING (Task Decomposition)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [story-mapper](story-mapper.md) | Patton story mapping | `pre_stage_PLANNING` |
| [mvp-freeze-architect](mvp-freeze-architect.md) | Scope freezing, V1 extraction | `pre_stage_PLANNING` |

## Phase: DESIGNING (Architecture)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [domain-modeler](domain-modeler.md) | DDD/Evans domain modeling | `pre_stage_DESIGNING` |
| [architecture-advisor](architecture-advisor.md) | Quality attributes (Bass/Clements) | `pre_stage_DESIGNING` |
| [responsibility-modeler](responsibility-modeler.md) | CRC cards (Wirfs-Brock) | `pre_stage_DESIGNING` |

## Phase: IMPLEMENTING (Coding)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [tdd-coach](tdd-coach.md) | Beck TDD: Red → Green → Refactor | `pre_stage_IMPLEMENTING` |
| [refactoring-guide](refactoring-guide.md) | Fowler refactoring patterns | `pre_stage_IMPLEMENTING` |
| [legacy-surgeon](legacy-surgeon.md) | Feathers legacy code techniques | `pre_stage_IMPLEMENTING` |

## Phase: TESTING (Verification)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [test-strategist](test-strategist.md) | Crispin testing quadrants | `pre_stage_TESTING` |
| [test-strategy-advisor](test-strategy-advisor.md) | Change-based test prioritization | `pre_stage_TESTING` |
| [code-reviewer](code-reviewer.md) | Structured code review | `pre_stage_TESTING` |
| [error-analyzer](error-analyzer.md) | Runtime error analysis | `pre_stage_TESTING` |

## Phase: DELIVERING (Final Review)

| Agent | Methodology | Hook Point |
|-------|-------------|------------|
| [tech-design-reviewer](tech-design-reviewer.md) | Architecture review | `post_stage_DELIVERING` |

## Cross-Phase (Available at any stage)

| Agent | Purpose | Trigger |
|-------|---------|---------|
| [blocker-resolver](blocker-resolver.md) | Unblock stuck workflows | On demand |

## Agent Invocation

Agents are invoked via the Task tool as sub-agents:

```
Task(subagent_type="<agent-type>", query="<context from workflow>")
```

For methodology agents (read-only analysis), use `subagent_type="search"`.
For action agents (code review, error analysis), use `subagent_type="general_purpose_task"`.
