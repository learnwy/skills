---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. Use when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Triggers on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', 'I keep doing the same thing every time'. Do NOT use for rules (use trae-rules-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.1"
---

# Trae Skill Writer

Create Trae IDE skills by analyzing project patterns first, then designing skills that automate real workflows.

## Workflow

```
0. SIZE CHECK → Is project too large? If yes, ask user to specify folders
1. ANALYZE    → Scan project for repetitive patterns (ls scripts/, .trae/skills/)
2. IDENTIFY   → What workflows need automation?
3. DESIGN     → Structure skill for on-demand loading
4. CREATE     → Write SKILL.md with clear triggers
5. VERIFY     → Validate skill structure and test activation
```

## Large Project Handling

**Before analyzing, check project size.** If the project is too large (many folders, monorepo, >50 top-level items):

1. **STOP** - Do not attempt to analyze the entire project
2. **INFORM** - Tell user the project is too large for comprehensive analysis
3. **ASK** - Use `AskUserQuestion` to request target folders:
   - "Which folders should I focus on for creating skills?"
   - "Please provide 1-3 specific directories (e.g., `src/features/`, `scripts/`)"
4. **SCOPE** - Only create skills for the user-specified folders

**Example response for large projects:**
```
This project appears to be large (I see 20+ top-level directories).
To create focused, useful skills, please specify which folders I should analyze:
- Which directories contain workflows you want to automate?
- Any specific areas with repetitive tasks?

Example: "Focus on src/api/ and scripts/"
```

**Indicators of "too large":**
- Monorepo with multiple packages
- >50 files/folders at root level
- Multiple independent modules or services
- No clear single entry point

## User Interaction Guidelines

**When to ask user for clarification:**
- Project scope is unclear (large project, monorepo)
- Multiple valid skill designs are possible
- User's intent is ambiguous
- Choosing between global vs project skill

**Use `AskUserQuestion` tool with options like:**
```
Question: "What type of skill scope do you prefer?"
Options:
- "Global skill (~/.trae/skills/)" - Available in all projects
- "Project skill (.trae/skills/)" - Only for this project
```

## Skill Structure

```
skill-name/
├── SKILL.md               # Required - Core instructions (<500 lines)
├── scripts/               # Optional - Executable automation
├── references/            # Optional - Detailed docs (loaded on-demand)
└── assets/                # Optional - Templates, files for output
```

## SKILL.md Format

```markdown
---
name: skill-name
description: "What it does. When to use. Trigger phrases. Do NOT use for X."
---

# Skill Name

Brief intro.

## When to Use

**Invoke when:**
- [Condition 1]
- [Condition 2]

**Do NOT invoke when:**
- [Exception 1]
- [Exception 2]

## Workflow

[Steps or flowchart]

## Quick Reference

[Tables, commands]

## Error Handling

| Issue | Solution |
|-------|----------|
| [Issue 1] | [Solution 1] |

## References

- [doc.md](references/doc.md) - When to read
```

**Description is the primary trigger mechanism.** Include:
- What the skill does
- When to use it (specific phrases)
- When NOT to use it

## Skill Types

| Type    | Location            | Scope           |
| ------- | ------------------- | --------------- |
| Global  | `~/.trae/skills/`   | All projects    |
| Project | `.trae/skills/`     | Current project |

## Good Skill Candidates

- Multi-step workflows (code review, deployment)
- Complex domain logic (order processing, pricing)
- Repetitive tasks (report generation, migrations)
- Tool integration (database setup, test running)

**Don't make skills for:** Simple one-step tasks, generic AI knowledge, continuous constraints (use rules instead).

## Example

```
User: "Create a skill for our code review process"

Analysis:
- Found: scripts/lint.sh, .github/workflows/ci.yml
- Workflow: lint → test → review checklist

Creating: .trae/skills/code-review/SKILL.md

---
name: code-review
description: "Code review for this project. Use when reviewing PRs or checking code quality. Triggers on 'review', 'PR', 'check this code'. Do NOT use for simple syntax questions."
---

# Code Review

Automated code review workflow for this project.

## When to Use

**Invoke when:**
- Reviewing pull requests
- Checking code quality before commit
- Running pre-merge validation

**Do NOT invoke when:**
- Simple syntax questions
- Non-code file reviews

## Workflow

1. Run linter: `npm run lint`
2. Run tests: `npm test`
3. Check review checklist

## Checklist

- [ ] No TypeScript errors
- [ ] Tests pass
- [ ] No console.log in production

## Error Handling

| Issue | Solution |
|-------|----------|
| Lint fails | Fix reported issues first |
| Tests fail | Check test output for details |
```

## Validation Checklist

After creating a skill, verify:

- [ ] **Frontmatter**: Has `name` and `description` fields
- [ ] **Description**: Includes trigger phrases and "Do NOT use for"
- [ ] **Workflow**: Has clear numbered steps
- [ ] **When to Use**: Specifies both positive and negative conditions
- [ ] **Error Handling**: Documents common issues and solutions
- [ ] **References**: Links to detailed docs if needed
- [ ] **No README.md**: Skills don't need separate documentation files

## Testing Skills

1. **Start new chat** - Skills don't apply retroactively
2. **Use trigger phrase** - Say something matching the description
3. **Verify activation** - Skill should load and follow workflow
4. **Test edge cases** - Try "Do NOT use" scenarios

## References

- [Trae Skills Documentation](assets/trae-skills-docs.md) - Official documentation
- [Best Practices](assets/trae-skill-best-practices.md) - How to write good skills
- [Advanced Patterns](references/advanced-patterns.md) - Multi-variant skills, domain organization
- [Skill Template](assets/skill.md.template) - Starter template
- [Workflow Example](examples/workflow-skill.md) - Complete end-to-end example
