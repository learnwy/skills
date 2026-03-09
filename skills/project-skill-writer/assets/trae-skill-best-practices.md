# Best Practices for Writing Good Skills

> Source: https://docs.trae.ai/ide/best-practice-for-how-to-write-a-good-skill

## Overview

A well-written skill dramatically improves AI assistant effectiveness. This guide covers proven patterns for creating high-quality skills.

## Key Principles

### 1. Clear Purpose

Define exactly what the skill does in one sentence:
- Good: "Generate TypeScript interfaces from JSON data"
- Bad: "Help with TypeScript stuff"

### 2. Specific Triggers

Include explicit trigger phrases in the description:

```yaml
description: "Generate TypeScript interfaces from JSON. Triggers on: 'json to typescript', 'create interface from json', 'convert json to types'."
```

### 3. Structured Workflow

Break complex tasks into numbered steps:

```markdown
## Workflow

1. **Analyze Input**: Parse the JSON structure
2. **Identify Types**: Determine appropriate TypeScript types
3. **Generate Interfaces**: Create interface definitions
4. **Validate Output**: Ensure TypeScript compiles
```

### 4. Concrete Examples

Show real input/output pairs:

```markdown
## Examples

### Input
```json
{"name": "John", "age": 30, "active": true}
```

### Output
```typescript
interface User {
  name: string;
  age: number;
  active: boolean;
}
```
```

## Description Writing

The description is the most important field - it determines when the skill activates.

### Structure

```
[What it does] + [When to use] + [Trigger keywords]
```

### Good Descriptions

```yaml
# Specific and actionable
description: "Create React components with TypeScript. Use when building new UI components. Triggers on: 'create component', 'new component', 'react component'."

# Clear scope
description: "Generate unit tests for Python functions. Triggers on: 'write tests', 'test this function', 'create unit tests'."
```

### Bad Descriptions

```yaml
# Too vague
description: "Helps with coding tasks"

# No triggers
description: "A useful skill for developers"

# Too broad
description: "Does everything related to web development"
```

## Workflow Design

### Keep Steps Atomic

Each step should do one thing:

```markdown
## Workflow

1. Read the input file
2. Parse JSON content
3. Extract field names and types
4. Generate interface definition
5. Write to output file
6. Validate TypeScript syntax
```

### Handle Edge Cases

```markdown
## Edge Cases

- **Empty input**: Return empty interface
- **Nested objects**: Create nested interfaces
- **Arrays**: Use generic array types
- **Null values**: Use optional fields
```

### Include Decision Points

```markdown
## Workflow

1. Analyze input format
2. IF JSON → Parse as JSON
   ELSE IF YAML → Parse as YAML
   ELSE → Ask user for format
3. Generate TypeScript interfaces
```

## Asset Organization

```
skill-name/
├── SKILL.md              # Main skill definition
├── assets/
│   ├── template.md       # Output templates
│   └── config.json       # Default configurations
├── examples/
│   ├── basic-usage.md    # Simple examples
│   └── advanced-usage.md # Complex scenarios
└── references/
    ├── api-reference.md  # API documentation
    └── patterns.md       # Common patterns
```

## Testing Your Skill

### Activation Test

1. Start a new chat
2. Use trigger phrases from description
3. Verify skill activates

### Quality Test

1. Provide sample input
2. Check output matches expected format
3. Test edge cases

### Iteration

1. Note where skill fails
2. Add clarifying instructions
3. Update examples for edge cases

## Common Mistakes

### 1. Vague Instructions

❌ "Generate good code"
✅ "Generate TypeScript code following the project's existing patterns"

### 2. Missing Context

❌ "Create a component"
✅ "Create a React functional component with TypeScript, following the patterns in src/components/"

### 3. No Examples

❌ Just workflow steps
✅ Workflow steps + concrete input/output examples

### 4. Overlapping Triggers

❌ Two skills both triggered by "create file"
✅ Distinct triggers: "create component" vs "create utility"

## Skill Quality Checklist

- [ ] Description clearly states purpose
- [ ] Trigger keywords are specific and unique
- [ ] Workflow has numbered, atomic steps
- [ ] Examples show real input/output
- [ ] Edge cases are documented
- [ ] Assets are organized and referenced
- [ ] Skill activates correctly in testing
- [ ] Output matches expected quality

## Advanced Patterns

### Conditional Behavior

```markdown
## Workflow

1. Detect project type:
   - If `package.json` exists → Node.js project
   - If `requirements.txt` exists → Python project
   - If `Cargo.toml` exists → Rust project
2. Apply language-specific patterns
```

### Multi-Step Workflows

```markdown
## Workflow

### Phase 1: Analysis
1. Scan project structure
2. Identify existing patterns

### Phase 2: Generation
3. Create new files
4. Update imports

### Phase 3: Validation
5. Run linter
6. Run tests
```

### Reference External Docs

```markdown
## References

- [Official Docs](assets/official-docs.md) - Read for API details
- [Examples](examples/) - Reference for patterns
```
