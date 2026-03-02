---
name: trae-agent-writer
description: "Create subagent definitions (agent.md files) for independent AI workers. Use when user wants to: create an agent, build a grader/evaluator, make an A/B comparator, spawn independent workers, or create something that runs in isolation. Triggers on: '创建 agent', 'subagent', 'grade outputs independently', 'blind comparison', 'run this in parallel'. Do NOT use for skills (use trae-skill-writer) or rules (use trae-rules-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.2"
---

# Trae Agent Writer

Create agent definitions for independent, isolated execution with business context.

## What is an Agent?

- **Spawned as subagents** - Run with isolated context
- **Single-purpose** - One agent, one job
- **Stateless** - No memory between invocations
- **Composable** - Orchestrated by parent agents/skills

## Workflow

```
0. SIZE CHECK      → Is project too large? Ask user to specify context
1. ANALYZE         → What independent task needs an agent?
2. UNDERSTAND BIZ  → What business context does this agent need?
3. READ CODE       → Study existing patterns/agents if any
4. DEFINE          → Role, inputs, process, outputs + business rules
5. CREATE          → Write agent.md with domain context
6. VERIFY          → Test agent invocation
```

---

## Common Mistakes (AVOID THESE)

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `/Users/john/project/` | `{project_root}/` | Absolute paths break for others |
| `agent.md`, `helper.md` | `review-grader.md` | Use descriptive action-oriented names |
| Mixed 中英文 | Single language | Confuses AI |

---

## Understand Code + Business

### Code-First Approach

```
1. Check if similar agents exist
2. Read 1-2 existing agents for patterns
3. Follow established conventions
```

### Business Context

Agents need domain knowledge to make correct decisions:

| Agent Type | Business Context Needed |
|------------|-------------------------|
| **Grader** | What makes output "good"? |
| **Analyzer** | What patterns matter? |
| **Validator** | What business rules apply? |

---

## Agent Format

```markdown
# {Agent Name} Agent

{One-sentence role}

## Role

{What this agent does and why}

## Inputs

- **param_name**: Description
- **output_path**: Where to save results

## Process

### Step 1: {Action}
1. Do this
2. Then this

### Step N: Write Results
Save to `{output_path}`.

## Output Format

{JSON structure}

## Guidelines

- **Be objective**: Avoid bias
- **Cite evidence**: Quote specific text
```

---

## Best Practices

### Naming

| Good ✅ | Bad ❌ |
|---------|--------|
| `review-grader.md` | `agent.md` |
| `code-comparator.md` | `helper.md` |
| `app-analyzer.md` | `scanner.md` (too vague) |

### Agent Locations

| Location | Use Case |
|----------|----------|
| `skill-name/agents/` | Inside skills |
| `.trae/agents/` | Project-level |
| `~/.trae/agents/` | Global |

### Good Agent Candidates

| Pattern | Why Agent? |
|---------|------------|
| Grader | Needs objectivity |
| Comparator | Blind comparison |
| Analyzer | Deep dive, isolated |
| Transformer | Parallel processing |

**Don't make agents for:** Simple inline tasks, tasks needing conversation history.

---

## Quality Checklist

Before creating agents, verify:

- [ ] **No absolute paths** - Use placeholders
- [ ] **Naming** - Descriptive, action-oriented
- [ ] **Language** - Single language throughout
- [ ] **Role** - Clear single purpose
- [ ] **Inputs** - All parameters documented
- [ ] **Output** - Structured format defined

---

## Example

```
User: "I need an agent to grade code review outputs"

ANALYZE:
- Purpose: Evaluate code reviews objectively
- Needs isolation to prevent bias

CREATE: review-grader.md

# Review Grader Agent

Grade code reviews against quality expectations.

## Role

Assess reviews for completeness, accuracy, helpfulness.
Operates blindly to prevent bias.

## Inputs

- **review_path**: Path to review file
- **expectations**: List of expected findings
- **output_path**: Where to save grading.json

## Process

### Step 1: Read Review
1. Read review file
2. Extract all claims and findings

### Step 2: Check Expectations
For each expectation:
1. Search for evidence in review
2. Mark PASS/FAIL
3. Cite specific evidence

### Step 3: Write Results
Save to `{output_path}/grading.json`

## Output Format

{
  "expectations": [
    {"text": "...", "passed": true, "evidence": "..."}
  ],
  "pass_rate": 0.80
}

## Guidelines

- **Be objective**: Don't favor verbose or brief
- **Cite evidence**: Quote specific text
```

---

## References

- [Trae Agent Documentation](assets/trae-agent-docs.md)
- [Agent Patterns](references/agent-patterns.md)
- [Agent Template](assets/agent.md.template)
- [Grader Agent Example](examples/grader-agent.md)
