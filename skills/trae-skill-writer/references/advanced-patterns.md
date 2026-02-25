# Advanced Skill Patterns

Reference for complex skill design patterns. Load when creating sophisticated skills with multiple variants or workflows.

## Pattern 1: Multi-Variant Skills

For skills supporting multiple frameworks/options, keep selection logic in SKILL.md and variant details in references:

```
cloud-deploy/
├── SKILL.md (workflow + provider selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

**SKILL.md example:**

```markdown
## Cloud Provider Selection

| Provider | Use When                    | Reference                        |
| -------- | --------------------------- | -------------------------------- |
| AWS      | Team uses AWS, EKS, Lambda  | [aws.md](references/aws.md)      |
| GCP      | Team uses GCP, GKE, Cloud Run | [gcp.md](references/gcp.md)    |
| Azure    | Team uses Azure, AKS        | [azure.md](references/azure.md)  |

Select provider based on user's context, then load specific reference.
```

## Pattern 2: Domain-Specific Organization

Organize by domain to avoid loading irrelevant context:

```
analytics-skill/
├── SKILL.md (overview + navigation)
└── references/
    ├── finance.md (revenue, billing)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (usage, features)
    └── marketing.md (campaigns, attribution)
```

When user asks about sales metrics, AI only reads `sales.md`.

## Pattern 3: Conditional Details

Show basic content, link to advanced content:

```markdown
## Creating Documents

Use docx-js for new documents. Basic example:

\`\`\`javascript
const doc = new Document({ sections: [...] });
\`\`\`

**For tracked changes**: See [REDLINING.md](references/REDLINING.md)
**For OOXML details**: See [OOXML.md](references/OOXML.md)
```

## Pattern 4: Layered Workflow Skills

For complex workflows with multiple stages:

```
requirement-workflow/
├── SKILL.md (overview + stage loop)
├── references/
│   ├── WORKFLOW_L1.md (quick workflow)
│   ├── WORKFLOW_L2.md (standard workflow)
│   └── WORKFLOW_L3.md (complex workflow)
├── agents/
│   ├── AGENTS.md (agent overview)
│   ├── code-reviewer.md
│   └── risk-auditor.md
├── scripts/
│   └── init-workflow.sh
└── assets/
    ├── spec.md.template
    └── tasks.md.template
```

## Pattern 5: CLI Tool Integration

For skills wrapping CLI tools:

```
skill-finder/
├── SKILL.md (overview + quick usage)
├── references/
│   ├── cmd-find.md
│   ├── cmd-add.md
│   ├── cmd-remove.md
│   └── cmd-list.md
└── examples/
    ├── search-install.md
    └── create-skill.md
```

**SKILL.md pattern:**

```markdown
## Command Reference

| Command  | Purpose              | Reference                           |
| -------- | -------------------- | ----------------------------------- |
| `find`   | Search for skills    | [cmd-find.md](references/cmd-find.md) |
| `add`    | Install a skill      | [cmd-add.md](references/cmd-add.md)   |

## Quick Usage

\`\`\`bash
npx skills find [query]
npx skills add -g <package>
\`\`\`
```

## Freedom Levels

Match specificity to task fragility:

| Freedom | When to Use              | Format             | Example                  |
| ------- | ------------------------ | ------------------ | ------------------------ |
| High    | Multiple valid approaches | Text instructions  | Architecture decisions   |
| Medium  | Preferred pattern exists | Pseudocode/params  | Code templates           |
| Low     | Fragile/critical ops     | Specific scripts   | Database migrations      |

## Progressive Disclosure Guidelines

### Keep SKILL.md Lean

```
┌─────────────────────────────────────────────────────────────────┐
│ SKILL.md (< 500 lines)                                          │
│ ├── When to Use / Do NOT invoke when                            │
│ ├── Quick workflow overview                                     │
│ ├── Command/reference table                                     │
│ └── Links to detailed references                                │
└─────────────────────────────────────────────────────────────────┘
         ↓ (if needed)
┌─────────────────────────────────────────────────────────────────┐
│ references/*.md                                                  │
│ ├── One file per domain/variant/command                         │
│ ├── Include TOC for files > 100 lines                           │
│ └── Link back to SKILL.md for context                           │
└─────────────────────────────────────────────────────────────────┘
```

### Reference File Structure

For files > 100 lines, include table of contents:

```markdown
# API Reference

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)

## Authentication

...

## Endpoints

...
```

## Anti-Patterns to Avoid

| Anti-Pattern               | Problem                        | Solution                          |
| -------------------------- | ------------------------------ | --------------------------------- |
| Deeply nested references   | Hard to navigate               | Keep references 1 level deep      |
| Everything in SKILL.md     | Token bloat                    | Split to references/              |
| No "When to Use" section   | Inconsistent triggering        | Always include explicit triggers  |
| Vague description          | Won't trigger correctly        | Include specific keywords         |
| README/CHANGELOG           | Not for AI agents              | Delete these files                |
