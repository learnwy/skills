---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. Use when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Triggers on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', 'I keep doing the same thing every time'. Do NOT use for rules (use trae-rules-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.3"
---

# Trae Skill Writer

Analyze project patterns and design skill specs, then delegate to `skill-creator` for SKILL.md creation.

## Workflow

```
0. SIZE CHECK → Is project too large? If yes, ask user to specify folders
1. ANALYZE    → Scan project (spawn Project Scanner Agent)
2. IDENTIFY   → What workflows need automation?
3. DESIGN     → Structure skill requirements and triggers
4. DELEGATE   → Hand off to skill-creator (DO NOT write SKILL.md yourself)
5. VERIFY     → Validate skill after creation
```

## Delegation to skill-creator (CRITICAL)

**After DESIGN step, ALWAYS delegate to `skill-creator` for actual SKILL.md creation.**

This skill focuses on: **Analysis & Design**
- Project scanning
- Pattern identification
- Requirements gathering
- Skill spec creation

`skill-creator` handles: **Creation & Testing**
- Writing SKILL.md
- Test prompts
- Evaluations
- Iterative improvement

### Delegation Template

```
Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** {name}
**Purpose:** {what it does}
**Triggers:** {phrases that should activate it}
**Exclusions:** {when NOT to use}
**Workflow:** {numbered steps}
**Location:** .trae/skills/{name}/ or ~/.trae/skills/{name}/

Project context:
- Tech stack: {detected tech}
- Patterns found: {patterns}
- Existing automation: {scripts, CI/CD}
```

## Agent-Enhanced Analysis

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large/unfamiliar projects |
| ANALYZE | [Tech Stack Analyzer](agents/tech-stack-analyzer.md) | Domain-specific (iOS, Go, React) |
| VERIFY | [Quality Validator](agents/quality-validator.md) | Post-creation validation |

## Large Project Handling

If project is too large (>50 top-level items, monorepo):

1. **STOP** - Don't analyze entire project
2. **ASK** - Use `AskUserQuestion` for target folders
3. **SCOPE** - Only analyze user-specified folders

## Path Conventions

**NEVER use absolute paths.** Use relative paths or placeholders:

| Bad ❌ | Good ✅ |
|--------|---------|
| `/Users/john/project/src/` | `src/` or `{project_root}/src/` |
| `/home/dev/repo/.trae/` | `.trae/` |

Placeholders: `{project_root}`, `{git_root}`, `{skill_dir}`, relative paths

## Good Skill Candidates

- Multi-step workflows (code review, deployment)
- Complex domain logic (order processing)
- Repetitive tasks (report generation)
- Tool integration (database setup)

**NOT good for:** Simple one-step tasks, generic AI knowledge, continuous constraints (use rules).

## Example

```
User: "Create a skill for our code review process"

ANALYZE:
- Tech stack: TypeScript, React
- Found: scripts/lint.sh, .github/workflows/ci.yml

DESIGN (skill spec):
- Name: code-review
- Purpose: Automate code review workflow
- Triggers: 'review', 'PR', 'check this code'
- Exclusions: simple syntax questions
- Workflow: lint → test → checklist

DELEGATE:
"Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** code-review
**Purpose:** Automate code review workflow for TypeScript/React
**Triggers:** 'review', 'PR', 'check this code'
**Exclusions:** simple syntax questions
**Workflow:**
1. Run linter: npm run lint
2. Run tests: npm test
3. Check review checklist
**Location:** .trae/skills/code-review/

Project context:
- Tech stack: TypeScript, React
- Patterns: lint.sh, GitHub Actions CI"

VERIFY: After skill-creator completes
```

## References

- [Trae Skills Documentation](assets/trae-skills-docs.md) - Official docs
- [Best Practices](assets/trae-skill-best-practices.md) - Writing good skills

## Agents

- [Project Scanner](agents/project-scanner.md)
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md)
- [Convention Detector](agents/convention-detector.md)
- [Quality Validator](agents/quality-validator.md)
