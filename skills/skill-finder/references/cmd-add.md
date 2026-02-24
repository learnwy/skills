# Command: add

Install a skill package from community or local source.

## Usage

```bash
npx skills add <package> [options]
```

## Default Configuration

| Setting | Default | Override |
| ------- | ------- | -------- |
| Scope   | Project | `-g` for global |
| Agent   | All     | `-a <agent>` for specific agent |

**Supported Agents**: `trae-cn`, `trae`, `cursor`, `claude-code`, `qwen-code`

**When to ask vs use defaults**:
- If user says "install globally" → use `-g`
- If user doesn't specify → default to project-level (no `-g`)
- If user mentions specific IDE → use `-a <agent>`

## Options

| Option                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `-g, --global`          | Install skill globally (user-level) instead of project-level |
| `-a, --agent <agents>`  | Specify agents to install to (use '*' for all)       |
| `-s, --skill <skills>`  | Specify skill names to install (use '*' for all)     |
| `-l, --list`            | List available skills in the repository without installing |
| `-y, --yes`             | Skip confirmation prompts                            |
| `--copy`                | Copy files instead of symlinking                     |
| `--all`                 | Shorthand for `--skill '*' --agent '*' -y`           |
| `--full-depth`          | Search all subdirectories even when root SKILL.md exists |

## Package Formats

```bash
# GitHub repository
npx skills add vercel-labs/agent-skills

# Specific skill from repository
npx skills add owner/repo@skill-name

# Full GitHub URL
npx skills add https://github.com/vercel-labs/agent-skills
```

## Common Usage Patterns

### Install to Global (Recommended)

```bash
npx skills add -g owner/repo@skill-name
npx skills add -g -y owner/repo@skill-name  # Skip confirmation
```

### Install Specific Skills

```bash
npx skills add owner/repo --skill pr-review commit
npx skills add owner/repo -s '*'  # All skills from repo
```

### Install to Specific Agents

```bash
npx skills add owner/repo --agent claude-code cursor
npx skills add owner/repo -a '*'  # All agents
```

### List Available Skills (Without Installing)

```bash
npx skills add owner/repo -l
```

## Workflow

### Step 1: Execute Installation

```bash
npx skills add -g -y <owner/repo@skill-name>
```

### Step 2: Verify Installation

```bash
ls ~/.agents/skills/<skill-name>
```

Check:
- SKILL.md exists
- Directory properly created

### Step 3: Confirm Success

```
✅ Successfully installed <skill-name>!

Location: ~/.agents/skills/<skill-name>

The skill is now available for the AI assistant.
```

## Installation Locations

| Scope   | Location                      |
| ------- | ----------------------------- |
| Global  | `~/.agents/skills/`           |
| Project | `./.agents/skills/` or agent-specific directories |

## Error Handling

### Installation Fails

```
❌ Installation failed

Possible causes:
- npm/npx not available
- Network connection issue
- Invalid skill name
- Skill doesn't exist

Solutions:
1. Check npm: npm --version
2. Check network connection
3. Verify skill at https://skills.sh/
```

### Permission Denied

```
❌ Permission denied writing to ~/.agents/skills

Solutions:
1. Check permissions: ls -la ~/.agents
2. Fix permissions: chmod 755 ~/.agents/skills
3. Try with sudo if necessary
```

### Skill Already Exists

```
⚠️ Skill already exists

Options:
1. Reinstall (overwrite): npx skills add -g -y <skill-name>
2. Keep existing version
3. Check for updates: npx skills check
```

## Tools Required

- **RunCommand**: Execute npx commands
- **Read**: Verify SKILL.md exists
