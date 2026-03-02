---
name: trae-agent-writer
description: "Create subagent definitions (agent.md files) for independent AI workers. Use when user wants to: create an agent, build a grader/evaluator, make an A/B comparator, spawn independent workers, or create something that runs in isolation. Triggers on: '创建 agent', 'subagent', 'grade outputs independently', 'blind comparison', 'run this in parallel'. Do NOT use for skills (use trae-skill-writer) or rules (use trae-rules-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.3"
---

# Trae Agent Writer

Create agent definitions for independent, isolated execution with business context.


## What is an Agent?

- **Spawned as subagents** - Run with isolated context
- **Single-purpose** - One agent, one job
- **Stateless** - No memory between invocations
- **Composable** - Orchestrated by parent agents/skills


## Phase 1: Understand Project (REQUIRED)

**Before creating ANY agent, understand the context first.**

### 1.1 Check Scope

If project is too large:
- **ASK** - What specific task needs an agent?
- **SCOPE** - Focus on one isolated task

### 1.2 Scan Existing Patterns

Quick scan to understand what exists (NOT deep reading):

```
1. Check if agents/ directory exists
2. List existing agents (names only)
3. Note invocation patterns used
```

**Note:** Deep reading of existing agents happens in Phase 2 when creating similar ones.

### 1.3 Understand Business

Agents need domain knowledge to make decisions:

| Agent Type | Business Context Needed |
|------------|-------------------------|
| **Grader** | What makes output "good"? |
| **Analyzer** | What patterns matter? |
| **Validator** | What business rules apply? |

**Ask:** "What criteria should this agent use?"


## Phase 2: Create Agents (SEQUENTIAL)

**Create agents ONE at a time.**

### 2.1 Plan Agent Breakdown

First, identify what agents are needed:

```
Example: code-review skill
├── review-grader.md    (grade review quality)
├── code-comparator.md  (compare two versions)
└── issue-analyzer.md   (analyze patterns)
```

### 2.2 For EACH Agent

```
┌─────────────────────────────────────────────┐
│  For each agent:                            │
│                                             │
│  1. Define role clearly                     │
│     - Single purpose                        │
│     - What makes it need isolation?         │
│                                             │
│  2. Specify inputs/outputs                  │
│     - All parameters documented             │
│     - Structured output format              │
│                                             │
│  3. Write process steps                     │
│     - Numbered, clear steps                 │
│     - Include business rules                │
│                                             │
│  4. Move to next agent                      │
└─────────────────────────────────────────────┘
```

### 2.3 Agent Format

```markdown
# {Agent Name} Agent

{One-sentence role}

## Role

{What this agent does and why it needs isolation}

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


## Phase 3: Quality & Lessons Learned

### ⚠️ Common Mistakes (CRITICAL)

These mistakes break agents. **Always check:**

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `/Users/john/project/src/` | `src/` | NO absolute paths! |
| `/home/dev/output/` | `output/` or use `{output_path}` param | Paths from project root |
| `agent.md` | `review-grader.md` | Descriptive names |
| Mixed 中英文 | Single language | Confuses AI |
| Missing inputs | Document all params | Agent needs context |

**Path Rule:** Use relative paths like `src/file.ts`. For dynamic paths, use input parameters like `{output_path}`.

### Quality Checklist

Before creating each agent:

- [ ] **Paths** - Use placeholders, no absolute paths
- [ ] **Naming** - Descriptive, action-oriented
- [ ] **Language** - Single language throughout
- [ ] **Role** - Clear single purpose
- [ ] **Inputs** - All parameters documented
- [ ] **Output** - Structured format defined
- [ ] **Business** - Includes domain context


## Best Practices

### Naming

| Good ✅ | Bad ❌ |
|---------|--------|
| `review-grader.md` | `agent.md` |
| `code-comparator.md` | `helper.md` |
| `app-analyzer.md` | `scanner.md` |

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


## Example

```
User: "Create agent to grade code reviews"

Phase 1: Understand
- Purpose: Evaluate reviews objectively
- Needs isolation: Prevent bias
- Criteria: completeness, accuracy

Phase 2: Create

📄 agents/review-grader.md

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
2. Extract all claims

### Step 2: Check Expectations
For each expectation:
1. Search for evidence
2. Mark PASS/FAIL
3. Cite specific text

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

Phase 3: Verify agent can be invoked
```


## References

- [Trae Agent Documentation](assets/trae-agent-docs.md)
- [Agent Patterns](references/agent-patterns.md)
- [Grader Example](examples/grader-agent.md)
