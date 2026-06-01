---
name: lwy-mao-methodology
description: "Use Mao Zedong's three philosophical works as practical decision / analysis / writing frameworks. Three lenses: contradiction (《矛盾论》, opposing forces & root cause), practice (《实践论》, hypothesis verification through action), protracted-war (《论持久战》, staged strategy for long contests, especially when starting from weakness). Triggers: '矛盾分析', '主要矛盾', '抓主要矛盾', 'contradiction analysis', 'principal contradiction', 'trade-off analysis', 'opposing forces', 'root cause', '实事求是', '调查研究', '实践论', 'practice-based', 'verify through practice', 'seek truth from facts', 'test assumptions', 'practice spiral', '持久战', '分阶段策略', '长期战略', '战略防御', '战略相持', '战略反攻', 'long-term strategy', 'protracted war', 'staged approach', 'underdog strategy', 'strategic patience'."
metadata:
  author: "learnwy"
  version: "2.0"
  source: "Mao Zedong, 《矛盾论》(1937), 《实践论》(1937), 《论持久战》(1938)"
---

# Mao Methodology

Three philosophical works → three operational lenses for decision-making, problem analysis, and report writing. Pick the lens that matches the *shape* of the question, not the topic.

## Pick a lens

| Question shape | Lens | Source |
|---|---|---|
| What forces are in tension? Where is the leverage? | **contradiction** | 《矛盾论》 |
| Is our model right? How do we test it? | **practice** | 《实践论》 |
| How do we win a long contest from weakness? When do we shift posture? | **protracted-war** | 《论持久战》 |

If unsure, the lenses are complementary:
- `contradiction` → *what* the forces are (structure)
- `practice` → *how* to verify (process)
- `protracted-war` → *when* to act and evolve (time / strategy)

## Three agents per lens

Every lens ships the same three agents (different methodology, same shape):

| Agent | Job | Output |
|---|---|---|
| `decision-maker` | Choose between options under the lens's framework | A recommendation with rationale |
| `problem-analyzer` | Diagnose a situation or stuck problem | A structured analysis |
| `report-writer` | Write a report (decision memo, retro, strategy doc) | A structured document |

## How to invoke

The agents are read-only methodology guides — invoke via the Task tool with the lens-specific path:

```
Task(subagent_type="search", query="Read agents/<lens>/<agent>.md and apply to: <user's question>")
```

Where `<lens>` is `contradiction` / `practice` / `protracted-war` and `<agent>` is `decision-maker` / `problem-analyzer` / `report-writer`.

## Lens-specific entry points

### contradiction (《矛盾论》)

> Acknowledge contradictions are universal; identify the principal contradiction and its principal aspect; perform concrete analysis of concrete situations; use the unity of opposites for transformation; insist on the unity of "two-point theory" and "key-point theory".

When to reach for it:
- Multiple competing trade-offs and unclear which dominates
- Root cause is murky and surface symptoms compete for attention
- Need to write a report whose structure must hold contradictory facts

Agents: [contradiction/decision-maker](agents/contradiction/decision-maker.md), [contradiction/problem-analyzer](agents/contradiction/problem-analyzer.md), [contradiction/report-writer](agents/contradiction/report-writer.md)

### practice (《实践论》)

> Practice is the source, motivation, purpose, and sole criterion for testing truth. Cognition spirals upward: practice → perceptual knowledge → rational knowledge → renewed practice → renewed cognition. All correct ideas come from social practice; their value lies in guiding and improving practice.

When to reach for it:
- Decision based on assumption rather than evidence — needs a verification step
- Theory and field reality conflict and you suspect the theory
- Need to write a report grounded in observed facts ("实事求是") rather than speculation

Agents: [practice/decision-maker](agents/practice/decision-maker.md), [practice/problem-analyzer](agents/practice/problem-analyzer.md), [practice/report-writer](agents/practice/report-writer.md)

### protracted-war (《论持久战》)

> A weaker side can prevail in a long contest if it sequences three phases — strategic defense, strategic stalemate, strategic counter-offensive — and converts weakness into strength through endurance, mobility, and the steady accumulation of small wins.

When to reach for it:
- Project / competition / personal goal is long and starts from disadvantage
- Need to decide the *posture* (defend / hold / push) for the current phase
- Need a strategy doc that explains why patience now serves victory later

Agents: [protracted-war/decision-maker](agents/protracted-war/decision-maker.md), [protracted-war/problem-analyzer](agents/protracted-war/problem-analyzer.md), [protracted-war/report-writer](agents/protracted-war/report-writer.md)

## Composition recipes

Two lenses combine well:

| Recipe | Lens 1 | Lens 2 | Use for |
|---|---|---|---|
| **Diagnose-then-test** | contradiction (find principal contradiction) | practice (design verification) | Stuck investigations, unclear root causes |
| **Strategy-then-tempo** | protracted-war (pick the phase) | contradiction (find this phase's principal contradiction) | Long competitive games |
| **Plan-then-verify** | protracted-war (stage the plan) | practice (validate at each milestone) | Multi-quarter initiatives |

Use all three only when writing a major strategic document — overuse turns into framework theatre.

## When NOT to use

- Trivial trade-offs with one obviously right answer
- Code-implementation questions (use `requirement-workflow`)
- Knowledge persistence (use `knowledge-consolidation` or `llm-wiki`)
- The actual question is empirical and the answer is just "go check"

## Boundaries

This skill **only**: provides methodology agents for the three lenses.

This skill **does not**: write the actual report for you, fetch data, run analyses, or remember conclusions across sessions (use `knowledge-consolidation` or `llm-wiki` for persistence).
