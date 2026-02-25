---
name: trae-rules-writer
description: Create and manage Trae IDE rules (user rules and project rules). Use when creating new rules for AI behavior, code style guidelines, project conventions, or editing existing .trae/rules/*.md files. Triggers on 'create rule', 'write rule', 'trae rule', 'project rule', 'user rule', 'AI behavior rule'.
---

# Trae Rules Writer

Create well-structured rules for Trae IDE to regulate AI behavior.

## Rule Types

### User Rules
- Take effect in ALL projects globally
- Set via Settings > Rules & Skills > User Rules
- Use cases: language style, OS preference, content depth, interaction mode

### Project Rules  
- Take effect ONLY in current project
- Located in `.trae/rules/` directory as Markdown files
- Use cases: code style, naming conventions, framework preferences, API restrictions

## Project Rule Structure

```markdown
---
description: When to use this rule (for intelligent application)
globs: "*.ts,src/**/*.js"  # File patterns (for file-specific application)
alwaysApply: false         # true = always apply, false = conditional
---

# Rule Title

## Rule content in Markdown
- Clear, actionable guidelines
- Specific constraints and requirements
```

## Application Modes

| Mode | alwaysApply | Additional Config |
|------|-------------|-------------------|
| Always Apply | `true` | None |
| Apply to Specific Files | `false` | `globs: "*.ts,*.tsx"` |
| Apply Intelligently | `false` | `description: "Use case description"` |
| Apply Manually | `false` | Reference via `#RuleName` in chat |

## Workflow

1. Determine rule type (user vs project) and scope
2. Choose application mode based on use case
3. Create rule file at `.trae/rules/<rule-name>.md`
4. Set frontmatter properties correctly
5. Write clear, focused rule content
6. Test in new chat session

## Best Practices

- Keep each rule focused on single concern
- Avoid conflicting rules
- Use relative paths from project root
- Start new chat after rule changes
- For refactoring legacy code, explicitly inform AI it's a "refactoring" task

## Example: Code Style Rule

```markdown
---
description: Apply when writing or reviewing TypeScript code
globs: "*.ts,*.tsx"
alwaysApply: false
---

# TypeScript Code Style

## Naming
- Use PascalCase for types/interfaces
- Use camelCase for variables/functions
- Prefix interfaces with 'I' only when necessary

## Organization
- Group imports: external, internal, relative
- One component per file
- Export types separately from implementations

## Error Handling
- Always handle Promise rejections
- Use typed error responses
- Log errors with context
```

## Compatible Files

Trae also supports:
- `AGENTS.md` - Project root, reusable across IDEs
- `CLAUDE.md` / `CLAUDE.local.md` - Compatible with Claude Code projects

Enable via Settings > Rules > Import Settings.
