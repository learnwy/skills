---
name: project-skill-installer
description: "Install or configure project-level skills by understanding what users want to accomplish. NOT by asking where to install - by understanding the goal and finding the right skill. Keeps outputs in project scope."
metadata:
  author: "learnwy"
  version: "3.0"
---

# Project Skill Installer

Analyzes a project's tech stack, workflows, and pain points, then **recommends** the best skills to install. Always confirms with the user via `AskUserQuestion` before installing anything.

> **Core Principle**: Understand the project first, recommend second, install only after user confirms.

## When to Use

**Invoke when:**

- User says "install a skill", "find a skill for X", "what skills would help this project"
- User describes a capability gap ("I wish AI would automatically...")
- User wants to set up a new project with skills

**Do NOT invoke when:**

- User wants to **create** a new skill (delegate to `project-skill-writer`)
- User wants to **create** an agent (delegate to `project-agent-writer`)
- User wants to **create** a rule (delegate to `trae-rules-writer`)

## Prerequisites

- Node.js >= 18
- Requires `find-skills` or `trae-skill-finder` skill to be available globally
- If missing, prompt user: `npx skills add find-skills -g -y`

## Workflow

```
[L1: Goal Understanding]
         ↓
[L2: Project Analysis]
         ↓
[L3: Skill Discovery]
         ↓
[L4: Recommendation]  ← AskUserQuestion (MUST confirm)
         ↓
[L5: Installation]
         ↓
[L6: Verification]
```

## L1: Goal Understanding

Extract what the user needs — do NOT ask "what skill do you want?" Instead, understand:

| User Says | Real Need |
|-----------|-----------|
| "install a skill" | Vague — proceed to L2 analysis to find gaps |
| "find a skill for testing" | Specific domain — search for testing skills |
| "set up this project with skills" | Full audit — analyze project and recommend suite |
| "I keep doing X manually" | Automation gap — find skill that addresses X |

## L2: Project Analysis

Scan the project to build a tech profile. Use search tools in parallel:

### Detection Targets

| Signal | What to Look For | Tool |
|--------|-----------------|------|
| Language | File extensions (`.ts`, `.py`, `.swift`, `.go`) | Glob |
| Framework | package.json deps, Podfile, go.mod, Cargo.toml | Read |
| Build Tool | Makefile, webpack.config, vite.config, Bazel | Glob |
| Testing | jest.config, pytest.ini, XCTest, go test | Glob |
| CI/CD | .github/workflows/, Jenkinsfile, .gitlab-ci.yml | Glob |
| Existing Skills | .trae/skills/, .cursor/skills/ | Glob |
| Existing Rules | .trae/rules/ | Glob |

### Tech Profile Output

```
Project: {name}
Languages: TypeScript, Swift
Frameworks: React 18, UIKit
Build: Vite, Bazel
Testing: Jest, XCTest
CI: GitHub Actions
Existing Skills: [list]
Existing Rules: [list]
```

## L3: Skill Discovery

Based on the tech profile and user's goal, search for matching skills:

### Search Strategy

1. **Direct match**: Search by user's exact request → `npx skills find "<user_query>"`
2. **Tech match**: Search by detected tech stack → `npx skills find "react"`, `npx skills find "swift"`
3. **Gap match**: Search by detected workflow gaps → if no testing skill, search `npx skills find "testing"`

### Skill Sources (Priority Order)

1. **Local registry**: Check `~/.trae/skills/` and `~/.trae-cn/skills/` for already-installed global skills
2. **Community registry**: `npx skills find "<query>"` — searches skills.sh marketplace
3. **ByteDance registry**: `npx @tiktok-fe/skills find "<query>"` — searches internal registry (if available)

### Filtering Criteria

Reject skills that:
- Conflict with existing installed skills (same purpose)
- Don't match the project's language/framework
- Are global-only (this skill installs project-level)
- Have no description or are clearly low-quality

## L4: Recommendation (MUST USE AskUserQuestion)

**CRITICAL**: Before installing ANY skill, present recommendations via `AskUserQuestion`.

### Recommendation Format

For each recommended skill, prepare:

```
Skill: {name}
Purpose: {what it does, 1 sentence}
Why: {why it fits this project specifically}
Install: {command}
```

### AskUserQuestion Call

Use `AskUserQuestion` with:

```json
{
  "questions": [{
    "question": "Based on your {language/framework} project, I recommend these skills. Which would you like to install?",
    "header": "Skills",
    "multiSelect": true,
    "options": [
      {
        "label": "{skill-1-name} (Recommended)",
        "description": "{1-sentence: what it does + why it fits}"
      },
      {
        "label": "{skill-2-name}",
        "description": "{1-sentence: what it does + why it fits}"
      },
      {
        "label": "Skip",
        "description": "Don't install any skills right now"
      }
    ]
  }]
}
```

**Rules**:
- Put the most relevant skill first with "(Recommended)"
- Max 4 options (3 skills + Skip)
- Include "Skip" as last option
- Use `multiSelect: true` to allow multiple installs
- Never install without user confirmation

## L5: Installation

After user confirms which skills to install:

### Install Path Discovery

Determine project-relative install path using [Path Discovery](references/path-discovery.md):

1. Check for existing `.trae/skills/` in project root
2. Check for `.cursor/skills/` or `.claude/skills/`
3. Default to `.trae/skills/`

### Install Commands

```bash
# Community skills (skills.sh)
npx skills add <package-name> --path <project-root>/.trae/skills/

# ByteDance internal skills
npx @tiktok-fe/skills add <package-name> --agent trae-cn --path <project-root>/.trae/skills/
```

### Install Rules

- **ALWAYS** project-relative path — NEVER `~/.trae/skills/` or other global paths
- Install one skill at a time, verify each before proceeding to next
- If install fails, report error and suggest manual install steps

## L6: Verification

After installation, verify:

- [ ] Skill directory exists at expected path
- [ ] SKILL.md is present and readable
- [ ] Skill's description mentions relevant triggers
- [ ] No conflicts with existing skills

Report to user:

```
Installed {N} skill(s):
  ✓ {skill-1} → {path}
  ✓ {skill-2} → {path}

To use: just describe what you need, the skill will activate automatically.
```

## Error Handling

| Issue | Solution |
|-------|----------|
| `find-skills` not available | Prompt: `npx skills add find-skills -g -y` |
| No skills found for query | Suggest creating a custom skill via `project-skill-writer` |
| User requests global install | Reject, explain project-scope boundary, offer project-relative alternative |
| User requests agent/rule creation | Route to `project-agent-writer` or `trae-rules-writer` |
| Install command fails | Show error, suggest `npx skills add <name> --path <path>` manually |
| Skill conflicts with existing | Show comparison, ask user which to keep |

## Boundary Enforcement

This skill ONLY handles:
- ✅ Analyzing project for skill needs
- ✅ Searching skill registries
- ✅ Recommending skills with user confirmation
- ✅ Installing skills to project-relative paths
- ✅ Verifying installation

This skill does NOT handle:
- ❌ Creating new skills → `project-skill-writer`
- ❌ Creating agents → `project-agent-writer`
- ❌ Creating rules → `trae-rules-writer`
- ❌ Global installation (always project-scoped)

## References

- [Path Discovery](references/path-discovery.md) — Install path determination
- [Agent Skills Core Practices](references/agent-skills-core-practices.md) — Best practices for AI skills
