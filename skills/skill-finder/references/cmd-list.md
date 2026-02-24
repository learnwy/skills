# Command: list

List installed skills.

## Usage

```bash
npx skills list [options]
npx skills ls [options]  # Alias
```

## Options

| Option                  | Description                           |
| ----------------------- | ------------------------------------- |
| `-g, --global`          | List global skills (default: project) |
| `-a, --agent <agents>`  | Filter by specific agents             |

## Examples

```bash
npx skills list              # List project skills
npx skills ls                # Alias for list
npx skills ls -g             # List global skills
npx skills ls -a claude-code # Filter by agent
```

## Output Format

Typical output shows:
- Skill name
- Installation location
- Agent associations

```
Global Skills:
  - skill-finder (~/.agents/skills/skill-finder)
  - react-performance (~/.agents/skills/react-performance)
  - code-review (~/.agents/skills/code-review)

Total: 3 skills
```

## Workflow

### List All Global Skills

```bash
npx skills ls -g
```

### List Project Skills

```bash
npx skills ls
```

### Filter by Agent

```bash
npx skills ls -a claude-code
npx skills ls -a cursor
```

## Use Cases

1. **Before installing** - Check if skill already exists
2. **Before removing** - See what's installed
3. **Inventory check** - Review all available skills
4. **Troubleshooting** - Verify skill installation

## Parsing Output

When programmatically parsing, extract:
- Skill names
- Installation paths
- Agent associations

## Tools Required

- **RunCommand**: Execute `npx skills ls`
