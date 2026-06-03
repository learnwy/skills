---
name: lwy-project-skill-installer
description: "Use this skill when the user wants to install, add, or configure a skill in a project. Analyze the project's tech stack and workflow, then recommend and install the best-matching skill. Triggers: 'install skill', 'add skill', 'configure skill', 'set up skill', 'enable skill', 'use skill in project', 'project skill', or when the user asks how to bring an existing skill capability into the current workspace."
metadata:
  author: "learnwy"
  version: "3.0"
---

# Project Skill Installer

Analyze the project's tech stack, workflow, and pain points, then **recommend** the best skills to install. Always confirm with the user via `AskUserQuestion` before installing anything.

> **Core principle**: First understand the project, then recommend, and install only after the user confirms.

> **Shared principle:** This skill shares the 5 common writer disciplines with `project-skill-writer` / `project-agent-writer` / `project-rules-writer`. See [../project-skill-writer/references/writer-discipline.md](../project-skill-writer/references/writer-discipline.md) for details.

## Use Cases

**Trigger when:**

- The user says "install a skill", "find a skill for X", "what skills would help this project"
- The user describes a capability gap ("I wish AI would automatically...")
- The user wants to set up a new project with skills

**Do not trigger when:**

- The user wants to **create** a new skill (delegate to `project-skill-writer`)
- The user wants to **create** an agent (delegate to `project-agent-writer`)
- The user wants to **create** a rule (delegate to `project-rules-writer`)

## Prerequisites

- Node.js >= 18
- Requires the globally available `find-skills` or `trae-skill-finder` skill
- If missing, prompt the user: `npx skills add find-skills -g -y`

## Workflow

```
[L1: Understand the goal]
         ↓
[L2: Project analysis]
         ↓
[L3: Skill discovery]
         ↓
[L4: Recommend]  ← AskUserQuestion (confirmation required)
         ↓
[L5: Install]
         ↓
[L6: Verify]
```

## L1: Understand the Goal

Extract the user's needs—do not ask "what skill do you want?" but understand:

| What the user says | Real need |
|----------|----------|
| "install a skill" | Vague—proceed to L2 analysis to find gaps |
| "find a skill for testing" | Specific domain—search for testing skills |
| "set up this project with skills" | Full audit—analyze the project and recommend a suite |
| "I keep doing X manually" | Automation gap—find a skill that solves X |

## L2: Project Analysis

Scan the project to build a tech profile. Use search tools in parallel:

### Detection Targets

| Signal | What to look for | Tool |
|------|----------|------|
| Language | File extensions (`.ts`, `.py`, `.swift`, `.go`) | Glob |
| Framework | package.json dependencies, Podfile, go.mod, Cargo.toml | Read |
| Build tools | Makefile, webpack.config, vite.config, Bazel | Glob |
| Testing | jest.config, pytest.ini, XCTest, go test | Glob |
| CI/CD | .github/workflows/, Jenkinsfile, .gitlab-ci.yml | Glob |
| Existing skills | .agents/skills/, .trae/skills/, .cursor/skills/ | Glob |
| Existing rules | .agents/rules/, .trae/rules/ | Glob |

### Tech Profile Output

```
Project: {name}
Language: TypeScript, Swift
Framework: React 18, UIKit
Build: Vite, Bazel
Testing: Jest, XCTest
CI: GitHub Actions
Existing skills: [list]
Existing rules: [list]
```

## L3: Skill Discovery

Based on the tech profile and the user's goal, search for matching skills:

### Search Strategy

1. **Direct match**: search by the user's exact request → `npx skills find "<user_query>"`
2. **Tech match**: search by the detected tech stack → `npx skills find "react"`, `npx skills find "swift"`
3. **Gap match**: search by detected workflow gaps → if there is no testing skill, search `npx skills find "testing"`

### Skill Sources (priority order)

