# Command: remove

Remove installed skills.

## Usage

```bash
npx skills remove [skills]
```

## Options

| Option                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `-g, --global`          | Remove from global scope                 |
| `-a, --agent <agents>`  | Remove from specific agents (use '*' for all) |
| `-s, --skill <skills>`  | Specify skills to remove (use '*' for all) |
| `-y, --yes`             | Skip confirmation prompts                |
| `--all`                 | Shorthand for `--skill '*' --agent '*' -y` |

## Examples

```bash
npx skills remove                    # Interactive remove
npx skills remove web-design         # Remove by name
npx skills rm --global frontend-design  # Remove from global
npx skills remove -g -y skill-name   # Remove global without prompt
```

## Workflow

### Step 1: List Installed Skills First

Before removing, show user what's installed:

```bash
npx skills ls -g  # List global skills
```

### Step 2: Use AskUserQuestion for Selection

**IMPORTANT**: Use `AskUserQuestion` to confirm which skill(s) to remove:

```json
{
  "questions": [{
    "question": "Which skill would you like to remove?",
    "header": "Remove Skill",
    "options": [
      {"label": "skill-name-1", "description": "Location: ~/.agents/skills/skill-name-1"},
      {"label": "skill-name-2", "description": "Location: ~/.agents/skills/skill-name-2"},
      {"label": "All skills", "description": "Remove all listed skills"},
      {"label": "Cancel", "description": "Don't remove any skill"}
    ],
    "multiSelect": true
  }]
}
```

### Step 3: Execute Removal

```bash
# Single skill
npx skills remove -g -y <skill-name>

# Multiple skills
npx skills remove -g -y skill1 skill2

# All skills
npx skills remove -g -y --all
```

### Step 4: Confirm Removal

```
✅ Successfully removed <skill-name>

The skill has been uninstalled from ~/.agents/skills/
```

## Interactive Mode

Running `npx skills remove` without arguments enters interactive mode:
- Shows list of installed skills
- Allows selection via keyboard
- Confirms before deletion

## Manual Removal Alternative

```bash
rm -rf ~/.agents/skills/<skill-name>
```

## Error Handling

### Skill Not Found

```
❌ Skill '<skill-name>' not found

Check installed skills with:
npx skills ls -g
```

### Permission Denied

```
❌ Permission denied

Solutions:
1. Check permissions: ls -la ~/.agents/skills
2. Fix permissions if needed
3. Try with sudo if necessary
```

## Safety Notes

1. **Always confirm before removing** - Use AskUserQuestion
2. **Removal is permanent** - Skill files are deleted, not archived
3. **Re-installation available** - Skills can be reinstalled with `npx skills add`

## Tools Required

- **RunCommand**: Execute npx commands
- **AskUserQuestion**: Confirm removal selection
