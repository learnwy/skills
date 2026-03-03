---
description: Sync rule for agents with universal and adapted versions
globs: agents/*.md,agents/**/agent.md
alwaysApply: false
---

# Agent Sync Rule

When modifying agents that have both a universal version and adapted versions, keep them in sync.

## Architecture

```
skills/agents/                    # Universal agents (pure methodology)
├── {agent-name}/
│   └── agent.md                  # Core methodology, no context-specific logic

skills/{skill-name}/agents/       # Adapted agents (context-specific)
├── {agent-name}.md               # Adds Hook Points, output formats, etc.
```

## Sync Rules

**Update universal agent (`skills/agents/{name}/agent.md`):**
1. Identify adapted versions in skill directories
2. Update methodology content in adapted versions
3. Preserve context-specific additions (Hook Points)

**Update adapted agent (`skills/{skill}/agents/{name}.md`):**
1. Methodology change → Also update universal version
2. Context-specific change → Only update this version

## What Syncs

| Content | Syncs | Example |
|---------|-------|---------|
| Methodology | Yes | Process steps, patterns |
| Output format | Yes | JSON schema |
| References | Yes | Book citations |
| Hook Points | No | `pre_stage_ANALYZING` |
| Config Options | No | Skill-specific |

## Agent Mappings

| Universal | Adapted In |
|-----------|------------|
| `problem-definer` | `requirement-workflow` |
| `spec-by-example` | `requirement-workflow` |
| `story-mapper` | `requirement-workflow` |
| `responsibility-modeler` | `requirement-workflow` |
| `domain-modeler` | `requirement-workflow` |
| `architecture-advisor` | `requirement-workflow` |
| `refactoring-guide` | `requirement-workflow` |
| `tdd-coach` | `requirement-workflow` |
| `legacy-surgeon` | `requirement-workflow` |
| `test-strategist` | `requirement-workflow` |

## Checklist

```
□ Is this a universal agent? → Check skills/agents/{name}/agent.md
□ Has adapted versions? → Search {name}.md in skill directories
□ Methodology or context-specific? → Sync accordingly
```
