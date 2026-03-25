---
description: Personal Skills Repository overview
alwaysApply: true
---

# Personal Skills Repository

## Goal

This repository stores and maintains personal AI skills, agents, and supporting rules.

## Structure

```
skills/                           # Repository root
├── .trae/rules/                  # Project rules (this directory)
├── agents/                       # Universal methodology agents
│   ├── problem-definer/
│   ├── story-mapper/
│   ├── domain-modeler/
│   ├── architecture-advisor/
│   ├── responsibility-modeler/
│   ├── spec-by-example/
│   ├── tdd-coach/
│   ├── refactoring-guide/
│   ├── legacy-surgeon/
│   ├── test-strategist/
│   └── AGENTS.md
├── skills/                       # Runnable skill modules
│   ├── ai-brain/                 # Cross-session memory system
│   ├── english-learner/          # Vocabulary learning assistant
│   ├── figma-node-fetcher/       # Figma design data fetcher
│   ├── knowledge-consolidation/  # Knowledge persistence
│   ├── project-agent-writer/     # Create project-level agents
│   ├── project-skill-installer/  # Install skills into projects
│   ├── project-skill-writer/     # Create project-level skills
│   ├── requirement-workflow/     # SDD development workflow
│   ├── software-methodology-toolkit/  # Methodology agents (fallback)
│   └── trae-rules-writer/        # Create Trae IDE rules
└── AGENT.md, CLAUDE.md, LICENSE
```

## Categories

**agents/**: Universal methodology agents (problem-definer, story-mapper, etc.). These are the canonical copies; adapted versions live inside skills.

**skills/**: Runnable skill modules, each with its own SKILL.md, scripts, and supporting files.

## Skill Layout

```
skills/{name}/
├── SKILL.md          # Skill definition (required)
├── scripts/          # CJS scripts (Node.js >= 18)
├── evals/            # Evaluation test cases
├── agents/           # Skill-specific agents
├── assets/           # Templates, static files
├── references/       # Reference documentation
└── examples/         # Usage examples
```

## Conventions

- **Scripts**: CommonJS (.cjs) with `#!/usr/bin/env node` and `'use strict'`
- **Language**: All skill documents in English (see skills-english-only rule)
- **Paths**: Always project-relative, never global
- **Prerequisites**: Listed as 2nd or 3rd section in every SKILL.md

## Usage

**Users**: AI selects skills automatically based on triggers in SKILL.md descriptions.
**Developers**: Add or update `skills/{name}/SKILL.md`.
