---
name: trae-rules-writer
description: "Create and manage Trae IDE rules (user rules and project rules). Use when creating new rules for AI behavior, code style guidelines, project conventions, or editing existing .trae/rules/*.md files. Triggers on 'create rule', 'write rule', 'trae rule', 'project rule', 'user rule', 'AI behavior rule'."
---

# Trae Rules Writer

Create well-structured Trae IDE rules by analyzing the target project first.

## When to Use

**Invoke when:**

- User wants to create a new project rule
- User wants to define AI behavior guidelines for a project
- User mentions: `create rule`, `write rule`, `project rule`, `code style rule`
- User wants to edit `.trae/rules/*.md` files

**Do NOT invoke when:**

- User wants to create a skill (use trae-skill-writer)
- Simple Q&A about rules without creation intent

## ⚠️ CRITICAL: Workflow

**MUST analyze target project BEFORE creating rules.**

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. ANALYZE target project code first                             │
│ 2. IDENTIFY patterns: arch, code style, lang, domain, layers    │
│ 3. DESIGN rules based on project's actual conventions           │
│ 4. CREATE rules following Trae's official format                │
└──────────────────────────────────────────────────────────────────┘
```

## Step 1: Analyze Target Project

**MUST scan project to understand:**

| Aspect         | What to Analyze                                      | Tools        |
| -------------- | ---------------------------------------------------- | ------------ |
| Architecture   | Directory structure, module organization, layers     | LS, Glob     |
| Code Style     | Naming conventions, formatting, import patterns      | Read, Grep   |
| Language       | Primary languages, frameworks, libraries             | Glob, Read   |
| Domain         | Business logic patterns, terminology                 | Read         |
| Existing Rules | Current `.trae/rules/`, AGENTS.md, CLAUDE.md         | Glob, Read   |

**Example analysis commands:**

```bash
# Check project structure
ls -la <project_root>

# Find existing rules
ls -la <project_root>/.trae/rules/ 2>/dev/null

# Identify primary languages
find <project_root> -name "*.ts" -o -name "*.tsx" | head -20

# Check for existing conventions
cat <project_root>/AGENTS.md 2>/dev/null
cat <project_root>/.editorconfig 2>/dev/null
```

## Step 2: Identify Rule Categories

Based on analysis, determine which rules to create:

| Category       | When to Create                        | Example                         |
| -------------- | ------------------------------------- | ------------------------------- |
| Code Style     | Project has consistent patterns       | Naming, formatting, imports     |
| Architecture   | Clear layer boundaries exist          | Layer dependencies, module rules|
| Framework      | Specific framework conventions        | React patterns, API styles      |
| Security       | Sensitive data handling needed        | Auth, data validation           |
| Testing        | Test files have patterns              | Test structure, coverage        |
| Domain         | Business-specific terminology         | Entity naming, workflow rules   |

## Step 3: Create Rules Following Trae Format

### Rule Types

| Type         | Scope        | Location               | Loading     |
| ------------ | ------------ | ---------------------- | ----------- |
| User Rules   | All projects | Settings > Rules & Skills | Full       |
| Project Rules| Current project | `.trae/rules/`       | Conditional |

### Project Rule Structure (Trae Official Format)

```markdown
---
description: When to use this rule (for intelligent application)
globs: "*.ts,src/**/*.js"  # File patterns (for file-specific)
alwaysApply: false         # true = always, false = conditional
---

# Rule Title

Rule content in Markdown
```

### Application Modes

| Mode                    | alwaysApply | Additional Config                         |
| ----------------------- | ----------- | ----------------------------------------- |
| Always Apply            | `true`      | None                                      |
| Apply to Specific Files | `false`     | `globs: "*.ts,*.tsx"`                     |
| Apply Intelligently     | `false`     | `description: "Use case description"`     |
| Apply Manually          | `false`     | Reference via `#RuleName` in chat         |

## Step 4: Output Rules

Create rules at `.trae/rules/<rule-name>.md`:

```
<project_root>/
└── .trae/
    └── rules/
        ├── code-style.md       # Always Apply
        ├── typescript.md       # Apply to *.ts,*.tsx
        ├── testing.md          # Apply to *.test.ts
        └── architecture.md     # Apply Intelligently
```

## Example: Complete Workflow

```
User: "Create rules for this React TypeScript project"

AI:
1. Analyzing project structure...
   - Found: src/, components/, hooks/, services/
   - Languages: TypeScript, TSX
   - Framework: React with hooks
   - Testing: Jest with @testing-library

2. Identified patterns:
   - Naming: camelCase for functions, PascalCase for components
   - Imports: Absolute paths with @/ alias
   - Components: Functional with hooks pattern

3. Creating rules:

📄 .trae/rules/code-style.md
---
alwaysApply: true
---
# Code Style
- Use camelCase for variables/functions
- Use PascalCase for components/types
- Prefer const over let
...

📄 .trae/rules/react-patterns.md
---
globs: "*.tsx,*.jsx"
alwaysApply: false
---
# React Patterns
- Use functional components with hooks
- Extract reusable logic to custom hooks
...
```

## Compatible Files

Trae also supports:

| File              | Location     | Description                    |
| ----------------- | ------------ | ------------------------------ |
| `AGENTS.md`       | Project root | Reusable across IDEs           |
| `CLAUDE.md`       | Project root | Compatible with Claude Code    |
| `CLAUDE.local.md` | Project root | Local-only config              |

Enable via Settings > Rules > Import Settings.

## References

- [Rule Types Guide](references/rule-types.md) - Detailed type selection
- [Application Mode Examples](examples/application-modes.md) - Mode usage examples
- [Rule Template](assets/rule.md.template) - Starter template

## Best Practices

- **Analyze first**: Always scan project before creating rules
- **Match project style**: Rules should reflect existing conventions, not impose new ones
- **Keep focused**: One concern per rule file
- **Test in new chat**: Start new chat after rule changes to verify
