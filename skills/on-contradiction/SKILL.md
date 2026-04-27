---
name: on-contradiction
description: "Use this skill when analyzing opposing forces, trade-offs, or root causes using Mao Zedong's *On Contradiction* (《矛盾论》). Provides the law of the unity of opposites as actionable frameworks for decision-making, problem analysis, and report writing. Triggers on: 'contradiction analysis', 'principal contradiction', 'analyze contradictions', '矛盾分析', '主要矛盾', 'On Contradiction', 'decision analysis', 'root cause', 'trade-off analysis', 'opposing forces', or when the user needs to identify the core conflict in a complex situation."
metadata:
  author: "learnwy"
  version: "1.1"
  source: "Mao Zedong, *On Contradiction* (《矛盾论》, 1937)"
---

# On Contradiction Methodology Toolkit

Practical methodology toolkit derived from Mao Zedong's *On Contradiction*. Transforms the philosophical law of the unity of opposites into actionable, reusable operational frameworks for thinking, analyzing, and writing.

> **Core Principle**: Acknowledge the universality of contradictions, grasp the principal contradiction and its principal aspect, analyze specific issues concretely, utilize the identity of contradictions to achieve transformation, and uphold the unity of the "two-point theory" and the "key-point theory."

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Works in any domain — business, engineering, personal, strategic

## When to Use

**Invoke when:**

- User needs to make a complex decision with competing trade-offs
- User faces a problem with unclear root causes
- User wants to write a report with sharp logic and clear structure
- User mentions "contradiction", "principal contradiction", "trade-off analysis", "root cause"
- User asks for structured thinking frameworks beyond simple pros/cons

**Do NOT invoke when:**

- User needs code implementation → use `requirement-workflow` or IDE directly
- User needs software-specific methodology → use `software-methodology-toolkit`
- User needs a quick factual answer → answer directly
- The problem is trivial and doesn't warrant deep analysis

## Relationship with On Practice and On Protracted War

*On Contradiction*, *On Practice*, and *On Protracted War* form a trilogy:

| Dimension | On Contradiction | On Practice | On Protracted War |
|-----------|-----------------|-------------|-------------------|
| **Focus** | Structure of forces | Process of knowing | Evolution over time |
| **Question** | "What are the contradictions?" | "How do we verify truth?" | "How does this unfold and when do we act?" |
| **Method** | Identify, prioritize, transform | Investigate, test, validate | Stage, strategize, maneuver, evolve |
| **Strength** | Structural clarity — sees the skeleton | Process rigor — ensures grounding | Temporal wisdom — sees the arc of change |
| **Combine** | Identify WHAT forces are at play | Validate HOW through practice | Plan WHEN to act and how each phase differs |

## The Universal Contradiction Framework

Every agent in this toolkit applies a 5-step formula:

```
Step 1: IDENTIFY    — List all opposing contradictions in the situation
Step 2: PRIORITIZE  — Separate principal from secondary contradictions
Step 3: ANALYZE     — Examine the unity (shared ground) and struggle (opposing forces)
Step 4: TRANSFORM   — Find conditions to turn unfavorable contradictions into favorable ones
Step 5: ACT         — Execute on the principal contradiction, defer secondary ones
```

This formula is the DNA of all agents. Each agent applies it to a specific domain.

## Key Concepts

| Concept | Definition | Practical Meaning |
|---------|-----------|-------------------|
| **Universality of Contradictions** | Contradictions exist in everything, at all times | Never deny that a problem exists; every situation has tensions |
| **Particularity of Contradictions** | Each contradiction has unique characteristics | Reject one-size-fits-all; analyze each situation concretely |
| **Principal Contradiction** | The dominant contradiction that determines overall development | Focus energy on the ONE thing that matters most |
| **Principal Aspect** | The dominant side within a single contradiction | The mainstream trend — distinguish it from the secondary aspect |
| **Identity of Contradictions** | Opposing sides share a common ground and can transform | Enemies can become allies; weaknesses can become strengths |
| **Struggle of Contradictions** | Opposing sides clash and push change | Conflict drives progress; don't fear productive tension |
| **Two-Point Theory** | Consider BOTH sides of every contradiction | Avoid one-sidedness; acknowledge achievements AND problems |
| **Key-Point Theory** | Focus on the MAIN point among all contradictions | Don't spread energy thin; tackle the core issue |
| **Contradiction Transformation** | Under certain conditions, opposites switch positions | Plan for how today's advantage may become tomorrow's liability |
| **Internal vs External Causes** | Internal causes are fundamental; external causes are conditions | Fix the root (internal), don't just blame the environment |

