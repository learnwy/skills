---
name: lwy-project-agent-writer
description: "Use this skill when the user wants to create, update, or design a project-level agent (.agents/agents/*.md). Analyze the user's question and project context to design a work plan. Triggers: 'create agent', 'build an agent', 'add agent', 'design agent', 'update agent', 'project agent', 'subagent', 'worker agent', 'automated worker', or when the user describes a repetitive task that should be handled by an autonomous agent."
metadata:
  author: "learnwy"
  version: "4.0"
---

# Project Agent Writer

Analyze the project's structure, conventions, and automation gaps, then **design** an agent to solve the user's problem. Always confirm with the user via `AskUserQuestion` before generating any files.

> **Core principle**: First understand the problem, then analyze the project, then design the agent, and only generate after the user confirms.

> **Shared principle:** This skill shares the 5 common writer disciplines with `project-skill-writer` / `project-skill-installer` / `project-rules-writer`. See [../project-skill-writer/references/writer-discipline.md](../project-skill-writer/references/writer-discipline.md) for details.

## Use Cases

**Trigger when:**

- The user says "create an agent", "I need an agent that...", "make AI do X every time"
- The user describes an automation need ("someone to automatically...", "I want something that monitors...")
- The user wants to build a grader, comparator, analyzer, transformer, researcher, or validator

**Do not trigger when:**

- The user wants to **install** a skill → delegate to `project-skill-installer`
- The user wants to **create** a skill → delegate to `project-skill-writer`
- The user wants to **create** a rule → delegate to `project-rules-writer`

## Prerequisites

- Node.js >= 18
- The target project must have a writable directory for agent output

## Workflow

```
[L1: Understand the problem]
         ↓
[L2: Project analysis]
         ↓
[L3: Agent design]
         ↓
[L4: Confirm]  ← AskUserQuestion (confirmation required)
         ↓
[L5: Generate]
         ↓
[L6: Verify]
```

## L1: Understand the Problem

Extract the user's needs—do not ask "what do you want the agent to do?" but infer from their question:

### Problem Classification

| Problem pattern | Agent type | Example |
|----------|------------|------|
| "evaluate/grade/compare output" | Grader | Code reviewer, PR quality checker |
| "compare A and B, pick the better one" | Comparator | Skill version comparison, A/B tester |
| "analyze/find patterns/report insights" | Analyzer | Bug finder, performance diagnostics |
| "convert/transform/normalize data" | Transformer | Format converter, schema mapper |
| "research/gather/synthesize information" | Researcher | Doc lookup, best practices |
| "check/validate/enforce rules" | Validator | Schema checker, compliance validator |

### Extract the Agent Spec

Extract from the user's question:
- **Role**: what the agent does (extracted from the problem description)
- **Input**: what triggers the agent / what data it needs
- **Output**: what the agent produces
- **Constraints**: boundaries and limitations

## L2: Project Analysis

Scan the project to understand context. Use search tools in parallel:

### Detection Targets

| Signal | What to look for | Tool |
|------|----------|------|
| Language | File extensions (`.ts`, `.py`, `.swift`, `.go`) | Glob |
| Framework | package.json dependencies, Podfile, go.mod, Cargo.toml | Read |
| Existing agents | `.agents/agents/`, `.trae/agents/`, `.claude/agents/`, `.cursor/agents/` | Glob |
| Existing skills | `.agents/skills/`, `.trae/skills/`, `.cursor/skills/` | Glob |
| Automation scripts | `scripts/`, `tools/`, `Makefile` targets | Glob |
| API interfaces | REST endpoints, GraphQL schema, gRPC protos | Grep |
| Conventions | Naming patterns, output formats, directory structure | LS |

### Analysis Output

```
Project: {name}
Language: {detected language}
Existing agents: {list or "none"}
Existing skills: {list or "none"}
Automation scripts: {list or "none"}
Integration points: {API, file patterns, tools}
Conventions: {naming, output format}
```

## L3: Agent Design

Based on the problem (L1) + analysis (L2), design the agent:

```
Agent: {name}
Problem: {the problem in the user's own words}
Role: {one-sentence description}
Type: {Grader|Comparator|Analyzer|Transformer|Researcher|Validator}

Trigger: {when the agent activates}
Input: {what data the agent needs}
Process: {high-level steps}
Output: {what the agent produces + format}
Constraints: {boundaries + what it should not do}

Files to create:
  - {path/to/agent.md}
```

## L4: Confirm (AskUserQuestion required)

**Critical**: Present the design via `AskUserQuestion` before generating any files.

### AskUserQuestion Call

Use `AskUserQuestion`:

```json
{
  "questions": [{
    "question": "I've designed this agent based on your project. Should I create it?",
    "header": "Agent",
    "multiSelect": false,
    "options": [
      {
        "label": "Create {agent-name} (Recommended)",
        "description": "{type} agent — {one-sentence role}. Output: {path}"
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
- Always show the designed agent's name and type
- Include the output path so the user knows where the file goes
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

- Never generate files before the user confirms
- If the user says "adjust the design", return to L3 with the feedback

## L5: Generate

After the user confirms:

1. Use [path discovery](references/path-discovery.md) to determine the output path
2. Use `scripts/cli.cjs init` to create the agent scaffold
3. Fill in the role, input, process, and output from the L3 design
4. Set the correct project-relative output path
5. Include quality gates and constraints

### Generation Command

```bash
node scripts/cli.cjs init \
  --skill-dir <this-skill-dir> \
  --name <agent-name> \
  --role "<one-sentence-role>" \
  --output-dir <project>/.agents/agents/
```

## L6: Verify

Verify before delivery:

- [ ] The agent has a clear, specific role (not vague)
- [ ] Inputs are clearly defined and described
- [ ] The output schema is deterministic (JSON with known fields)
- [ ] Constraints are enforced (what it should not do)
- [ ] The output path is project-relative, not global
- [ ] The agent follows the conventions from the L2 analysis

### Delivery Report

```
Agent created:
  Name: {agent-name}
  Type: {Grader|Comparator|Analyzer|...}
  Path: {project-relative path}

Usage: Launch this agent via the Task tool using its defined inputs.
```

## Error Handling

| Problem | Solution |
|------|----------|
| User's question is too vague | Infer the most likely agent type from context, confirm at L4 |
| Multiple valid agent types | Present alternatives in AskUserQuestion and let the user choose |
| No agent directory exists | Create `.agents/agents/` |
| User requests creating a skill/rule | Route to `project-skill-writer` or `project-rules-writer` |
| User says "adjust the design" at L4 | Return to L3 and incorporate the feedback |
| Output path is global | Reject, enforce a project-relative path |
| Agent conflicts with an existing one | Show a comparison, ask the user whether to replace or rename |

## Scope

This skill handles **only**:
- Analyzing the project for agent design context
- Designing the agent based on the user's problem
- Confirming the design via AskUserQuestion
- Generating the agent file to a project-relative path
- Verifying the generated agent

This skill does **not** handle:
- Creating skills → `project-skill-writer`
- Installing skills → `project-skill-installer`
- Creating rules → `project-rules-writer`
- Global agent installation (always scoped to the project)

## References

- [Agent patterns](references/agent-patterns.md) — Architecture patterns (grader, comparator, analyzer, transformer, researcher, validator)
- [Path discovery](references/path-discovery.md) — Output path determination (load after the design is complete)
- [Example: Grader agent](examples/grader-agent.md) — Complete walkthrough of creating a grader agent
