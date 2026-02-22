# Skills Repository Agent

This repository contains reusable skills for AI assistants.

## Repository Structure

```
skills/
├── AGENT.md              # This file - project guidelines
├── LICENSE
└── skills/               # Individual skill directories
    ├── requirement-workflow/   # State-machine driven development workflow
    └── skill-finder/           # Skill discovery and installation
```

## Skill Structure Standard

Each skill MUST follow this structure:

```
{skill-name}/
├── SKILL.md              # REQUIRED: Main skill definition (frontmatter + content)
├── hooks.yaml            # Optional: Default hooks/agents configuration
├── agents/               # Optional: Agent definitions
│   └── *.md
├── references/           # Optional: Detailed reference documents
│   └── *.md
├── examples/             # Optional: Usage examples
│   └── *.md
├── assets/               # Optional: Templates and static files
│   └── *.template
└── scripts/              # Optional: Shell scripts
    └── *.sh
```

## SKILL.md Requirements

```markdown
---
name: "{skill-name}"
description: "{What it does}. {When to invoke it}. Keep under 200 chars."
---

# {Skill Title}

{Detailed instructions}
```

### Critical Fields

| Field | Location | Requirement |
|-------|----------|-------------|
| `name` | frontmatter | Unique identifier |
| `description` | frontmatter | MUST include: what + when to invoke |
| Content | body | Execution steps, examples |

## Script Path Convention

**All script paths are relative to `{skill_root}` (the directory containing SKILL.md).**

```bash
# AI must resolve actual path before running:
{skill_root}/scripts/init-workflow.sh ...

# Example with absolute path:
/path/to/skills/requirement-workflow/scripts/init-workflow.sh -r /project
```

## Development Guidelines

### Adding a New Skill

1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with proper frontmatter
3. Add reference docs to `references/` if needed
4. Add scripts to `scripts/` if needed
5. Test the skill

### Modifying Existing Skills

1. Keep SKILL.md concise (~100-200 lines)
2. Move detailed content to `references/`
3. Ensure script path conventions are documented
4. Test changes before committing

### Code Style

- No comments in code unless explicitly requested
- Use English for code, Chinese for user-facing docs (unless specified otherwise)
- Keep files focused and single-purpose

## Available Skills

### requirement-workflow

State-machine driven orchestrator for structured software development.

**Triggers:** `feature`, `bugfix`, `refactor`, `implement`, `develop`

**Key Features:**
- 3-level workflows (L1/L2/L3)
- Agent/Skill injection at hook points
- Document generation at each stage

### skill-finder

Intelligent skill discovery and installation assistant.

**Triggers:** User wants to find or install skills

## Testing

When making changes to skills:

1. Verify SKILL.md frontmatter is valid
2. Test scripts with actual project paths
3. Ensure examples in docs are accurate
4. Check script path conventions are followed
