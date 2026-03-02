---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when user wants to: create a project rule, set up code style guidelines, enforce naming conventions, make AI always do X, customize AI behavior for specific files, configure AI coding standards, or establish project-specific AI guidelines. Triggers on: 'create rule', '创建 rule', 'project rule', '.trae/rules/', 'AGENTS.md', 'CLAUDE.md', 'set up coding rules', 'make AI always use PascalCase', 'enforce naming convention', 'configure AI behavior'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.5"
---

# Trae Rules Writer

Analyze project conventions AND business context, then create rules that guide AI behavior.

## Workflow

```
0. SIZE CHECK      → Is project too large? Ask user to specify folders
1. ANALYZE         → Scan project structure (spawn Project Scanner Agent)
2. UNDERSTAND BIZ  → Gather business context from user and docs
3. READ CODE       → Deep-dive into domain-specific code (2-5 key files)
4. IDENTIFY        → Extract conventions + business rules from code
5. DESIGN          → Choose rule type and application mode
6. CREATE          → Write rules with code AND business guidance
7. VALIDATE        → Ensure no conflicts (spawn Quality Validator)
8. REFRESH         → Start new chat for rules to take effect
```

---

## Common Mistakes (AVOID THESE)

These mistakes break rules. Check before creating:

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `globs: "*.ts,*.tsx"` | `globs: *.ts,*.tsx` | Trae doesn't recognize quoted globs |
| `globs: ["*.ts"]` | `globs: *.ts,*.tsx` | No YAML arrays for globs |
| `/Users/john/src/` | `src/` | Absolute paths break for others |
| Mixed 中英文 | Single language | Confuses AI and users |
| Missing `description` | Always include it | Even for alwaysApply rules |

---

## Understand Code + Business

### Code-First Approach

Before writing any rule, read actual codebase files:

```
1. Identify key files for this domain
2. Read 2-5 source files deeply (100-200 lines each)
3. Extract actual patterns from code
4. Create rules that MATCH existing patterns
```

### Business Context

Rules should capture BOTH code conventions AND business guidance:

| Include ✅ | Skip ❌ |
|------------|---------|
| Domain terminology | Generic programming terms |
| Business constraints | Implementation details |
| "Why" behind conventions | "How" of algorithms |

---

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

### Application Modes

| Mode | Frontmatter | Use Case |
|------|-------------|----------|
| **Always Apply** | `alwaysApply: true` | All AI chats |
| **File-Specific** | `globs: *.tsx,*.jsx` | Matching files only |
| **Intelligent** | `description: "When..."` | AI determines |
| **Manual** | (no frontmatter) | `#RuleName` only |

---

## Best Practices

### Naming

| Good ✅ | Bad ❌ |
|---------|--------|
| `code-style.md` | `rules.md` (too vague) |
| `react-patterns.md` | `all-patterns.md` |
| `app-naming.md` | `style.md` |

### Language Consistency

All content in ONE language:

```yaml
# Good
# Code Style
- Use PascalCase for components

# Bad
# Code Style 代码规范
- Use PascalCase 组件命名
```

### Always Include Description

Even for `alwaysApply: true` rules:

```yaml
# Good
---
description: Code style conventions for TypeScript
alwaysApply: true
---

# Bad
---
alwaysApply: true
---
```

---

## Quality Checklist

Before creating rules, verify:

- [ ] **Globs format** - No quotes: `globs: *.ts,*.tsx`
- [ ] **Description** - Always included
- [ ] **No absolute paths** - Use relative paths only
- [ ] **Language** - Single language throughout
- [ ] **Code study** - Based on actual codebase
- [ ] **No conflicts** - Rules don't contradict

---

## Example

```
User: "Create rules for this TypeScript React project"

READ CODE:
- src/components/Button.tsx
- src/hooks/useAuth.ts
- Found: PascalCase components, camelCase hooks

CREATE: .trae/rules/

📄 code-style.md
---
description: Naming conventions for TypeScript React
alwaysApply: true
---
# Code Style
- PascalCase for components and types
- camelCase for functions and hooks

📄 react-patterns.md
---
description: React component and hook patterns
globs: *.tsx,*.jsx
---
# React Patterns
- Use functional components with hooks
- Custom hooks in src/hooks/
```

---

## Agent-Enhanced Analysis

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large projects |
| IDENTIFY | [Convention Detector](agents/convention-detector.md) | Extract conventions |
| VALIDATE | [Quality Validator](agents/quality-validator.md) | Check conflicts |

## References

- [Trae Rules Documentation](assets/trae-rules-docs.md)
- [Application Mode Examples](examples/application-modes.md)
- [Rule Template](assets/rule.md.template)

## Agents

- [Project Scanner](agents/project-scanner.md)
- [Convention Detector](agents/convention-detector.md)
- [Quality Validator](agents/quality-validator.md)
