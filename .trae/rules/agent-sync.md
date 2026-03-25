---
description: Sync agents between universal, adapted, and standalone copies
globs: agents/*.md,agents/**/agent.md
alwaysApply: false
---

# Agent Sync Rule

## Architecture

```
agents/{name}/agent.md                          # Universal (canonical)
skills/{skill}/agents/{name}.md                 # Adapted (skill-specific)
skills/software-methodology-toolkit/agents/     # Standalone (grouped by phase)
```

## Sync Rules

**Update universal** → Sync to adapted + standalone copies.

**Update adapted** → If methodology change: update universal first. If context-only change: keep local.

**Update standalone** → Full copy from universal, no modifications.

## Current Mappings

| Universal | Adapted (in skill) | Standalone (phase/) |
|-----------|-------------------|-------------------|
| problem-definer | requirement-workflow | analyzing/ |
| spec-by-example | requirement-workflow | analyzing/ |
| story-mapper | requirement-workflow | planning/ |
| domain-modeler | requirement-workflow | designing/ |
| architecture-advisor | requirement-workflow | designing/ |
| responsibility-modeler | requirement-workflow | designing/ |
| tdd-coach | requirement-workflow | implementing/ |
| refactoring-guide | requirement-workflow | implementing/ |
| legacy-surgeon | requirement-workflow | implementing/ |
| test-strategist | requirement-workflow | testing/ |

## Checklist

When editing any agent:

- [ ] Universal copy updated?
- [ ] Adapted versions in skill synced?
- [ ] Standalone copies in software-methodology-toolkit synced?
- [ ] Hook points preserved in adapted versions?

**Note:** software-methodology-toolkit is a fallback skill (lower priority than requirement-workflow).
