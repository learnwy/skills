# Example: Create New Skill

Complete workflow for creating a custom skill with `AskUserQuestion`.

## User Query

```
User: "Help me create a skill for testing REST APIs"
```

## Step 1: Use AskUserQuestion for Skill Name

**CRITICAL**: Use `AskUserQuestion` to get skill name:

```json
{
  "questions": [{
    "question": "What would you like to name your skill? (use kebab-case)",
    "header": "Skill Name",
    "options": [
      {"label": "api-tester", "description": "Suggested: General API testing"},
      {"label": "rest-api-helper", "description": "Suggested: REST-specific helper"},
      {"label": "http-validator", "description": "Suggested: HTTP validation focus"}
    ],
    "multiSelect": false
  }]
}
```

## Step 2: User Selects Name

```
User selected: "api-tester"
```

## Step 3: Execute Init

```
Assistant: Creating skill template...

Executing: npx skills init api-tester

✅ Created template at ./api-tester/SKILL.md
```

## Step 4: Guide Structure

```
Your skill template is ready! Here's the structure:

./api-tester/
└── SKILL.md

Required sections in SKILL.md:

1. Frontmatter (YAML):
   ---
   name: api-tester
   description: Helps test and validate REST API endpoints
   ---

2. When to Use This Skill:
   - User mentions "test API" or "API testing"
   - User shows API endpoints to test
   - User asks for API validation help

3. Instructions:
   - Parse API endpoint information
   - Generate test cases
   - Validate responses
   - Check status codes, headers, body

Would you like me to help edit any specific section?
```

## Step 5: Testing Guidance

```
User: "I've filled in the SKILL.md. How do I test it?"
```

```
Assistant: Great! To test your api-tester skill:

1. **Verify skill loads**:
   - Open a new chat session
   - Ask: "Can you help me test an API?"
   - The skill should activate based on triggers

2. **Test with a sample request**:
   - Provide an endpoint: "Test GET https://api.example.com/users"
   - Verify the skill follows your instructions

3. **Iterate and refine**:
   - Adjust SKILL.md instructions as needed
   - Test edge cases (POST, PUT, DELETE)
```

## Step 6: Removal Example

To remove a skill you no longer need:

```bash
# Delete the skill directory
rm -rf ./api-tester/

# Or move it elsewhere for backup
mv ./api-tester/ ~/skill-backups/
```

**Note**: Simply removing the skill directory will disable it. No uninstall command is needed.