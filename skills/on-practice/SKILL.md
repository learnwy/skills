---
name: on-practice
description: "Use this skill when validating assumptions through real-world testing using Mao Zedong's *On Practice* (《实践论》). Applies the practice-cognition-re-practice spiral to decision-making, problem analysis, and report writing. Triggers on: 'practice-based', 'verify through practice', 'seek truth from facts', '实践论', '实事求是', 'On Practice', 'test assumptions', 'practice spiral', 'field investigation', 'validate hypothesis', or when the user needs to move from theory to verified action."
metadata:
  author: "learnwy"
  version: "1.1"
  source: "Mao Zedong, *On Practice* (《实践论》, 1937)"
---

# On Practice Methodology Toolkit

Practical methodology toolkit derived from Mao Zedong's *On Practice*. Transforms the philosophical theory of the unity of knowing and doing into actionable, reusable operational frameworks for decision-making, problem analysis, and report writing.

> **Core Principle**: Practice is the source, driving force, purpose, and sole criterion for testing truth. Cognition follows a spiral: practice → perceptual knowledge → rational knowledge → re-practice → re-cognition, repeating infinitely. All correct ideas come from social practice; their real value lies in guiding and improving practice.

## Prerequisites

- No runtime dependencies (methodology-only skill, no scripts)
- Works in any domain — business, engineering, personal, strategic

## When to Use

**Invoke when:**

- User needs to make a decision grounded in real-world evidence rather than speculation
- User faces a problem that requires investigation and fact-finding before analysis
- User wants to write a report structured around what was done, learned, and will be improved
- User mentions "practice-based", "verify through practice", "seek truth from facts", "test assumptions"
- User needs to move from theory to action, or validate ideas through experimentation
- User wants to break analysis paralysis by grounding thinking in concrete practice

**Do NOT invoke when:**

- User needs contradiction-based structural analysis → use `on-contradiction`
- User needs code implementation → use `requirement-workflow` or IDE directly
- User needs software-specific methodology → use `software-methodology-toolkit`
- The problem is purely theoretical with no practical component

## Relationship with On Contradiction and On Protracted War

*On Practice*, *On Contradiction*, and *On Protracted War* form a trilogy:

| Dimension | On Contradiction | On Practice | On Protracted War |
|-----------|-----------------|-------------|-------------------|
| **Focus** | Structure of forces | Process of knowing | Evolution over time |
| **Question** | "What are the contradictions?" | "How do we verify truth?" | "How does this unfold and when do we act?" |
| **Method** | Identify, prioritize, transform | Investigate, test, validate | Stage, strategize, maneuver, evolve |
| **Strength** | Structural clarity — sees the skeleton | Process rigor — ensures grounding | Temporal wisdom — sees the arc of change |
| **Combine** | Identify WHAT forces are at play | Validate HOW through practice | Plan WHEN to act and how each phase differs |

## The Practice-Cognition Spiral

Every agent in this toolkit applies this spiral:

```
Step 1: PRACTICE    — Engage with reality: investigate, experiment, observe
Step 2: PERCEIVE    — Gather perceptual knowledge: raw facts, data, impressions
Step 3: REASON      — Elevate to rational knowledge: patterns, laws, theories
Step 4: RE-PRACTICE — Apply rational knowledge back to practice: test, validate
Step 5: RE-COGNIZE  — Refine understanding based on results: correct, deepen
                      ↻ Repeat — each cycle spirals upward
```

This spiral is the DNA of all agents. Each applies it to a specific domain.

## Key Concepts

| Concept | Definition | Practical Meaning |
|---------|-----------|-------------------|
| **Practice is Primary** | All knowledge originates from practice | Don't theorize in a vacuum; get your hands dirty first |
| **Perceptual Knowledge** | Direct, surface-level impressions from experience | Raw data, observations, first-hand impressions — necessary but insufficient |
| **Rational Knowledge** | Systematic understanding of patterns and laws | Theories, frameworks, principles extracted from perceptual knowledge |
| **Perceptual → Rational Leap** | The qualitative leap from observation to understanding | Don't stay at the data level; synthesize patterns and laws |
| **Rational → Practice Return** | The second leap: applying theory back to action | Theory without practice is empty; apply and validate |
| **Unity of Knowing and Doing** | Knowledge and action are inseparable | Knowing without doing is not truly knowing |
| **Seek Truth from Facts** | Conclusions must come from actual investigation | No investigation, no right to speak |
| **Spiral Development** | Each practice-cognition cycle advances understanding | Learning is not linear; it spirals upward through repetition |
| **Practice as Criterion** | Only practice can verify whether an idea is correct | Arguments don't settle truth — results do |
| **Concrete Analysis** | Study the actual conditions, not abstract categories | Every situation has specific circumstances that generic theory misses |

