# Command: find

Search for skills interactively from the community repository.

## Usage

```bash
npx skills find [query]
```

## Parameters

| Parameter | Description                             |
| --------- | --------------------------------------- |
| `query`   | Optional keyword(s) to search for       |

## Examples

```bash
npx skills find                   # Interactive search
npx skills find typescript        # Search by keyword
npx skills find react performance # Multiple keywords
```

## Workflow

### Step 1: Parse User Intent

Extract key terms from user's query:

| User Says                             | Keywords to Use        |
| ------------------------------------- | ---------------------- |
| "I need help with React performance"  | `react, performance`   |
| "Find me a code reviewer"             | `code-review`          |
| "I want to optimize my SQL queries"   | `sql, optimization`    |

Generate 1-3 focused search keywords. Consider synonyms and related terms.

### Step 2: Execute Search

```bash
npx skills find [keywords]
```

### Step 3: Parse Output and Present Results

Extract from output:
- Skill name
- Full name (owner/repo@skill)
- URL (skills.sh link)

Present in numbered list for selection:

```
Found 5 skills:

1. owner/repo@skill-name
   https://skills.sh/owner/repo/skill-name

2. another/repo@another-skill
   https://skills.sh/another/repo/another-skill
...
```

### Step 4: User Selection with AskUserQuestion

**IMPORTANT**: Use `AskUserQuestion` with `multiSelect: true` to allow installing multiple skills:

```json
{
  "questions": [{
    "question": "Which skill(s) would you like to install? (can select multiple)",
    "header": "Install",
    "options": [
      {"label": "skill-name-1", "description": "owner/repo - Brief description"},
      {"label": "skill-name-2", "description": "owner/repo - Brief description"},
      {"label": "skill-name-3", "description": "owner/repo - Brief description"},
      {"label": "Search again", "description": "Try different keywords"}
    ],
    "multiSelect": true
  }]
}
```

### Step 5: Ask Installation Scope (if not specified)

If user hasn't specified global vs project:

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

**Defaults**:
- **Scope**: Project-level (no `-g` flag) unless user says "global"
- **Agent**: `trae` unless user specifies another IDE

## Edge Cases

### No Results

```
No skills found for "obscure-keyword"

Suggestions:
1. Try broader terms
2. Browse all skills: https://skills.sh/
3. Try different keywords
```

### Too Many Results

```
Found 50+ skills - search too broad.
Please provide more specific keywords.
```

### Network Error

```
❌ Network error during skill search.
1. Check internet connection
2. Try again: npx skills find [keywords]
3. Browse manually: https://skills.sh/
```

## Tools Required

- **RunCommand**: Execute `npx skills find`
- **AskUserQuestion**: Get user's skill selection
