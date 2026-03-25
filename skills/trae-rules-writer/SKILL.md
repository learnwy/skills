---
name: trae-rules-writer
description: "Create Trae IDE rules (.trae/rules/*.md) for AI behavior constraints. Use when: create rule, set up code style, enforce naming convention, make AI always do X, configure AI behavior. NOT for skills (use project-skill-writer) or agents (use project-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "3.0"
---

# Trae Rules Writer

Create rules that solve specific problems — not generic rules. Analyzes a project's structure and conventions, then **designs** a rule to constrain AI behavior. Always confirms with the user via `AskUserQuestion` before generating any files.

> **Core Principle**: Understand the problem first, analyze the project second, design the rule third, generate only after user confirms.

## When to Use

**Invoke when:**

- User says "create a rule", "create rules for...", "set up code style"
- User says "make AI always...", "enforce naming convention", "configure AI behavior"
- User references `.trae/rules/...` or uses `#RuleName` syntax
- User wants to constrain AI behavior for a specific project or file pattern

**Do NOT invoke when:**

- User wants to create a **skill** → delegate to `project-skill-writer`
- User wants to create an **agent** → delegate to `project-agent-writer`
- User wants to **install** an existing skill → delegate to `project-skill-installer`
- User is asking about Trae rules documentation (answer directly, no generation needed)

## Prerequisites

- Node.js >= 18
- Trae IDE (with `.trae/rules/` support)

## Workflow

```
[L1: Problem Understanding]
         ↓
[L2: Project Analysis]  ← parallel sub-agents
         ↓
[L3: Rule Design]
         ↓
[L4: Confirmation]  ← AskUserQuestion (MUST confirm)
         ↓
[L5: Generation & Verification]
```

## L1: Problem Understanding

Extract what the user needs — do NOT ask "what rule do you want?" Instead, infer from their problem:

### Problem Classification

| Problem Pattern | Rule Type | Application Mode | Example |
|----------------|-----------|-----------------|---------|
| "AI keeps using wrong naming" | Convention | File-Specific (`globs`) | camelCase for `.ts`, snake_case for `.py` |
| "AI should always do X" | Behavioral | Always (`alwaysApply: true`) | Always use project's logging library |
| "AI ignores our architecture" | Structural | Intelligent (`description`) | Enforce layered architecture boundaries |
| "AI generates wrong imports" | Style | File-Specific (`globs`) | Use `@/` path aliases in `.tsx` files |
| "I want to toggle a rule manually" | Manual | Manual (`#RuleName`) | Ad-hoc code review checklist |

### Extract Rule Specifications

From the user's problem, extract:
- **Problem**: What the AI is doing wrong (or should start doing)
- **Scope**: Which files or contexts the rule applies to
- **Behavior**: What the AI should do differently
- **Exceptions**: Any cases where the rule should NOT apply

## L2: Project Analysis

Scan the project to understand context. Launch these agents in parallel via the Task tool:

| Agent | Purpose | Tool Invocation |
|-------|---------|-----------------|
| [Project Scanner](agents/project-scanner.md) | Structure, existing rules, patterns | `Task(subagent_type="search", query="...")` |
| [Convention Detector](agents/convention-detector.md) | Naming, style, and pattern conventions | `Task(subagent_type="search", query="...")` |

### Detection Targets

| Signal | What to Look For | Tool |
|--------|-----------------|------|
| Language | File extensions (`.ts`, `.py`, `.swift`, `.go`) | Glob |
| Framework | package.json deps, Podfile, go.mod, Cargo.toml | Read |
| Existing Rules | `.trae/rules/*.md` files and their frontmatter | Glob + Read |
| Code Style | ESLint, Prettier, EditorConfig, Ruff configs | Glob |
| Naming Patterns | Variable casing, file naming, directory structure | Grep |
| Architecture | Layering, module boundaries, import patterns | LS + Grep |

### Analysis Output

```
Project: {name}
Languages: {detected languages}
Existing Rules: {list with application modes, or "none"}
Code Style Tools: {linters, formatters}
Conventions: {naming, imports, architecture patterns}
Conflicts: {any existing rules that overlap with the proposed rule}
```

## L3: Rule Design

Based on Problem (L1) + Analysis (L2), design the rule:

### Application Mode Selection

Refer to [Application Modes](examples/application-modes.md) and [Rule Types](references/rule-types.md) for detailed guidance.

| Mode | When to Use | Frontmatter |
|------|------------|-------------|
| Always | Rule applies to every AI interaction | `alwaysApply: true` |
| File-Specific | Rule applies only to certain file types | `globs: *.tsx,*.ts` + `alwaysApply: false` |
| Intelligent | AI decides when rule is relevant based on description | `description: "..."` + `alwaysApply: false` |
| Manual | User explicitly invokes with `#RuleName` | No frontmatter, use `#RuleName` |

### Design Spec

```
Rule: {name}
Problem: {user's problem in their words}
Application Mode: {Always|File-Specific|Intelligent|Manual}
Scope: {which files/contexts}

Content Summary:
- {constraint 1}
- {constraint 2}

Frontmatter:
  description: {when this rule applies}
  globs: {file patterns, if applicable}
  alwaysApply: {true|false}

File to create:
  - .trae/rules/{rule-name}.md
```

### Design Principles

1. **Single Problem** — one rule = one problem solved
2. **Convention-Aligned** — use project's existing style tools as the source of truth
3. **Minimal Scope** — apply rule to the narrowest file set that covers the problem
4. **No Conflicts** — verify the new rule does not contradict existing rules

