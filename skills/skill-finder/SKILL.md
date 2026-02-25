---
name: skill-finder
description: "Helps users discover and install agent skills when they ask questions like 'how do I do X', 'find a skill for X', 'is there a skill that can...', or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill."
---

# Skill Finder

Intelligent assistant for discovering, installing, and managing AI assistant skills using the `npx skills` CLI.

## When to Use This Skill

Activate when the user:

- Wants to find/search for a skill
- Wants to install or add a skill
- Wants to remove/uninstall a skill
- Wants to list installed skills
- Wants to check for or apply updates
- Wants to create a new custom skill
- Mentions "skill" with management intent

## Command Reference

| Command   | Purpose                          | Reference                                    |
| --------- | -------------------------------- | -------------------------------------------- |
| `find`    | Search for skills                | [cmd-find.md](references/cmd-find.md)        |
| `add`     | Install a skill                  | [cmd-add.md](references/cmd-add.md)          |
| `remove`  | Remove installed skills          | [cmd-remove.md](references/cmd-remove.md)    |
| `list`    | List installed skills            | [cmd-list.md](references/cmd-list.md)        |
| `check`   | Check for updates                | [cmd-check.md](references/cmd-check.md)      |
| `update`  | Update all skills                | [cmd-update.md](references/cmd-update.md)    |
| `init`    | Create new skill template        | [cmd-init.md](references/cmd-init.md)        |

## Quick Usage

```bash
npx skills find [query]           # Search skills
npx skills add -g <package>       # Install globally
npx skills remove [skill]         # Remove skill
npx skills list -g                # List global skills
npx skills check                  # Check for updates
npx skills update                 # Update all skills
npx skills init <name>            # Create new skill
```

## Core Workflows

### 1. Find and Install Skills

```
User: "Find me a React performance skill"
     ↓
[Parse intent] → [npx skills find react performance]
     ↓
[Present results] → [AskUserQuestion for selection]
     ↓
[npx skills add -g -y <selected>] → Done
```

**Key**: Use `AskUserQuestion` to let user select which skill to install.

### 2. Remove Skills

```
User: "Remove the code-review skill"
     ↓
[npx skills ls -g] → [Show installed skills]
     ↓
[AskUserQuestion to confirm removal]
     ↓
[npx skills remove -g -y <selected>] → Done
```

**Key**: Use `AskUserQuestion` to confirm which skill(s) to remove.

### 3. Create New Skills

```
User: "Help me create a skill for SQL optimization"
     ↓
[AskUserQuestion for skill name]
     ↓
[npx skills init <name>] → [Guide structure]
     ↓
[User edits] → [cp -r ./<name> ~/.agents/skills/]
```

## AskUserQuestion Integration

**IMPORTANT**: Always use `AskUserQuestion` for user decisions:

### Skill Selection (after find)

Use `multiSelect: true` to allow installing multiple skills at once:

```json
{
  "questions": [{
    "question": "Which skill(s) would you like to install? (can select multiple)",
    "header": "Install",
    "options": [
      {"label": "skill-1", "description": "owner/repo - description"},
      {"label": "skill-2", "description": "owner/repo - description"},
      {"label": "skill-3", "description": "owner/repo - description"},
      {"label": "Search again", "description": "Try different keywords"}
    ],
    "multiSelect": true
  }]
}
```

### Installation Scope (if user hasn't specified)

```json
{
  "questions": [{
    "question": "Where should the skill(s) be installed?",
    "header": "Scope",
    "options": [
      {"label": "Project (Recommended)", "description": "Install to ./.agents/skills/ for this project only"},
      {"label": "Global", "description": "Install to ~/.agents/skills/ for all projects"}
    ],
    "multiSelect": false
  }]
}
```

### Removal Confirmation

```json
{
  "questions": [{
    "question": "Which skill(s) would you like to remove?",
    "header": "Remove",
    "options": [
      {"label": "skill-name", "description": "~/.agents/skills/skill-name"},
      {"label": "All listed", "description": "Remove all skills shown"},
      {"label": "Cancel", "description": "Don't remove any"}
    ],
    "multiSelect": true
  }]
}
```

## Default Configuration

| Setting       | Default Value | Description                          |
| ------------- | ------------- | ------------------------------------ |
| Scope         | Project       | `-g` for global, none for project    |
| Agent         | All           | `-a <agent>` for specific agent only |

**Supported Agents**: `trae-cn`, `trae`, `cursor`, `claude-code`, `qwen-code`

When user doesn't specify, ask or use defaults:
- **Scope**: Default to project-level unless user says "global" or "for all projects"
- **Agent**: Default installs to all detected agents; use `-a` to target specific agent

## Installation Locations

| Scope   | Flag | Location                |
| ------- | ---- | ----------------------- |
| Global  | `-g` | `~/.agents/skills/`     |
| Project | none | `./.agents/skills/`     |

## Examples

- [Search and Install](examples/example-search-install.md)
- [Remove Skills](examples/example-remove-skill.md)
- [Create New Skill](examples/example-create-skill.md)

## Error Handling

| Error              | Solution                                           |
| ------------------ | -------------------------------------------------- |
| Network error      | Check connection, retry command                    |
| Skill not found    | Try broader keywords, browse https://skills.sh/    |
| Permission denied  | Check `~/.agents` permissions, use chmod 755       |
| npm/npx not found  | Install Node.js                                    |

## Tools Required

- **RunCommand**: Execute `npx skills` commands
- **AskUserQuestion**: Interactive selection and confirmation
- **Read**: Verify SKILL.md files

## Resources

- Community skills: https://skills.sh/
- CLI documentation: `npx skills --help`
