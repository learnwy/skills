# Phase 1: Intent Analysis & Skill Search

## Objective
Understand user needs and search for appropriate skills using natural language processing.

## Steps

### 1. Parse User Intent
- Extract key terms from the user's query
- Identify problem domain (e.g., "React performance", "code review", "debugging")
- Generate 1-3 focused search keywords
- Consider synonyms and related terms

**Examples of intent parsing**:
- "I need help with React performance" → keywords: `react, performance`
- "Find me a code reviewer" → keywords: `code-review, reviewer`
- "I want to optimize my SQL queries" → keywords: `sql, optimization`

### 2. Execute Search
```bash
npx skills find [keyword1][ keyword2][ keyword3]
```

**Example**:
```bash
npx skills find react performance
```

### 3. Parse and Format Results
- Extract: skill name, full name (owner/repo@skill), and URL
- Present in a clear, numbered list
- If no results, suggest broader or alternative search terms

## Example Interaction

**User**: "I need help optimizing my React app's performance"

**Assistant**:
```
I'll search for React performance optimization skills.

Executing: npx skills find react performance

Found 5 skills:

1. nickcrew/claude-ctx-plugin@react-performance-optimization
   https://skills.sh/nickcrew/claude-ctx-plugin/react-performance-optimization
   
2. dimillian/skills@react-component-performance
   https://skills.sh/dimillian/skills/react-component-performance

3. ...

Which skill would you like to install? (Enter number 1-5, or 'none' to search again)
```

## Edge Cases

### No Results
```
No skills found for "obscure-keyword"

Suggestions:
1. Try broader terms: "code-review" instead of "typescript-code-review"
2. Browse all skills: https://skills.sh/
3. Try different keywords
```

### Too Many Results
```
Found 50+ skills for "code"

The search is too broad. Please provide more specific keywords.
Examples: "code-review", "code-generation", "code-analysis"
```

### Network Error
```
❌ Network error during skill search.

Possible causes:
- No internet connection
- npm registry unreachable

Solutions:
1. Check internet connection
2. Try again: npx skills find [keywords]
3. Browse manually: https://skills.sh/
```

## Tools Used
- **RunCommand**: Execute `npx skills find`
- **AskUserQuestion**: Get user's skill selection
- **Grep/Parse**: Extract skill information from command output
