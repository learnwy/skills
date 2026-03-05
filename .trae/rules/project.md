---
description: Personal Skills Repository overview
alwaysApply: true
---

# Personal Skills Repository

## Goal

This repository stores and maintains personal AI skills.

## Structure

```
skills/
├── .trae/rules/
├── skills/
│   ├── life-reset/
│   └── software-methodology-toolkit/
└── agents/
```

## Categories

**agents/**: methodology-only assets (for example `problem-definer`, `story-mapper`).

**skills/**: runnable skill modules.
- Project-specific skills (higher priority)
- General fallback skills

## Skill Layout

```
skills/{name}/
├── SKILL.md
├── evals/
└── agents/
```

## Usage

**Users**: AI selects skills automatically.
**Developers**: add or update `skills/{name}/SKILL.md`.

## References

- [Skill Creator](../skill-creator/SKILL.md)
- [Software Methodology Toolkit](../skills/software-methodology-toolkit/SKILL.md)
- [Life Reset](../skills/life-reset/SKILL.md)
