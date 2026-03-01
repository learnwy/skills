# Trae IDE Agent Documentation

> Source: https://docs.trae.ai/ide/agent-overview

## Overview

Agents in Trae IDE are autonomous AI workers that can perform complex tasks independently. They operate in isolation and return results to the main conversation.

## Agent vs Skill vs Rule

| Concept | Purpose                              | Execution       |
| ------- | ------------------------------------ | --------------- |
| Rule    | Constrain AI behavior                | Always active   |
| Skill   | Extend AI capabilities               | On-demand       |
| Agent   | Delegate independent tasks           | Isolated worker |

## When to Use Agents

- **Parallel tasks**: Multiple independent operations
- **Isolated evaluation**: Grading without bias
- **Complex workflows**: Multi-step processes with clear deliverables
- **A/B comparison**: Blind evaluation of alternatives

## Agent File Structure

```
agent-name/
├── agent.md           # Required: Agent definition
├── assets/            # Optional: Templates, prompts
└── examples/          # Optional: Usage examples
```

## agent.md Format

```markdown
---
name: agent-name
description: "What this agent does and when to spawn it."
---

# Agent Title

## Purpose

Clear statement of what this agent accomplishes.

## Input

What the agent expects to receive.

## Process

Step-by-step workflow the agent follows.

## Output

What the agent returns when finished.
```

## Agent Characteristics

### Stateless

Each agent invocation is independent:
- No memory of previous runs
- Cannot communicate during execution
- Returns single final message

### Isolated

Agents operate separately:
- Cannot access main conversation context
- Work with only provided input
- Results merged back to main conversation

### Autonomous

Agents make decisions independently:
- Follow defined workflow
- Handle edge cases
- Complete task without guidance

## Creating Agents

### Define Purpose

Be specific about what the agent does:

```markdown
## Purpose

Evaluate code submissions against rubric criteria without knowing which submission is which (blind grading).
```

### Specify Input

Document expected input format:

```markdown
## Input

- `submission`: Code to evaluate
- `rubric`: Evaluation criteria
- `context`: Any additional information
```

### Design Process

Create clear workflow:

```markdown
## Process

1. Parse submission and rubric
2. Evaluate each criterion independently
3. Assign scores with justification
4. Calculate total score
5. Generate feedback summary
```

### Define Output

Specify return format:

```markdown
## Output

Return JSON:
```json
{
  "score": 85,
  "breakdown": {...},
  "feedback": "...",
  "pass": true
}
```
```

## Agent Patterns

### Grader Agent

Evaluates work against criteria:

```markdown
---
name: code-grader
description: "Grade code submissions blindly against rubric."
---

# Code Grader

## Purpose
Evaluate code quality without bias.

## Process
1. Read submission (anonymous)
2. Apply each rubric criterion
3. Score objectively
4. Return structured feedback
```

### Comparator Agent

Compares alternatives:

```markdown
---
name: solution-comparator
description: "Compare two solutions and pick the better one."
---

# Solution Comparator

## Purpose
Blind A/B comparison of solutions.

## Process
1. Receive Solution A and Solution B (unlabeled)
2. Evaluate each independently
3. Compare on defined criteria
4. Declare winner with reasoning
```

### Researcher Agent

Gathers information:

```markdown
---
name: api-researcher
description: "Research API documentation and summarize."
---

# API Researcher

## Purpose
Investigate APIs and return actionable summary.

## Process
1. Search for API documentation
2. Extract relevant endpoints
3. Note authentication requirements
4. Summarize usage patterns
```

## Best Practices

### 1. Clear Boundaries

Define exactly what agent does and doesn't do:

```markdown
## Scope

Does:
- Evaluate code style
- Check for bugs
- Assess performance

Does NOT:
- Run code
- Access external APIs
- Modify files
```

### 2. Structured Output

Always specify output format:

```markdown
## Output Format

```json
{
  "status": "success|error",
  "result": {...},
  "notes": []
}
```
```

### 3. Error Handling

Define how to handle problems:

```markdown
## Error Handling

- If input invalid → Return error with reason
- If criteria unclear → Make reasonable assumption and note
- If task impossible → Explain why and suggest alternative
```

### 4. Comprehensive Input

Include everything agent needs:

```markdown
## Required Input

- All relevant code files
- Evaluation criteria
- Context about project
- Any constraints or preferences
```

## Agent Invocation

Agents are spawned by the main AI when:
- Task matches agent's description
- Independence is beneficial
- Parallel execution is possible

The main AI:
1. Prepares input for agent
2. Spawns agent with context
3. Waits for agent completion
4. Integrates agent's response

## Limitations

- Agents cannot ask questions during execution
- No real-time communication with user
- Must complete task with provided input
- Single response per invocation
