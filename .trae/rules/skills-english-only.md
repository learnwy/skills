---
description: Enforce English-only writing for all personally maintained skill documents
globs: skills/**/*.md
alwaysApply: false
---

# Skills English-Only Rule

Use English for all personally created and maintained skill documents.

## Scope

- `skills/**/SKILL.md`
- `skills/**/agents/*.md`
- `skills/**/assets/*.md`
- `skills/**/references/*.md`
- `skills/**/examples/*.md`

## Requirements

- Write headings, body text, examples, and notes in English.
- Keep frontmatter fields (`name`, `description`) in English.
- Do not mix Chinese and English in the same rule/skill doc unless quoting user input.

## Exceptions

- Keep code, API fields, file paths, and command flags unchanged.
- Preserve exact external identifiers and product names.
