---
name: trae-agent-writer
description: "Create subagent definitions (agent.md files) for independent AI workers. Use when user wants to: create an agent, build a grader/evaluator, make an A/B comparator, spawn independent workers, or create something that runs in isolation. Triggers on: '创建 agent', 'subagent', 'grade outputs independently', 'blind comparison', 'run this in parallel'. Do NOT use for skills (use trae-skill-writer) or rules (use trae-rules-writer)."
---

# Trae Agent Writer

Create agent definitions for tasks that need independent, isolated execution.

## What is an Agent?

A **focused, autonomous instruction set** for a subagent to execute independently:
- **Spawned as subagents** - Run with isolated context
- **Single-purpose** - One agent, one job
- **Stateless** - No memory between invocations
- **Composable** - Orchestrated by parent agents/skills

## Workflow

```
1. IDENTIFY → What independent task needs an agent?
2. DEFINE   → Role, inputs, process, outputs
3. DESIGN   → Step-by-step instructions
4. CREATE   → Write agent.md following the pattern
```

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

```json
{
  "field": "value"
}
```

## Guidelines

- **Be objective**: Avoid bias
- **Cite evidence**: Quote specific text
```

## Agent Locations

- `skill-name/agents/` - Inside orchestrating skills
- `.trae/agents/` - Project-level agents
- `~/.trae/agents/` - Global agents

## Good Agent Candidates

| Pattern      | Why Agent?                  | Example              |
| ------------ | --------------------------- | -------------------- |
| Grader       | Needs objectivity           | Output evaluator     |
| Comparator   | Blind comparison            | A/B tester           |
| Analyzer     | Deep dive, isolated context | Performance analyzer |
| Transformer  | Parallel processing         | File converter       |
| Researcher   | Independent investigation   | Doc researcher       |

**Don't make agents for:** Simple inline tasks, tasks needing conversation history, single-step operations.

## Example

```
User: "I need an agent to grade code review outputs"

📄 review-grader.md

# Review Grader Agent

Grade code reviews against quality expectations.

## Role

Assess reviews for completeness, accuracy, helpfulness. Operates blindly to prevent bias.

## Inputs

- **review_path**: Path to review file
- **expectations**: List of expected findings
- **output_path**: Where to save grading.json

## Process

### Step 1: Read Review
1. Read review file
2. Extract all claims

### Step 2: Check Expectations
For each expectation:
1. Search for evidence
2. Mark PASS/FAIL
3. Cite evidence

### Step 3: Write Results
Save to `{output_path}/grading.json`

## Output Format

```json
{
  "expectations": [
    {"text": "...", "passed": true, "evidence": "..."}
  ],
  "summary": {"passed": 4, "failed": 1, "pass_rate": 0.80}
}
```

## Guidelines

- **Be objective**: Don't favor verbose or brief
- **Cite evidence**: Quote specific text
```

## References

- [Agent Patterns](references/agent-patterns.md) - Common archetypes
- [Agent Template](assets/agent.md.template) - Starter template
