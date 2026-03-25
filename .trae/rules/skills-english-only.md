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
- `agents/**/*.md`

## Requirements

- Write headings, body text, examples, and notes in English.
- Keep frontmatter fields (`name`, `description`) in English.
- Do not mix Chinese and English in the same document unless it falls under an exception below.

## Exceptions

- Code, API fields, file paths, and command flags remain unchanged.
- Preserve exact external identifiers and product names.
- **english-learner skill**: Response format templates may use Chinese labels (e.g. `词义`, `释义`, `同义词`) since the skill teaches English to Chinese speakers. The SKILL.md structure and non-template sections must still be in English.
- **Eval files** (`evals/*.json`): Prompts and expected outputs must be in English.
