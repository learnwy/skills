---
name: trae-skill-writer
description: Create and manage Trae IDE skills (SKILL.md files). Use when creating new skills for AI agent capabilities, editing existing skills, or setting up skill directories. Triggers on 'create skill', 'write skill', 'trae skill', 'new skill', 'SKILL.md', 'agent capability'.
---

# Trae Skill Writer

Create well-structured skills for Trae IDE to extend AI agent capabilities.

## Skill Types

| Type | Location | Scope |
|------|----------|-------|
| Global | `~/.trae/skills/` | All projects |
| Project | `.trae/skills/` | Current project only |

## Skill Structure

```
skill-name/
├── SKILL.md           # (Required) Core instructions
├── examples/          # (Optional) Input/output samples
├── templates/         # (Optional) Reusable templates
└── resources/         # (Optional) Scripts, references
```

## SKILL.md Format

```markdown
---
name: skill-name
description: What the skill does and when to use it. Include trigger keywords.
---

# Skill Name

## Description
What the skill accomplishes.

## When to Use
Specific scenarios that trigger this skill.

## Instructions
Step-by-step guidance for the agent.

## Examples (optional)
Input/output demonstrations.
```

## Key Principles

### 1. Concise Content
- Only add what AI doesn't already know
- Challenge each paragraph: "Does this justify its token cost?"
- Prefer examples over verbose explanations

### 2. Clear Triggers
- Put ALL trigger conditions in `description` field
- Include specific keywords and phrases
- The body only loads AFTER triggering

### 3. Progressive Disclosure
Skills load in three levels:
1. **Metadata** - Always in context (~100 words)
2. **SKILL.md body** - When triggered (<5k words)
3. **Resources** - As needed (unlimited)

## Workflow

1. Define skill purpose and trigger scenarios
2. Create skill directory:
   - Project: `.trae/skills/<skill-name>/`
   - Global: `~/.trae/skills/<skill-name>/`
3. Write SKILL.md with proper frontmatter
4. Add optional resources (examples, templates, scripts)
5. Test skill triggering in chat

## Description Field Best Practices

The `description` is the PRIMARY trigger mechanism. Include:
- What the skill does
- When to use it (specific scenarios)
- Trigger keywords/phrases

**Good example:**
```yaml
description: Create React components with TypeScript. Use when building UI components, forms, or interactive elements. Triggers on 'react component', 'tsx component', 'create form', 'build UI'.
```

**Bad example:**
```yaml
description: A skill for React development.
```

## Skills vs Rules vs MCP

| Feature | Loading | Purpose |
|---------|---------|---------|
| Rules | Full (always) | Constraints & guidelines |
| Skills | On-demand | Capabilities & workflows |
| MCP | Tools | External tool integration |

## Example: API Integration Skill

```markdown
---
name: rest-api-client
description: Generate REST API client code with proper error handling and types. Use when creating API services, fetch wrappers, or HTTP clients. Triggers on 'API client', 'fetch service', 'HTTP wrapper'.
---

# REST API Client Generator

## Workflow
1. Define API endpoints and response types
2. Generate typed client functions
3. Add error handling and retry logic
4. Include request/response logging

## Template

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function apiCall<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(response.statusText);
    return { data: await response.json() };
  } catch (error) {
    return { data: null as T, error: String(error) };
  }
}
\`\`\`
```

## Avoid Creating

- README.md
- CHANGELOG.md  
- INSTALLATION_GUIDE.md
- User-facing documentation

Skills are for AI agents, not human documentation.
