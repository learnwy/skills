---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. MUST trigger when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Also trigger on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', or requests like 'I keep doing the same thing every time - can we automate this'. Do NOT trigger for rules (constraints), agents (independent workers), or installing existing skills."
---

# Trae Skill Writer

Create well-structured Trae IDE skills by analyzing the target project first, identifying repetitive patterns worth automating, then designing skills that match the project's actual workflows.

## When to Use

**Invoke when:**
- User wants to create a skill for a project
- User mentions: "create skill", "SKILL.md", "agent capability", "automate this workflow"
- User wants AI to follow a specific process repeatedly
- User asks about `.trae/skills/` or global skills

**Do NOT invoke when:**
- User wants to create a rule (use trae-rules-writer instead)
- Simple Q&A about skills without creation intent

## Skills vs Rules

Understanding the difference prevents choosing the wrong tool:

| Aspect    | Rules                          | Skills                              |
| --------- | ------------------------------ | ----------------------------------- |
| Loading   | Always in context (full load)  | On-demand (loaded when triggered)   |
| Purpose   | Constraints & guidelines       | Capabilities & workflows            |
| Tokens    | Consume context continuously   | Only when invoked                   |
| Best For  | "Always do X"                  | "When user asks for Y, do Z"        |

**Rule of thumb:** If the guidance applies to every interaction, make it a rule. If it's a specific capability triggered by certain requests, make it a skill.

## Why Analyze First?

Skills should automate what the team actually does, not impose theoretical workflows. By scanning the project first, you discover:
- Repetitive patterns worth automating
- Domain-specific terminology to include
- Existing scripts that could be bundled
- Workflows that would benefit from standardization

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ANALYZE  → Scan project for repetitive patterns          │
│ 2. IDENTIFY → What workflows need automation?               │
│ 3. DESIGN   → Structure skill for on-demand loading         │
│ 4. CREATE   → Write SKILL.md with clear triggers            │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Analyze Target Project

Look for automation opportunities:

| Aspect            | What to Look For                          | How                      |
| ----------------- | ----------------------------------------- | ------------------------ |
| Scripts           | Existing automation, build processes      | `ls scripts/`            |
| Workflows         | Multi-step processes done repeatedly      | Ask user, read docs      |
| Domain            | Business logic, terminology               | Read domain code         |
| Existing Skills   | `.trae/skills/` patterns to follow        | `ls .trae/skills/`       |
| TODOs/Comments    | Common patterns marked for automation     | `grep -r "TODO"`         |

Quick scan:
```bash
# Check for existing skills
ls -la <project>/.trae/skills/ 2>/dev/null

# Find scripts
ls <project>/scripts/ <project>/tools/ 2>/dev/null

# Look for workflow documentation
cat <project>/docs/*.md 2>/dev/null | head -50
```

## Step 2: Identify Skill Opportunities

Good candidates for skills:

| Pattern                  | Why It's a Good Skill                    | Example                        |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| Multi-step workflow      | AI can execute entire process            | Code review, deployment        |
| Complex domain logic     | Encapsulates business rules              | Order processing, pricing      |
| Repetitive task          | Saves time on common operations          | Report generation, migrations  |
| Tool integration         | Guides AI on using specific tools        | Database setup, test running   |
| Output standardization   | Ensures consistent format                | Documentation, changelogs      |

**Anti-patterns (don't make skills for):**
- Simple one-step tasks (AI handles these fine)
- Generic knowledge AI already has
- Things better suited as rules (continuous constraints)

## Step 3: Design Skill Structure

### Skill Types

| Type    | Location            | Scope           | Use Case                    |
| ------- | ------------------- | --------------- | --------------------------- |
| Global  | `~/.trae/skills/`   | All projects    | General dev workflows       |
| Project | `.trae/skills/`     | Current project | Project-specific automation |

### Directory Structure

```
skill-name/
├── SKILL.md               # (Required) Core instructions
├── scripts/               # (Optional) Executable automation
├── references/            # (Optional) Detailed docs, loaded on-demand
├── templates/             # (Optional) Output templates
└── examples/              # (Optional) Input/output samples
```

### Progressive Disclosure

Skills load in three levels to conserve tokens:

| Level    | Content              | Size          | When Loaded              |
| -------- | -------------------- | ------------- | ------------------------ |
| Metadata | name + description   | ~100 words    | Always scanned           |
| Body     | SKILL.md content     | <500 lines    | When skill triggers      |
| Resources| references/, etc.    | Unlimited     | When AI needs them       |

## Step 4: Create the Skill

### SKILL.md Format

```markdown
---
name: skill-name
description: What it does. When to use. Include trigger phrases like "X", "Y", "Z".
---

# Skill Name

Brief intro explaining capability.

## When to Use

**Invoke when:**
- Trigger condition 1
- Trigger condition 2

**Do NOT invoke when:**
- Exception 1

## Workflow

[Steps, flowchart, or process]

## Quick Reference

[Tables, commands, key info]

## References

- [Detailed Doc](references/doc.md) - When to read this
```

### Description is Critical

The description field is **the primary trigger mechanism**. Include:
- What the skill does
- When to use it
- Specific trigger phrases

**Good:** "Generate database migration files. Use when creating, modifying, or rolling back database schema changes. Triggers on 'migration', 'schema change', 'add column', 'create table', 'database update'."

**Bad:** "Helps with database stuff."

## Example: Complete Flow

```
User: "Create a skill for our code review process"

1. Analyzing project...
   - Found: scripts/lint.sh, .github/workflows/ci.yml
   - Patterns: TypeScript, Jest tests, ESLint
   - Workflow: lint → test → review checklist

2. Identified opportunity:
   - Code review is multi-step (lint, test, checklist)
   - Done repeatedly for every PR
   - Has project-specific checklist items

3. Creating skill:

📁 .trae/skills/code-review/

📄 SKILL.md
---
name: code-review
description: Perform comprehensive code review for this project. Use when reviewing PRs, checking code quality, or when user asks for code feedback. Triggers on 'review', 'PR', 'code quality', 'check this code'.
---

# Code Review

Automated code review following project standards.

## When to Use

**Invoke when:**
- User asks to review code or a PR
- User wants code quality feedback
- Before merging significant changes

**Do NOT invoke when:**
- Simple syntax questions
- Explaining existing code (not reviewing)

## Workflow

1. Run linter: `npm run lint`
2. Run tests: `npm test`
3. Check against review checklist

## Review Checklist

- [ ] No TypeScript errors
- [ ] Tests pass and coverage maintained
- [ ] No console.log in production code
- [ ] API changes documented
- [ ] Error handling present

## References

- [Style Guide](references/style-guide.md) - Detailed style rules
```

## Best Practices

**DO:**
- Analyze project before creating skills
- Make description "pushy" - err on side of triggering
- Explain WHY, not just WHAT - AI understands reasoning
- Bundle scripts the AI would write repeatedly
- Keep SKILL.md under 500 lines, split to references/

**DON'T:**
- Create skills for things AI handles well already
- Use heavy-handed MUST/NEVER without explaining why
- Duplicate content between rules and skills
- Create README.md or CHANGELOG.md (skills are for AI, not humans)

## References

For advanced patterns, read:
- [Advanced Patterns](references/advanced-patterns.md) - Multi-variant skills, domain organization
- [Workflow Example](examples/workflow-skill.md) - Complete skill creation walkthrough
- [Skill Template](assets/skill.md.template) - Starter template
