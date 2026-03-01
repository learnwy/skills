---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when user wants to: create a project rule, set up code style guidelines, enforce naming conventions, make AI always do X, customize AI behavior for specific files, configure AI coding standards, or establish project-specific AI guidelines. Triggers on: 'create rule', '创建 rule', 'project rule', '.trae/rules/', 'AGENTS.md', 'CLAUDE.md', 'set up coding rules', 'make AI always use PascalCase', 'enforce naming convention', 'configure AI behavior'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.4"
---

# Trae Rules Writer

Analyze project conventions with code-first approach, then create rules that match existing patterns.

## Workflow

```
0. SIZE CHECK   → Is project too large? Ask user to specify folders
1. ANALYZE      → Scan project structure (spawn Project Scanner Agent)
2. READ CODE    → Deep-dive into domain-specific code (2-5 key files)
3. IDENTIFY     → Extract real conventions from code (spawn Convention Detector)
4. DESIGN       → Choose rule type and application mode
5. CREATE       → Write rules in Trae's official format
6. VALIDATE     → Ensure no conflicts (spawn Quality Validator)
7. REFRESH      → Start new chat for rules to take effect
```

## Naming Convention (CRITICAL)

**Every rule MUST use a descriptive, focused name.**

| Good ✅ | Bad ❌ |
|---------|--------|
| `code-style.md` | `rules.md` |
| `react-patterns.md` | `all-patterns.md` |
| `import-order.md` | `style.md` (too vague) |

**For project-specific rules, consider prefix:**
- `app-naming.md` for your-app project
- `fe-components.md` for frontend rules

## Language Consistency (CRITICAL)

**All content within a rule MUST be in ONE language.**

- Title, description, guidance - ALL same language
- Prefer English for code projects
- Do NOT mix Chinese and English in the same rule file

```yaml
# Good - all English
# Code Style
- Use PascalCase for components

# Bad - mixed languages
# Code Style 代码规范
- Use PascalCase 组件命名
```

## Code-First Approach (CRITICAL)

**Before writing any rule, you MUST read actual codebase files.**

### Study Workflow (for each rule)

```
1. Identify key files for this domain
2. Read 2-5 source files deeply (100-200 lines each)
3. Extract actual patterns, naming conventions from code
4. Create rules that match existing patterns (not impose new ones)
```

### Rules Must Match Reality

- Every convention should come from actual codebase patterns
- Include file paths as examples when referencing specific patterns
- Don't create rules that contradict existing code style

## Batch Rule Creation Workflow

When creating multiple rules for a project:

### Phase 1 - Project Overview
- Understand overall project conventions
- Identify areas needing AI guidance
- Plan rule breakdown (avoid overlap)

### Phase 2 - Sequential Deep-Dive
- Process ONE rule at a time
- For each rule: read code → extract conventions → create rule
- Ensure rules don't conflict

### Phase 3 - Cross-Reference Pass
- Check for rule conflicts
- Verify globs don't overlap excessively
- Test rule activation

## Agent-Enhanced Analysis

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large/unfamiliar projects |
| IDENTIFY | [Convention Detector](agents/convention-detector.md) | Extract naming/style conventions |
| VALIDATE | [Quality Validator](agents/quality-validator.md) | Check for conflicts |

## Large Project Handling

If project is too large (>50 top-level items, monorepo):

1. **STOP** - Don't analyze entire project
2. **ASK** - Use `AskUserQuestion` for target folders
3. **SCOPE** - Only analyze user-specified folders

## Path Conventions

**NEVER use absolute paths.** Use relative paths or placeholders:

| Bad ❌ | Good ✅ |
|--------|---------|
| `/Users/john/project/src/` | `src/` or `{project_root}/src/` |
| `/home/dev/repo/.trae/` | `.trae/` |

## Rule Format

```markdown
---
description: Brief explanation of what this rule does
globs: *.ts,*.tsx
alwaysApply: false
---

# Rule Title

Concise guidance for AI.
```

## Description Field (RECOMMENDED)

**Always include `description`**, even for `alwaysApply: true` rules.

| Without description ❌ | With description ✅ |
|------------------------|---------------------|
| `alwaysApply: true` | `description: Project architecture guide` |
| (Trae doesn't know what it's for) | `alwaysApply: true` |

**Why:**
- Helps Trae understand rule purpose
- Shows in rule list with context
- Makes rules easier to manage/review
- Useful for team members reading `.trae/rules/`

```yaml
# Good - always include description
---
description: Code style conventions for TypeScript React project
alwaysApply: true
---

# Bad - missing context
---
alwaysApply: true
---
```

## Globs Format (CRITICAL)

**`globs` MUST be comma-separated WITHOUT quotes.** Trae does NOT recognize standard YAML arrays.

| Correct ✅ | Wrong ❌ |
|------------|----------|
| `globs: *.ts,*.tsx` | `globs: "*.ts,*.tsx"` |
| `globs: *.test.ts,*.spec.ts` | `globs: ["*.test.ts", "*.spec.ts"]` |
| `globs: src/**/*.jsx` | `globs: 'src/**/*.jsx'` |

**Never use quotes around globs value.** This is a common mistake that breaks rule activation.

## Application Modes

| Mode | Frontmatter | Use Case |
|------|-------------|----------|
| **Always Apply** | `alwaysApply: true` | All AI chats in project |
| **File-Specific** | `globs: *.tsx,*.jsx` | Only for matching files |
| **Apply Intelligently** | `description: "When doing X..."` | AI determines relevance |
| **Manual Only** | (no frontmatter) | Invoke with `#RuleName` |

## Quality Checklist

Before creating rules, verify:

- [ ] **Description**: Always included (even for alwaysApply rules)
- [ ] **Naming**: Descriptive, focused, optionally prefixed
- [ ] **Language**: 100% consistent language
- [ ] **Code Study**: Based on actual codebase conventions
- [ ] **Globs Format**: NO quotes - `globs: *.ts,*.tsx` NOT `globs: "*.ts,*.tsx"`
- [ ] **No Conflicts**: Rules don't contradict each other
- [ ] **Single Concern**: Each rule is focused on one area
- [ ] **Paths**: Uses relative paths only

## Example

```
User: "Create rules for this TypeScript React project"

READ CODE:
- src/components/Button.tsx (150 lines)
- src/hooks/useAuth.ts (100 lines)
- Found: PascalCase components, camelCase hooks, functional components

DESIGN:
- Rule 1: code-style (naming conventions)
- Rule 2: react-patterns (component patterns)
- Rule 3: file-organization (structure)

CREATE: .trae/rules/

📄 code-style.md
---
description: Naming conventions for TypeScript React codebase
alwaysApply: true
---
# Code Style
- PascalCase for components and types
- camelCase for functions, hooks, and variables
- Use const for component definitions

📄 react-patterns.md
---
description: React component and hook patterns
globs: *.tsx,*.jsx
---
# React Patterns
- Use functional components with hooks
- Custom hooks go in src/hooks/
- Prefer named exports for components

📄 file-organization.md
---
description: When organizing project files or creating new components
---
# File Organization
- Components in src/components/
- Hooks in src/hooks/
- Use relative imports
```

## References

- [Trae Rules Documentation](assets/trae-rules-docs.md) - Official docs
- [Application Mode Examples](examples/application-modes.md) - Complete examples
- [Rule Template](assets/rule.md.template) - Starter template

## Agents

- [Project Scanner](agents/project-scanner.md)
- [Convention Detector](agents/convention-detector.md)
- [Quality Validator](agents/quality-validator.md)
