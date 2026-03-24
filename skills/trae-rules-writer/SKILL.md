---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when: create rule, set up code style, enforce naming convention, make AI always do X, configure AI behavior. NOT for skills (use project-skill-writer) or agents (use project-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "3.0"
---

# Trae Rules Writer

Create rules that solve specific problems - not generic rules.

## Activation

When user says:
- "Create rules for..."
- "Make AI always..."
- "Enforce naming convention"
- ".trae/rules/..."
- "#RuleName"

## Prerequisites

- Node.js >= 18
- Trae IDE (with `.trae/rules/` support)

## Workflow

```
1. Understand the problem → What problem does this rule solve?
2. Analyze project → What conventions already exist?
3. Design rule → What should AI do differently?
4. Validate with user → Show design, get confirmation
5. Generate → Create .trae/rules/xxx.md
```

## Rule Format

```markdown
---
description: When this rule applies
globs: *.ts,*.tsx
alwaysApply: false
---

# Rule Title

Rule content...
```

## ⚠️ Critical (MUST FOLLOW)

| Wrong | Correct |
|-------|---------|
| `globs: "*.ts"` | `globs: *.ts,*.tsx` |
| `globs: ["*.ts"]` | `globs: *.ts` |
| `/Users/.../src/` | `src/` |

## Application Modes

| Mode | Config |
|------|--------|
| Always | `alwaysApply: true` |
| File-Specific | `globs: *.tsx` + `alwaysApply: false` |
| Intelligent | `description: "..."` + `alwaysApply: false` |
| Manual | No frontmatter, use `#RuleName` |

## Quality Gates

Before delivery:
- [ ] globs format: comma-separated, no quotes
- [ ] No absolute paths
- [ ] Description present
- [ ] No conflicts with existing rules

## Output

Always produce:
1. Problem Understanding
2. Rule Design (application mode + content)
3. Deliverables
4. Quality Report

## References

Load these as needed:
- [Rule Types](references/rule-types.md): Choose rule type based on problem
- [Application Modes](examples/application-modes.md): All mode examples
- [Project Scanner](agents/project-scanner.md): For large projects
- [Quality Validator](agents/quality-validator.md): Check conflicts

## Official Docs

- [Trae Rules](https://docs.trae.ai/ide/rules)
- [Trae Skills](https://docs.trae.ai/ide/skills)
