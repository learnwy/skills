---
name: trae-rules-writer
description: Create and manage Trae IDE rules for AI behavior guidance. Use this skill whenever the user mentions rules, project rules, user rules, code style guidelines, AI constraints, .trae/rules/, or wants to customize how AI behaves in their project. Also use when you see AGENTS.md, CLAUDE.md, or any conversation about standardizing AI behavior across a codebase.
---

# Trae Rules Writer

Create well-structured Trae IDE rules by analyzing the target project first, then designing rules that match the project's actual conventions.

## When to Use

**Invoke when:**
- User wants to create rules for a project
- User mentions: "create rule", "project rule", "code style", "AI guideline"
- User wants to customize AI behavior for specific files or contexts
- User asks about `.trae/rules/`, AGENTS.md, or CLAUDE.md

**Do NOT invoke when:**
- User wants to create a skill (use trae-skill-writer instead)
- Simple Q&A about rules without creation intent

## Why Analyze First?

Rules should reflect what's already working in the project, not impose external standards. A rule that contradicts existing patterns creates friction. By scanning the codebase first, you capture the implicit conventions the team already follows and make them explicit for AI.

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ANALYZE → Scan project structure, code style, patterns   │
│ 2. IDENTIFY → What conventions exist? What needs guidance?  │
│ 3. DESIGN  → Choose rule type and application mode          │
│ 4. CREATE  → Write rules in Trae's official format          │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Analyze Target Project

Scan these aspects before creating any rules:

| Aspect           | What to Look For                              | How                        |
| ---------------- | --------------------------------------------- | -------------------------- |
| Structure        | Directory layout, module boundaries           | `ls`, `tree`               |
| Languages        | Primary languages, frameworks                 | File extensions, imports   |
| Naming           | Variables, functions, files, components       | Read sample files          |
| Imports          | Absolute vs relative, aliases                 | Check import statements    |
| Existing Rules   | `.trae/rules/`, AGENTS.md, CLAUDE.md          | `ls .trae/rules/`          |

Quick scan commands:
```bash
# Project structure
ls -la <project>

# Languages used
find <project> -type f -name "*.ts" -o -name "*.py" | head -10

# Existing rules
cat <project>/.trae/rules/*.md 2>/dev/null
cat <project>/AGENTS.md 2>/dev/null
```

## Step 2: Identify Rule Needs

Based on analysis, determine which rules would help:

| Category     | When to Create                                | Example                        |
| ------------ | --------------------------------------------- | ------------------------------ |
| Code Style   | Consistent naming, formatting patterns exist  | camelCase, PascalCase rules    |
| Architecture | Clear layer/module boundaries exist           | "Don't import from X in Y"     |
| Framework    | Specific patterns used (React, Django, etc.)  | "Use hooks, not class comps"   |
| Security     | Sensitive data handling needed                | "Never log secrets"            |
| Domain       | Business terminology, workflow rules          | "Orders must have customer_id" |

## Step 3: Choose Rule Type & Mode

### Rule Types

| Type          | Location                  | Scope           |
| ------------- | ------------------------- | --------------- |
| User Rules    | Settings > Rules & Skills | All projects    |
| Project Rules | `.trae/rules/*.md`        | Current project |

### Application Modes

| Mode                | frontmatter                             | When to Use                          |
| ------------------- | --------------------------------------- | ------------------------------------ |
| Always Apply        | `alwaysApply: true`                     | Global conventions (naming, etc.)    |
| File-Specific       | `globs: "*.tsx,*.jsx"`                  | Language/framework-specific rules    |
| Apply Intelligently | `description: "When doing X..."`        | Context-dependent guidance           |
| Manual Only         | (no frontmatter)                        | Rarely used, invoke with `#RuleName` |

## Step 4: Create Rules

### Project Rule Format

```markdown
---
description: When to apply this rule (for intelligent mode)
globs: "*.ts,*.tsx"
alwaysApply: false
---

# Rule Title

Concise guidance for AI.
```

### Output Location

```
<project>/
└── .trae/
    └── rules/
        ├── code-style.md       # alwaysApply: true
        ├── react-patterns.md   # globs: "*.tsx"
        └── api-design.md       # description: "When creating APIs"
```

## Example: Complete Flow

```
User: "Create rules for this TypeScript React project"

1. Analyzing project...
   - Structure: src/components/, src/hooks/, src/services/
   - Languages: TypeScript, TSX
   - Naming: PascalCase components, camelCase functions
   - Imports: Using @/ path alias
   - No existing .trae/rules/

2. Identified conventions:
   - Functional components with hooks (no class components)
   - Custom hooks in hooks/ directory
   - Services return typed responses

3. Creating rules:

📁 .trae/rules/

📄 code-style.md
---
alwaysApply: true
---
# Code Style
- PascalCase for components and types
- camelCase for functions and variables
- Prefer const over let

📄 react-patterns.md
---
globs: "*.tsx,*.jsx"
alwaysApply: false
---
# React Patterns
- Use functional components with hooks
- Custom hooks go in src/hooks/
- No inline styles - use CSS modules

📄 api-design.md
---
description: When creating API endpoints or service functions
alwaysApply: false
---
# API Design
- Services return { data, error } tuples
- Use TypeScript generics for response types
```

## Compatible Files

Trae also recognizes these files at project root:

| File              | Description                    |
| ----------------- | ------------------------------ |
| `AGENTS.md`       | Reusable across IDEs           |
| `CLAUDE.md`       | Compatible with Claude Code    |
| `CLAUDE.local.md` | Local-only, gitignored         |

Enable via Settings > Rules > Import Settings.

## Best Practices

**DO:**
- Analyze before creating - rules should match existing patterns
- One concern per rule file - easier to toggle and maintain
- Use descriptive filenames - `react-testing.md` not `rule1.md`
- Test after creating - start new chat to verify rules load

**DON'T:**
- Impose external standards the project doesn't follow
- Create overly restrictive rules that fight the AI
- Duplicate what AI already knows (basic syntax, etc.)

## References

For detailed examples, read:
- [Application Mode Examples](examples/application-modes.md) - Complete examples of each mode
- [Rule Template](assets/rule.md.template) - Starter template
