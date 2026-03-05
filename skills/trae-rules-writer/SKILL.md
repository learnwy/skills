---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when user wants to: create a project rule, set up code style guidelines, enforce naming conventions, make AI always do X, customize AI behavior for specific files, configure AI coding standards, or establish project-specific AI guidelines. Triggers on: 'create rule', '创建 rule', 'project rule', '.trae/rules/', 'AGENTS.md', 'CLAUDE.md', 'set up coding rules', 'make AI always use PascalCase', 'enforce naming convention', 'configure AI behavior'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.6"
---

# Trae Rules Writer

Analyze project conventions AND business context, then create rules that guide AI behavior.


## Phase 1: Understand Project (REQUIRED)

**Before creating ANY rule, you MUST understand the project first.**

### 1.1 Check Project Size

If project is too large (>50 top-level items, monorepo):
- **STOP** - Don't analyze entire project
- **ASK** - Use `AskUserQuestion` for target folders
- **SCOPE** - Only analyze user-specified folders

### 1.2 Scan Project Structure

Quick scan to understand what exists (NOT deep reading):

```
1. List top-level directories
2. Identify tech stack and frameworks
3. Find existing .trae/rules/, linting configs
4. List areas that need AI guidance
```

**Note:** Deep code reading happens in Phase 2 for each specific rule.

### 1.3 Understand Business

Rules should reflect business requirements:

| Source | What to Extract |
|--------|-----------------|
| **User input** | Team standards, preferences |
| **README/docs** | Coding guidelines |
| **Code comments** | Constraints, requirements |

**Ask:** "What coding standards does your team follow?"


## Phase 2: Create Rules (SEQUENTIAL)

**Create rules ONE at a time.**

### 2.1 Plan Rule Breakdown

First, identify all rules needed:

```
Example: react-project
├── code-style.md     (naming conventions)
├── react-patterns.md (component patterns)
├── import-order.md   (import style)
└── testing.md        (test patterns)
```

### 2.2 For EACH Rule

```
┌─────────────────────────────────────────────┐
│  For each rule:                             │
│                                             │
│  1. Deep-dive into THIS rule's scope        │
│     - What files does it apply to?          │
│     - What conventions exist?               │
│                                             │
│  2. Choose application mode                 │
│     - alwaysApply: true                     │
│     - globs: *.ts,*.tsx                     │
│     - description: "When..."                │
│                                             │
│  3. Write rule with business context        │
│     - Include domain terminology            │
│     - Explain "why" for each guideline      │
│                                             │
│  4. Move to next rule                       │
└─────────────────────────────────────────────┘
```

### 2.3 Rule Format

```markdown
description: Brief explanation of what this rule does
globs: *.ts,*.tsx
alwaysApply: false

# Rule Title

Concise guidance for AI.
```

**Character Limit:** Keep rules under 1000 characters when possible. Long rules reduce AI attention.

### Application Modes

| Mode | Frontmatter | Use Case |
|------|-------------|----------|
| **Always** | `alwaysApply: true` | All AI chats |
| **File-Specific** | `globs: *.tsx` | Matching files |
| **Intelligent** | `description: "..."` | AI determines |
| **Manual** | (none) | `#RuleName` only |


## Phase 3: Quality & Lessons Learned

### ⚠️ Common Mistakes (CRITICAL)

These mistakes break rules. **Always check:**

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `globs: "*.ts,*.tsx"` | `globs: *.ts,*.tsx` | **No quotes in globs** |
| `globs: ["*.ts"]` | `globs: *.ts,*.tsx` | **No YAML arrays** |
| `/Users/john/project/src/` | `src/` | NO absolute paths! |
| `/home/dev/lib/file.ts` | `lib/file.ts` | Paths from project root, no `/` prefix |
| Mixed 中英文 | Single language | Confuses AI |
| Missing `description` | Always include | Even for alwaysApply |

**Path Rule:** Always use paths relative to project root. Just `src/file.ts`, never `/absolute/path/`.

### Globs Format (CRITICAL)

**Trae does NOT recognize:**
- Quoted strings: `"*.ts,*.tsx"` ❌
- YAML arrays: `["*.ts", "*.tsx"]` ❌

**Only this format works:** `globs: *.ts,*.tsx` ✅

### Quality Checklist

Before creating each rule:

- [ ] **Globs** - No quotes, comma-separated
- [ ] **Description** - Always included
- [ ] **Paths** - All relative
- [ ] **Language** - Single language
- [ ] **No conflicts** - Rules don't contradict
- [ ] **Length** - Under 1000 characters (ideal)


## Best Practices

### Always Include Description

Even for `alwaysApply: true`:

```yaml
# Good
description: Code style for TypeScript
alwaysApply: true

# Bad
alwaysApply: true
```

### Naming

| Good ✅ | Bad ❌ |
|---------|--------|
| `code-style.md` | `rules.md` |
| `react-patterns.md` | `all.md` |

### Include Business Context

```markdown
## Domain Rules
- **Card Pack**: Always show minimum 3 cards
- **Scene**: Determines allowed styles

## Code Conventions
- Use CardPack component
- Apply SceneStyle based on context
```


## Example

```
User: "Create rules for TypeScript React project"

Phase 1: Read src/components/, src/hooks/
Found: PascalCase components, camelCase hooks

Phase 2: Create rules

📄 .trae/rules/code-style.md
description: Naming conventions for TypeScript React
alwaysApply: true
# Code Style
- PascalCase for components
- camelCase for functions/hooks

📄 .trae/rules/react-patterns.md
description: React component patterns
globs: *.tsx,*.jsx
# React Patterns
- Functional components with hooks
- Custom hooks in src/hooks/

Phase 3: Verify no conflicts, test activation
```


## Agents

| Stage | Agent | When |
|-------|-------|------|
| Phase 1 | [Project Scanner](agents/project-scanner.md) | Large projects |
| Phase 1 | [Convention Detector](agents/convention-detector.md) | Extract patterns |
| Phase 3 | [Quality Validator](agents/quality-validator.md) | Check conflicts |

## References

- [Trae Rules Documentation](assets/trae-rules-docs.md)
- [Application Mode Examples](examples/application-modes.md)
