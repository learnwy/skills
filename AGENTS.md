# AGENTS.md

This file provides guidance to AI agents (Claude Code, Codex, Cursor, etc.) when working with this repository.

## Project Overview

Personal skills repository containing reusable AI capabilities following the [Agent Skills Specification](https://agentskills.io/specification). Each skill is a self-contained directory with a `SKILL.md` file defining its functionality, triggers, and usage patterns.

## Repository Structure

```
skills/                                    # Repository root
├── AGENTS.md                              # This file — project guidelines
├── CLAUDE.md                              # Claude-specific pointer (→ AGENTS.md)
├── LICENSE                                # MIT License
├── agents/                                # Universal methodology agents (canonical copies)
│   ├── AGENTS.md
│   ├── problem-definer/
│   ├── story-mapper/
│   ├── domain-modeler/
│   ├── architecture-advisor/
│   ├── responsibility-modeler/
│   ├── spec-by-example/
│   ├── tdd-coach/
│   ├── refactoring-guide/
│   ├── legacy-surgeon/
│   └── test-strategist/
└── skills/                                # Runnable skill modules
    ├── english-learner/                   # Vocabulary learning assistant
    ├── knowledge-consolidation/           # Persist conversation insights
    ├── llm-wiki/                          # Karpathy-style knowledge base
    ├── on-contradiction/                  # Mao's contradiction methodology
    ├── on-practice/                       # Mao's practice methodology
    ├── on-protracted-war/                 # Mao's protracted war methodology
    ├── project-agent-writer/              # Create project-level agents
    ├── project-skill-installer/           # Install skills into projects
    ├── project-skill-writer/              # Create project-level skills
    ├── requirement-workflow/              # SDD development orchestrator
    ├── software-methodology-toolkit/      # 10 methodology agents (fallback)
    ├── prompt-optimizer/                  # Pre-flight prompt analysis & improvement
    └── trae-rules-writer/                 # Create Trae IDE rules
```

## Skills by Category

### Methodology Skills (No Scripts — Pure Agent Frameworks)

| Skill | Description | Agents |
|-------|-------------|--------|
| **on-contradiction** | Mao's *On Contradiction* — structural analysis of opposing forces | decision-maker, problem-analyzer, report-writer |
| **on-practice** | Mao's *On Practice* — practice-cognition spiral for validation | decision-maker, problem-analyzer, report-writer |
| **on-protracted-war** | Mao's *On Protracted War* — staged strategy for long games | decision-maker, problem-analyzer, report-writer |
| **llm-wiki** | Karpathy's LLM Wiki — compounding knowledge base | ingestor, querier, linter, schema-writer |
| **software-methodology-toolkit** | 10 methodology agents (fallback when no specific skill matches) | problem-definer, story-mapper, domain-modeler, etc. |

### Development Workflow Skills

| Skill | Description | Has Scripts |
|-------|-------------|-------------|
| **requirement-workflow** | Spec-Driven Development: spec.md → tasks.md → implementation → verification | Yes (shell) |
| **project-skill-writer** | Create project-level skills with convention detection | No |
| **project-agent-writer** | Create project-level agents | No |
| **project-skill-installer** | Install skills into projects | No |
| **trae-rules-writer** | Create Trae IDE rules | No |

### Utility Skills

| Skill | Description | Has Scripts |
|-------|-------------|-------------|
| **english-learner** | Vocabulary learning with auto-intercept English coaching | Yes (CJS) |
| **knowledge-consolidation** | Persist conversation insights to project knowledges/ | Yes (CJS) |
| **prompt-optimizer** | Pre-flight prompt analysis & improvement (7-dimension scoring) | No |

## Skill Specification

### Directory Layout

```
{skill-name}/
├── SKILL.md              # REQUIRED: Skill definition
├── scripts/              # Optional: Executable code
├── references/           # Optional: Detailed documentation
├── assets/               # Optional: Templates and resources
└── agents/               # Optional: Sub-agent definitions
    ├── thinking/         #   Analysis/decision agents
    ├── writing/          #   Report/document agents
    └── operations/       #   Workflow operation agents
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name              # 1-64 chars, lowercase, hyphens only
description: "What it does and when to use it (1-1024 chars)"
metadata:
  author: "learnwy"
  version: "1.0"
  source: "optional source reference"
---
```

### Progressive Disclosure

| Level | Token Budget | When Loaded |
|-------|-------------|-------------|
| Metadata | ~100 tokens | Startup (all skills) |
| Instructions | < 5000 tokens | Skill activation |
| Resources | As needed | On demand |

### Script Conventions

- **CJS scripts**: `.cjs` with `#!/usr/bin/env node` and `'use strict'` (for skills requiring Node.js compatibility)
- **ESM scripts**: `.mjs` with Node.js >= 18 (for modern skill implementations)
- **Path convention**: All script paths are relative to `{skill_root}` (the SKILL.md directory)
- All skill documents in English

## Development Guidelines

### Creating a New Skill

1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with valid frontmatter
3. Verify name matches directory name (lowercase, hyphens only)
4. Include: When to Use, When NOT to Use, Prerequisites
5. Add agents to `agents/` if the skill has sub-agents
6. Add scripts to `scripts/` if needed

### Code Style

- No comments unless explicitly requested
- English for all skill documents and code
- Named exports, arrow functions for scripts
- Follow existing patterns in neighboring skills

### Testing

No automated test framework. Test skills by:
1. Loading them in an AI assistant
2. Verifying triggers work as specified
3. Checking scripts execute correctly
4. Validating output format

## Common Workflows

### Structured Development
Use `requirement-workflow` for multi-stage software development:
```
ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING
```

### Methodology Analysis
The Mao Zedong Trilogy provides three complementary lenses:
```
on-contradiction   → WHAT are the forces?      (Structure)
on-practice        → HOW do we verify?          (Process)
on-protracted-war  → WHEN do we act & evolve?   (Time/Strategy)
```

### Knowledge Management
```
knowledge-consolidation  → Save single conversation insights
llm-wiki                 → Build full compounding knowledge base
```

### Creating Project-Level Extensions
```
project-skill-writer     → Create a reusable skill for a project
project-agent-writer     → Create a specialized agent
trae-rules-writer        → Create AI behavior rules
project-skill-installer  → Install an existing skill into a project
```
