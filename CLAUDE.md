# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a skills repository containing reusable AI capabilities following the [Agent Skills Specification](https://agentskills.io/specification). Each skill is a self-contained directory with a `SKILL.md` file that defines its functionality, triggers, and usage patterns.

## Repository Structure

```
skills/
├── AGENT.md              # Project guidelines and skill specification
├── LICENSE               # MIT License
└── skills/               # Individual skill directories
    ├── english-learner/          # English learning utilities
    ├── english-prompt-optimizer/ # Prompt optimization for English
    ├── knowledge-consolidation/  # Knowledge management
    ├── memory-manager/           # Cross-session AI memory (CRITICAL)
    ├── requirement-workflow/     # Software development orchestrator
    ├── skill-finder/             # Skill discovery and installation
    ├── trae-agent-writer/         # Trae IDE agent creation
    ├── trae-rules-writer/         # Trae IDE rules creation
    └── trae-skill-writer/         # Trae IDE skill creation
```

## Essential Commands

### Session Start (ALWAYS REQUIRED)
The memory-manager skill MUST be loaded at the start of every session:
```bash
# Read these files first to maintain continuity
cat {skill_dir}/memory/SOUL.md    # AI identity and context
cat {skill_dir}/memory/USER.md    # User preferences and history
```

### Working with Skills

#### Finding and Installing Skills
```bash
npx skills find [query]           # Search for skills
npx skills add -g <package>       # Install globally
npx skills add <package>          # Install to project
npx skills list -g                # List global skills
npx skills remove -g <skill>      # Remove skill
```

#### Creating New Skills
```bash
npx skills init <name>            # Create new skill template
```

#### Managing Skills in Development
Skills are located in two scopes:
- Global: `~/.agents/skills/` or `~/.trae/skills/`
- Project: `./.agents/skills/` or `./.trae/skills/`

### Working with requirement-workflow
The requirement-workflow skill provides structured software development:
```bash
{skill_root}/scripts/init-workflow.sh -r <project_root> -n <name> -t <type> -l <level>
# Types: feature, bugfix, refactor, hotfix
# Levels: L1 (quick), L2 (standard), L3 (complex)

{skill_root}/scripts/advance-stage.sh -r <project_root>  # Advance workflow stage
{skill_root}/scripts/get-status.sh -r <project_root>     # Check current stage
```

### Testing Skills
There are no automated tests. Test skills by:
1. Loading them in an AI assistant
2. Verifying triggers work as specified
3. Checking scripts execute correctly
4. Validating output format

## Architecture

### Skill Structure
Each skill follows this structure:
```
{skill-name}/
├── SKILL.md              # REQUIRED: Skill definition (<500 lines)
├── scripts/              # Optional: Executable code
├── references/           # Optional: Detailed documentation
├── assets/                # Optional: Templates and resources
└── agents/                # Optional: Agent definitions
    ├── AGENTS.md         # Agent index
    └── {agent-name}.md   # Individual agents
```

### Skill Frontmatter
All SKILL.md files must include:
```yaml
---
name: skill-name              # 1-64 chars, lowercase, hyphens only
description: What it does and when to use it (1-1024 chars)
license: Apache-2.0           # Optional
compatibility: "Requires git, docker"  # Optional
metadata:                      # Optional
  author: "example-org"
  version: "1.0"
---
```

### Memory Management
The memory-manager skill is critical for session continuity:
- **SOUL.md**: AI's identity, principles, and learned wisdom
- **USER.md**: User preferences, context, and interaction history
- **history/**: Session-by-session records
- **archive/**: Consolidated historical data

### Key Skills

#### memory-manager
- Always load first in every session
- Maintains AI identity and user context across sessions
- Saves session history and consolidates learnings
- Memory stored in `{skill_dir}/memory/`

#### requirement-workflow
- State-machine orchestrator for software development
- Stages: ANALYZING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING
- Supports agent/skill injection at each stage
- Creates structured documents for each stage

#### skill-finder
- Discovers and installs community skills
- Uses `npx skills` CLI for management
- Supports global and project-scoped installations

#### trae-*
- trae-skill-writer: Creates reusable skills for workflows
- trae-rules-writer: Creates AI behavior rules
- trae-agent-writer: Creates specialized AI agents

## Development Guidelines

### Creating New Skills
1. Create directory: `skills/{skill-name}/`
2. Create `SKILL.md` with valid frontmatter
3. Ensure name matches directory (lowercase, hyphens only)
4. Keep SKILL.md under 500 lines
5. Move detailed docs to `references/`
6. Test scripts with `{skill_root}` path convention

### Script Path Convention
All script paths in documentation are relative to `{skill_root}`:
```bash
# In documentation:
./scripts/init-workflow.sh

# Actual execution requires full path:
{skill_root}/scripts/init-workflow.sh
```

### Writing Style
- Code: English, no comments unless requested
- Documentation: Match user language preference
- Memory files: Dense, telegraphic style, under 2000 tokens each

## Common Workflows

### Starting a New Project
1. Load memory-manager for continuity
2. Use requirement-workflow for structured development
3. Install relevant skills with skill-finder
4. Create project-specific rules with trae-rules-writer

### Automating Repetitive Tasks
1. Identify patterns in project
2. Create skill with trae-skill-writer
3. Test skill with real scenarios
4. Install globally if reusable

### Session Management
1. Always read SOUL.md and USER.md at start
2. Update memory files at session end
3. Consolidate history every 3+ sessions

## Important Notes

- The memory-manager skill is CRITICAL for session continuity
- Skills are on-demand loaded to optimize context usage
- Script paths must be resolved from `{skill_root}` before execution
- Keep SKILL.md files concise (<500 lines) for efficient loading
- Use skill-finder to discover and install community skills
- Use requirement-workflow for structured, multi-stage development tasks