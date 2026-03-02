---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. Use when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Triggers on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', 'I keep doing the same thing every time'. Do NOT use for rules (use trae-rules-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.6"
---

# Trae Skill Writer

Analyze project code AND business context, then delegate to `skill-creator` for SKILL.md creation.


## Phase 1: Understand Project (REQUIRED)

**Before creating ANY skill, you MUST understand the project first.**

### 1.1 Check Project Size

If project is too large (>50 top-level items, monorepo):
- **STOP** - Don't analyze entire project
- **ASK** - Use `AskUserQuestion` for target folders
- **SCOPE** - Only analyze user-specified folders

```
"This project is large. Which folders should I focus on?"
Options: "src/features/", "lib/core/", "Other..."
```

### 1.2 Scan Project Structure

Quick scan to understand what exists (NOT deep reading):

```
1. List top-level directories
2. Identify tech stack (package.json, go.mod, etc.)
3. Find existing skills/rules/automation
4. List major domains/modules for skill breakdown
```

**Note:** Deep code reading happens in Phase 2 for each specific skill.

### 1.3 Understand Business

Ask user and read docs to capture business context:

| Source | What to Extract |
|--------|-----------------|
| **User input** | Domain terminology, workflows |
| **README/docs** | Project purpose, architecture |
| **Code comments** | Business rules |
| **Naming** | Domain concepts |

**Ask:** "What business problem does this solve?"


## Phase 2: Create Skills (SEQUENTIAL)

**Create skills ONE at a time, not in parallel.**

### 2.1 Plan Skill Breakdown

First, identify all skills needed:

```
Example: ecommerce-app
├── app-style      (style system)
├── app-component  (UI components)
├── app-api        (API patterns)
└── app-monitor    (monitoring)
```

### 2.2 For EACH Skill (Sequential Loop)

```
┌─────────────────────────────────────────────┐
│  For each skill:                            │
│                                             │
│  1. Deep-dive into THIS skill's code        │
│     - Read 2-5 key files for this domain    │
│     - Extract patterns specific to it       │
│                                             │
│  2. Design spec for THIS skill              │
│     - Name, triggers, exclusions            │
│     - Key files, workflow                   │
│     - Business context                      │
│                                             │
│  3. Delegate to skill-creator               │
│     - Use template below                    │
│     - Wait for completion                   │
│                                             │
│  4. Move to next skill                      │
└─────────────────────────────────────────────┘
```

### 2.3 Delegation Template

```
Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** {prefix}-{domain}
**Purpose:** {what it does}
**Triggers:** {phrases that should activate it}
**Exclusions:** {when NOT to use}
**Language:** English (or specify)
**Key Files:** {list of files - relative paths only}
**Workflow:** {numbered steps}
**Location:** .trae/skills/{name}/

Project context:
- Tech stack: {detected tech}
- Patterns: {from actual code}

Business context:
- Domain concepts: {terminology}
- Business rules: {constraints}
```


## Phase 3: Quality & Lessons Learned

### ⚠️ Common Mistakes (CRITICAL)

These mistakes break skills. **Always check:**

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `/Users/john/src/` | `src/` | Absolute paths break for others |
| `globs: "*.ts"` | `globs: *.ts,*.tsx` | No quotes in globs |
| Mixed 中英文 | Single language | Confuses AI |
| `super-long-name` | `app-style` | prefix + short domain |
| No business context | Include domain terms | AI needs to understand "why" |

### Quality Checklist

Before delegating each skill:

- [ ] **Paths** - All relative, no absolute paths
- [ ] **Naming** - `{prefix}-{domain}` format
- [ ] **Language** - Single language throughout
- [ ] **Code study** - Based on actual codebase
- [ ] **Business** - Includes domain terminology
- [ ] **Granularity** - Single responsibility


## Best Practices

### Naming: `{prefix}-{domain}`

| Good ✅ | Bad ❌ |
|---------|--------|
| `app-style` | `style` (no prefix) |
| `fe-component` | `my-app-template` (too long) |

### Single Responsibility

Each skill = ONE domain:
- Good: `app-style` (only style)
- Bad: `app-style-and-component` (too broad)

### Cross-Reference

After creating all skills:
- Check for overlap
- Add "Related Skills" sections
- Verify no duplicate content


## Agents

| Stage | Agent | When |
|-------|-------|------|
| Phase 1 | [Project Scanner](agents/project-scanner.md) | Large projects |
| Phase 1 | [Tech Stack Analyzer](agents/tech-stack-analyzer.md) | Domain-specific |
| Phase 3 | [Quality Validator](agents/quality-validator.md) | Validation |

## References

- [Trae Skills Documentation](assets/trae-skills-docs.md)
- [Best Practices](assets/trae-skill-best-practices.md)
