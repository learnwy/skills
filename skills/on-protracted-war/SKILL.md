---
name: on-protracted-war
description: "Practical methodology toolkit based on Mao Zedong's *On Protracted War* (《论持久战》). Provides staged strategy thinking for long-term competitions, projects, and challenges where the weaker side must persevere to win. Triggers on: 'long-term strategy', 'protracted war', 'staged approach', '持久战', 'phased strategy', 'we are weaker but', 'how to survive and win', 'strategic patience', 'competitive marathon'."
metadata:
  author: "learnwy"
  version: "1.0"
  source: "Mao Zedong, *On Protracted War* (《论持久战》, 1938)"
---

# On Protracted War Methodology Toolkit

Practical methodology toolkit derived from Mao Zedong's *On Protracted War*. Transforms the strategic theory of staged warfare and strength/weakness transformation into actionable frameworks for navigating long-term competitions, projects, and challenges where conditions evolve over time.

> **Core Principle**: Reject both despair ("we will fail") and haste ("we will win quickly"). Recognize that long-term struggles pass through distinct stages — each requiring a different strategy. The weaker side can prevail by correctly diagnosing the current stage, applying the right tactics for that stage, and actively creating conditions for the next stage transition.

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Works in any domain — business competition, career development, product roadmaps, technical debt, organizational change

## When to Use

**Invoke when:**

- User faces a long-term challenge where they are currently at a disadvantage
- User needs to plan a multi-phase strategy with different approaches per phase
- User is stuck in a difficult middle period and losing confidence (the "stalemate")
- User is choosing between an aggressive fast approach and a conservative slow approach
- User mentions "long game", "phased strategy", "competitive marathon", "we're outmatched but"
- User needs to assess whether they are in defense, stalemate, or counteroffensive position

**Do NOT invoke when:**

- User needs structural analysis of opposing forces → use `on-contradiction`
- User needs practice-based evidence validation → use `on-practice`
- User needs code implementation → use `requirement-workflow` or IDE directly
- The challenge is short-term and doesn't evolve through phases
- The situation doesn't involve a weaker/stronger dynamic or time-based evolution

## Relationship with On Contradiction and On Practice

*On Protracted War* completes the trilogy with *On Contradiction* and *On Practice*:

| Dimension | On Contradiction | On Practice | On Protracted War |
|-----------|-----------------|-------------|-------------------|
| **Focus** | Structure of forces | Process of knowing | Evolution over time |
| **Question** | "What are the opposing forces?" | "How do we verify truth?" | "How does this unfold and when do we act?" |
| **Method** | Identify, prioritize, transform | Investigate, test, validate | Stage, strategize, maneuver, evolve |
| **Strength** | Structural clarity — sees the skeleton | Process rigor — ensures grounding | Temporal wisdom — sees the arc of change |
| **Combine** | Identify WHAT forces are at play | Validate HOW through practice | Plan WHEN to act and how each phase differs |

## The Protracted Strategy Framework

Every agent in this toolkit applies this 5-step framework:

```
Step 1: ASSESS      — Analyze four factors: strength, momentum, scale, and support
Step 2: STAGE       — Diagnose which phase you're in (defense, stalemate, or counteroffensive)
Step 3: STRATEGIZE  — Apply the correct strategy for the current phase
Step 4: MANEUVER    — Execute tactical actions suited to your position
Step 5: EVOLVE      — Monitor phase transitions, prepare for the next stage
                      ↻ Repeat — conditions change, stages shift
```

This framework is the DNA of all agents. Each agent applies it to a specific domain.

## Key Concepts

| Concept | Definition | Practical Meaning |
|---------|-----------|-------------------|
| **Three-Stage Development** | Every long struggle passes through defense → stalemate → counteroffensive | Don't apply the same strategy across all phases; each requires different tactics |
| **Reject Despair AND Haste** | Neither "we will certainly fail" nor "we will win quickly" is correct | Be realistic about timelines; avoid both panic and wishful thinking |
| **The Stalemate as Pivot** | The hardest middle phase is where the turning point lives | The most painful period is the most important — don't give up during the stalemate |
| **Strength/Weakness Transformation** | Today's weak can become tomorrow's strong under the right conditions | Disadvantages are not permanent; actively create conditions for reversal |
| **Defense-within-Offense** | Even while defending strategically, attack tactically where you can win | Don't be purely passive; find local opportunities within an overall defensive posture |
| **Strategic Persistence, Tactical Speed** | The overall game is long, but each battle should be fast and decisive | Win small, win fast, accumulate — "积小胜为大胜" (accumulate small victories into big victory) |
| **Inner-Line to Outer-Line** | When surrounded, create local superiority through maneuver | Even in a disadvantaged position, you can create pockets of advantage |
| **Conscious Initiative** | Strategy doesn't execute itself; requires active, purposeful human effort | Passive waiting loses; actively shape the situation at every stage |
| **People as Foundation** | Victory depends on mobilizing all stakeholders, not just resources | Engage your team, users, allies — the deepest source of strength is in people |
| **Four-Factor Analysis** | Assess strength, momentum, scale, and support — not just one dimension | A weak side can compensate through other factors (justice, scale, allies) |

