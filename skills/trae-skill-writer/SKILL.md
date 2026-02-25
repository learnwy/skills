---
name: trae-skill-writer
description: "Create and manage Trae IDE skills (SKILL.md files). Use when creating new skills for AI agent capabilities, editing existing skills, or setting up skill directories. Triggers on 'create skill', 'write skill', 'trae skill', 'new skill', 'SKILL.md', 'agent capability'."
---

# Trae Skill Writer

Create well-structured skills for Trae IDE to extend AI agent capabilities.

## When to Use

**Invoke when:**

- User wants to create a new skill
- User wants to define AI agent capabilities
- User mentions: `create skill`, `write skill`, `new skill`, `SKILL.md`
- User wants to edit `.trae/skills/` or `~/.trae/skills/` content

**Do NOT invoke when:**

- User wants to create a rule (use trae-rules-writer)
- Simple Q&A about skills without creation intent

## Skill Types

| Type    | Location            | Scope              | Use Case                    |
| ------- | ------------------- | ------------------ | --------------------------- |
| Global  | `~/.trae/skills/`   | All projects       | General dev paradigms       |
| Project | `.trae/skills/`     | Current project    | Project-specific workflows  |

## Skill vs Rule vs MCP

| Feature | Loading    | Purpose                      |
| ------- | ---------- | ---------------------------- |
| Rules   | Full       | Constraints & guidelines     |
| Skills  | On-demand  | Capabilities & workflows     |
| MCP     | Tools      | External tool integration    |

## ⚠️ CRITICAL: Design Principles

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. CONCISE IS KEY - Only add what AI doesn't already know        │
│ 2. TRIGGERS IN DESCRIPTION - All trigger conditions in metadata  │
│ 3. PROGRESSIVE DISCLOSURE - Metadata → Body → Resources          │
│ 4. NO EXTRA DOCS - No README, CHANGELOG, INSTALL guides          │
└──────────────────────────────────────────────────────────────────┘
```

## Skill Structure

```
skill-name/
├── SKILL.md              # (Required) Core instructions
├── references/           # (Optional) Detailed docs, loaded on-demand
│   └── api-reference.md
├── examples/             # (Optional) Input/output samples
│   └── workflow.md
├── scripts/              # (Optional) Executable automation
│   └── helper.sh
└── assets/               # (Optional) Templates, not loaded to context
    └── template.md
```

## SKILL.md Format

```markdown
---
name: skill-name
description: "What it does. When to use. Trigger keywords: 'x', 'y', 'z'."
---

# Skill Name

Brief intro (1-2 sentences).

## When to Use

**Invoke when:**
- Condition 1
- Condition 2

**Do NOT invoke when:**
- Exception 1

## Workflow

[Steps or flowchart]

## Quick Reference

[Tables, commands, examples]

## References

- [Detail Doc](references/doc.md) - Purpose
```

## Workflow

```
[Define skill purpose]
       ↓
[List trigger scenarios]
       ↓
[Create skill directory]
       ↓
[Write SKILL.md]
       ↓
[Add references/examples if needed]
       ↓
[Test trigger in chat]
```

## Description Field Best Practices

The `description` is the PRIMARY trigger mechanism.

**Good example:**

```yaml
description: "Create React components with TypeScript. Use when building UI components, forms, or interactive elements. Triggers on 'react component', 'tsx component', 'create form', 'build UI'."
```

**Bad example:**

```yaml
description: "A skill for React development."
```

**Include:**

- What the skill does
- When to use it (specific scenarios)
- Trigger keywords/phrases

## Progressive Disclosure

Skills load in three levels to manage context:

| Level    | Content           | Size       | When Loaded           |
| -------- | ----------------- | ---------- | --------------------- |
| Metadata | name + description| ~100 words | Always in context     |
| Body     | SKILL.md content  | <5k words  | When skill triggers   |
| Resources| references/, etc  | Unlimited  | As needed by AI       |

## Resource Organization

### references/

Domain knowledge, loaded when needed.

```
references/
├── api-docs.md         # API specifications
├── schema.md           # Database schemas
└── patterns.md         # Design patterns
```

### examples/

Complete workflow demonstrations.

```
examples/
├── basic-workflow.md   # Simple use case
└── advanced-usage.md   # Complex scenarios
```

### scripts/

Executable code for deterministic operations.

```
scripts/
├── init.sh             # Setup script
└── validate.py         # Validation logic
```

### assets/

Output resources, not loaded to context.

```
assets/
├── template.md         # Document template
└── config.yaml         # Config template
```

## Quick Reference: Common Skill Types

| Type         | Purpose                    | Key Resources           |
| ------------ | -------------------------- | ----------------------- |
| Workflow     | Multi-step processes       | scripts/, references/   |
| Tool         | CLI/API integration        | references/cmd-*.md     |
| Domain       | Business knowledge         | references/domain.md    |
| Template     | Standardized output        | assets/templates        |
| Automation   | Repetitive tasks           | scripts/*.sh            |

## Best Practices

- Keep SKILL.md under 500 lines
- Split large content into references/
- Include "When to Use" and "Do NOT invoke when"
- Use tables for quick reference
- Test triggers before finalizing

## Do NOT Create

- README.md
- CHANGELOG.md
- INSTALLATION_GUIDE.md
- User-facing documentation

Skills are for AI agents, not human documentation.

## References

- [Advanced Patterns](references/advanced-patterns.md) - Multi-variant, domain-specific organization
- [Complete Workflow Example](examples/workflow-skill.md) - End-to-end skill creation
- [SKILL.md Template](assets/skill.md.template) - Starter template

## Error Handling

| Issue                   | Solution                                      |
| ----------------------- | --------------------------------------------- |
| Skill not triggering    | Check description keywords                    |
| Too much context        | Move content to references/                   |
| Inconsistent behavior   | Add explicit "When to Use" section            |
| Large files             | Split into domain-specific references         |
