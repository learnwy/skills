# Command: init

Initialize a new skill with template structure.

## Usage

```bash
npx skills init [name]
```

## Parameters

| Parameter | Description                                  |
| --------- | -------------------------------------------- |
| `name`    | Skill name (creates `<name>/SKILL.md`)       |

If no name provided, creates `./SKILL.md` in current directory.

## Examples

```bash
npx skills init my-skill         # Creates ./my-skill/SKILL.md
npx skills init                  # Creates ./SKILL.md
```

## Workflow

### Step 1: Get Skill Name

Ask user for skill name if not provided:

```json
{
  "questions": [{
    "question": "What would you like to name your skill? (use kebab-case)",
    "header": "Skill Name",
    "options": [
      {"label": "Custom name", "description": "Enter your own skill name"}
    ],
    "multiSelect": false
  }]
}
```

Suggest based on user's intent:
- "api-tester" for API testing
- "sql-optimizer" for SQL optimization
- "code-reviewer" for code review

### Step 2: Execute Init

```bash
npx skills init <skill-name>
```

### Step 3: Guide Structure

Template created at `./<skill-name>/SKILL.md`:

```markdown
---
name: <skill-name>
description: Brief description of what this skill does
---

# <Skill Name>

## When to Use This Skill

Activate when:
- User mentions X
- User asks about Y
- Context indicates Z

## Instructions

1. First, do A
2. Then, check B
3. Finally, C

## Examples

[Show example interactions]
```

### Step 4: Provide Next Steps

```
✅ Created template at ./<skill-name>/SKILL.md

Next steps:
1. Edit SKILL.md with your skill logic
2. Test by copying to ~/.agents/skills/<skill-name>/
3. Commit to your own git repository

To use the skill:
  cp -r ./<skill-name> ~/.agents/skills/
```

## SKILL.md Structure Guide

### Required Sections

1. **Frontmatter** (YAML)
   - `name`: Skill name (kebab-case)
   - `description`: What the skill does and when to use it

2. **When to Use This Skill**
   - List trigger conditions
   - Keywords that should activate the skill

3. **Instructions**
   - Step-by-step guide for AI
   - Clear, actionable instructions

### Optional Sections

4. **Examples** - Sample interactions
5. **References** - Links to external docs
6. **Tools Required** - List needed tools

## Validation Checklist

Before using the skill, verify:
- [ ] Frontmatter present with name and description
- [ ] "When to Use" section exists
- [ ] Clear instructions for AI
- [ ] Valid markdown syntax
- [ ] Tested with sample queries

## Testing the Skill

```bash
# Copy to skills directory
cp -r ./<skill-name> ~/.agents/skills/

# Verify installation
ls ~/.agents/skills/<skill-name>

# Test by triggering the skill
# (Ask questions that should activate it)
```

## Tools Required

- **RunCommand**: Execute `npx skills init`
- **Read**: Read created SKILL.md template
- **AskUserQuestion**: Get skill name if not provided
