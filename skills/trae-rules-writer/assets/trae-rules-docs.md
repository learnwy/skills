# Trae IDE Rules Documentation

> Source: https://docs.trae.ai/ide/rules

## Overview

Rules regulate AI behavior within Trae IDE, making output better aligned with personal preferences and project requirements.

## Use Cases

1. **Efficiency Improvement**: Transform personal experience into reusable rules
2. **Standardization**: Structure team guidelines into consistent rules
3. **Quality Assurance**: Ensure AI understands project constraints

## Types of Rules

| Type          | Location                  | Scope           |
| ------------- | ------------------------- | --------------- |
| User Rules    | Settings > Rules & Skills | All projects    |
| Project Rules | `.trae/rules/*.md`        | Current project |

## Application Modes

| Mode                   | Frontmatter Setting              | Behavior                                |
| ---------------------- | -------------------------------- | --------------------------------------- |
| Always Apply           | `alwaysApply: true`              | Effective for all AI chats in project   |
| Apply to Specific Files| `globs: *.ts,*.tsx`              | Active when matching files are involved |
| Apply Intelligently    | `description: "When doing X..."` | AI determines relevance based on context|
| Apply Manually         | `alwaysApply: false` (no globs)  | Only when referenced with #RuleName     |

## Rule File Format

```markdown
---
description: When to apply this rule (for intelligent mode)
globs: *.ts,*.tsx
alwaysApply: false
---

# Rule Title

Your rule content here.
```

### Frontmatter Properties

| Property     | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| description  | string  | Explains when to apply (for intelligent mode)    |
| globs        | string  | Comma-separated file patterns (no quotes)        |
| alwaysApply  | boolean | true = always active, false = conditional        |

### Globs Format

- **Correct**: `globs: *.ts,*.tsx` (comma-separated, no quotes)
- **Incorrect**: `globs: "*.ts,*.tsx"` (do not use quotes)

Examples:
- `globs: *.ts,*.tsx` - TypeScript files
- `globs: *.test.ts,*.spec.ts,__tests__/**` - Test files
- `globs: src/**/*.jsx,src/**/*.tsx` - JSX/TSX in src folder

## Creating Rules

### User Rules
1. Open Settings (gear icon)
2. Select "Rules & Skills" in left navigation
3. In "User Rules" section, click "+ Create"
4. Enter rule content and save

### Project Rules
1. Open Settings
2. Select "Rules & Skills"
3. In "Project Rules" section, click "+ Create"
4. Enter rule name and confirm
5. System creates `.trae/rules/<name>.md`
6. Edit the rule file in the editor

## Referencing Rules

- **Always Apply**: Automatically displayed in chat input box
- **File-Specific**: Auto-activated when matching files are mentioned
- **Intelligent**: AI decides based on conversation context
- **Manual**: Reference using `#RuleName` in chat

## Compatible Files

| File              | Description                           |
| ----------------- | ------------------------------------- |
| `AGENTS.md`       | Behavioral guidance, reusable across IDEs |
| `CLAUDE.md`       | Compatible with Claude Code           |
| `CLAUDE.local.md` | Local-only rules, typically gitignored |

## Best Practices

1. **Control Granularity**: Keep each rule clear and focused
2. **Avoid Conflicts**: Rules must not override each other
3. **Use Relative Paths**: Reference files relative to project root
4. **Be Specific**: Provide clear, actionable guidance
5. **Include Examples**: Show good and bad patterns when helpful

## Import Settings

In Settings > Rules & Skills:
- "Include AGENTS.md in the context" - Enable to read AGENTS.md
- "Include CLAUDE.md in context" - Enable for Claude compatibility