## Agent Summary

| Domain | Agent | Core Principles Applied |
|--------|-------|------------------------|
| Thinking | [decision-maker](agents/thinking/decision-maker.md) | Three-stage + defense-within-offense + reject despair/haste |
| Thinking | [problem-analyzer](agents/thinking/problem-analyzer.md) | Four-factor analysis + stage diagnosis + stalemate pivot |
| Writing | [report-writer](agents/writing/report-writer.md) | Phased narrative + strength/weakness transformation arc |

## Routing Decision Table

| User Signal | Agent | Confidence |
|-------------|-------|------------|
| "long-term strategy", "phased plan", "when should we act" | decision-maker | High |
| "assess the situation", "which phase are we in", "why are we stuck" | problem-analyzer | High |
| "write a strategy report", "present our roadmap", "document the plan" | report-writer | High |
| "持久战", "战略防御", "战略相持", "战略反攻" | problem-analyzer | High |
| Feeling overwhelmed or wanting to give up on a long effort | problem-analyzer (diagnose stage) → decision-maker | Medium |
| Need to present a multi-phase plan to stakeholders | report-writer | Medium |
| General mention of "protracted" or "long game" | problem-analyzer (default entry) | Low |

If confidence is Low, confirm agent selection with the user before proceeding.

## Composition Workflows

### Full Strategic Planning Workflow (Assess → Decide → Report)

```
1. problem-analyzer  → Assess four factors, diagnose current stage
2. decision-maker    → Choose strategy for current stage, plan phase transitions
3. report-writer     → Present the phased strategy with stage-specific actions
```

### Stage Transition Workflow

```
1. problem-analyzer  → Diagnose: are we still in defense, or entering stalemate?
2. problem-analyzer  → Identify transformation conditions for next stage
3. decision-maker    → Decide whether to shift strategy for the new stage
```

### Confidence Recovery Workflow (for "stalemate despair")

```
1. problem-analyzer  → Diagnose: this IS the stalemate — the pivot, not the end
2. decision-maker    → Identify defense-within-offense opportunities
3. report-writer     → Reframe narrative: show progress arc from defense through stalemate to future counteroffensive
```

## Cross-Skill Composition Workflows (with On Contradiction and On Practice)

### The Trilogy Workflow (Structure → Time → Evidence)

```
1. on-contradiction / problem-analyzer   → Identify all contradictions, find the principal one
2. on-protracted-war / problem-analyzer  → Diagnose current stage, assess four factors
3. on-protracted-war / decision-maker    → Choose phase-appropriate strategy
4. on-practice / decision-maker          → Validate strategy assumptions through small-scale practice
5. on-protracted-war / report-writer     → Full strategic report with contradiction structure + phased plan + evidence
```

### Quick Strategic Assessment

```
1. on-protracted-war / problem-analyzer  → Four-factor analysis + stage diagnosis
2. on-contradiction / decision-maker     → Identify principal contradiction at this stage
3. on-protracted-war / decision-maker    → Phase-appropriate action plan
```

### Long-Game Confidence Builder

```
1. on-protracted-war / problem-analyzer  → "You are in the stalemate — the hardest but most important phase"
2. on-practice / problem-analyzer        → "Here is the evidence of progress from your practice"
3. on-contradiction / decision-maker     → "Here is the principal contradiction to resolve for phase transition"
```

## Strategy Analysis Tools

### Tool 1: Four-Factor Assessment Matrix

For any competitive or challenging situation, assess all four factors:

| Factor | Your Side | Opponent/Challenge | Implication |
|--------|-----------|-------------------|-------------|
| **Strength** (current capability) | {your resources, skills, tech} | {their resources, skills, tech} | Who has raw power advantage? |
| **Momentum** (direction of change) | {improving / stable / declining} | {improving / stable / declining} | Who is gaining ground? |
| **Scale** (depth of reserves) | {how long can you sustain} | {how long can they sustain} | Who can outlast? |
| **Support** (allies, ecosystem) | {community, partners, users} | {their ecosystem, support} | Who has broader backing? |

**Rule**: Being weaker on ONE factor does not mean defeat. Assess all four — compensating advantages matter.

### Tool 2: Stage Diagnosis Checklist

To identify which stage you're currently in:

