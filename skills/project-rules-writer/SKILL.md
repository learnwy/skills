---
name: project-rules-writer
description: "Use when the user wants to create or update project-level AI rules (written to .agents/rules/*.md) that constrain AI behaviour. The rule format is the common frontmatter+markdown convention used by Trae / Cursor / Windsurf — not Trae-specific. Good for: code-style enforcement, naming conventions, commit-message format, or making the AI consistently follow a project pattern. NOT for skills (use project-skill-writer) or agents (use project-agent-writer). Triggers: '创建规则', '添加规则', '设置代码风格', '强制约定', '配置 AI 行为', 'AI 规则', '始终做 X', or any 'always do X' / 'never do Y' AI-behaviour request that should persist across sessions."
metadata:
  author: "learnwy"
  version: "5.0"
---

# Project Rules Writer

Create rules that solve a *specific* problem in a *specific* project — never generic ones. Analyse the project first, design, **confirm with `AskUserQuestion`**, then generate.

> **Core discipline:** understand the problem → analyse the project → design the rule → confirm → generate. No file lands without user confirmation.

Shared writing-discipline rules across this and the other writer skills (project-skill-writer / project-agent-writer / project-skill-installer): see [../project-skill-writer/references/writer-discipline.md](../project-skill-writer/references/writer-discipline.md).

## When to use

- "create a rule", "for X create a rule", "set the code style"
- "make the AI always …", "enforce naming convention", "configure AI behaviour"
- User references `.agents/rules/...`, `.trae/rules/...`, or `#RuleName` syntax
- Constrain AI behaviour for a specific project or file pattern

## When NOT to use

| User wants | Delegate to |
|---|---|
| A skill | `project-skill-writer` |
| An agent / subagent | `project-agent-writer` |
| Install an existing skill | `project-skill-installer` |
| Documentation about how rules work | Just answer; don't generate |

## Prerequisites

- Node.js ≥ 18
- A project where an AI assistant reads project rules (Trae, Cursor, Windsurf, Claude Code, etc.). This writer emits to `<project>/.agents/rules/`; symlink or sync to `.trae/rules/` / `.cursor/rules/` if your IDE needs that exact path.

## Workflow (5 steps)

```
L1 Understand the problem  →  L2 Analyse the project  →  L3 Design the rule  →  L4 Confirm  →  L5 Generate + validate
```

### L1 — Understand the problem

Don't ask "what rule do you want?" Infer from the prompt:

| Pattern | Rule type | Apply mode | Example |
|---|---|---|---|
| "AI keeps using wrong naming" | Convention | File-specific (`globs`) | camelCase for `.ts`, snake_case for `.py` |
| "AI should always do X" | Behaviour | Always-apply | Always use the project logger |
| "AI ignores our architecture" | Structure | Smart (`description`) | Enforce layered-arch boundaries |
| "AI generates wrong imports" | Style | File-specific | Use `@/` path aliases in `.tsx` |
| "I want to toggle manually" | Manual | `#RuleName` | Ad-hoc code-review checklist |

Extract: **problem**, **scope** (which files/contexts), **expected behaviour**, **exceptions**.

### L2 — Analyse the project

Run two agents in parallel via the Task tool:
- [project-scanner](agents/project-scanner.md) — structure, existing rules, patterns
- [convention-detector](agents/convention-detector.md) — naming / style / architecture conventions

Detect: language(s), framework, existing rule files (`.agents/rules/*.md` first, then `.trae/rules/*.md` if present), lint/format configs (ESLint, Prettier, EditorConfig, Ruff), naming patterns, layering.

### L3 — Design the rule

Apply-mode picker:

| Mode | Use when | Frontmatter |
|---|---|---|
| Always-apply | Rule fits every AI interaction | `alwaysApply: true` |
| File-specific | Rule applies to certain file types | `globs: *.tsx,*.ts` + `alwaysApply: false` |
| Smart | AI decides per request via the description | `description: "..."` + `alwaysApply: false` |
| Manual | User invokes via `#RuleName` | no frontmatter |

Design principles: **one problem per rule** • **follow project conventions** • **narrowest scope that covers the problem** • **no conflict with existing rules**.

Frontmatter format gotchas (the gate enforces these in L5):

| Wrong | Right |
|---|---|
| `globs: "*.ts"` | `globs: *.ts,*.tsx` |
| `globs: ["*.ts"]` | `globs: *.ts` |
| absolute paths | project-relative |
| missing `description` | always include `description` |
| `alwaysApply: true` AND `globs:` | one or the other |

### L4 — Confirm (mandatory)

Use `AskUserQuestion` to present the design before any file is written. Include the rule name, apply mode, and output path. Offer "create / adjust / skip" — and if multiple modes are valid, offer the mode choice as a separate question. **Never write a file without user confirmation.** If the user says "adjust", loop back to L3.

### L5 — Generate + validate

```bash
node scripts/cli.cjs init \
  --skill-dir <this-skill-dir> \
  --name <rule-name> \
  --description "<when-this-rule-applies>" \
  --output-dir <project>/.agents/rules/
```

Fallback: if `init` doesn't fit, write the `.md` file directly using [assets/rule.md.template](assets/rule.md.template).

Then run [quality-validator](agents/quality-validator.md). Pre-delivery checklist:

- [ ] `globs`: comma-separated, no quotes, no array
- [ ] No absolute paths in rule content
- [ ] `description` present and explains *when* the rule applies
- [ ] `alwaysApply` and `globs` not both active
- [ ] No conflict with existing rules (from L2 analysis)
- [ ] Rule content is actionable (specific constraints, not vague advice)
- [ ] Content in English

### Delivery report

```
Rule created:
  Name:    {rule-name}
  Mode:    {always|file-specific|smart|manual}
  Path:    {project-relative path}

Frontmatter:
  description: {value}
  globs:       {value if applicable}
  alwaysApply: {value}

Usage: {one-line note on how it fires}
```

## Error handling

| Problem | Resolution |
|---|---|
| User's ask is too vague | Infer the most likely rule type from context, confirm in L4 |
| Multiple valid apply modes | Surface the choice in L4 |
| `.agents/rules/` doesn't exist | Create it under the project root |
| User wants a skill / agent / install | Route to the right writer skill |
| User says "adjust design" in L4 | Loop back to L3 with feedback |
| Rule contains an absolute path | Reject; convert to project-relative |
| New rule conflicts with an existing one | Show diff, ask user to merge / replace / rename |
| `globs` malformed | Auto-fix: drop quotes, flatten arrays, use commas |
| No detectable conventions | Fall back to language defaults; note the assumption in the delivery report |

## Boundaries

This skill **only**: analyses project context, designs a rule, confirms with the user, generates a frontmatter+markdown `.md` at `<project>/.agents/rules/` (project-relative, IDE-neutral), validates the result.

This skill **does not**: create skills (→ `project-skill-writer`), create agents (→ `project-agent-writer`), install skills (→ `project-skill-installer`), edit any IDE's own settings, or install rules globally.

## Agents and references

- Agents: [project-scanner](agents/project-scanner.md), [convention-detector](agents/convention-detector.md), [quality-validator](agents/quality-validator.md)
- [references/rule-types.md](references/rule-types.md) — pick the right rule type from a problem
- [examples/application-modes.md](examples/application-modes.md) — all four apply modes with frontmatter examples
- [assets/rule.md.template](assets/rule.md.template) — scaffold
- [assets/trae-rules-docs.md](assets/trae-rules-docs.md) — vendored frontmatter format reference (originally from Trae's rules doc; format is shared across Trae / Cursor / Windsurf)
