---
name: project-skill-writer
description: "Create or update project-level skills only. Use for project skill authoring and refactoring. Delegate generation to skill-creator and keep outputs in project scope."
license: "MIT"
requires:
  - skill-creator
compatibility: "Any skill-enabled workspace"
metadata:
  author: "learnwy"
  version: "2.0"
---

# Project Skill Writer

Build project-level skills with deterministic scaffolding, then refine with domain evidence.

## L1: Create or Update Project Skills

- Create new project skills under the discovered project skill directory
- Update existing skill workflows, triggers, and exclusions
- Normalize path style, language style, and output structure
- Delegate final drafting to `skill-creator` when needed
- Reject global-scope output targets

## L2: Project Workflow Contract

1. If repository is large, require user-selected scope before deep analysis
2. Detect project skill path by loading [Path Discovery](references/path-discovery.md)
3. Gather project evidence from selected scope only
4. Check global prerequisite: `skill-creator`; if missing, ask user to install before continuing
5. Delegate drafting to `skill-creator` and enforce project-only output path
6. For Trae / Trae-CN targets, apply [Trae Skill Best Practices](references/trae-skill-best-practices.md)
7. If target is not a skill request, route to the matching writer skill

## L3: Category Details

### Category A: New Skill Creation
- Identify one domain per skill
- Keep triggers focused on user intent, not just keywords
- Keep file paths project-relative only

### Category B: Existing Skill Update
- Preserve valid frontmatter fields
- Replace weak workflow steps with executable steps
- Move long vendor/runtime details into references

### Category C: Quality Gate
- Ensure single-language consistency
- Ensure no absolute paths
- Ensure clear activation and non-activation sections

### Category C2: Prerequisites Gate
- Require global availability of `skill-creator`
- If missing, prompt user with installation guidance before execution
- Suggested commands:
  - `npx skills add skill-creator -g -y`

### Category D: Reference Loading
- Load `references/path-discovery.md` for output path discovery and validation
- Load `references/advanced-patterns.md` only for complex structuring decisions
- Load `references/trae-target-mode.md` only when runtime target is Trae or Trae-CN
- Load `references/trae-skill-best-practices.md` only when runtime target is Trae or Trae-CN

### Category E: Target Routing
- Skills request: handle in this skill
- Agents request: route to `project-agent-writer`
- Rules request: route to `project-rules-writer`

### Category F: Claude Code Practices
- Keep project skill guidance in `CLAUDE.md` or `.claude/CLAUDE.md`
- Split specialized guidance by project rule files when needed

### Category G: Trae / Trae-CN Practices
- Keep project skill guidance in project-managed `.trae` context
- Follow Trae project conventions for scoped instructions
- Carry forward existing Trae-specific constraints into new project outputs

## Agents

- [Project Scanner](agents/project-scanner.md): use for large project boundary scan
- [Tech Stack Analyzer](agents/tech-stack-analyzer.md): use for framework-aware skill design
- [Quality Validator](agents/quality-validator.md): use before final delivery
- [Convention Detector](agents/convention-detector.md): use when conventions are implicit

## References

- [Advanced Patterns](references/advanced-patterns.md)
- [Path Discovery](references/path-discovery.md)
- [Trae Target Mode](references/trae-target-mode.md)
- [Trae Skill Best Practices](references/trae-skill-best-practices.md)