| Stage | Signals | Strategy |
|-------|---------|----------|
| **Defense** (敌攻我守) | Losing ground, opponent advancing, you're reactive | Preserve core assets, trade space for time, seek local tactical wins |
| **Stalemate** (相持) | Neither side making decisive progress, grind, fatigue | This is the PIVOT — invest in capability building, find guerrilla opportunities, accumulate small wins |
| **Counteroffensive** (反攻) | Your strength has caught up or surpassed, initiative shifting to you | Concentrate force, seize strategic opportunities, push decisively |

### Tool 3: Defense-within-Offense Finder

Even in a defensive stage, find offensive opportunities:

| Dimension | Strategic Posture | Tactical Opportunity |
|-----------|------------------|---------------------|
| Overall position | Defending (weaker) | Where can you attack locally? |
| Time horizon | Long game (持久) | Which battles can you win fast (速决)? |
| Territory | Surrounded (内线) | Where can you create local superiority (外线)? |

## Agent Output Contract

All agents follow the same output rules:

| Allowed | Not Allowed |
|---------|-------------|
| Phased strategic analysis with stage-specific actions | One-size-fits-all strategy ignoring current stage |
| Realistic timelines rejecting both despair and haste | Promise of quick victory or prediction of inevitable defeat |
| Identification of transformation conditions between stages | Static analysis that ignores how conditions evolve |
| Actionable next steps for the CURRENT stage | Actions that belong to a future stage applied prematurely |

Every agent output must include:
1. **Four-Factor Assessment** — Strength, momentum, scale, support for both sides
2. **Stage Diagnosis** — Which phase the situation is in, with evidence
3. **Stage-Appropriate Strategy** — Tactics matched to the current phase
4. **Transformation Conditions** — What must change for the next phase transition
5. **Immediate Actions** — Concrete next steps for THIS stage, not the next one

## Error Handling

| Issue | Solution |
|-------|----------|
| User's request matches no agent trigger | Default to problem-analyzer for stage diagnosis |
| User wants to skip stages (jump from defense to counteroffensive) | Explain why stages can't be skipped; the stalemate is the necessary pivot |
| User has given up hope during stalemate | Apply Confidence Recovery Workflow; show that stalemate IS the turning point |
| User is too aggressive (wants to counterattack while still in defense) | Diagnose the actual stage; show which conditions must change before counteroffensive |
| Situation doesn't have clear strong/weak dynamics | Simplify to: "which side has the initiative?" and "is it shifting?" |
| User expects precise timing for phase transitions | Clarify: transitions are condition-driven, not calendar-driven; list the conditions |

## Execution Checklist

Before invoking any agent, verify:

- [ ] The situation involves a long-term challenge with evolving conditions
- [ ] There is a meaningful strong/weak or advantage/disadvantage dynamic
- [ ] Agent selection follows the Routing Decision Table
- [ ] Agent receives sufficient context (situation, competitors/challenges, timeline, resources)

After agent produces output, verify:

- [ ] Output includes a four-factor assessment (not just strength comparison)
- [ ] A stage diagnosis is provided with evidence (not assumed)
- [ ] Strategy is matched to the CURRENT stage (not a future desired stage)
- [ ] Neither despair nor haste is endorsed — both are explicitly rejected
- [ ] Transformation conditions for the next stage are concrete
- [ ] Action plan focuses on what to do NOW in this stage

## Boundary Enforcement

This skill ONLY handles:

- Long-term strategic planning with phased approaches
- Stage diagnosis for competitive or challenging situations
- Strength/weakness transformation analysis over time
- Defense-within-offense tactical opportunity identification
- Strategic patience and confidence during difficult middle phases
- Report writing with phased narrative structure

This skill does NOT handle:

- Structural contradiction analysis → `on-contradiction`
- Practice-based evidence validation → `on-practice`
- Code generation or software implementation → `requirement-workflow`
- Software engineering methodology → `software-methodology-toolkit`
- Quick factual answers → answer directly
- Short-term decisions that don't involve phased evolution

## Expansion Roadmap (v2.0)

> **Guiding principle**: No new agents until v1.0 agents are practice-tested. Apply On Practice — use the skills in real work first, then expand based on evidence.

| Domain | Agent | Core Principle |
|--------|-------|---------------|
| Competition | competitive-strategist | Four-factor analysis + stage-specific competitive tactics |
| Career | career-marathon-planner | Three-stage career development + stalemate perseverance |
| Product | product-roadmap-advisor | Phased feature strategy + defense-within-offense in markets |
| Organization | change-navigator | Organizational transformation through staged adoption |
| Technical | debt-resolver | Technical debt as protracted war — staged remediation |

## References

- **On Protracted War** (《论持久战》) — Mao Zedong (1938)
- **On Contradiction** (《矛盾论》) — Mao Zedong (1937)
- **On Practice** (《实践论》) — Mao Zedong (1937)
- **Strategic Problems of China's Revolutionary War** (《中国革命战争的战略问题》) — Mao Zedong (1936)
