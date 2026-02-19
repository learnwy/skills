# Example 1: Search and Install

This example shows the basic workflow of searching for and installing a skill.

## User Query

```
User: "I need help optimizing my React app's performance"
```

## Assistant Response

**Step 1: Parse Intent and Search**
```
I'll search for React performance optimization skills.

Executing: npx skills find react, performance
```

**Step 2: Present Results**
```
Found 5 skills:

1. nickcrew/claude-ctx-plugin@react-performance-optimization
   https://skills.sh/nickcrew/claude-ctx-plugin/react-performance-optimization
   Description: React performance optimization patterns

2. dimillian/skills@react-component-performance
   https://skills.sh/dimillian/skills/react-component-performance
   Description: Component-level performance improvements

3. ...

Which skill would you like to install? (Enter number 1-5)
```

**Step 3: User Selection**
```
User: "1"
```

**Step 4: Install**
```
Installing skill: react-performance-optimization

Executing: npx skills add -g -y nickcrew/claude-ctx-plugin@react-performance-optimization

✅ Installed to ~/.agents/skills/react-performance-optimization
```

**Step 5: Verify Installation**
```
Verifying installation...

Checking: ~/.agents/skills/react-performance-optimization
- SKILL.md ✓
- references/ ✓

✅ Successfully installed react-performance-optimization!

Location: ~/.agents/skills/react-performance-optimization

The skill is now available for the AI assistant to use.

If you want to customize this skill:
1. Create your own skill repository
2. Copy and modify the skill as needed: 
   cp -r ~/.agents/skills/react-performance-optimization ~/my-skills/
3. Manage versions with your own git workflow
4. Copy updated versions back to ~/.agents/skills/ when needed
```

## Complete Workflow Summary

1. User describes need → AI parses intent ("react, performance")
2. AI searches using `npx skills find`
3. AI presents formatted results
4. User selects skill → AI installs with `npx skills add`
5. AI verifies installation in ~/.agents/skills/
6. Success! Skill is ready to use

## User Customization Workflow (Optional)

If user wants to customize:
```
User: "I want to add my own examples to this skill"