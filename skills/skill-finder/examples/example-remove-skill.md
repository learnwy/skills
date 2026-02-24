# Example: Remove Installed Skill

Complete workflow demonstrating skill removal with `AskUserQuestion`.

## User Query

```
User: "I want to remove some skills I no longer need"
```

## Step 1: List Installed Skills

```
Assistant: Let me check your installed skills first.

Executing: npx skills ls -g

Global Skills:
  - react-performance-optimization (~/.agents/skills/react-performance-optimization)
  - code-review (~/.agents/skills/code-review)
  - sql-optimizer (~/.agents/skills/sql-optimizer)
  - api-tester (~/.agents/skills/api-tester)

Total: 4 skills
```

## Step 2: Use AskUserQuestion for Selection

**CRITICAL**: Use `AskUserQuestion` to confirm removal:

```json
{
  "questions": [{
    "question": "Which skill(s) would you like to remove?",
    "header": "Remove Skills",
    "options": [
      {"label": "react-performance-optimization", "description": "~/.agents/skills/react-performance-optimization"},
      {"label": "code-review", "description": "~/.agents/skills/code-review"},
      {"label": "sql-optimizer", "description": "~/.agents/skills/sql-optimizer"},
      {"label": "Cancel", "description": "Don't remove any skills"}
    ],
    "multiSelect": true
  }]
}
```

## Step 3: User Selects (via AskUserQuestion UI)

```
User selected: ["code-review", "sql-optimizer"]
```

## Step 4: Execute Removal

```
Assistant: Removing selected skills...

Executing: npx skills remove -g -y code-review sql-optimizer

✅ Successfully removed:
  - code-review
  - sql-optimizer

Remaining skills:
  - react-performance-optimization
  - api-tester
```

## Complete Workflow Summary

```
[User wants to remove skills]
       ↓
[npx skills ls -g] → List installed skills
       ↓
[AskUserQuestion with multiSelect: true]  ← Key step!
       ↓
[User clicks skill(s) in UI]
       ↓
[npx skills remove -g -y <selected>]
       ↓
[Confirm removal success]
```

## Key Points

1. **Always list skills first** - Show user what's installed before removal
2. **Use `multiSelect: true`** - Allow removing multiple skills at once
3. **Include Cancel option** - Let user back out without removing anything
4. **Use `-g -y` flags** - Remove from global without additional prompts
5. **Confirm after removal** - Show what was removed and what remains
