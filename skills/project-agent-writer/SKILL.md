---
name: project-agent-writer
description: "Use this skill when the user wants to create, update, or design a project-level agent (.trae/agents/*.md or agents/*.md). Analyzes user problems and project context to design worker solutions. Triggers on: 'create agent', 'build an agent', 'add agent', 'design agent', 'update agent', 'project agent', 'subagent', 'worker agent', 'automated worker', or when the user describes a repetitive task that should be handled by an autonomous agent."
metadata:
  author: "learnwy"
  version: "4.0"
---

# Project Agent Writer

Analyzes a project's structure, conventions, and automation gaps, then **designs** an agent to solve the user's problem. Always confirms with the user via `AskUserQuestion` before generating any files.

> **Core Principle**: Understand the problem first, analyze the project second, design the agent third, generate only after user confirms.

## When to Use

**Invoke when:**

- User says "create an agent", "I need an agent that...", "make AI do X every time"
- User describes automation need ("someone to automatically...", "I want something that monitors...")
- User wants to build a grader, comparator, analyzer, transformer, researcher, or validator

**Do NOT invoke when:**

- User wants to **install** a skill → delegate to `project-skill-installer`
- User wants to **create** a skill → delegate to `project-skill-writer`
- User wants to **create** a rule → delegate to `trae-rules-writer`

## Prerequisites

- Node.js >= 18
- Target project must have a writable directory for agent output

## Workflow

```
[L1: Problem Understanding]
         ↓
[L2: Project Analysis]
         ↓
[L3: Agent Design]
         ↓
[L4: Confirmation]  ← AskUserQuestion (MUST confirm)
         ↓
[L5: Generation]
         ↓
[L6: Verification]
```

## L1: Problem Understanding

Extract what the user needs — do NOT ask "what do you want the agent to do?" Instead, infer from their problem:

### Problem Classification

| Problem Pattern | Agent Type | Example |
|----------------|------------|---------|
| "Evaluate/grade/compare outputs" | Grader | Code reviewer, PR quality checker |
| "Compare A vs B, pick the better one" | Comparator | Skill version comparison, A/B tester |
| "Analyze/find patterns/report insights" | Analyzer | Bug finder, performance diagnosis |
| "Transform/convert/normalize data" | Transformer | Format converter, schema mapper |
| "Research/gather/synthesize information" | Researcher | Documentation lookup, best practices |
| "Check/validate/enforce rules" | Validator | Schema checker, compliance verifier |

### Extract Agent Specifications

From the user's problem, extract:
- **Role**: What the agent does (from problem description)
- **Inputs**: What triggers the agent / what data it needs
- **Outputs**: What the agent produces
- **Constraints**: Boundaries and limitations

## L2: Project Analysis

Scan the project to understand context. Use search tools in parallel:

### Detection Targets

| Signal | What to Look For | Tool |
|--------|-----------------|------|
| Language | File extensions (`.ts`, `.py`, `.swift`, `.go`) | Glob |
| Framework | package.json deps, Podfile, go.mod, Cargo.toml | Read |
| Existing Agents | `.trae/agents/`, `.claude/agents/`, `.cursor/agents/` | Glob |
| Existing Skills | `.trae/skills/`, `.cursor/skills/` | Glob |
| Automation Scripts | `scripts/`, `tools/`, `Makefile` targets | Glob |
| API Surface | REST endpoints, GraphQL schema, gRPC protos | Grep |
| Conventions | Naming patterns, output formats, directory structure | LS |

### Analysis Output

```
Project: {name}
Languages: {detected languages}
Existing Agents: {list or "none"}
Existing Skills: {list or "none"}
Automation Scripts: {list or "none"}
Integration Points: {APIs, file patterns, tools}
Conventions: {naming, output formats}
```

## L3: Agent Design

Based on Problem (L1) + Analysis (L2), design the agent:

```
Agent: {name}
Problem: {user's problem in their words}
Role: {one-line description}
Type: {Grader|Comparator|Analyzer|Transformer|Researcher|Validator}

Triggers: {when agent should activate}
Inputs: {what data the agent needs}
Process: {high-level steps}
Outputs: {what agent produces + format}
Constraints: {boundaries + what NOT to do}

Files to create:
  - {path/to/agent.md}
```

