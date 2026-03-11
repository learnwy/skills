---
name: project-agent-writer
description: "Create or update project-level agents by analyzing user problems and project context. NOT by asking questions - by understanding what users struggle with and designing worker solutions. Keeps outputs in project scope."
license: "MIT"
compatibility: "Any agent-enabled workspace"
metadata:
  author: "learnwy"
  version: "3.0"
---

# Project Agent Writer

**Design Philosophy**: Users don't know what an "agent" is. They know their **problems**. This skill transforms problem descriptions into working agents.

## Core Principle: Problem-First, Not Questionnaire-First

When a user mentions any of these, activate this skill:
- "I need someone to automatically..."
- "Can you make AI do X every time..."
- "I want an agent that..."
- "Someone to constantly monitor..."
- Any automation need described as "someone who would..."

**DO NOT** ask "What do you want the agent to do?" - infer from their problem.

## L1: Problem Understanding

### Problem Classification

| Problem Pattern | Agent Type | Example |
|----------------|------------|---------|
| "Evaluate/grade/compare..." | Evaluator | Code reviewer, PR grader |
| "Analyze/find/report..." | Analyzer | Bug finder, pattern detector |
| "Transform/convert/normalize..." | Transformer | Format converter |
| "Monitor/watch/alert..." | Monitor | Log watcher, performance tracker |
| "Execute/run/deploy..." | Executor | Deployment agent |

### Extract Agent Specifications

From user's problem, extract:
- **Role**: What the agent does (from problem)
- **Inputs**: What triggers the agent
- **Outputs**: What the agent produces
- **Constraints**: Boundaries and limitations

## L2: Project Analysis Pipeline

Run in parallel with problem understanding:

### Analysis 1: Existing Agents

```
Check for:
- .trae/agents/ - existing agents
- .claude/agents/ - alternative locations
- scripts/ - automation scripts that could become agents
```

### Analysis 2: Integration Points

```
Find:
- APIs the agent will call
- File patterns the agent will process
- External tools the agent will use
```

### Analysis 3: Conventions

```
Detect:
- Naming conventions for automation
- Output formats expected in project
```

## L3: Agent Design

Based on Problem + Analysis, design the agent:

```
## Agent: {name}

Problem: {user's problem in their words}
Role: {one-line description}
Type: {Evaluator|Analyzer|Transformer|Monitor|Executor}

### Triggers
- {when agent should activate}

### Inputs
- {what triggers the agent}
- {required context}

### Process
1. {step 1}
2. {step 2}
3. ...

### Outputs
- {what agent produces}
- {output format}

### Constraints
- {boundaries}
- {what NOT to do}
```

## L4: Validation (Before Generation)

Show user BEFORE generating:

```
I'll create an agent that:

Problem: {user's problem}
Role: {what the agent does}
Type: {agent category}
Triggers: {when it activates}
Files: {files to create}

Is this correct? Should I adjust anything?
```

WAIT for confirmation before generating.

## L5: Generation

1. Create agent scaffold using `scripts/init_agent.py`
2. Fill role, inputs, process, outputs
3. Set correct project-relative output path
4. Include quality gates

## L6: Quality Gates

Before delivery, verify:
- [ ] Agent has clear role (not vague)
- [ ] Inputs are explicitly defined
- [ ] Output schema is deterministic
- [ ] Constraints are enforced
- [ ] Output path is project-relative, not global

## L7: Output Contract

Always produce:
1. **Problem Understanding**: What problem identified
2. **Agent Design**: The agent architecture
3. **Deliverables**: Files created
4. **Usage Guide**: How to trigger and use

## Reference: AskUserQuestion Triggers (Limited)

Only use AskUserQuestion when:
- Multiple valid agent types exist and user preference matters

DO NOT use for:
- Asking what to name it (infer from problem)
- Asking where to put it (use project conventions)

## Agents

- Built-in problem analysis
- Project convention detection
- Integration point discovery

## References

- [Agent Patterns](references/agent-patterns.md): Architecture patterns
- [Path Discovery](references/path-discovery.md): Output paths (load AFTER design)
