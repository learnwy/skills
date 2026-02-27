---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when user wants to: create a project rule, set up code style guidelines, enforce naming conventions, make AI always do X, customize AI behavior for specific files, configure AI coding standards, or establish project-specific AI guidelines. Triggers on: 'create rule', '创建 rule', 'project rule', '.trae/rules/', 'AGENTS.md', 'CLAUDE.md', 'set up coding rules', 'make AI always use PascalCase', 'enforce naming convention', 'configure AI behavior'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.2"
---

# Trae Rules Writer

Create Trae IDE rules by analyzing project conventions first, then designing rules that match existing patterns.

## Workflow

```
1. ANALYZE  → Scan project structure, code style (ls .trae/rules/, cat AGENTS.md)
2. IDENTIFY → What conventions exist? What needs guidance?
3. DESIGN   → Choose rule type and application mode based on needs
4. CREATE   → Write rules in Trae's official format
5. VALIDATE → Ensure no conflicts, proper granularity
6. REFRESH  → Start new chat for rules to take effect
```

## Rule Creation Methods

### Method 1: Direct File Creation (Recommended)
Create `.trae/rules/<rule-name>.md` files directly in the project.

### Method 2: UI Creation (Alternative)
Use Trae IDE interface:
- **User Rules**: Settings > Rules & Skills > User Rules > "+ Create"
- **Project Rules**: Settings > Rules & Skills > Project Rules > "+ Create"

## Rule Format

```markdown
---
description: Use cases for intelligent mode
globs: *.ts,*.tsx
alwaysApply: false
---

# Rule Title

Concise guidance for AI.
```

**Frontmatter Properties:**
- `alwaysApply`: Set to `true` for rules effective in all project chats
- `globs`: File patterns for specific files mode (e.g., `*.ts,*.tsx`)
- `description`: Use cases for intelligent mode (AI determines relevance)

**Note on frontmatter format:** Use YAML frontmatter with exactly these keys. All properties are optional - omitting `alwaysApply` defaults to `false` (manual invocation only).

## Application Modes

| Mode                  | Frontmatter                      | Use Case                      |
| --------------------- | -------------------------------- | ----------------------------- |
| **Always Apply**      | `alwaysApply: true`              | Effective for all AI chats in project |
| **File-Specific**     | `globs: *.tsx,*.jsx`             | Only when matching files specified |
| **Apply Intelligently**| `description: "When doing X..."` | AI determines relevance in chat |
| **Manual Only**       | (no frontmatter)                 | Invoke with `#RuleName` only |

## Rule Types

| Type          | Location                  | Scope           |
| ------------- | ------------------------- | --------------- |
| **User Rules**| Settings > Rules & Skills > User Rules | Customized for AI based on personal habits, all projects |
| **Project Rules**| `.trae/rules/*.md`     | Must be followed for current project only |

## Compatible Files

| File              | Description                |
| ----------------- | -------------------------- |
| `AGENTS.md`       | Reusable across IDEs       |
| `CLAUDE.md`       | Compatible with Claude Code|
| `CLAUDE.local.md` | Local-only, gitignored     |

## Example

```
User: "Create rules for this TypeScript React project"

Analysis:
- Structure: src/components/, src/hooks/
- Naming: PascalCase components, camelCase functions
- No existing .trae/rules/

Creating: .trae/rules/

📄 code-style.md
---
alwaysApply: true
---
# Code Style
- PascalCase for components and types
- camelCase for functions and variables

📄 react-patterns.md
---
globs: *.tsx,*.jsx
---
# React Patterns
- Use functional components with hooks
- Custom hooks go in src/hooks/

📄 file-organization.md
---
description: "When organizing project files or creating new components"
---
# File Organization
- Components in src/components/
- Hooks in src/hooks/
- Use relative imports: import Hook from '../hooks/Hook'
```

## Import Settings

- Include AGENTS.md in context when working with agents
- Include CLAUDE.md in context for Claude-specific guidance

## References

- [Trae Rules Documentation](assets/trae-rules-docs.md) - Official documentation
- [Application Mode Examples](examples/application-modes.md) - Complete examples
- [Rule Template](assets/rule.md.template) - Starter template
- [Rule Types Reference](references/rule-types.md) - Selecting appropriate rule types

## Best Practices

- Control rule granularity to keep rules clear and focused
- Rules must not conflict or override each other
- Use relative paths for file specifications
- Start new chat after creating/modifying rules for changes to take effect

## Quick Reference

| Rule Type              | When to Use                              | Example Frontmatter               |
| ---------------------- | --------------------------------------- | ------------------------------- |
| Global convention       | For all files in project                 | `alwaysApply: true`            |
| Language-specific       | Only for certain file types              | `globs: *.ts,*.tsx`           |
| Context-dependent       | Only in specific situations              | `description: "When refactoring"` |
| On-demand             | Only when explicitly invoked             | *(no frontmatter)*              |

## Testing Rules

After creating rules:
1. Check syntax: `ls .trae/rules/*.md`
2. Verify frontmatter format
3. Test with sample AI queries
4. Start new chat to apply changes

## Debugging Tips

- Rules not applying? Check if new chat was started (rules don't apply retroactively)
- Rule not triggering? Verify frontmatter syntax and application mode
- Conflicting rules? Review rule priority: User Rules > Project Rules > File-specific > Intelligent > Manual

## Referencing Rules

- **Always Apply** rules display automatically in chat input box
- **Apply Manually** rules are invoked using `#RuleName` syntax in chat
- Example: "Using #security-guidelines, review this authentication code"