1. **Local registry**: check globally installed skills in `~/.trae/skills/` and `~/.trae-cn/skills/`
2. **Community registry**: `npx skills find "<query>"` — search the skills.sh marketplace
3. **Bytedance registry**: `npx @tiktok-fe/skills find "<query>"` — search the internal registry (if available)

### Filtering Criteria

Reject skills that:
- Conflict with an installed skill (same purpose)
- Do not match the project's language/framework
- Are global-only (this skill installs project-level ones)
- Have no description or are clearly low quality

## L4: Recommend (AskUserQuestion required)

**Critical**: Present recommendations via `AskUserQuestion` before installing any skill.

### Recommendation Format

For each recommended skill, prepare:

```
Skill: {name}
Purpose: {what it does, one sentence}
Reason: {why it fits this project}
Install: {command}
```

### AskUserQuestion Call

Use `AskUserQuestion`:

```json
{
  "questions": [{
    "question": "Based on your {language/framework} project, I recommend these skills. Which would you like to install?",
    "header": "Skills",
    "multiSelect": true,
    "options": [
      {
        "label": "{skill-1-name} (Recommended)",
        "description": "{one sentence: what it does + why it fits}"
      },
      {
        "label": "{skill-2-name}",
        "description": "{one sentence: what it does + why it fits}"
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
- Put the most relevant skill first and mark it "(Recommended)"
- At most 4 options (3 skills + Skip)
- Put "Skip" as the last option
- Use `multiSelect: true` to allow multiple installs
- Never install before the user confirms

## L5: Install

After the user confirms which skills to install:

### Install Path Discovery

Use [path discovery](references/path-discovery.md) to determine the project-relative install path:

1. Check whether `.agents/skills/` exists in the project root
2. Otherwise default to creating `.agents/skills/` (no longer write to `.trae/`, `.cursor/`, `.claude/`—those are IDE-managed)

### Install Commands

```bash
# Community skills (skills.sh)
npx skills add <package-name> --path <project-root>/.agents/skills/

# Bytedance internal skills
npx @tiktok-fe/skills add <package-name> --path <project-root>/.agents/skills/
```

### Install Rules

- **Always** use a project-relative path — never `~/.trae/skills/`, `~/.claude/skills/`, or other global paths
- Do not install into the project's `.trae/`, `.claude/`, `.cursor/`—those are IDE-written directories
- Install skills one at a time, verifying each before moving to the next
- If an install fails, report the error and suggest manual installation steps

## L6: Verify

Verify after installation:

- [ ] The skill directory exists at the expected path
- [ ] SKILL.md exists and is readable
- [ ] The skill description mentions relevant triggers
- [ ] No conflict with existing skills

Report to the user:

```
Installed {N} skills:
  ✓ {skill-1} → {path}
  ✓ {skill-2} → {path}

Usage: Just describe your need, and the skill activates automatically.
```

## Error Handling

| Problem | Solution |
|------|----------|
| `find-skills` unavailable | Prompt: `npx skills add find-skills -g -y` |
| No skill matches the query | Suggest creating a custom skill via `project-skill-writer` |
| User requests a global install | Reject, explain the project-scope limitation, offer a project-relative alternative |
| User requests creating an agent/rule | Route to `project-agent-writer` or `project-rules-writer` |
| Install command fails | Show the error, suggest manual `npx skills add <name> --path <path>` |
| Skill conflicts with an existing one | Show a comparison, ask the user which to keep |

## Scope

This skill handles **only**:
- ✅ Analyzing the project's skill needs
- ✅ Searching skill registries
- ✅ Recommending skills with user confirmation
- ✅ Installing skills to a project-relative path
- ✅ Verifying the installation

This skill does **not** handle:
- ❌ Creating new skills → `project-skill-writer`
- ❌ Creating agents → `project-agent-writer`
- ❌ Creating rules → `project-rules-writer`
- ❌ Global installation (always scoped to the project)

## References

- [Path discovery](references/path-discovery.md) — Install path determination
- [Agent Skills core practices](references/agent-skills-core-practices.md) — AI skill best practices
