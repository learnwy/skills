---
description: Guidelines for Trae IDE tool writer skills (trae-rules-writer)
globs: skills/trae-rules-writer/**/*.md
alwaysApply: false
---

# Trae Writer Skill Development

## Scope

This rule applies to `trae-rules-writer` and any future `trae-*-writer` skills.

## Current Structure

```
skills/trae-rules-writer/
├── agents/
│   ├── convention-detector.md
│   ├── project-scanner.md
│   └── quality-validator.md
├── assets/
│   ├── rule.md.template
│   └── trae-rules-docs.md
├── evals/
├── examples/
├── references/
├── scripts/
│   └── init_rule.cjs
└── SKILL.md
```

## Agents

| Agent | Purpose |
|-------|---------|
| project-scanner | Analyze project structure and conventions |
| convention-detector | Extract naming, style, and pattern conventions |
| quality-validator | Validate generated output quality |

## Critical Rules

**Paths:** NO absolute paths. Use `src/` or `{project_root}/`.

**Globs:** NO quotes in frontmatter globs. `globs: *.ts,*.tsx` NOT `globs: "*.ts"`.

**Frontmatter:** Every rule must have `description` and `alwaysApply` or `globs`.

## Quality Checklist

- [ ] Frontmatter has `description`
- [ ] Frontmatter has `alwaysApply: true` or `globs:` (not both active)
- [ ] Description includes trigger conditions
- [ ] No absolute paths in content
- [ ] Globs use no quotes
- [ ] Content in English only
