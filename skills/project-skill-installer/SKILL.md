---
name: project-skill-installer
description: "Install or configure project-level skills by understanding what users want to accomplish. NOT by asking where to install - by understanding the goal and finding the right skill. Keeps outputs in project scope."
priority: 100
requires:
  - find-skills
compatibility: "Any skills-enabled workspace"
metadata:
  author: "learnwy"
  version: "2.0"
---

# Project Skill Installer

**Design Philosophy**: Users don't say "install a skill". They say "I want to do X" or "help me with Y". This skill transforms goal descriptions into skill installation plans.

## Core Principle: Goal-First, Not Installation-First

When a user mentions any of these, activate this skill:
- "I want to do X with AI help"
- "Can AI help me with..."
- "How do I set up..."
- "What's available for..."
- "I need a skill that..."
- "Help me use..."

**DO NOT** ask "Which skill do you want to install?" - understand their goal first.

## L1: Goal Understanding

### Goal Classification

| User Goal | Skill Category | Action |
|-----------|---------------|--------|
| "I want AI to generate..." | Generator Skills | Find/install generator |
| "I want AI to check/validate..." | Validator Skills | Find/install validator |
| "I want AI to explain..." | Informer Skills | Find/install informer |
| "I want AI to do X automatically" | Workflow Skills | Find/install workflow |
| "I don't know what's available" | Discovery | Use find-skills to explore |

### Extract Installation Requirements

From user's goal, determine:
- **What capability**: What do they want AI to do?
- **Project context**: What language/framework are they using?
- **Integration**: Where should the skill live?

## L2: Project Analysis Pipeline

Run in parallel with goal understanding:

### Analysis 1: Existing Skills

```
Check:
- .trae/skills/ - what's already installed
- .claude/skills/ - alternative location
- package.json - skill dependencies
```

### Analysis 2: Project Context

```
Detect:
- Language: from package.json, go.mod, etc.
- Framework: React, Vue, Swift, etc.
- Build tool: npm, yarn, cargo, etc.
```

### Analysis 3: Available Skills

```
Use find-skills to discover:
- What skills match the user's goal
- What's already installed
- What needs to be installed
```

## L3: Installation Plan Design

Based on Goal + Analysis, design the installation:

```
## Installation Plan

Goal: {user's goal in their words}
Needed: {skill that fulfills the goal}
Current Status: {installed / not installed / partially installed}
Action: {install / configure / update / nothing needed}

### Installation Steps
1. {step 1}
2. {step 2}
...

### Configuration (if needed)
- Output path: {project-relative path}
- Project integration: {how to integrate with project}
```

## L4: Validation (Before Execution)

Show user BEFORE installing:

```
I'll help you achieve: {user's goal}

Plan:
- Skill needed: {name}
- Current status: {installed/not installed}
- Action: {what will happen}
- Location: {where skill will be placed}

Is this correct? Should I adjust anything?
```

WAIT for confirmation before delegating to find-skills.

## L5: Delegation to find-skills

After user confirmation:

1. Prepare delegation inputs:
   - `runtime_target`: detected from project
   - `project_root`: verified project path
   - `project_only`: true (always)
   - `requested_skill_intent`: user's goal

2. Delegate to find-skills with project-only constraint

3. Verify installation succeeded

## L6: Quality Gates

Before delivery, verify:
- [ ] Skill is actually needed (not already available)
- [ ] Installation target is project-relative, not global
- [ ] Project context is preserved
- [ ] User's goal can be fulfilled

## L7: Output Contract

Always produce:
1. **Goal Understanding**: What the user wants to accomplish
2. **Installation Plan**: What will be installed/configured
3. **Execution Summary**: What happened
4. **Usage Guide**: How to use the installed skill

## Reference: AskUserQuestion Triggers (Limited)

Only use AskUserQuestion when:
- Multiple skills match the goal and user needs to choose
- User's goal is vague and needs clarification

DO NOT use for:
- Asking where to install (use project conventions)
- Asking which specific skill (infer from goal)

## Prerequisites

- Requires `find-skills` to be globally available
- If missing, prompt user: `npx skills add find-skills -g -y`

## References

- [Path Discovery](references/path-discovery.md): Output paths (load AFTER plan design)
- [Agent Skills Core Practices](references/agent-skills-core-practices.md): Quality guidelines