## Agent Summary

| Domain | Agent | Core Principles Applied |
|--------|-------|------------------------|
| Thinking | [decision-maker](agents/thinking/decision-maker.md) | Principal/secondary contradictions + transformation + two-point theory |
| Thinking | [problem-analyzer](agents/thinking/problem-analyzer.md) | Universality/particularity + internal/external causes + layered analysis |
| Writing | [report-writer](agents/writing/report-writer.md) | Key-point theory + two-point theory + developmental prediction |

## Routing Decision Table

| User Signal | Agent | Confidence |
|-------------|-------|------------|
| "make a decision", "choose between", "trade-off", "dilemma" | decision-maker | High |
| "analyze the problem", "root cause", "why is this happening", "dig deeper" | problem-analyzer | High |
| "write a report", "summarize findings", "present analysis" | report-writer | High |
| "矛盾分析", "主要矛盾", "抓主要矛盾" | problem-analyzer | High |
| Complex situation with no clear direction | problem-analyzer (entry point) → decision-maker | Medium |
| Need to present findings to stakeholders | report-writer | Medium |
| General mention of "contradictions" or "On Contradiction" | problem-analyzer (default entry) | Low |

If confidence is Low, confirm agent selection with the user before proceeding.

## Composition Workflows

### Full Analysis Workflow (Problem → Decision → Report)

```
1. problem-analyzer  → Identify and layer all contradictions, find root cause
2. decision-maker    → Grasp principal contradiction, evaluate transformation conditions
3. report-writer     → Present findings with two-point structure and actionable conclusions
```

### Quick Decision Workflow

```
1. decision-maker    → List contradictions, isolate principal one, predict transformation, decide
```

### Deep Investigation Workflow

```
1. problem-analyzer  → Surface → Intermediate → Essential contradiction layers
2. problem-analyzer  → Internal causes vs external causes
3. decision-maker    → Prioritize and plan resolution
```

## Cross-Skill Composition Workflows (Trilogy)

### Structure-Then-Validate (with On Practice)

```
1. on-contradiction / problem-analyzer  → Identify all contradictions, find the principal one
2. on-contradiction / decision-maker    → Evaluate transformation conditions, propose a path
3. on-practice / decision-maker         → Surface untested assumptions, design small-scale trials
4. on-practice / problem-analyzer       → Analyze practice results, extract validated knowledge
5. on-contradiction / report-writer     → Final report: contradiction structure + practice evidence
```

### Rapid Evidence-Grounded Decision (with On Practice)

```
1. on-contradiction / decision-maker    → Identify principal contradiction and two sides
2. on-practice / decision-maker         → Audit assumptions: which side has practice evidence?
3. on-contradiction / decision-maker    → Decide with both structural and empirical confidence
```

### The Full Trilogy Workflow (Structure → Time → Evidence)

```
1. on-contradiction / problem-analyzer   → Identify all contradictions, find the principal one
2. on-protracted-war / problem-analyzer  → Diagnose current stage, assess four factors over time
3. on-protracted-war / decision-maker    → Choose phase-appropriate strategy
4. on-practice / decision-maker          → Validate strategy assumptions through small-scale practice
5. on-protracted-war / report-writer     → Full strategic report: contradiction + phased plan + evidence
```

## Contradiction Analysis Tools

### Tool 1: Contradiction Matrix

For any situation, fill this matrix:

| # | Contradiction | Side A | Side B | Principal? | Transformable? |
|---|--------------|--------|--------|------------|----------------|
| 1 | {name} | {benefit/positive} | {risk/negative} | ✅ / ❌ | {conditions} |
| 2 | {name} | {short-term} | {long-term} | ✅ / ❌ | {conditions} |
| 3 | {name} | {individual} | {collective} | ✅ / ❌ | {conditions} |

### Tool 2: Principal Contradiction Checklist

To identify the principal contradiction, ask:

1. Which contradiction, if resolved, would make most others dissolve or become manageable?
2. Which contradiction most affects the overall direction of development?
3. Which contradiction currently has the most energy/conflict?
4. If you could only fix ONE thing, what would it be?

The answer to all four should converge on the same contradiction.

### Tool 3: Transformation Condition Map

For the principal contradiction:

| Current State | Desired State | Transformation Conditions | Actions Required |
|--------------|---------------|--------------------------|------------------|
| {unfavorable aspect dominates} | {favorable aspect dominates} | {what must change} | {concrete steps} |

## Agent Output Contract

All agents follow the same output rules:

