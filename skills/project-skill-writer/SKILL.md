---
name: project-skill-writer
description: "Create or update project-level skills by analyzing user problems and project context. NOT by asking questions - by understanding what users struggle with and designing solutions. Keeps outputs in project scope."
license: "MIT"
compatibility: "Any skill-enabled workspace"
metadata:
  author: "learnwy"
  version: "3.1"
---

# Project Skill Writer

**Design Philosophy**: Users don't know what a "skill" is or how to describe one. They know their **problems**. This skill transforms problem descriptions into working skills.

## When to Use

**Invoke when:**

- User describes a recurring frustration or repetitive task
- User says "create a skill", "I keep doing X manually", "I wish AI would automatically..."
- User provides a workflow that could be standardized

**Do NOT invoke when:**

- User wants an agent (delegate to `project-agent-writer`)
- User wants to install an existing skill (delegate to `project-skill-installer`)
- User wants a rule, not a skill (delegate to `trae-rules-writer`)
- One-off request with no reuse potential

## Workflow

```
[L1: Problem Understanding]
         ↓
[L2: Project Analysis]  ← parallel sub-agents
         ↓
[L3: Skill Design]
         ↓
[L4: Validate with User]  ← WAIT for confirmation
         ↓
[L5: Generation]
         ↓
[L6: Quality Gates]
```

## L1: Problem Understanding

Extract the problem, classify it, and infer skill metadata — do NOT ask the user to define these.

| Problem Pattern | Skill Type | Example |
|----------------|------------|---------|
| "I write the same code every time" | Generator | Component generator, API client |
| "I do the same check every time" | Validator | Linter, security scanner |
| "I explain the same thing every time" | Informer | Architecture docs, API docs |
| "I follow the same steps every time" | Workflow | Deployment, release process |
| "I find and fix the same issues" | Remediation | Bug fixer, refactorer |

Ask ONLY when multiple valid solutions exist and user preference matters. NEVER ask "What do you want the skill to do?" — infer from the problem.

## L2: Project Analysis Pipeline

Launch these agents in parallel via the Task tool (they are independent):

| Agent | Purpose | Tool Invocation |
|-------|---------|-----------------|
| [Project Scanner](agents/project-scanner.md) | Structure, existing assets, patterns | `Task(subagent_type="search", query="...")` |
| [Tech Stack Analyzer](agents/tech-stack-analyzer.md) | Language, framework, build tools | `Task(subagent_type="search", query="...")` |
| [Convention Detector](agents/convention-detector.md) | Naming, imports, code style | `Task(subagent_type="search", query="...")` |

Combine their outputs into a unified project profile before proceeding to design.

## L3: Skill Design

Based on Problem + Project Analysis, produce a design spec:

```
## Skill: {name}

### Problem Solved
{1-sentence description of the problem this skill solves}

### Triggers
- {trigger 1}
- {trigger 2}

### Architecture
- Input: {what the skill takes}
- Output: {what the skill produces}
- Process: {how the skill works}

### Project Integration
- Output path: {project-relative path}
- Conventions: {from project analysis}

### Quality Criteria
- {measurable success criteria}
```

Design Principles:
1. **Single Responsibility** — one skill = one problem solved
2. **Convention-Aligned** — use project's naming, structure, patterns
3. **Minimal Friction** — triggers should match natural language
4. **Verifiable Output** — clear success/failure criteria

## L4: Validation

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

After user confirmation:

1. **Scaffold**: Run `scripts/init_skill.py` with `--problem` flag, or create files manually using [skill.md.template](assets/skill.md.template)
2. **Populate**: Inject project-specific conventions from L2 analysis into SKILL.md sections
3. **Reference files**: Create `references/`, `assets/`, `scripts/` only when the skill needs them
4. **Path**: Determine output path using [Path Discovery](references/path-discovery.md) — always project-relative

Fallback: If `init_skill.py` fails or the template doesn't fit, write SKILL.md directly following the template structure.

## L6: Quality Gates

Run [Quality Validator](agents/quality-validator.md) against the generated skill.

Minimum checks before delivery:

- [ ] Skill has meaningful triggers (not just filename)
- [ ] Output path is project-relative, not global
- [ ] Frontmatter has `name` and `description`
- [ ] Workflow is executable (not just abstract steps)
- [ ] Dependencies are declared
- [ ] Examples show real usage

## Error Handling

| Issue | Solution |
|-------|----------|
| Cannot detect tech stack | Ask user for language/framework, or scan for file extensions |
| Project too large (>500 top-level items) | Use `focus_folders` parameter in Project Scanner |
| Conflicting existing skill found | Show comparison, ask user: extend existing or create new? |
| User problem maps to multiple skill types | Present top-2 candidates with trade-offs, let user pick |
| Path discovery finds no markers | Default to `.trae/skills/` in project root |
| Generated skill fails quality gates | Show failing checks, auto-fix what's possible, flag the rest |

## Output Contract

Always produce four sections:

1. **Problem Understanding**: What problem you identified
2. **Solution Design**: The skill architecture
3. **Deliverables**: Files created
4. **Usage Guide**: How to trigger and use the skill

## Agents

- [Project Scanner](agents/project-scanner.md): Structure and pattern analysis
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md): Language/framework detection
- [Convention Detector](agents/convention-detector.md): Code style extraction
- [Quality Validator](agents/quality-validator.md): Post-generation validation

## References

- [Path Discovery](references/path-discovery.md): Output path determination (load AFTER design)
- [Advanced Patterns](references/advanced-patterns.md): Skill architecture patterns (workflow, domain, template, multi-variant)
