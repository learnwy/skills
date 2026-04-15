# Rule Schema

Rules are stored as Markdown files with YAML frontmatter.

## Required shape

```md
---
id: typescript-import-hygiene
title: TypeScript Import Hygiene
summary: Keep imports explicit, stable, and easy for tooling to rewrite.
groups:
  - frontend
tags:
  - typescript
  - imports
targets:
  - agents-md
  - trae-rule
complexity: 2
update_frequency: occasional
maintenance_cost: low
priority: 70
last_reviewed: 2026-04-15
---

# Intent

Describe when the rule should apply.

# Rule

Put the actual Markdown rule content here.
```

## Frontmatter fields

- `id`: stable rule identifier, usually slugified from the title
- `title`: human-readable rule name
- `summary`: one-line description used in scoring and previews
- `groups`: logical buckets such as `frontend`, `review`, `ios`
- `tags`: fine-grained labels used for filtering and composition
- `targets`: intended export targets such as `agents-md`, `trae-rule`, `generic`
- `complexity`: numeric score from `1` to `5`
- `update_frequency`: `rare`, `occasional`, `monthly`, `weekly`, or `frequent`
- `maintenance_cost`: `low`, `medium`, `high`, or `very-high`
- `priority`: optional integer weighting used during assembly
- `last_reviewed`: ISO date string

## Compatibility Notes

- The body stays plain Markdown so it can be reused in AGENTS-style documents and Trae-compatible rule files.
- Frontmatter is metadata for management and assembly. Exported rule sets keep the Markdown body readable even if a target tool ignores metadata.
- If a target expects a single consolidated document, use the `rule-set` artifact.
- If a target expects one focused rule, use the `single-rule` artifact.
- If a downstream tool needs structured metadata, use the `config-file` artifact.
