---
name: project-skill-installer
description: "Coordinate project-only skill discovery and installation context. Delegate execution to find-skills and never produce global installation outputs."
priority: 100
requires:
  - find-skills
compatibility: "Any skills-enabled workspace"
---

# Project Skill Installer

This skill orchestrates project-only skill installation context and delegates execution to `find-skills`.

## L1: Project Skill Installation Context

Use this skill to perform:
- Define project-only constraints for skill installation
- Delegate skill discovery and install planning to `find-skills`
- Keep all outputs and install targets inside project scope
- Reject global installation targets

## L2: Project Workflow Contract

1. If repository is large, require user-selected scope before deep analysis
2. Detect IDE marker and project paths by loading [Path Discovery](references/path-discovery.md)
3. Check global prerequisite: `find-skills`; if missing, ask user to install before continuing
4. Delegate discovery and install planning to `find-skills` with project-only constraint context
5. Apply [Agent Skills Core Practices](references/agent-skills-core-practices.md) for output quality
6. If runtime target is Trae or Trae-CN, apply [Trae Runtime Practices](references/trae-runtime-practices.md)
7. Return project-only install plan, target path, and action summary

## L3: Category-Specific Actions

- **Delegation:** always delegate install actions to `find-skills`
- **Project Scope Enforcement:** reject global target requests and keep output in project paths
- **Prerequisites Gate:** block execution until `find-skills` is available globally

### L3-Claude Code Practices
- Prefer project instruction and `.claude` project conventions for routed targets

### L3-Trae / Trae-CN Practices
- Prefer project `.trae` conventions for routed targets
- Preserve previously defined Trae-specific requirements
- If Trae detail is missing, fetch official Trae docs links from Trae runtime reference

### L3-Prerequisites
- Require global availability of `find-skills`
- If missing, prompt user to run:
  - `npx skills add find-skills -g -y`

## References

- [Path Discovery](references/path-discovery.md)
- [Agent Skills Core Practices](references/agent-skills-core-practices.md)
- [Trae Runtime Practices](references/trae-runtime-practices.md)
