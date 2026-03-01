---
description: "When creating or editing Trae skills, rules, or agents in skills/trae-*-writer directories"
globs: skills/trae-*-writer/**/*.md
---

# Trae Skill Development Guidelines

Rules for developing and maintaining the Trae writer skills (trae-skill-writer, trae-rules-writer, trae-agent-writer).

## Shared Agents Architecture

Each Trae writer skill has its own `agents/` directory with duplicated agents for self-containment:

```
skills/
├── trae-skill-writer/
│   └── agents/
│       ├── project-scanner.md      # Deep project analysis
│       ├── tech-stack-analyzer.md  # Domain-specific analysis
│       ├── convention-detector.md  # Extract conventions
│       └── quality-validator.md    # Validate outputs
├── trae-rules-writer/
│   └── agents/
│       ├── project-scanner.md      # (duplicate)
│       ├── convention-detector.md  # (duplicate)
│       └── quality-validator.md    # (duplicate)
└── trae-agent-writer/
    └── agents/
        └── (future agents)
```

## Agent Sync Policy

When modifying shared agents:

1. **Edit the canonical version first** (in trae-skill-writer/agents/)
2. **Sync to other skills** - Copy to trae-rules-writer/agents/
3. **Update both SKILL.md** - Ensure references remain local (use `agents/` not `../`)

## Agent Responsibilities

| Agent | Purpose | Output |
|-------|---------|--------|
| **project-scanner** | Analyze project structure, tech stack, patterns | `project-analysis.json` |
| **tech-stack-analyzer** | Domain-specific analysis (iOS, Go, React) | `tech-stack-{domain}.json` |
| **convention-detector** | Extract naming/style conventions | `conventions.json` |
| **quality-validator** | Validate skills/rules against best practices | `validation.json` |

## Workflow Integration

Skills should reference agents at appropriate workflow stages:

```
0. SIZE CHECK → project-scanner (check size.is_large)
1. ANALYZE    → project-scanner + tech-stack-analyzer
2. IDENTIFY   → convention-detector
3. DESIGN     → (manual)
4. CREATE     → (manual)
5. VERIFY     → quality-validator
```

## File Naming Conventions

- **SKILL.md** - Main skill definition (PascalCase)
- **agents/*.md** - Agent definitions (kebab-case)
- **assets/*.md** - Templates and docs (kebab-case)
- **examples/*.md** - Usage examples (kebab-case)
- **references/*.md** - Reference docs (kebab-case)

## Quality Standards

When creating/editing skills:

- [ ] Frontmatter has `name` and `description`
- [ ] Description includes trigger phrases
- [ ] Description includes "Do NOT use for"
- [ ] Workflow has numbered steps
- [ ] Error Handling section exists
- [ ] References link to existing files
- [ ] Agents use local paths (`agents/` not `../`)