### Critical Format Rules

| Wrong | Correct |
|-------|---------|
| `globs: "*.ts"` | `globs: *.ts,*.tsx` |
| `globs: ["*.ts"]` | `globs: *.ts` |
| `/Users/.../src/` | `src/` |
| Missing `description` | Always include `description` |
| Both `alwaysApply: true` AND `globs:` active | Use one or the other |

## L4: Confirmation (MUST USE AskUserQuestion)

**CRITICAL**: Before generating ANY files, present the design via `AskUserQuestion`.

### AskUserQuestion Call

Use `AskUserQuestion` with:

```json
{
  "questions": [{
    "question": "I've designed this rule based on your project. Should I create it?",
    "header": "Rule",
    "multiSelect": false,
    "options": [
      {
        "label": "Create {rule-name} (Recommended)",
        "description": "{application-mode} rule — {1-sentence behavior}. Output: .trae/rules/{rule-name}.md"
      },
      {
        "label": "Adjust design",
        "description": "Let me refine the rule design before generating"
      },
      {
        "label": "Skip",
        "description": "Don't create a rule right now"
      }
    ]
  }]
}
```

**Rules**:
- Always show the designed rule name and application mode
- Include the output path so user knows where the file goes
- If multiple application modes are valid, offer alternatives:

```json
{
  "questions": [{
    "question": "This rule could work in different modes. Which fits best?",
    "header": "Application mode",
    "multiSelect": false,
    "options": [
      {
        "label": "Always-on rule (Recommended)",
        "description": "alwaysApply: true — active in every AI interaction"
      },
      {
        "label": "File-specific rule",
        "description": "globs: *.tsx — only active when matching files are open"
      },
      {
        "label": "Skip",
        "description": "Don't create a rule right now"
      }
    ]
  }]
}
```

- Never generate files without user confirmation
- If user says "Adjust design", loop back to L3 with feedback

## L5: Generation & Verification

After user confirms:

### Generation

1. Determine output path: `.trae/rules/` in the target project root
2. Create rule file using `scripts/init_rule.cjs` or [rule.md.template](assets/rule.md.template)
3. Fill in frontmatter (`description`, `globs`, `alwaysApply`) from L3 design
4. Write rule content — actionable constraints, not vague guidelines
5. Ensure all paths in rule content are project-relative, never absolute

### Generation Command

```bash
node scripts/init_rule.cjs \
  --skill-dir <this-skill-dir> \
  --name <rule-name> \
  --description "<when-this-rule-applies>" \
  --output-dir <project>/.trae/rules/
```

Fallback: If `init_rule.cjs` fails or the template doesn't fit, write the `.md` file directly following the template structure.

### Verification

Run [Quality Validator](agents/quality-validator.md) against the generated rule.

Minimum checks before delivery:

- [ ] `globs` format: comma-separated, no quotes, no arrays
- [ ] No absolute paths anywhere in the rule
- [ ] `description` is present and describes when the rule applies
- [ ] `alwaysApply` and `globs` are not both active simultaneously
- [ ] No conflicts with existing rules (from L2 analysis)
- [ ] Rule content is actionable (specific constraints, not vague advice)
- [ ] Content is in English

### Delivery Report

```
Created rule:
  Name: {rule-name}
  Mode: {Always|File-Specific|Intelligent|Manual}
  Path: {project-relative path}

Frontmatter:
  description: {value}
  globs: {value, if applicable}
  alwaysApply: {value}

To use: {instructions based on application mode}
```

## Error Handling

| Issue | Solution |
|-------|----------|
| User's problem is too vague | Infer the most likely rule type from context, confirm at L4 |
| Multiple valid application modes | Show alternatives in AskUserQuestion, let user pick |
| No `.trae/rules/` directory exists | Create `.trae/rules/` in the project root |
| User requests skill/agent creation | Route to `project-skill-writer` or `project-agent-writer` |
| User says "Adjust design" at L4 | Loop back to L3, incorporate feedback |
| Rule contains absolute paths | Reject, convert to project-relative paths |
| Rule conflicts with existing rule | Show comparison, ask user whether to merge, replace, or rename |
| `globs` format is wrong | Auto-fix: remove quotes, flatten arrays, use comma separation |
| Project has no detectable conventions | Fall back to language defaults, note assumptions in delivery report |

## Boundary Enforcement

This skill ONLY handles:
- Analyzing project for rule design context
- Designing rules based on user problems
- Confirming design via AskUserQuestion
- Generating `.trae/rules/*.md` files to project-relative paths
- Verifying generated rules against quality gates

This skill does NOT handle:
- Creating skills → `project-skill-writer`
- Creating agents → `project-agent-writer`
- Installing skills → `project-skill-installer`
- Global rule installation (always project-scoped)
- Editing Trae IDE settings or configuration files

## Agents

- [Project Scanner](agents/project-scanner.md): Structure, existing rules, and pattern analysis
- [Convention Detector](agents/convention-detector.md): Naming, style, and convention extraction
- [Quality Validator](agents/quality-validator.md): Post-generation rule validation

## References

- [Rule Types](references/rule-types.md): Choose rule type based on problem
- [Application Modes](examples/application-modes.md): All mode examples with frontmatter
- [Rule Template](assets/rule.md.template): Scaffold for new rules
- [Trae Rules Docs](assets/trae-rules-docs.md): Official documentation snapshot