## Agent Summary

| Domain | Agent | Core Principles Applied |
|--------|-------|------------------------|
| Thinking | [decision-maker](agents/thinking/decision-maker.md) | Small-scale trials + feedback validation + unity of judgment and results |
| Thinking | [problem-analyzer](agents/thinking/problem-analyzer.md) | Investigation first + perceptual → rational leap + internal process tracing |
| Writing | [report-writer](agents/writing/report-writer.md) | Practice-based evidence chain + continuous improvement cycle |

## Routing Decision Table

| User Signal | Agent | Confidence |
|-------------|-------|------------|
| "make a decision", "choose between", "test this option", "validate assumptions" | decision-maker | High |
| "analyze the problem", "investigate", "what actually happened", "root cause" | problem-analyzer | High |
| "write a report", "summarize findings", "document what we learned" | report-writer | High |
| "实事求是", "调查研究", "实践检验" | problem-analyzer | High |
| Need to validate an idea before committing | decision-maker | Medium |
| Need to present practice-based findings to stakeholders | report-writer | Medium |
| General mention of "practice" or "On Practice" | problem-analyzer (default entry) | Low |

If confidence is Low, confirm agent selection with the user before proceeding.

## Composition Workflows

### Full Practice Cycle Workflow (Investigate → Decide → Report)

```
1. problem-analyzer  → Investigate the real situation, extract rational knowledge
2. decision-maker    → Design practice-based validation, decide based on evidence
3. report-writer     → Document what was done, learned, verified, and next steps
```

### Assumption Validation Workflow

```
1. decision-maker    → Identify assumptions, design small-scale tests
2. problem-analyzer  → Analyze test results, extract patterns
3. decision-maker    → Refine decision based on validated evidence
```

### Continuous Improvement Workflow

```
1. problem-analyzer  → Investigate current state through practice lens
2. report-writer     → Document the practice → learning → improvement cycle
   ↻ Repeat each iteration
```

## Cross-Skill Composition Workflows (Trilogy)

### Validate-Then-Structure (with On Contradiction)

```
1. on-practice / problem-analyzer       → Investigate reality: gather first-hand perceptual knowledge
2. on-practice / decision-maker         → Audit assumptions: which have practice evidence?
3. on-contradiction / problem-analyzer  → Structure validated findings into contradiction layers
4. on-contradiction / decision-maker    → Identify principal contradiction, plan transformation
5. on-practice / report-writer          → Document the full practice → structure → action cycle
```

### Practice-Driven Decision (with On Contradiction)

```
1. on-practice / decision-maker         → Surface assumptions, design small-scale trials
2. on-contradiction / decision-maker    → Frame validated results as contradictions, find principal one
3. on-practice / decision-maker         → Final decision grounded in both evidence and structural clarity
```

### The Full Trilogy Workflow (Evidence → Structure → Time)

```
1. on-practice / problem-analyzer        → Investigate reality, gather first-hand perceptual knowledge
2. on-contradiction / problem-analyzer   → Structure findings into contradiction layers, find principal one
3. on-protracted-war / problem-analyzer  → Diagnose current stage, assess four factors over time
4. on-protracted-war / decision-maker    → Choose phase-appropriate strategy
5. on-practice / report-writer           → Full report: evidence + contradiction structure + phased plan
```

## Practice Analysis Tools

### Tool 1: Practice-Cognition Map

For any situation, trace the knowledge chain:

| Stage | Content | Evidence | Confidence |
|-------|---------|----------|------------|
| Practice (what was done) | {concrete actions taken} | {records, logs, data} | Factual |
| Perception (what was observed) | {raw observations} | {direct experience} | Perceptual |
| Reason (what was understood) | {patterns, principles extracted} | {analysis, synthesis} | Rational |
| Validation (was it correct?) | {re-practice results} | {outcomes, metrics} | Verified / Unverified |

### Tool 2: Assumption Audit

Before any decision, list all assumptions and their practice-basis:

| # | Assumption | Practice-Based? | Evidence | Confidence |
|---|-----------|-----------------|----------|------------|
| 1 | {assumption} | ✅ Tested / ❌ Untested | {what evidence exists} | High / Low |
| 2 | {assumption} | ✅ / ❌ | {evidence} | High / Low |

**Rule**: Untested assumptions with high impact must be validated through practice before proceeding.

### Tool 3: Investigation Checklist

Before drawing ANY conclusion, verify:

