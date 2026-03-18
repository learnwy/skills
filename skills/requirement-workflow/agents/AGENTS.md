# Agents

Agents invoked at workflow checkpoints.

## Default Hooks (from hooks.yaml)

| Agent | Hook | Purpose |
|-------|------|---------|
| problem-definer | pre_DEFINING | Clarify requirements |
| risk-auditor | pre_DEFINING | Assess risk |
| spec-by-example | post_DEFINING | Write specs |
| story-mapper | post_PLANNING | Task breakdown |
| domain-modeler | pre_DESIGNING | Domain design |
| architecture-advisor | post_DESIGNING | Architecture review |
| tech-design-reviewer | post_DESIGNING | Design review |
| tdd-coach | pre_IMPLEMENTING | TDD guidance |
| code-reviewer | post_IMPLEMENTING | Code review |
| refactoring-guide | post_IMPLEMENTING | Refactor guidance |
| test-strategist | pre_TESTING | Test strategy |
| test-strategy-advisor | pre_TESTING | Test advice |
| blocker-resolver | on_blocked | Remove blockers |
| error-analyzer | on_error | Analyze errors |

## Injection

```bash
# Add to current workflow
node hooks.cjs -r /project add pre_stage_DEFINING --type agent --name problem-definer

# Add to all project workflows
node hooks.cjs -r /project --scope project add pre_stage_DEFINING --type agent --name problem-definer
```

## Agent Definitions

See individual agent files in `agents/` directory.
