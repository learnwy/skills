---
name: project-skill-writer
description: "Create or update project-level skills by analyzing user problems and project context. NOT by asking questions - by understanding what users struggle with and designing solutions. Keeps outputs in project scope."
license: "MIT"
requires:
  - skill-creator
compatibility: "Any skill-enabled workspace"
metadata:
  author: "learnwy"
  version: "3.0"
---

# Project Skill Writer

**Design Philosophy**: Users don't know what a "skill" is or how to describe one. They know their **problems**. This skill transforms problem descriptions into working skills.

## Core Principle: Problem-First, Not Questionnaire-First

When a user says "I want a skill" or describes a recurring frustration, **DO NOT ask questions**. Instead:

1. **Understand the problem** - What does the user struggle with?
2. **Analyze the project** - What code, patterns, and conventions already exist?
3. **Design the solution** - Recommend a skill architecture
4. **Validate with user** - Show what will be created, get confirmation
5. **Generate and deliver** - Create the skill files

## L1: Problem Understanding (The Critical Step)

### Extract the Problem Statement

When user mentions any of these, activate this skill:
- "I keep doing X manually"
- "Every time I need to Y, I have to..."
- "Can you create a skill for..."
- "I wish AI would automatically..."
- Any repetitive workflow description

### Problem Classification

Classify the problem into a skill category:

| Problem Pattern | Skill Type | Example |
|----------------|------------|---------|
| "I write the same code every time" | Generator | Component generator, API client |
| "I do the same check every time" | Validator | Linter, security scanner |
| "I explain the same thing every time" | Informer | Architecture docs, API docs |
| "I follow the same steps every time" | Workflow | Deployment, release process |
| "I find and fix the same issues" | Remediation | Bug fixer, refactorer |

### Ask ONLY When Necessary

Only ask questions when:
- Multiple valid solutions exist and user preference matters
- Ambiguous terms need clarification ("what kind of component?")

NEVER ask: "What do you want the skill to do?" - you should infer this from their problem.

## L2: Project Analysis Pipeline

Run these in parallel (they're independent):

### Analysis 1: Tech Stack Detection

```
Detect from project:
- Language: from package.json, go.mod, Cargo.toml, Podfile, etc.
- Framework: React, Vue, SwiftUI, UIKit, etc.
- Build tools: npm, yarn, pod, cargo, etc.
```

### Analysis 2: Convention Detection

```
Find in existing code:
- Naming patterns: kebab-case, PascalCase, snake_case
- File organization: src/, lib/, internal/
- Import patterns: relative vs alias
```

### Analysis 3: Existing Assets

```
Check for:
- .trae/skills/ - existing skills
- .trae/rules/ - existing rules
- scripts/ - automation scripts
- .github/workflows/ - CI/CD
```

### Analysis 4: Pattern Discovery

```
Look for:
- Repeated code structures (component patterns)
- Similar files that could be templates
- Common import/order patterns
```

## L3: Skill Design

Based on Problem + Project Analysis, design the skill:

### Design Output Template

For each skill, define:

```
## Skill: {name}

### Problem Solved
{1-sentence description of the problem this skill solves}

### Triggers (auto-detected from problem description)
- {trigger 1}
- {trigger 2}

### Architecture
- Input: {what does skill take}
- Output: {what does skill produce}
- Process: {how does skill work}

### Project Integration
- Output path: {project-relative path}
- Dependencies: {required skills}
- Conventions: {from project analysis}

### Quality Criteria
- {measurable success criteria}
```

### Design Principles

1. **Single Responsibility**: One skill = one problem solved
2. **Convention-Aligned**: Use project's naming, structure, patterns
3. **Minimal Friction**: Triggers should match natural language
4. **Verifiable Output**: Clear success/failure criteria

## L4: Validation (Before Generation)

Before generating, show user:

```
I'll create a skill that:

Problem: {user's problem in their words}
Solution: {what the skill will do}
Triggers: {when it activates}
Output: {files it will create}

Is this correct? Should I adjust anything?
```

WAIT for user confirmation before generating.

## L5: Generation

Only after user confirmation:

1. Use `skill-creator` for scaffolding
2. Inject project-specific conventions
3. Set correct output paths
4. Include quality gates

## L6: Quality Gates

Before delivery, verify:

- [ ] Skill has meaningful triggers (not just filename)
- [ ] Output path is project-relative, not global
- [ ] Frontmatter has name and description
- [ ] Workflow is executable (not just steps)
- [ ] Dependencies are declared
- [ ] Examples show real usage

## L7: Output Contract

Always produce four sections:

1. **Problem Understanding**: What problem you identified
2. **Solution Design**: The skill architecture
3. **Deliverables**: Files created
4. **Usage Guide**: How to trigger and use the skill

## Reference: AskUserQuestion Triggers (Limited)

Only use AskUserQuestion when:

```
Condition: Multiple solutions exist
Example: "Generate React or Vue components?" (user didn't specify)

DO NOT use for:
- Asking what they want to name it (infer from problem)
- Asking where to put it (use project conventions)
- Asking what language/framework (detect from project)
```

## Agents

- [Project Scanner](agents/project-scanner.md): for project analysis
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md): for tech detection
- [Convention Detector](agents/convention-detector.md): for pattern extraction
- [Quality Validator](agents/quality-validator.md): for quality gates

## References

- [Path Discovery](references/path-discovery.md): Output path determination (load AFTER design)
- [Advanced Patterns](references/advanced-patterns.md): Skill architecture patterns (workflow, domain, template, multi-variant)
