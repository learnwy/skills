---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. Use when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Triggers on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', 'I keep doing the same thing every time'. Do NOT use for skills (use trae-skill-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.5"
---

# Trae Skill Writer

Analyze project patterns AND business context, design skill specs, then delegate to `skill-creator`.

## Workflow

```
0. SIZE CHECK      → Is project too large? Ask user to specify folders
1. ANALYZE         → Scan project structure (spawn Project Scanner Agent)
2. UNDERSTAND BIZ  → Gather business context from user and docs
3. READ CODE       → Deep-dive into domain-specific code (2-5 key files)
4. IDENTIFY        → Extract patterns + business rules from code
5. DESIGN          → Structure skill spec with code AND business context
6. DELEGATE        → Hand off to skill-creator (DO NOT write SKILL.md yourself)
7. VERIFY          → Validate skill after creation
```

---

## Common Mistakes (AVOID THESE)

These mistakes break skills. Check before delegating:

| Wrong ❌ | Correct ✅ | Why |
|----------|------------|-----|
| `/Users/john/project/src/` | `src/` | Absolute paths break for other users |
| `globs: "*.ts,*.tsx"` | `globs: *.ts,*.tsx` | Trae doesn't recognize quoted globs |
| Mixed 中英文 in same file | Single language throughout | Confuses AI and users |
| `my-super-long-skill-name` | `app-style` | Use prefix + short domain |

---

## Understand Code + Business

### Code-First Approach

Before writing any skill, read actual codebase files:

```
1. Identify key files for this domain
2. Read 2-5 source files deeply (100-200 lines each)
3. Extract actual patterns, types, constants
4. Use real code examples from the codebase
```

### Business Context

Skills should capture BOTH code patterns AND business logic:

| Source | Information |
|--------|-------------|
| **User input** | Domain terminology, workflows |
| **README/docs** | Project purpose, architecture |
| **Comments** | Business rules in code |
| **Naming** | Domain concepts from identifiers |

**Ask user:** "What business problem does this solve?"

---

## Best Practices

### Naming Convention

Every skill MUST use a project prefix: `{prefix}-{domain}`

| Good ✅ | Bad ❌ |
|---------|--------|
| `app-style` | `style` (no prefix) |
| `fe-component` | `my-app-general-search-scene-template` (too long) |

### Language Consistency

All content within a skill MUST be in ONE language:

```yaml
# Good
name: app-style
description: "Style system guide..."

# Bad
name: app-style
description: "Style 系统指南..."
```

### Skill Granularity

**Single Responsibility**: Each skill focuses on ONE domain.

- Good: `app-style` (only style), `app-monitor` (only monitoring)
- Bad: `app-style-and-component` (too broad)

---

## Delegation to skill-creator

**After DESIGN step, delegate to `skill-creator` for SKILL.md creation.**

### Template

```
Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** {prefix}-{domain}
**Purpose:** {what it does}
**Triggers:** {phrases that should activate it}
**Exclusions:** {when NOT to use}
**Language:** English (or specify)
**Key Files:** {list of files - relative paths}
**Workflow:** {numbered steps}
**Location:** .trae/skills/{name}/

Project context:
- Tech stack: {detected tech}
- Patterns found: {from actual code}

Business context:
- Domain concepts: {terminology}
- Business rules: {constraints}
```

---

## Quality Checklist

Before delegating, verify:

- [ ] **No absolute paths** - All paths are relative
- [ ] **Naming** - Has project prefix, kebab-case
- [ ] **Language** - Single language throughout
- [ ] **Code study** - Based on actual codebase reading
- [ ] **Business context** - Includes domain terminology

---

## Batch Creation Workflow

When creating multiple skills:

1. **Phase 1 - Overview**: Understand architecture, identify domains
2. **Phase 2 - Deep-Dive**: Process ONE skill at a time
3. **Phase 3 - Cross-Reference**: Check for overlap and duplication

---

## Agent-Enhanced Analysis

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large/unfamiliar projects |
| ANALYZE | [Tech Stack Analyzer](agents/tech-stack-analyzer.md) | Domain-specific (iOS, Go, React) |
| VERIFY | [Quality Validator](agents/quality-validator.md) | Post-creation validation |

## References

- [Trae Skills Documentation](assets/trae-skills-docs.md)
- [Best Practices](assets/trae-skill-best-practices.md)

## Agents

- [Project Scanner](agents/project-scanner.md)
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md)
- [Convention Detector](agents/convention-detector.md)
- [Quality Validator](agents/quality-validator.md)
