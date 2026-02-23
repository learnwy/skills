# Skills Repository Agent

This repository contains reusable skills following the [Agent Skills Specification](https://agentskills.io/specification).

## Repository Structure

```
skills/
├── AGENT.md              # This file - project guidelines
├── LICENSE
└── skills/               # Individual skill directories
    ├── requirement-workflow/
    └── skill-finder/
```

## Agent Skills Specification

### Directory Structure

A skill is a directory containing at minimum a `SKILL.md` file:

```
{skill-name}/
├── SKILL.md              # REQUIRED: Skill definition
├── scripts/              # Optional: Executable code
├── references/           # Optional: Additional documentation
└── assets/               # Optional: Static resources (templates, data)
```

### SKILL.md Format

```markdown
---
name: "{skill-name}"
description: "{What it does and when to use it}"
license: "Apache-2.0"                    # Optional
compatibility: "Requires git, docker"    # Optional
metadata:                                 # Optional
  author: "example-org"
  version: "1.0"
---

# {Skill Title}

{Instructions, examples, edge cases}
```

### Required Fields

| Field | Constraints |
|-------|-------------|
| `name` | 1-64 chars. Lowercase letters, numbers, hyphens only. Must match directory name. |
| `description` | 1-1024 chars. MUST describe what + when to use. |

### name Field Rules

```yaml
# ✅ Valid
name: pdf-processing
name: data-analysis
name: code-review

# ❌ Invalid
name: PDF-Processing    # uppercase not allowed
name: -pdf              # cannot start with hyphen
name: pdf--processing   # consecutive hyphens not allowed
```

### description Field Best Practice

```yaml
# ✅ Good - describes what AND when
description: "State-machine driven orchestrator for structured software development. Triggers: 'build a feature', 'fix this bug', 'implement', 'develop'."

# ❌ Poor - too vague
description: "Helps with development."
```

## Progressive Disclosure

Skills should be structured for efficient context usage:

| Level | Token Budget | When Loaded |
|-------|--------------|-------------|
| **Metadata** | ~100 tokens | Startup (all skills) |
| **Instructions** | < 5000 tokens | Skill activation |
| **Resources** | As needed | On demand |

**Guidelines:**
- Keep `SKILL.md` under **500 lines**
- Move detailed reference material to `references/`
- Scripts and assets load only when needed

## Our Extensions

Beyond the official spec, this repo uses:

### agents/ Directory

For agent injection system:
```
{skill-name}/
└── agents/
    ├── AGENTS.md         # Agent index
    └── {agent-name}.md   # Individual agent definitions
```

### hooks.yaml

Default hook configuration:
```yaml
hooks: {}
agents:
  pre_stage_ANALYZING:
    - agent: "risk-auditor"
      required: false
```

### Script Path Convention

**All script paths are relative to `{skill_root}` (the SKILL.md directory).**

```bash
# AI must resolve actual path before running:
{skill_root}/scripts/init-workflow.sh -r /project

# In docs, use relative paths:
./scripts/init-workflow.sh -r /project

# Note in references:
> All `./scripts/` paths are relative to `{skill_root}`. Use absolute path in execution.
```

## Development Guidelines

### Creating a New Skill

1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with valid frontmatter
3. Verify name matches directory name
4. Keep SKILL.md < 500 lines
5. Add `references/` for detailed docs
6. Add `scripts/` for executable code

### Modifying Existing Skills

1. Validate frontmatter fields
2. Keep description under 1024 chars
3. Ensure name follows naming rules
4. Test script path conventions
5. Check line count (< 500 recommended)

### Code Style

- No comments unless explicitly requested
- English for code, match user language for docs
- Keep files focused and single-purpose

## Checklist

Before committing skill changes:

- [ ] `name` field matches directory name
- [ ] `name` is lowercase with hyphens only
- [ ] `description` describes what AND when to use
- [ ] `description` < 1024 characters
- [ ] SKILL.md < 500 lines
- [ ] Script paths documented with `{skill_root}` convention
- [ ] Detailed content in `references/` not SKILL.md

## Available Skills

### requirement-workflow

State-machine driven orchestrator for structured software development.

```yaml
name: requirement-workflow
description: "State-machine driven orchestrator for structured software development. Supports skill/agent injection at each stage. Triggers: 'build a feature', 'fix this bug', 'implement', 'develop', 'refactor'."
```

### skill-finder

Intelligent skill discovery and installation assistant.

```yaml
name: skill-finder
description: "Intelligent skill discovery and installation assistant. Helps users find community skills and install them."
```
