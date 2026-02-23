# Phase 3: Skill Creation

## Objective

Help users create new custom skills using `npx skills init`. Users own and manage created skills in their own repositories.

## Steps

### 1. Initiate Creation

Ask user for skill name:

```
Let's create a new skill!

What would you like to name your skill? (use-kebab-case)
Example: my-custom-reviewer, api-tester, sql-optimizer
```

### 2. Execute Init

```bash
npx skills init <skill-name>
```

This creates a template SKILL.md in the current directory: `./<skill-name>/SKILL.md`

**Recommended location**: User's own skill repository

### 3. Guide Structure

Explain required sections:

```
I've created a template at ./<skill-name>/SKILL.md

Required sections:
1. Frontmatter (---name: <skill-name>...)
   - name: <skill-name>
   - description: What does this skill do?

2. When to Use This Skill
   - List trigger conditions
   - When should the AI activate this?

3. Core Instructions
   - Step-by-step instructions for the AI
   - Examples of expected behavior
   - Error handling guidelines

Optional but recommended:
4. Examples (show sample interactions)
5. References (link to external docs)
6. Tools Required (list needed tools)
```

### 4. Provide Template Example

Show user what a good SKILL.md looks like:

```markdown
---
name: my-skill
description: Brief description of what this skill does
---

# My Skill

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

### 5. Installation Guidance

```
Your skill template is ready at ./<skill-name>/SKILL.md

Next steps:
1. Edit the SKILL.md file with your skill logic
2. Test it by copying to ~/.agents/skills/<skill-name>/
3. Once working, commit to your own git repository
4. Manage versions with your own workflow

To use the skill:
cp -r ./<skill-name> ~/.agents/skills/

To update it:
1. Edit in your repository
2. Copy updated version to ~/.agents/skills/
```

### 6. Validation Checklist

Remind user to check:

```
Before using your skill, verify:
- [ ] Frontmatter present with name and description
- [ ] "When to Use" section exists
- [ ] Clear instructions for AI
- [ ] Valid markdown syntax
- [ ] Tested with sample queries
```

## Example Workflow

**User**: "Help me create a skill for SQL optimization"

**Assistant**:

```
I'll help you create a SQL optimization skill.

Executing: npx skills init sql-optimizer

✅ Created template at ./sql-optimizer/SKILL.md

Now let's set up the skill structure:

1. Open ./sql-optimizer/SKILL.md
2. Update the description:
   description: "Helps optimize SQL queries for better performance"

3. Add trigger conditions:
   - User mentions "SQL performance"
   - User asks "optimize this query"
   - User shows slow SQL code

4. Add your SQL optimization instructions

When ready:
- Test: cp -r ./sql-optimizer ~/.agents/skills/
- Manage in your own repository

Would you like me to help with any specific section?
```

## Tools Used

- **RunCommand**: Execute `npx skills init`
- **Read**: Read created SKILL.md template
- **AskUserQuestion**: Get skill name

## Notes

- Skills are created in current directory
- Users manage skills in their own repositories
- No automatic installation to `~/.agents/skills/`
- Users handle git, versioning, and updates themselves
- Encourage users to maintain skills as separate projects
