# Phase 2: Skill Installation

## Objective

Install the selected skill to `~/.agents/skills/` only. Users manage customizations in their own repositories.

## Steps

### 1. Confirm Selection

Get user's choice (number or skill name) and confirm the installation.

### 2. Execute Installation

```bash
npx skills add -g -y <owner/repo@skill-name>
```

**Example**:

```bash
npx skills add -g -y nickcrew/claude-ctx-plugin@react-performance-optimization
```

### 3. Verify Installation

```bash
ls ~/.agents/skills/<skill-name>
```

Check that:

- SKILL.md exists
- Skill directory is properly created
- Optional: references/ directory exists

### 4. Confirm Success

```
✅ Successfully installed <skill-name>!

Location: ~/.agents/skills/<skill-name>

The skill is now available for the AI assistant to use.

If you want to customize this skill:
1. Create your own skill repository
2. Copy and modify the skill as needed
3. Manage versions with your own git workflow
```

## Installation Verification

After installation, verify the skill structure:

```bash
cd ~/.agents/skills/<skill-name>
ls -la

# Expected files:
# - SKILL.md (required)
# - references/ (optional)
# - examples/ (optional)
```

## Error Handling

### Installation Fails

```
❌ Installation failed

Possible causes:
- npm/npx not available
- Network connection issue
- Invalid skill name
- Skill doesn't exist in registry

Solutions:
1. Check npm: npm --version
2. Check network connection
3. Verify skill name at https://skills.sh/
4. Try alternate skill name
```

### Permission Denied

```
❌ Permission denied writing to ~/.agents/skills

Solutions:
1. Check permissions: ls -la ~/.agents
2. Fix permissions: chmod 755 ~/.agents/skills
3. Try with sudo (if necessary): sudo npx skills add ...
```

### Skill Already Exists

```
⚠️ Skill <skill-name> already exists in ~/.agents/skills/

Options:
1. Reinstall (will overwrite): npx skills add -g -y <skill-name>
2. Keep existing version
3. Check if you want to update: npx skills check
```

## Update Existing Skill

To update a skill to the latest version:

```bash
# Check for updates
npx skills check

# Update all skills
npx skills update

# Or reinstall specific skill
npx skills add -g -y <owner/repo@skill-name>
```

## Remove Skill

To remove an installed skill:

```bash
# Interactive remove
npx skills remove

# Remove specific skill
npx skills remove <skill-name>

# Or manually
rm -rf ~/.agents/skills/<skill-name>
```

## Tools Used

- **RunCommand**: Execute npx commands
- **AskUserQuestion**: Confirm installation
- **Read**: Verify SKILL.md exists

## Notes

- Skills are installed globally to `~/.agents/skills/` by default
- Users are responsible for customization management
- No version tracking or git operations by this skill
- Updates are handled via `npx skills update` command
