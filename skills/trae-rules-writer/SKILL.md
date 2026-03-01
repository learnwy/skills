---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when user wants to: create a project rule, set up code style guidelines, enforce naming conventions, make AI always do X, customize AI behavior for specific files, configure AI coding standards, or establish project-specific AI guidelines. Triggers on: 'create rule', '创建 rule', 'project rule', '.trae/rules/', 'AGENTS.md', 'CLAUDE.md', 'set up coding rules', 'make AI always use PascalCase', 'enforce naming convention', 'configure AI behavior'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.3"
---

# Trae Rules Writer

Create Trae IDE rules by analyzing project conventions first, then designing rules that match existing patterns.

## Workflow

```
0. SIZE CHECK → Is project too large? If yes, ask user to specify folders
1. ANALYZE    → Scan project structure (spawn Project Scanner Agent for deep analysis)
2. IDENTIFY   → Extract conventions (spawn Convention Detector Agent)
3. DESIGN     → Choose rule type and application mode based on needs
4. CREATE     → Write rules in Trae's official format
5. VALIDATE   → Ensure no conflicts (spawn Quality Validator Agent)
6. VERIFY     → Check syntax and test rule activation
7. REFRESH    → Start new chat for rules to take effect
```

## Agent-Enhanced Analysis

For deeper project analysis, spawn specialized agents:

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large/unfamiliar projects |
| IDENTIFY | [Convention Detector](agents/convention-detector.md) | Extract naming/style conventions |
| VALIDATE | [Quality Validator](agents/quality-validator.md) | Comprehensive rule validation |

**How to use:**
```
Spawn agent with Task tool:
- Agent: agents/convention-detector.md
- Input: {project_path: "/path/to/project", file_types: ["*.ts", "*.tsx"], output_path: "/tmp/conventions"}
- Wait for structured JSON output with suggested_rules
- Use suggested rules as starting point
```

## Large Project Handling

**Before analyzing, check project size.** If the project is too large (many folders, monorepo, >50 top-level items):

1. **STOP** - Do not attempt to analyze the entire project
2. **INFORM** - Tell user the project is too large for comprehensive analysis
3. **ASK** - Use `AskUserQuestion` to request target folders:
   - "Which folders should I focus on for creating rules?"
   - "Please provide 1-3 specific directories (e.g., `src/components/`, `lib/utils/`)"
4. **SCOPE** - Only create rules for the user-specified folders

**Example response for large projects:**
```
This project appears to be large (I see 20+ top-level directories).
To create focused, useful rules, please specify which folders I should analyze:
- Which directories contain your main application code?
- Any specific areas where you want AI guidance?

Example: "Focus on src/features/ and src/shared/"
```

**Indicators of "too large":**
- Monorepo with multiple packages
- >50 files/folders at root level
- Multiple independent modules or services
- No clear single entry point

## User Interaction Guidelines

**When to ask user for clarification:**
- Project scope is unclear (large project, monorepo)
- Multiple valid rule types are possible
- User's intent is ambiguous (always apply vs file-specific)
- Choosing between user rules vs project rules

**Use `AskUserQuestion` tool with options like:**
```
Question: "What application mode should this rule use?"
Options:
- "Always Apply" - Active for all AI chats in project
- "File-Specific" - Only for certain file types (e.g., *.ts)
- "Apply Intelligently" - AI determines when relevant
- "Manual Only" - Only when explicitly invoked with #RuleName
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
- `globs`: File patterns for specific files mode (e.g., `*.ts,*.tsx`) - comma-separated, no quotes
- `description`: Use cases for intelligent mode (AI determines relevance)

**Note on frontmatter format:** Use YAML frontmatter with exactly these keys. All properties are optional - omitting `alwaysApply` defaults to `false` (manual invocation only).

**Important:** `globs` format is comma-separated without quotes: `globs: *.ts,*.tsx` (NOT `globs: "*.ts,*.tsx"`)

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

## Validation Checklist

After creating rules, verify:

- [ ] **Frontmatter Syntax**: Valid YAML with correct keys
- [ ] **Globs Format**: Comma-separated, no quotes (`globs: *.ts,*.tsx`)
- [ ] **No Conflicts**: Rules don't contradict each other
- [ ] **Proper Granularity**: Each rule is focused on one concern
- [ ] **Clear Guidance**: AI can follow the instructions unambiguously
- [ ] **Application Mode**: Correct mode for intended use case

## Testing Rules

After creating rules:
1. **Check syntax**: `ls .trae/rules/*.md`
2. **Verify frontmatter**: Ensure YAML is valid
3. **Start new chat**: Rules don't apply retroactively
4. **Test activation**: Use a prompt that should trigger the rule
5. **Verify behavior**: Check AI follows the rule

## Import Settings

- Include AGENTS.md in context when working with agents
- Include CLAUDE.md in context for Claude-specific guidance

## Quick Reference

| Rule Type              | When to Use                              | Example Frontmatter               |
| ---------------------- | --------------------------------------- | ------------------------------- |
| Global convention       | For all files in project                 | `alwaysApply: true`            |
| Language-specific       | Only for certain file types              | `globs: *.ts,*.tsx`           |
| Context-dependent       | Only in specific situations              | `description: "When refactoring"` |
| On-demand             | Only when explicitly invoked             | *(no frontmatter)*              |

## Debugging Tips

- **Rules not applying?** Check if new chat was started (rules don't apply retroactively)
- **Rule not triggering?** Verify frontmatter syntax and application mode
- **Conflicting rules?** Review rule priority: User Rules > Project Rules > File-specific > Intelligent > Manual
- **Globs not matching?** Ensure format is `globs: *.ts,*.tsx` (no quotes)

## Referencing Rules

- **Always Apply** rules display automatically in chat input box
- **Apply Manually** rules are invoked using `#RuleName` syntax in chat
- Example: "Using #security-guidelines, review this authentication code"

## References

- [Trae Rules Documentation](assets/trae-rules-docs.md) - Official documentation
- [Application Mode Examples](examples/application-modes.md) - Complete examples
- [Rule Template](assets/rule.md.template) - Starter template
- [Rule Types Reference](references/rule-types.md) - Selecting appropriate rule types

## Agents

- [Project Scanner](agents/project-scanner.md) - Deep project structure analysis
- [Convention Detector](agents/convention-detector.md) - Extract naming/style conventions
- [Quality Validator](agents/quality-validator.md) - Rule validation