1. Have you investigated the actual situation first-hand?
2. Is your data from practice (observed/measured) or from theory (assumed/deduced)?
3. Have you distinguished perceptual knowledge (raw facts) from rational knowledge (interpreted patterns)?
4. Has your conclusion been tested in practice, or is it still theoretical?
5. If tested, did the practice results confirm or contradict your theory?

> **"No investigation, no right to speak."** — Mao Zedong

## Agent Output Contract

All agents follow the same output rules:

| Allowed | Not Allowed |
|---------|-------------|
| Practice-grounded analysis with evidence | Conclusions without investigation evidence |
| Recommendations with validation plans | Pure theoretical reasoning without practice links |
| Experiment designs for testing assumptions | Presenting untested assumptions as facts |
| Actionable next practice steps | Abstract advice disconnected from action |

Every agent output must include:
1. **Practice Evidence** — What was actually done/observed (not assumed)
2. **Knowledge Stage** — Whether findings are perceptual, rational, or practice-verified
3. **Assumptions Audit** — Which conclusions are tested vs untested
4. **Validation Plan** — How to test unverified conclusions through practice
5. **Next Practice** — Concrete actions for the next spiral cycle

## Error Handling

| Issue | Solution |
|-------|----------|
| User's request matches no agent trigger | Default to problem-analyzer as the entry point |
| User wants to decide without any evidence | Highlight untested assumptions; recommend small-scale practice first |
| Analysis is based entirely on theory/logic | Challenge: "What practice evidence supports this?" Design investigation |
| User cannot access real-world data | Suggest proxy practices: interviews, prototypes, small experiments |
| Previous practice results contradict current theory | This is the spiral at work — revise rational knowledge, plan re-practice |
| User expects certainty from limited practice | Clarify: practice spirals upward; one cycle gives partial truth, not full truth |
| Conclusions feel correct but are untested | Mark as "rational knowledge (unverified)" — design validation practice |

## Execution Checklist

Before invoking any agent, verify:

- [ ] The situation involves real-world action, not pure abstract reasoning
- [ ] Agent selection follows the Routing Decision Table
- [ ] Agent receives concrete context (what was done, what was observed, what is planned)

After agent produces output, verify:

- [ ] Every conclusion traces back to practice evidence (not just logic)
- [ ] Assumptions are explicitly labeled as tested or untested
- [ ] A validation plan exists for untested conclusions
- [ ] Next steps are concrete actions (practice), not abstract recommendations
- [ ] The output identifies which stage of the spiral the user is in

## Boundary Enforcement

This skill ONLY handles:

- Practice-grounded decision-making with evidence validation
- Problem investigation rooted in real-world observation and data
- Report writing structured around the practice-cognition-improvement cycle
- Designing experiments and investigations to test assumptions
- Tracing the practice → cognition → re-practice spiral

This skill does NOT handle:

- Structural contradiction analysis → `on-contradiction`
- Long-term phased strategy or stage diagnosis → `on-protracted-war`
- Code generation or software implementation → `requirement-workflow`
- Software engineering methodology → `software-methodology-toolkit`
- Quick factual answers → answer directly
- Project management execution → out of scope (future v2.0)

## Expansion Roadmap (v2.0)

> **Guiding principle**: No new agents until v1.0 agents are practice-tested. Apply our own spiral — use the skills in real work first, then expand based on evidence.

The following agents are planned for future versions. Agents are assigned to the skill whose **core method** (practice spiral vs contradiction structure) is the primary lens.

| Domain | Agent | Core Principle | Notes |
|--------|-------|---------------|-------|
| Learning | learning-master | Learn by doing; deepen through repeated practice; summarize laws | Complements `on-contradiction / knowledge-absorber` (which focuses on structural universality/particularity) |
| Experimentation | experiment-designer | Small practices to test ideas; iterate on results | |
| Execution | execution-driver | Translate plans into actions; correct deviations through practice | |
| Investigation | field-investigator | First-hand research; rational knowledge from perceptual facts | |
| Improvement | pattern-extractor | Extract regular patterns; turn experience into methods into systems | Complements `on-contradiction / retrospective-guide` (which focuses on contradiction development over time) |

## References

- **On Practice** (《实践论》) — Mao Zedong (1937)
- **On Contradiction** (《矛盾论》) — Mao Zedong (1937)
- **On Protracted War** (《论持久战》) — Mao Zedong (1938)
- **"Where Do Correct Ideas Come From?"** (《人的正确思想是从哪里来的？》) — Mao Zedong (1963)
- **"Oppose Book Worship"** (《反对本本主义》) — Mao Zedong (1930)