| Allowed | Not Allowed |
|---------|-------------|
| Structured contradiction analysis | Making decisions for the user |
| Recommendations with trade-offs | Ignoring the secondary side (violates two-point theory) |
| Transformation predictions | Presenting only one perspective |
| Actionable next steps | Abstract philosophizing without practical steps |

Every agent output must include:
1. **Contradiction Inventory** — All identified contradictions
2. **Principal Contradiction** — The one that matters most, with reasoning
3. **Two-Point Analysis** — Both sides examined honestly
4. **Transformation Path** — How to shift the balance
5. **Action Plan** — Concrete next steps focused on the principal contradiction

## Error Handling

| Issue | Solution |
|-------|----------|
| User's request matches no agent trigger | Default to problem-analyzer as the entry point |
| User's request matches multiple agents | Use Routing Decision Table; pick highest-confidence match |
| Situation has too many contradictions to list | Use Contradiction Matrix tool, limit to top 5-7, then prioritize |
| User cannot agree on which is the principal contradiction | Apply the Principal Contradiction Checklist systematically |
| Analysis becomes too abstract | Ground every contradiction in concrete, observable evidence |
| User expects a definitive answer, not analysis | Clarify: this toolkit provides structured analysis; the user makes the final call |
| Contradiction transformation seems impossible | Re-examine conditions; sometimes the solution is to change the conditions, not the contradiction directly |

## Execution Checklist

Before invoking any agent, verify:

- [ ] The situation genuinely involves competing forces or trade-offs
- [ ] Agent selection follows the Routing Decision Table
- [ ] Low-confidence selections are confirmed with the user
- [ ] Agent receives sufficient context (situation description, stakeholders, constraints)

After agent produces output, verify:

- [ ] Output includes a Contradiction Inventory (not just conclusions)
- [ ] A Principal Contradiction is identified with clear reasoning
- [ ] Both sides are analyzed (two-point theory enforced)
- [ ] Transformation conditions are concrete, not vague
- [ ] Action plan focuses on the principal contradiction, not scattered across all
- [ ] Secondary contradictions are acknowledged but deferred

## Boundary Enforcement

This skill ONLY handles:

- Contradiction-based analysis of complex situations
- Structured decision-making through principal/secondary contradiction identification
- Problem root-cause analysis using internal/external cause distinction
- Report writing with contradiction-based logical structure
- Providing the analytical framework — the user makes the final decision

This skill does NOT handle:

- Long-term phased strategy or stage diagnosis → `on-protracted-war`
- Practice-based evidence validation → `on-practice`
- Code generation or software implementation → `requirement-workflow`
- Software engineering methodology → `software-methodology-toolkit`
- Quick factual answers → answer directly
- Emotional counseling → out of scope (future v2.0 agent: emotion-manager)
- Project management execution → out of scope (future v2.0 agent: project-manager)

## Expansion Roadmap (v2.0)

> **Guiding principle**: No new agents until v1.0 agents are practice-tested. Apply On Practice — use the skills in real work first, then expand based on evidence.

The following agents are planned for future versions. Agents are assigned to the skill whose **core method** (contradiction structure vs practice spiral) is the primary lens.

| Domain | Agent | Core Principle | Notes |
|--------|-------|---------------|-------|
| Communication | negotiation-advisor | Identity (common ground) + struggle (resolve divergences) | |
| Management | project-manager | Staged principal contradictions + internal/external causes | |
| Growth | self-growth-coach | Internal contradictions + transformation | |
| Innovation | innovation-catalyst | Unity of opposites + restructuring contradictions | |
| Risk | risk-controller | Risk/opportunity coexistence + prediction | |
| Team | team-harmonizer | Group contradiction universality + principal contradiction | |
| Review | retrospective-guide | Contradiction development over time + internal/external causes | Complements `on-practice / pattern-extractor` (which extracts patterns from practice data) |
| Learning | knowledge-absorber | Universality (underlying logic) + particularity (scenarios) | Complements `on-practice / learning-master` (which focuses on learning by doing) |
| Career | career-planner | Personal/environment contradictions + staged resolution | |
| Product | product-designer | User demand contradictions + supply-demand unity | |
| Emotion | emotion-manager | Rational/emotional contradictions + transformation | |
| Task | task-decomposer | Hierarchical contradictions + principal prioritization | |

## References

- **On Contradiction** (《矛盾论》) — Mao Zedong (1937)
- **On Practice** (《实践论》) — Mao Zedong (1937)
- **On Protracted War** (《论持久战》) — Mao Zedong (1938)
- **"On the Correct Handling of Contradictions Among the People"** (《关于正确处理人民内部矛盾的问题》) — Mao Zedong (1957)
