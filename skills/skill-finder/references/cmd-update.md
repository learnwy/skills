# Command: update

Update all skills to latest versions.

## Usage

```bash
npx skills update
```

## Workflow

### Step 1: Check Current Status (Optional)

```bash
npx skills check
```

### Step 2: Execute Update

```bash
npx skills update
```

### Step 3: Confirm Results

```
Updating skills...

✅ Updated:
  - skill-name-1: v1.0.0 → v1.2.0
  - skill-name-2: v2.1.0 → v2.3.0

Already up to date:
  - skill-name-3

Update complete!
```

## Alternative: Reinstall Specific Skill

To update a specific skill instead of all:

```bash
npx skills add -g -y <owner/repo@skill-name>
```

This reinstalls (overwrites) the existing skill with the latest version.

## Error Handling

### Update Fails

```
❌ Update failed for <skill-name>

Possible causes:
- Network issue
- Repository unavailable
- Breaking changes

Solutions:
1. Try again: npx skills update
2. Reinstall: npx skills add -g -y <skill-name>
3. Check skill repository for issues
```

### Partial Update

If some skills update and others fail:
- Successfully updated skills are at latest version
- Failed skills remain at previous version
- Retry failed skills individually

## Best Practices

1. **Check before update** - Run `npx skills check` first
2. **Review changes** - Check skill changelogs if available
3. **Test after update** - Verify skills work as expected

## Tools Required

- **RunCommand**: Execute `npx skills update`
