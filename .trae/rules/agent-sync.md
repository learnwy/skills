---
description: Sync agents between universal, adapted, and standalone copies
globs: agents/*.md,agents/**/agent.md
alwaysApply: false
---

# Agent Sync Rule

## Architecture

```
skills/agents/{name}/agent.md        # Universal
skills/{skill}/agents/{name}.md      # Adapted
skills/software-methodology-toolkit/ # Standalone
```

## Sync Rules

**Update universal** → Sync to adapted + standalone

**Update adapted** → Methodology: update universal | Context: keep local

**Update standalone** → Full copy, no modifications

## Mappings

| Universal | Adapted | Standalone |
|-----------|---------|------------|
| problem-definer | requirement-workflow | analyzing/ |
| story-mapper | requirement-workflow | planning/ |
| domain-modeler | requirement-workflow | designing/ |
| tdd-coach | requirement-workflow | implementing/ |
| refactoring-guide | requirement-workflow | implementing/ |

## Checklist

- [ ] Universal updated?
- [ ] Sync adapted versions?
- [ ] Sync standalone copies?
- [ ] Preserve Hook Points?

**Note:** software-methodology-toolkit is fallback (lower priority)
