---
description: Guidelines for Trae skill development in trae-*-writer directories
globs: skills/trae-*-writer/**/*.md
alwaysApply: false
---

# Trae Skill Development

## Shared Agents

Each trae-writer skill has duplicated agents:

```
skills/
├── trae-skill-writer/agents/
├── trae-rules-writer/agents/
└── trae-agent-writer/agents/
```

## Agent Sync

**Edit canonical** (trae-skill-writer/agents/) → **Sync to others**

## Agents

| Agent | Purpose |
|-------|---------|
| project-scanner | Analyze structure |
| tech-stack-analyzer | Domain analysis |
| convention-detector | Extract conventions |
| quality-validator | Validate outputs |

## Critical Rules

**Paths:** NO absolute paths. Use `src/` or `{project_root}/`

**Globs:** NO quotes. `globs: *.ts,*.tsx` ✅ NOT `"*.ts"` ❌

## Quality

- Frontmatter: name + description
- Description: triggers + "Do NOT"
- NO absolute paths
- Globs: no quotes
