# Trae IDE Skills Documentation

> Source: https://docs.trae.ai/ide/skills

## Overview

Skills are reusable AI capabilities that extend Trae's functionality. They encapsulate domain knowledge, workflows, and specialized behaviors that can be invoked on demand.

## Types of Skills

| Type           | Location                   | Scope           |
| -------------- | -------------------------- | --------------- |
| User Skills    | `~/.trae/skills/`          | All projects    |
| Project Skills | `.trae/skills/`            | Current project |

## Skill File Structure

```
skill-name/
├── SKILL.md           # Required: Skill definition
├── assets/            # Optional: Templates, docs
├── examples/          # Optional: Usage examples
└── references/        # Optional: Reference materials
```

## SKILL.md Format

```markdown
---
name: skill-name
description: "When and why to use this skill. Triggers on: 'keyword1', 'keyword2'."
---

# Skill Title

Detailed instructions for the AI when this skill is activated.

## Workflow

Step-by-step process for the skill to follow.

## Examples

Show input/output examples.

## References

Link to additional resources.
```

### Frontmatter Properties

| Property    | Required | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| name        | Yes      | Unique identifier for the skill                |
| description | Yes      | Explains purpose and trigger conditions        |

## Description Best Practices

The description field is critical for skill activation. Include:

1. **What the skill does**: Clear purpose statement
2. **When to use it**: Specific trigger conditions
3. **Trigger keywords**: Words/phrases that should activate the skill

Example:
```yaml
description: "Create PDF documents from markdown or data. Use when user wants to generate, create, or export PDFs. Triggers on: 'create PDF', 'export to PDF', 'generate report'."
```

## Creating Skills

### Via Settings
1. Open Settings (gear icon)
2. Select "Rules & Skills" in left navigation
3. In "Skills" section, click "+ Create"
4. Enter skill name and confirm
5. System creates skill folder with SKILL.md template

### Manual Creation
1. Create folder in `.trae/skills/` or `~/.trae/skills/`
2. Create `SKILL.md` file inside
3. Add frontmatter with name and description
4. Write skill instructions

## Using Skills

### Automatic Activation
Skills activate automatically when:
- User message matches trigger keywords in description
- Context indicates the skill is relevant

### Manual Activation
Reference skills explicitly:
- Using `#SkillName` in chat
- Mentioning the skill by name

## Skill Content Guidelines

### Be Specific
```markdown
## Workflow
1. Read the input file
2. Parse the data structure
3. Generate output in specified format
4. Validate the result
```

### Include Examples
```markdown
## Examples

Input: "Create a PDF report from sales.json"
Output: Generated sales-report.pdf with formatted tables and charts
```

### Reference Assets
```markdown
## References
- [Template](assets/template.md) - Base template for output
- [Format Guide](references/format-guide.md) - Detailed formatting rules
```

## Skill Activation Flow

```
User Message
     ↓
Check skill descriptions for keyword match
     ↓
If match found → Load SKILL.md
     ↓
AI follows skill instructions
     ↓
Task completed
```

## Best Practices

1. **Clear Triggers**: Use specific keywords in description
2. **Structured Workflow**: Break tasks into clear steps
3. **Include Examples**: Show expected input/output
4. **Reference Materials**: Link to templates and docs
5. **Single Responsibility**: One skill, one purpose
6. **Avoid Overlap**: Don't duplicate other skills' triggers
