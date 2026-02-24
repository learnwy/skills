# Example: Search and Install Skills

Complete workflow demonstrating skill discovery and installation with multi-select support.

## User Query

```
User: "I need help with React performance and code review"
```

## Step 1: Parse Intent and Search

```
Assistant: I'll search for React performance and code review skills.

Executing: npx skills find react performance
Executing: npx skills find code review
```

## Step 2: Present Combined Results

```
Found skills for your needs:

React Performance:
1. vercel-labs/agent-skills@react-performance-optimization
2. nickcrew/claude-ctx-plugin@react-perf

Code Review:
3. vercel-labs/agent-skills@code-review
4. dimillian/skills@pr-reviewer
```

## Step 3: Use AskUserQuestion for Multi-Select

**CRITICAL**: Use `multiSelect: true` to allow selecting multiple skills:

```json
{
  "questions": [{
    "question": "Which skill(s) would you like to install? (can select multiple)",
    "header": "Install",
    "options": [
      {"label": "react-performance-optimization", "description": "vercel-labs - Official patterns"},
      {"label": "react-perf", "description": "nickcrew - Community patterns"},
      {"label": "code-review", "description": "vercel-labs - Code review assistant"},
      {"label": "pr-reviewer", "description": "dimillian - PR review helper"}
    ],
    "multiSelect": true
  }]
}
```

## Step 4: User Selects Multiple (via UI)

```
User selected: ["react-performance-optimization", "code-review"]
```

## Step 5: Ask Installation Scope (if not specified)

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

## Step 6: User Selects Scope

```
User selected: "Project (Recommended)"
```

## Step 7: Install All Selected Skills

```
Assistant: Installing selected skills to project...

Executing: npx skills add -y vercel-labs/agent-skills@react-performance-optimization
Executing: npx skills add -y vercel-labs/agent-skills@code-review

✅ Successfully installed 2 skills!

Location: ./.agents/skills/
  - react-performance-optimization
  - code-review

The skills are now available for this project.
```

## Complete Workflow Summary

```
[User describes multiple needs]
       ↓
[AI parses intent] → multiple searches
       ↓
[npx skills find ...] for each category
       ↓
[Present combined results]
       ↓
[AskUserQuestion with multiSelect: true]  ← Select multiple!
       ↓
[AskUserQuestion for scope]  ← Project vs Global
       ↓
[npx skills add -y <skill1> <skill2> ...]
       ↓
[Confirm all installations]
```

## Key Points

1. **Use `multiSelect: true`** - Allow selecting multiple skills at once
2. **Ask scope separately** - Project (default) vs Global
3. **Batch install** - Install all selected skills in sequence
4. **Default to project** - Use project-level unless user specifies global

## Default Configuration

| Setting | Default | When to Ask |
| ------- | ------- | ----------- |
| Scope   | Project | If user hasn't specified "global" or "all projects" |
| Agent   | All     | If user mentions specific IDE, use `-a <agent>` |

**Supported Agents**: `trae-cn`, `trae`, `cursor`, `claude-code`, `qwen-code`
