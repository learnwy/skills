# Command: check

Check for available skill updates.

## Usage

```bash
npx skills check
```

## Output

Shows skills with available updates:

```
Checking for skill updates...

Updates available:
  - skill-name-1: v1.0.0 → v1.2.0
  - skill-name-2: v2.1.0 → v2.3.0

No updates:
  - skill-name-3 (up to date)

Run 'npx skills update' to update all skills.
```

## Workflow

### Step 1: Check for Updates

```bash
npx skills check
```

### Step 2: Review Available Updates

Present update information to user:
- Current version
- Available version
- Skill name

### Step 3: Prompt for Action

If updates are available, ask user:

```json
{
  "questions": [{
    "question": "Updates are available. Would you like to update?",
    "header": "Updates",
    "options": [
      {"label": "Update all", "description": "Update all skills to latest versions"},
      {"label": "Select skills", "description": "Choose which skills to update"},
      {"label": "Skip", "description": "Don't update now"}
    ],
    "multiSelect": false
  }]
}
```

## Error Handling

### Network Error

```
❌ Unable to check for updates

Solutions:
1. Check internet connection
2. Try again: npx skills check
```

### No Skills Installed

```
No skills installed to check.

Install skills with: npx skills add <package>
```

## Tools Required

- **RunCommand**: Execute `npx skills check`
- **AskUserQuestion**: Prompt for update action
