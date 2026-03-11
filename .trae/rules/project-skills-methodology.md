---
description: Project skills methodology - Problem-First approach for creating skills, agents, and installing capabilities
globs: skills/project-*/**/*.md
alwaysApply: false
---

# Project Skills Methodology

## Philosophy: Problem-First, Not Questionnaire-First

When users want to create project skills, agents, or install skills, they don't say "I want a skill". They describe their problems:

- "I keep writing the same component boilerplate"
- "I need someone to review my PRs automatically"
- "I want AI to help me with X"

Our skills should:
1. **Understand the problem** first - don't ask questions upfront
2. **Analyze the project** - detect tech stack, conventions, existing assets
3. **Design the solution** - propose skill/agent architecture
4. **Validate with user** - show what will be created, get confirmation
5. **Generate and deliver** - create the files

## Problem Classification

| Problem Pattern | Asset Type | Example |
|----------------|------------|---------|
| "I write the same code every time" | Skill (Generator) | Component generator |
| "I do the same check every time" | Skill (Validator) | Linter, security scanner |
| "I explain the same thing every time" | Skill (Informer) | Documentation generator |
| "I follow the same steps every time" | Skill (Workflow) | Deployment process |
| "I need someone to evaluate/grade..." | Agent (Evaluator) | Code reviewer |
| "I need someone to analyze/find..." | Agent (Analyzer) | Bug finder |
| "I want to do X with AI help" | Installer Goal | Find matching skill |

## Activation Triggers

### Skill Writer
- "I keep doing X manually"
- "Every time I need to Y..."
- "Can you create a skill for..."
- "I wish AI would automatically..."

### Agent Writer
- "I need someone to automatically..."
- "Can you make AI do X every time..."
- "I want an agent that..."
- "Someone to constantly monitor..."

### Skill Installer
- "I want to do X with AI help"
- "Can AI help me with..."
- "How do I set up..."
- "What's available for..."

## Flow: Path Discovery is LAST

```
Correct Flow:
1. Understand user's problem/goal
2. Analyze project (tech stack, conventions, patterns)
3. Design solution (skill/agent/installation plan)
4. Validate with user (show what will be created)
5. Only THEN: Determine output path

Wrong Flow:
1. Ask where to put it
2. Then design solution
3. Then generate
```

## Quality Gates

Before delivering any project asset, verify:

- [ ] Asset has meaningful triggers (not just filename)
- [ ] Output path is project-relative, never global (no ~/.trae/, ~/.claude/)
- [ ] Frontmatter has name and description
- [ ] Workflow/process is executable
- [ ] Dependencies are declared
- [ ] Examples show real usage

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Ask questions first | User doesn't know what they want | Infer from problem description |
| Ask path first | Delays real work | Use project conventions |
| Generate without validation | Wrong deliverable | Show design first, get confirmation |
| Use global paths | Pollutes user home | Always project-relative |
| Generic templates | Don't match project | Analyze project first |

## References

- project-skill-writer: Creating project-level skills
- project-agent-writer: Creating project-level agents
- project-skill-installer: Installing/configuring skills
