# Example 2: Create New Skill

This example shows how to create a custom skill from scratch.

## Scenario

User wants to create a skill for API testing assistance.

## User Query

```
User: "Help me create a skill for testing REST APIs"
```

## Assistant Response

**Step 1: Initiate Creation**
```
I'll help you create an API testing skill!

What would you like to name your skill? (use-kebab-case)
Suggestion: api-tester or rest-api-helper
```

**Step 2: User Provides Name**
```
User: "api-tester"
```

**Step 3: Execute Init**
```
Creating skill template...

Executing: npx skills init api-tester

✅ Created template at ./api-tester/SKILL.md
```

**Step 4: Guide Structure**
```
Your skill template is ready! Let's set it up:

1. Open ./api-tester/SKILL.md

2. Update the frontmatter:
   ---
   name: api-tester
   description: Helps test and validate REST API endpoints with automated checks
   ---

3. Add trigger conditions in "When to Use":
   - User mentions "test API" or "API testing"
   - User shows API endpoints to test
   - User asks for API validation help

4. Add your testing logic:
   - Parse API endpoint information
   - Generate test cases
   - Validate responses
   - Check status codes, headers, body format

Would you like me to help with any specific section?
```

**Step 5: User Edits and Tests**
```
User: "I've filled in the SKILL.md. How do I test it?"
```

**Step 6: Testing Guidance**
```
Great! Let's test your skill:

1. Copy to AI assistant skills directory:
   cp -r ./api-tester ~/.agents/skills/

2. Test by asking a question that should trigger it:
   "Can you help me test this API endpoint: GET /api/users"

3. If it works, commit to your repository:
   cd ~/my-skills-repo
   cp -r ./api-tester .
   git add api-tester/
   git commit -m "Add API tester skill"

4. To update later:
   - Edit in your repository
   - Copy updated version: cp -r ~/my-skills-repo/api-tester ~/.agents/skills/
```

## Complete Workflow Summary

1. User requests skill creation
2. AI helps choose skill name
3. AI executes `npx skills init`
4. AI guides through SKILL.md structure
5. User edits the skill
6. User tests by copying to ~/.agents/skills/
7. User manages in own git repository

## Template Generated

```markdown
---
name: api-tester
description: Helps test and validate REST API endpoints with automated checks
---

# API Tester

## When to Use This Skill

Activate when:
- User mentions "test API" or "API testing"
- User shows API endpoints to test
- User asks for help validating API responses

## Instructions

1. Parse the API endpoint information
   - Method (GET, POST, PUT, DELETE, etc.)
   - URL and parameters
   - Headers and authentication
   - Expected request/response format

2. Generate test cases
   - Happy path scenarios
   - Edge cases
   - Error conditions

3. Provide testing commands
   - curl examples
   - HTTP client code snippets
   - Validation checks

4. Analyze responses
   - Status codes
   - Response headers
   - Body format and content
   - Performance metrics

## Examples

[User provides endpoint]
→ [AI generates test cases]
→ [AI provides curl commands]
→ [AI validates responses]

## Tools Required
- RunCommand: Execute curl or HTTP requests
- Read: Read API specification files
```

## Result

User now has:
- ✅ Custom API testing skill
- ✅ Template ready for customization
- ✅ Clear testing workflow
- ✅ Managed in own repository

## Time: ~10 minutes
## Outcome: Fully functional custom skill
