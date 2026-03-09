---
name: project-agent-writer
description: "Create or update project-level agents only. Use for isolated workers in project workflows. Keep outputs in project scope and route non-agent targets to the right writer."
license: "MIT"
compatibility: "Any agent-enabled workspace"
metadata:
  author: "learnwy"
  version: "2.0"
---

# Project Agent Writer

Create deterministic, reusable agents for project workflows.

## L1: Create or Update Project Agents

- Create new agent files for project automation
- Update existing agent role, inputs, and output schemas
- Keep agents single-purpose and stateless
- Enforce explicit constraints and expected outputs
- Reject global-scope output targets

## L2: Project Workflow Contract

1. If repository is large, require user-selected scope before deep analysis
2. Detect project agent path by loading [Path Discovery](references/path-discovery.md)
3. Clarify one concrete agent job and boundaries
4. Generate scaffold and fill role, constraints, inputs, process, outputs
5. For Trae / Trae-CN targets, apply [Trae Agent Best Practices](references/trae-agent-best-practices.md)
6. If target is rules-related, load [IDE Rules Best Practices](references/ide-rules-best-practices.md) and route to `project-rules-writer`

Initialization command:

```bash
python {skill_dir}/scripts/init_agent.py \
  --skill-dir {skill_dir} \
  --name {agent_name} \
  --role "One-line role" \
  --output-dir {project_root}/agents
```

## L3: Category Details

### Category A: Evaluation Agents
- Graders, comparators, validators
- Must output explicit evidence for each decision

### Category B: Analysis Agents
- Pattern analyzers, root-cause analyzers
- Must define analysis dimensions before processing

### Category C: Transformation Agents
- Format converters, result normalizers
- Must keep deterministic output schema and destination path

### Category D: Reference Loading
- Load `references/path-discovery.md` for output path discovery and validation
- Load `references/agent-patterns.md` only when choosing agent pattern strategy
- Load `references/trae-target-locations.md` only when runtime target is Trae or Trae-CN
- Load `references/trae-agent-best-practices.md` only when runtime target is Trae or Trae-CN

### Category E: Target Routing
- Agents request: handle in this skill
- Skills request: route to `project-skill-writer`
- Rules request: route to `project-rules-writer` with IDE-specific rule practices

### Category F: Claude Code Practices
- Use project-scoped conventions and keep agent constraints consistent with project instruction files

### Category G: Trae / Trae-CN Practices
- Keep agent outputs in project `.trae` context
- Preserve Trae-specific agent conventions from existing assets
- For rules-related constraints, route to `project-rules-writer` for IDE-specific rule formats

## References

- [Agent Patterns](references/agent-patterns.md)
- [Path Discovery](references/path-discovery.md)
- [Trae Target Locations](references/trae-target-locations.md)
- [IDE Rules Best Practices](references/ide-rules-best-practices.md)
- [Trae Agent Best Practices](references/trae-agent-best-practices.md)
- [Grader Example](examples/grader-agent.md)
