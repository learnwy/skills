---
name: trae-skill-writer
description: "Create and manage Trae IDE skills (SKILL.md files). Use when creating new skills for AI agent capabilities, editing existing skills, or setting up skill directories. Triggers on 'create skill', 'write skill', 'trae skill', 'new skill', 'SKILL.md', 'agent capability'."
---

# Trae Skill Writer

Create well-structured Trae IDE skills by analyzing the target project first.

## When to Use

**Invoke when:**

- User wants to create a new skill for a project
- User wants to define AI agent capabilities
- User mentions: `create skill`, `write skill`, `new skill`, `SKILL.md`
- User wants to edit `.trae/skills/` content

**Do NOT invoke when:**

- User wants to create a rule (use trae-rules-writer)
- Simple Q&A about skills without creation intent

## ⚠️ CRITICAL: Workflow

**MUST analyze target project BEFORE creating skills.**

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. ANALYZE target project: arch, patterns, workflows, domain     │
│ 2. IDENTIFY skill opportunities: repetitive tasks, conventions   │
│ 3. DESIGN skill structure based on project's needs               │
│ 4. CREATE skill following Trae's official SKILL.md format        │
└──────────────────────────────────────────────────────────────────┘
```

## Step 1: Analyze Target Project

**MUST scan project to identify skill opportunities:**

| Aspect              | What to Analyze                                   | Tools        |
| ------------------- | ------------------------------------------------- | ------------ |
| Workflows           | Repetitive multi-step processes                   | Read, Grep   |
| Conventions         | Project-specific patterns worth standardizing     | Read         |
| Domain Knowledge    | Business rules, terminology, constraints          | Read         |
| Tooling             | CLI tools, scripts, build processes               | LS, Read     |
| Existing Skills     | Current `.trae/skills/`, patterns to follow       | Glob, Read   |

**Example analysis:**

```bash
# Check existing skills
ls -la <project_root>/.trae/skills/ 2>/dev/null

# Find repetitive patterns
grep -r "TODO:" <project_root>/src | head -10

# Identify workflow scripts
ls <project_root>/scripts/

# Check for domain entities
ls <project_root>/src/domain/ 2>/dev/null
```

## Step 2: Identify Skill Opportunities

Based on analysis, determine what skills would help:

| Opportunity Type     | When to Create Skill                     | Example                          |
| -------------------- | ---------------------------------------- | -------------------------------- |
| Workflow Automation  | Repetitive multi-step tasks              | Code review, deployment          |
| Domain Knowledge     | Complex business logic                   | Order processing, pricing rules  |
| Convention Enforcement| Project-specific standards              | Component creation, API design   |
| Tool Integration     | CLI tools with specific patterns         | Database migration, testing      |
| Template Generation  | Standardized output formats              | Report generation, scaffolding   |

## Step 3: Design Skill Structure

### Skill Types (Trae Official)

| Type    | Location            | Scope              | Use Case                    |
| ------- | ------------------- | ------------------ | --------------------------- |
| Global  | `~/.trae/skills/`   | All projects       | General dev paradigms       |
| Project | `.trae/skills/`     | Current project    | Project-specific workflows  |

### Skill vs Rule vs MCP

| Feature | Loading    | Purpose                      |
| ------- | ---------- | ---------------------------- |
| Rules   | Full       | Constraints & guidelines     |
| Skills  | On-demand  | Capabilities & workflows     |
| MCP     | Tools      | External tool integration    |

### Skill Directory Structure

```
skill-name/
├── SKILL.md              # (Required) Core instructions
├── references/           # (Optional) Detailed docs, loaded on-demand
├── examples/             # (Optional) Input/output samples
├── scripts/              # (Optional) Executable automation
└── assets/               # (Optional) Templates, not loaded to context
```

## Step 4: Create Skill Following Trae Format

### SKILL.md Structure (Trae Official Format)

```markdown
---
name: skill-name
description: "What it does. When to use. Trigger keywords: 'x', 'y', 'z'."
---

# Skill Name

Brief intro.

## When to Use

**Invoke when:**
- Condition 1
- Condition 2

**Do NOT invoke when:**
- Exception 1

## Workflow

[Steps or flowchart]

## Quick Reference

[Tables, commands]

## References

- [Detail](references/doc.md) - Purpose
```

### Key Principles

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. CONCISE IS KEY - Only add what AI doesn't already know        │
│ 2. TRIGGERS IN DESCRIPTION - All trigger conditions in metadata  │
│ 3. PROGRESSIVE DISCLOSURE - Metadata → Body → Resources          │
│ 4. PROJECT-SPECIFIC - Reflect the actual project patterns        │
└──────────────────────────────────────────────────────────────────┘
```

## Example: Complete Workflow

```
User: "Create a skill for this e-commerce project"

AI:
1. Analyzing project...
   - Found: src/orders/, src/products/, src/payments/
   - Domain: E-commerce with order processing workflow
   - Existing scripts: scripts/seed-data.sh, scripts/run-tests.sh
   - Patterns: Repository pattern, Domain events

2. Identified skill opportunities:
   - Order processing workflow (multi-step, repetitive)
   - Product management conventions
   - Payment integration patterns

3. Creating skill:

📁 .trae/skills/order-workflow/

📄 SKILL.md
---
name: order-workflow
description: "Manage order processing workflows. Use when creating, updating, or handling order state transitions. Triggers on 'order', 'checkout', 'payment processing', 'order status'."
---

# Order Processing Workflow

Handle order lifecycle in this e-commerce project.

## When to Use

**Invoke when:**
- Creating new order handling code
- Implementing order state transitions
- Adding payment processing logic

**Do NOT invoke when:**
- Simple product queries
- User authentication (not order-related)

## Order States

| State     | Transitions To        | Trigger                    |
| --------- | --------------------- | -------------------------- |
| PENDING   | CONFIRMED, CANCELLED  | Payment result             |
| CONFIRMED | SHIPPED, CANCELLED    | Fulfillment action         |
| SHIPPED   | DELIVERED             | Delivery confirmation      |
| DELIVERED | COMPLETED             | Auto after 7 days          |

## Domain Rules

- All prices in cents (integer)
- Order ID format: ORD-{timestamp}-{random}
- State changes emit domain events

## References

- [State Machine](references/order-states.md) - Detailed state rules
```

## Progressive Disclosure

Skills load in three levels:

| Level    | Content           | Size       | When Loaded           |
| -------- | ----------------- | ---------- | --------------------- |
| Metadata | name + description| ~100 words | Always in context     |
| Body     | SKILL.md content  | <5k words  | When skill triggers   |
| Resources| references/, etc  | Unlimited  | As needed by AI       |

## Best Practices

- **Analyze first**: Always scan project before creating skills
- **Match project patterns**: Skills should reflect existing workflows
- **Keep SKILL.md lean**: Under 500 lines, split to references/
- **Clear triggers**: Put ALL trigger conditions in description field
- **No extra docs**: No README.md, CHANGELOG.md - skills are for AI

## References

- [Advanced Patterns](references/advanced-patterns.md) - Multi-variant, domain organization
- [Complete Example](examples/workflow-skill.md) - End-to-end skill creation
- [SKILL.md Template](assets/skill.md.template) - Starter template

## Do NOT Create

- README.md
- CHANGELOG.md
- INSTALLATION_GUIDE.md

Skills are for AI agents, not human documentation.
