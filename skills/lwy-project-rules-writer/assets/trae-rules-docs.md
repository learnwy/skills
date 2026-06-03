# Trae IDE Rules Documentation

> Source: https://docs.trae.ai/ide/rules

## Overview

Rules govern AI behaviour in the Trae IDE, making its output better match personal preferences and project requirements.

## Use cases

1. **Efficiency**: turn personal experience into reusable rules
2. **Standardisation**: structure team guidelines into consistent rules
3. **Quality assurance**: ensure the AI understands project constraints

## Rule types

| Type | Location | Scope |
| ---- | -------- | ----- |
| User rules | Settings > Rules & Skills | All projects |
| Project rules | `.trae/rules/*.md` | Current project |

## Apply modes

| Mode | Frontmatter setting | Behaviour |
| ---- | ------------------- | --------- |
| Always-apply | `alwaysApply: true` | Active in all AI conversations in the project |
| File-specific | `globs: *.ts,*.tsx` | Activates when a matching file is involved |
| Smart-apply | `description: "When doing X..."` | The AI judges relevance from context |
| Manual-apply | `alwaysApply: false` (no globs) | Active only when referenced via #RuleName |

## Rule-file format

```markdown
---
description: When this rule applies (used by smart mode)
globs: *.ts,*.tsx
alwaysApply: false
---

# Rule Title

Your rule content goes here.
```

### Frontmatter properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| description | string | Explains when to apply (used by smart mode) |
| globs | string | Comma-separated file patterns (no quotes) |
| alwaysApply | boolean | true = always active, false = conditionally active |

### Globs format

- **Correct**: `globs: *.ts,*.tsx` (comma-separated, no quotes)
- **Wrong**: `globs: "*.ts,*.tsx"` (do not use quotes)

Examples:
- `globs: *.ts,*.tsx` - TypeScript files
- `globs: *.test.ts,*.spec.ts,__tests__/**` - test files
- `globs: src/**/*.jsx,src/**/*.tsx` - JSX/TSX files under the src directory

## Creating rules

### User rules
1. Open Settings (the gear icon)
2. Select "Rules & Skills" in the left-hand navigation
3. In the "User Rules" section, click "+ Create"
4. Enter the rule content and save

### Project rules
1. Open Settings
2. Select "Rules & Skills"
3. In the "Project Rules" section, click "+ Create"
4. Enter the rule name and confirm
5. The system creates `.trae/rules/<name>.md`
6. Edit the rule file in the editor

## Referencing rules

- **Always-apply**: shown automatically in the chat input box
- **File-specific**: activates automatically when a matching file is mentioned
- **Smart**: the AI decides based on the conversation context
- **Manual**: reference via `#RuleName` in chat

## Compatible files

| File | Description |
| ---- | ----------- |
| `AGENTS.md` | Behaviour guidance, reusable across IDEs |
| `CLAUDE.md` | Compatible with Claude Code |
| `CLAUDE.local.md` | Local-only rules, usually gitignored |

## Best practices

1. **Control granularity**: keep each rule clear and focused
2. **Avoid conflicts**: rules must not override one another
3. **Use relative paths**: reference files relative to the project root
4. **Be specific**: provide clear, actionable guidance
5. **Include examples**: show correct and incorrect patterns where helpful
6. **Keep it concise**: aim for under 1000 characters (reduces AI attention loss)

## Import settings

In Settings > Rules & Skills:
- "Include AGENTS.md in context" - enable to read AGENTS.md
- "Include CLAUDE.md in context" - enable for Claude compatibility