## L4: Confirmation (MUST USE AskUserQuestion)

**CRITICAL**: Before generating ANY files, present the design via `AskUserQuestion`.

### AskUserQuestion Call

Use `AskUserQuestion` with:

```json
{
  "questions": [{
    "question": "I've designed this agent based on your project. Should I create it?",
    "header": "Agent",
    "multiSelect": false,
    "options": [
      {
        "label": "Create {agent-name} (Recommended)",
        "description": "{type} agent — {1-sentence role}. Output: {path}"
      },
      {
        "label": "Adjust design",
        "description": "Let me refine the agent design before generating"
      },
      {
        "label": "Skip",
        "description": "Don't create an agent right now"
      }
    ]
  }]
}
```

**Rules**:
- Always show the designed agent name and type
- Include the output path so user knows where files go
- If multiple agent types are valid, offer alternatives:

```json
{
  "questions": [{
    "question": "Your problem could be solved by different agent types. Which approach fits best?",
    "header": "Agent type",
    "multiSelect": false,
    "options": [
      {
        "label": "Grader agent (Recommended)",
        "description": "Evaluates outputs against expectations with pass/fail evidence"
      },
      {
        "label": "Validator agent",
        "description": "Checks correctness against rules and suggests fixes"
      },
      {
        "label": "Skip",
        "description": "Don't create an agent right now"
      }
    ]
  }]
}
```

- Never generate files without user confirmation
- If user says "Adjust design", loop back to L3 with feedback

## L5: Generation

After user confirms:

1. Determine output path using [Path Discovery](references/path-discovery.md)
2. Create agent scaffold using `scripts/init_agent.cjs`
3. Fill in role, inputs, process, outputs from L3 design
4. Set correct project-relative output path
5. Include quality gates and constraints

### Generation Command

```bash
node scripts/init_agent.cjs \
  --skill-dir <this-skill-dir> \
  --name <agent-name> \
  --role "<one-sentence-role>" \
  --output-dir <project>/.trae/agents/
```

## L6: Verification

Before delivery, verify:

- [ ] Agent has a clear, specific role (not vague)
- [ ] Inputs are explicitly defined with descriptions
- [ ] Output schema is deterministic (JSON with known fields)
- [ ] Constraints are enforced (what NOT to do)
- [ ] Output path is project-relative, not global
- [ ] Agent follows conventions from L2 analysis

### Delivery Report

```
Created agent:
  Name: {agent-name}
  Type: {Grader|Comparator|Analyzer|...}
  Path: {project-relative path}

To use: spawn this agent via the Task tool with its defined inputs.
```

## Error Handling

| Issue | Solution |
|-------|----------|
| User's problem is too vague | Infer the most likely agent type from context, confirm at L4 |
| Multiple valid agent types | Show alternatives in AskUserQuestion, let user pick |
| No existing agents directory | Create `.trae/agents/` (or detected IDE convention) |
| User requests skill/rule creation | Route to `project-skill-writer` or `trae-rules-writer` |
| User says "Adjust design" at L4 | Loop back to L3, incorporate feedback |
| Output path is global | Reject, enforce project-relative path |
| Agent conflicts with existing | Show comparison, ask user whether to replace or rename |

## Boundary Enforcement

This skill ONLY handles:
- Analyzing project for agent design context
- Designing agents based on user problems
- Confirming design via AskUserQuestion
- Generating agent files to project-relative paths
- Verifying generated agents

This skill does NOT handle:
- Creating skills → `project-skill-writer`
- Installing skills → `project-skill-installer`
- Creating rules → `trae-rules-writer`
- Global agent installation (always project-scoped)

## References

- [Agent Patterns](references/agent-patterns.md) — Architecture patterns (Grader, Comparator, Analyzer, Transformer, Researcher, Validator)
- [Path Discovery](references/path-discovery.md) — Output path determination (load AFTER design)
- [Example: Grader Agent](examples/grader-agent.md) — Full walkthrough of creating a grader agent
