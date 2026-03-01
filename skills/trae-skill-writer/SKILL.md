---
name: trae-skill-writer
description: "Create Trae IDE skills (SKILL.md files) for reusable AI capabilities. Use when user wants to: create a skill, make a reusable workflow, automate repetitive tasks, turn a conversation into a skill, or encapsulate a process for AI to follow. Triggers on: '创建 skill', 'write a SKILL.md', 'make this reusable', '.trae/skills/', 'I keep doing the same thing every time'. Do NOT use for rules (use trae-rules-writer) or agents (use trae-agent-writer)."
license: "MIT"
compatibility: "Requires Trae IDE"
metadata:
  author: "learnwy"
  version: "1.4"
---

# Trae Skill Writer

Analyze project patterns, design skill specs with code-first approach, then delegate to `skill-creator`.

## Workflow

```
0. SIZE CHECK   → Is project too large? Ask user to specify folders
1. ANALYZE      → Scan project structure (spawn Project Scanner Agent)
2. READ CODE    → Deep-dive into domain-specific code (2-5 key files)
3. IDENTIFY     → Extract real patterns, constants, conventions from code
4. DESIGN       → Structure skill spec with real code examples
5. DELEGATE     → Hand off to skill-creator (DO NOT write SKILL.md yourself)
6. VERIFY       → Validate skill after creation
```

## Naming Convention (CRITICAL)

**Every skill MUST use a project prefix** to avoid namespace collision.

| Format | Example | Explanation |
|--------|---------|-------------|
| `{prefix}-{domain}` | `app-style` | app = your project name |
| `{prefix}-{domain}` | `trae-rules` | trae = trae-related |
| `{prefix}-{domain}` | `fe-component` | fe = frontend |

**Good names:** `app-scene-general`, `app-bff-review`, `trae-skill-writer`
**Bad names:** `my-app-general-search-scene-template` (too long)

## Language Consistency (CRITICAL)

**All content within a skill MUST be in ONE language.**

- Title, description, headings, code comments, explanations - ALL same language
- Prefer English for code projects
- Do NOT mix Chinese and English in the same skill file

```yaml
# Good - all English
name: app-style
description: "Style system guide for TextStyle/BaseStyle. Use when..."

# Bad - mixed languages
name: app-style
description: "Style 系统指南. Use when 使用样式时..."
```

## Code-First Approach (CRITICAL)

**Before writing any skill, you MUST read actual codebase files.**

### Study Workflow (for each skill)

```
1. Identify key files for this domain
2. Read 2-5 source files deeply (100-200 lines each)
3. Extract actual patterns, types, constants
4. Use real code examples from the codebase
```

### Code Examples Must Be Real

- Every code example should come from or closely mirror actual codebase patterns
- Include file paths as comments when referencing specific patterns
- Use actual constant names, function signatures, and type definitions

```go
// From: internal/style/text_style.go
type TextStyle struct {
    FontSize  int
    FontColor string
}
```

## Batch Skill Creation Workflow

When creating multiple skills for a project:

### Phase 1 - Project Overview
- Understand overall project architecture
- Identify major domains/modules
- Plan skill breakdown (avoid overlap)

### Phase 2 - Sequential Deep-Dive
- Process ONE skill at a time (not parallel)
- For each skill: read code → understand patterns → design spec
- Maintain overall coherence while focusing on specific domain

### Phase 3 - Cross-Reference Pass
- Ensure "Related Skills" sections are accurate
- Check for content duplication
- Verify trigger keywords don't overlap excessively

## Delegation to skill-creator

**After DESIGN step, ALWAYS delegate to `skill-creator` for actual SKILL.md creation.**

### Delegation Template

```
Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** {prefix}-{domain}
**Purpose:** {what it does}
**Triggers:** {phrases that should activate it}
**Exclusions:** {when NOT to use}
**Language:** English (or specify)
**Key Files:** {list of files this skill is based on}
**Workflow:** {numbered steps}
**Location:** .trae/skills/{name}/ or ~/.trae/skills/{name}/

Project context:
- Tech stack: {detected tech}
- Patterns found: {patterns from actual code}
- Related skills: {other skills to cross-reference}
```

## Agent-Enhanced Analysis

| Stage | Agent | When to Use |
|-------|-------|-------------|
| ANALYZE | [Project Scanner](agents/project-scanner.md) | Large/unfamiliar projects |
| ANALYZE | [Tech Stack Analyzer](agents/tech-stack-analyzer.md) | Domain-specific (iOS, Go, React) |
| VERIFY | [Quality Validator](agents/quality-validator.md) | Post-creation validation |

## Path Conventions

**NEVER use absolute paths.** Use relative paths or placeholders:

| Bad ❌ | Good ✅ |
|--------|---------|
| `/Users/john/project/src/` | `src/` or `{project_root}/src/` |
| `/home/dev/repo/.trae/` | `.trae/` |

## Skill Granularity

**Single Responsibility**: Each skill should focus on ONE specific domain.

- Good: `app-style` (only style system), `app-monitor` (only monitoring)
- Bad: `app-style-and-component` (too broad)

**Cross-Reference**: Use "Related Skills" section to connect related concepts.
- Don't duplicate content across skills
- Reference other skills for adjacent knowledge

## Quality Checklist

Before delegating to skill-creator, verify spec has:

- [ ] **Naming**: Has project prefix, kebab-case, concise
- [ ] **Language**: 100% consistent language decided
- [ ] **Code Study**: Based on actual codebase reading
- [ ] **Key Files**: List of source files this skill is based on
- [ ] **Examples**: Real code patterns extracted
- [ ] **Paths**: Uses relative paths only
- [ ] **Related Skills**: Links to adjacent skills

## Example

```
User: "Create skills for our ecommerce-app project"

Phase 1 - Project Overview:
- Tech stack: Go, internal frameworks
- Domains identified: style, component, monitor, api

Phase 2 - Sequential Deep-Dive for app-style:

READ CODE:
- internal/style/text_style.go (150 lines)
- internal/style/base_style.go (200 lines)
- Found: TextStyle, BaseStyle, FontSize constants

DESIGN (skill spec):
- Name: app-style (prefix: app)
- Language: English
- Key Files: internal/style/*.go
- Purpose: Style system guide for TextStyle/BaseStyle
- Triggers: 'style', 'TextStyle', 'font'
- Exclusions: layout, animation

DELEGATE:
"Use skill `skill-creator` to create the skill with this spec:

**Skill Name:** app-style
**Purpose:** Style system guide for TextStyle/BaseStyle in ecommerce-app
**Triggers:** 'style', 'TextStyle', 'BaseStyle', 'font', 'color'
**Exclusions:** layout, animation (see app-layout)
**Language:** English
**Key Files:**
- internal/style/text_style.go
- internal/style/base_style.go
**Workflow:**
1. Identify style type needed (Text vs Base)
2. Apply correct style constants
3. Follow naming conventions
**Location:** .trae/skills/app-style/

Project context:
- Tech stack: Go
- Patterns: TextStyle struct, BaseStyle interface
- Related skills: app-layout, app-component"

Phase 3 - Cross-Reference:
- app-style ↔ app-layout (related)
- app-style ↔ app-component (related)
```

## References

- [Trae Skills Documentation](assets/trae-skills-docs.md) - Official docs
- [Best Practices](assets/trae-skill-best-practices.md) - Writing good skills

## Agents

- [Project Scanner](agents/project-scanner.md)
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md)
- [Convention Detector](agents/convention-detector.md)
- [Quality Validator](agents/quality-validator.md)
