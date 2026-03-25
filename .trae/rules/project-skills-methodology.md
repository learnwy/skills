---
description: Project skills methodology - Problem-First approach for creating skills, agents, and installing capabilities
globs: skills/project-*/**/*.md
alwaysApply: false
---

# Project Skills Methodology

## Philosophy: Problem-First, Not Questionnaire-First

When users want to create project skills, agents, or install skills, they describe their **problems**, not asset types:

- "I keep writing the same component boilerplate"
- "I need someone to review my PRs automatically"
- "I want AI to help me with X"

## Workflow

Every project-* skill follows the same 3-stage flow:

```
[1. Understand]  → Infer from problem, analyze project
       ↓
[2. Confirm]     → AskUserQuestion (MANDATORY before any file creation)
       ↓
[3. Deliver]     → Generate files, verify, report
```

## Problem Classification

| Problem Pattern | Asset Type | Skill to Use |
|----------------|------------|--------------|
| "I write the same code every time" | Skill (Generator) | project-skill-writer |
| "I do the same check every time" | Skill (Validator) | project-skill-writer |
| "I follow the same steps every time" | Skill (Workflow) | project-skill-writer |
| "I need someone to evaluate/grade..." | Agent (Evaluator) | project-agent-writer |
| "I need someone to analyze/find..." | Agent (Analyzer) | project-agent-writer |
| "I want to do X with AI help" | Install a skill | project-skill-installer |
| "I want a rule for..." | Rule | trae-rules-writer |

## Activation Triggers

### project-skill-writer
- "I keep doing X manually"
- "Every time I need to Y..."
- "Can you create a skill for..."

### project-agent-writer
- "I need someone to automatically..."
- "Can you make AI do X every time..."
- "I want an agent that..."

### project-skill-installer
- "I want to do X with AI help"
- "Find a skill for...", "What's available for..."

### trae-rules-writer
- "I want a rule that enforces..."
- "Set up a coding standard for..."

## AskUserQuestion (Mandatory)

All project-* skills MUST use `AskUserQuestion` before generating files:

```json
{
  "questions": [{
    "question": "Based on your project, here's what I'll create. Proceed?",
    "header": "Confirm",
    "options": [
      { "label": "{asset-name} (Recommended)", "description": "{what it does}" },
      { "label": "Adjust", "description": "Let me refine the design" },
      { "label": "Skip", "description": "Don't create anything" }
    ]
  }]
}
```

## Path Rules

- Path discovery is the LAST step, not the first
- Always project-relative — NEVER global paths (`~/.trae/`, `~/.claude/`)
- Detect IDE markers (`.trae/`, `.claude/`, `.cursor/`) to determine convention

## Quality Gates

Before delivering any project asset:

- [ ] Has meaningful triggers (not just filename)
- [ ] Output path is project-relative
- [ ] Frontmatter has name and description
- [ ] Workflow/process is executable
- [ ] Dependencies declared in Prerequisites section
