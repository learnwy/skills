---
name: lwy-project-skill-writer
description: "当用户需要创建、更新或设计项目级技能（.agents/skills/*/SKILL.md）时使用此技能。Analyzes the user's problem and project context to design reusable skill solutions. 触发词：'创建技能'、'编写技能'、'构建技能'、'添加技能'、'更新技能'、'项目技能'、'新建技能'、'设计技能', or when the user describes a repetitive workflow that should be captured as a reusable AI skill."
metadata:
  author: "learnwy"
  version: "3.1"
---

# Project Skill Writer

**Design philosophy**: Users do not know what a "skill" is or how to describe one. They only know their **problem**. This skill turns a problem description into a runnable skill.

> **Shared principle:** This skill shares the 5 common writer disciplines (understand → analyze → confirm → project-relative paths → verify) with `project-agent-writer` / `project-skill-installer` / `project-rules-writer`. See [references/writer-discipline.md](references/writer-discipline.md) for details.

## When to Use

**Good fit:**

- The user describes a recurring annoyance or manual task
- The user says "create a skill", "I have to do X manually every time", "I wish the AI could automatically..."
- The user provides a workflow that can be standardized

**Not a fit:**

- The user wants an agent (hand off to `project-agent-writer`)
- The user wants to install an existing skill (hand off to `project-skill-installer`)
- The user wants a rule rather than a skill (hand off to `project-rules-writer`)
- A one-off request with no reuse potential

## Prerequisites

- Node.js >= 18
- The target project must have a writable directory (defaults to `.agents/skills/`)

## Workflow

```
[L1: Problem understanding]
       ↓
[L2: Project analysis]  ← parallel subagents
       ↓
[L3: Skill design]
       ↓
[L4: User confirmation]  ← wait for confirmation
       ↓
[L5: Generation]
       ↓
[L6: Quality validation]
```

## L1: Problem understanding

Extract the problem, classify it, and infer skill metadata — do not make the user define these.

| Problem pattern | Skill type | Example |
|---------|---------|------|
| "I write the same code every time" | Generator | Component generator, API client |
| "I run the same checks every time" | Validator | Code checks, security scan |
| "I explain the same things every time" | Informer | Architecture docs, API docs |
| "I follow the same steps every time" | Workflow | Deployment, release process |
| "I find and fix the same issues every time" | Remediation | Bug fix, refactoring |

Only ask questions when multiple valid approaches exist and the user's preference matters. **Never** ask "what do you want the skill to do?" — infer it from the problem.

## L2: Project analysis pipeline

Launch these agents in parallel via the Task tool (they are independent of one another):

| Agent | Purpose | Tool call |
|-------|------|---------|
| [Project scanner](agents/project-scanner.md) | Structure, existing assets, patterns | `Task(subagent_type="search", query="...")` |
| [Tech-stack analyzer](agents/tech-stack-analyzer.md) | Languages, frameworks, build tools | `Task(subagent_type="search", query="...")` |
| [Convention detector](agents/convention-detector.md) | Naming, imports, code style | `Task(subagent_type="search", query="...")` |

Merge their outputs into a unified project profile before entering the design stage.

## L3: Skill design

Based on the problem + project analysis, generate a design spec:

```
## Skill: {name}

### Problem solved
{One sentence describing the problem this skill solves}

### Trigger conditions
- {trigger 1}
- {trigger 2}

### Architecture
- Input: {what the skill accepts}
- Output: {what the skill produces}
- Processing: {how the skill works}

### Project integration
- Output path: {project-relative path}
- Conventions: {from project analysis}

### Quality criteria
- {measurable success criteria}

### Hooks (optional)
- Scope: {global|project}
- Events: {IDE lifecycle events to mount}
- Purpose: {deterministic automation the hooks provide}
```

Design principles:
1. **Single responsibility** — one skill = solve one problem
2. **Follow conventions** — use the project's naming, structure, and patterns
3. **Minimal friction** — trigger conditions should match natural language
4. **Verifiable output** — clear success/failure criteria

## L4: Confirmation

Before generating, show the user:

```
I will create a skill:

Problem: {the problem in the user's own words}
Solution: {what the skill will do}
Triggers: {when it activates}
Output: {files that will be created}

Is this correct? Anything to adjust?
```

**Wait** for the user's confirmation before generating.

## L5: Generation

After the user confirms:

1. **Scaffold**: run `scripts/cli.cjs init` with the `--problem` flag, or create the files manually using [skill.md.template](assets/skill.md.template)
2. **Populate**: inject the project-specific conventions from the L2 analysis into the SKILL.md sections
3. **Reference files**: only create `references/`, `assets/`, `scripts/` if the skill needs them
4. **Paths**: use [path discovery](references/path-discovery.md) to determine the output path — always use project-relative paths

Fallback: if `cli.cjs init` fails or the template does not fit, write SKILL.md directly following the template structure.

## L6: Quality validation

Run the [quality validator](agents/quality-validator.md) over the generated skill.

Minimum checks before delivery:

- [ ] The skill has meaningful trigger conditions (not just a filename)
- [ ] The output path is project-relative, not a global path
- [ ] The frontmatter contains `name` and `description`
- [ ] The workflow is executable (not just abstract steps)
- [ ] Dependencies are declared
- [ ] Examples show real usage
- [ ] If the skill has an automatic mode → hooks.json exists with the correct scope (global vs project)
- [ ] Hook scripts use the shared library (`src/shared/hooks-lib.ts`) rather than custom stdin parsing

## Error handling

| Issue | Solution |
|------|---------|
| Cannot detect the tech stack | Ask the user for the language/framework, or scan file extensions |
| Project too large (>500 top-level entries) | Use the `focus_folders` parameter in the project scanner |
| Found a conflicting existing skill | Show a comparison and ask the user: extend the existing one or create a new one? |
| The user's problem maps to multiple skill types | Show the top 2 candidates with trade-offs and let the user choose |
| Path discovery found no markers | Default to `.agents/skills/` at the project root |
| The generated skill fails quality validation | Show the failures, auto-fix what can be fixed, and flag the rest |

## Output contract

Always produce four parts:

1. **Problem understanding**: the problem identified
2. **Solution design**: the skill architecture
3. **Deliverables**: the files created
4. **Usage guide**: how to trigger and use the skill

## Agents

- [Project scanner](agents/project-scanner.md): structure and pattern analysis
- [Tech-stack analyzer](agents/tech-stack-analyzer.md): language/framework detection
- [Convention detector](agents/convention-detector.md): code-style extraction
- [Quality validator](agents/quality-validator.md): post-generation validation

## References

- [Path discovery](references/path-discovery.md): output-path determination (load after design is complete)
- [Advanced patterns](references/advanced-patterns.md): skill architecture patterns (workflow, domain, template, multi-variant)
