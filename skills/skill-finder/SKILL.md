---
name: skill-finder
description: "Discover, install, and manage AI assistant skills using npx skills CLI. Use when user wants to find a skill, install a skill, remove skills, list installed skills, or create new skills. Triggers on: 'find a skill', 'install skill', 'remove skill', 'list skills', 'how do I do X', 'is there a skill for'."
---

# Skill Finder

Manage AI assistant skills using `npx skills` CLI.

## Commands

```bash
npx skills find [query]           # Search skills
npx skills add -g <package>       # Install globally
npx skills add <package>          # Install to project
npx skills remove -g [skill]      # Remove global skill
npx skills list -g                # List global skills
npx skills list                   # List project skills
npx skills check                  # Check for updates
npx skills update                 # Update all skills
npx skills init <name>            # Create new skill
```

## Workflows

### Find and Install (3-Step Questions)

```
1. npx skills find <query>
2. AskUserQuestion #1: Which skill(s) to install? (multiSelect)
3. AskUserQuestion #2: Where to install? (scope: -g or not)
4. AskUserQuestion #3: Which AI IDE(s)? (agent: -a <agents>)
5. npx skills add [-g] [-a <agents>] -y <selected>
```

**Important:** Ask ALL three questions:
- Q1: Skill selection (can select multiple)
- Q2: Scope selection (global vs project)
- Q3: Agent/IDE selection (which AI assistants)

### Remove Skills

```
1. npx skills list [-g]
2. AskUserQuestion: Which to remove? (multiSelect)
3. npx skills remove [-g] -y <selected>
```

## AskUserQuestion Patterns

### Q1: Skill Selection (FIRST)
```json
{
  "question": "Which skill(s) would you like to install?",
  "header": "Skills",
  "options": [
    {"label": "skill-1", "description": "owner/repo - description"},
    {"label": "skill-2", "description": "owner/repo - description"},
    {"label": "Search again", "description": "Try different keywords"}
  ],
  "multiSelect": true
}
```

### Q2: Scope Selection (SECOND)
```json
{
  "question": "Where should the skill(s) be installed?",
  "header": "Scope", 
  "options": [
    {"label": "Project", "description": "Install to ./.agents/skills/ - tied to this project"},
    {"label": "Global (Recommended)", "description": "Install to ~/.agents/skills/ - available everywhere"}
  ],
  "multiSelect": false
}
```

### Q3: Agent/IDE Selection (THIRD)
```json
{
  "question": "Which AI IDE(s) should have access to this skill?",
  "header": "AI IDE", 
  "options": [
    {"label": "All (Recommended)", "description": "Install for all detected AI assistants"},
    {"label": "Trae", "description": "trae-cn, trae"},
    {"label": "Claude Code", "description": "claude-code"},
    {"label": "Cursor", "description": "cursor"},
    {"label": "Qwen Code", "description": "qwen-code"}
  ],
  "multiSelect": true
}
```

**Supported Agents:** `trae-cn`, `trae`, `cursor`, `claude-code`, `qwen-code`

**Note:** 
- Project scope installs to `./.agents/skills/` - only available in that project
- Use `-a *` or omit for all agents, use `-a claude-code cursor` for specific ones

## Locations

| Scope   | Flag | Location            |
| ------- | ---- | ------------------- |
| Global  | `-g` | `~/.agents/skills/` |
| Project | none | `./.agents/skills/` |

## Resources

- Community skills: https://skills.sh/
- Command references: `references/cmd-*.md`
