---
description: Sync rule for agents with universal and adapted versions
globs: agents/*.md,agents/**/agent.md
alwaysApply: false
---

# Agent Sync Rule

When modifying agents that have both a universal version and adapted versions, keep them in sync.

## Architecture

```
skills/agents/                              # Universal agents (pure methodology)
├── {agent-name}/
│   └── agent.md                            # Core methodology, no context-specific logic

skills/{skill-name}/agents/                 # Adapted agents (context-specific)
├── {agent-name}.md                         # Adds Hook Points, output formats, etc.

skills/software-methodology-toolkit/agents/ # Standalone copies (self-contained)
├── {phase}/
│   └── {agent-name}.md                     # Full copy for distribution
```

## Sync Rules

**Update universal agent (`skills/agents/{name}/agent.md`):**
1. Identify adapted versions in skill directories
2. Update methodology content in adapted versions
3. Preserve context-specific additions (Hook Points)
4. **NEW:** Update standalone copy in `software-methodology-toolkit/agents/{phase}/{name}.md`

**Update adapted agent (`skills/{skill}/agents/{name}.md`):**
1. Methodology change → Also update universal version
2. Context-specific change → Only update this version

**Update software-methodology-toolkit agent:**
1. Any methodology change → Update universal version first
2. Then sync to `software-methodology-toolkit/agents/{phase}/{name}.md`
3. This is a **full copy**, not an adaptation

## What Syncs

| Content | Syncs | Example |
|---------|-------|---------|
| Methodology | Yes | Process steps, patterns |
| Output format | Yes | JSON schema |
| References | Yes | Book citations |
| Hook Points | No | `pre_stage_ANALYZING` |
| Config Options | No | Skill-specific |

## Agent Mappings

| Universal | Adapted In | Standalone Copy |
|-----------|------------|-----------------|
| `problem-definer` | `requirement-workflow` | `software-methodology-toolkit/agents/analyzing/` |
| `spec-by-example` | `requirement-workflow` | `software-methodology-toolkit/agents/analyzing/` |
| `story-mapper` | `requirement-workflow` | `software-methodology-toolkit/agents/planning/` |
| `responsibility-modeler` | `requirement-workflow` | `software-methodology-toolkit/agents/designing/` |
| `domain-modeler` | `requirement-workflow` | `software-methodology-toolkit/agents/designing/` |
| `architecture-advisor` | `requirement-workflow` | `software-methodology-toolkit/agents/designing/` |
| `refactoring-guide` | `requirement-workflow` | `software-methodology-toolkit/agents/implementing/` |
| `tdd-coach` | `requirement-workflow` | `software-methodology-toolkit/agents/implementing/` |
| `legacy-surgeon` | `requirement-workflow` | `software-methodology-toolkit/agents/implementing/` |
| `test-strategist` | `requirement-workflow` | `software-methodology-toolkit/agents/testing/` |

## Checklist

```
□ Is this a universal agent? → Check skills/agents/{name}/agent.md
□ Has adapted versions? → Search {name}.md in skill directories
□ Has standalone copy? → Check software-methodology-toolkit/agents/{phase}/{name}.md
□ Methodology or context-specific? → Sync accordingly
□ Updated universal? → Sync to ALL locations (adapted + standalone)
```

## Priority Note

**software-methodology-toolkit is a fallback skill:**
- Project-specific skills (like `requirement-workflow`) should trigger first
- This toolkit only triggers when no project-specific skill matches
- Lower priority ensures context-specific adaptations take precedence
