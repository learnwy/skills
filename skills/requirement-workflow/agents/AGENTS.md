# Agent Registry

Agents are organised by phase. Each phase has **one default** (run first) and a small **opt-in pool** (use only when the brief says so or you hit a specific need).

The CLI does **not** auto-launch agents. They are invoked by the AI assistant via the `Task` tool, using the brief as their context input.

## DEFINING

| Role | Agent | Methodology |
|---|---|---|
| Default | [problem-definer](problem-definer.md) | Weinberg problem framing |
| Opt-in | [iron-audit-pm](iron-audit-pm.md) | PRD audit / DNA extraction |
| Opt-in | [risk-auditor](risk-auditor.md) | Policy / cost / execution risk scan |
| Opt-in | [spec-by-example](spec-by-example.md) | Adzic specification by example |

## PLANNING

| Role | Agent | Methodology |
|---|---|---|
| Default | [story-mapper](story-mapper.md) | Patton story mapping |
| Opt-in | [mvp-freeze-architect](mvp-freeze-architect.md) | MVP scope freeze |

## DESIGNING

| Role | Agent | Methodology |
|---|---|---|
| Default | [architecture-advisor](architecture-advisor.md) | Bass/Clements quality attributes |
| Opt-in | [domain-modeler](domain-modeler.md) | DDD/Evans |
| Opt-in | [responsibility-modeler](responsibility-modeler.md) | CRC cards (Wirfs-Brock) |

## IMPLEMENTING

| Role | Agent | Methodology |
|---|---|---|
| Default | [tdd-coach](tdd-coach.md) | Beck red/green/refactor |
| Opt-in | [refactoring-guide](refactoring-guide.md) | Fowler refactoring patterns |
| Opt-in | [legacy-surgeon](legacy-surgeon.md) | Feathers legacy techniques |

## TESTING

| Role | Agent | Methodology |
|---|---|---|
| Default | [test-strategist](test-strategist.md) | Crispin testing quadrants |
| Opt-in | [test-strategy-advisor](test-strategy-advisor.md) | Change-based prioritisation |
| Opt-in | [code-reviewer](code-reviewer.md) | Structured code review |
| Opt-in | [error-analyzer](error-analyzer.md) | Runtime error analysis |

## DELIVERING

| Role | Agent | Methodology |
|---|---|---|
| Default | [tech-design-reviewer](tech-design-reviewer.md) | Architecture review |
| Opt-in | [code-reviewer](code-reviewer.md) | Final structured review |

## Cross-phase

| Agent | Use |
|---|---|
| [blocker-resolver](blocker-resolver.md) | Unblock a stalled workflow at any phase |

## How to invoke

The brief at `briefs/<PHASE>.md` already names the default agent. To run it:

```
Task(subagent_type="<agent-type>", query="<contents of briefs/PHASE.md>")
```

For methodology agents (read-only analysis), use `subagent_type="search"`.
For action agents (review, error analysis), use `subagent_type="general_purpose_task"`.
