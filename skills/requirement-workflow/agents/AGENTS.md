# Available Agents

Agents are autonomous sub-agents invoked during workflow stages.

> **Architecture Note**: Agents in this directory are **adapted versions** of universal methodology agents.
> Universal versions live in `skills/agents/`. See `.trae/rules/agent-sync.md` for sync rules.

## Default Agents (Pre-configured in hooks.yaml)

These agents are automatically invoked during workflow execution:

| Agent                                             | Hook                      | Purpose         |
| ------------------------------------------------- | ------------------------- | --------------- |
| [risk-auditor](risk-auditor.md)                   | `pre_stage_ANALYZING`     | Risk assessment |
| [iron-audit-pm](iron-audit-pm.md)                 | `post_stage_ANALYZING`    | PRD audit       |
| [mvp-freeze-architect](mvp-freeze-architect.md)   | `post_stage_ANALYZING`    | MVP freeze      |
| [tech-design-reviewer](tech-design-reviewer.md)   | `post_stage_DESIGNING`    | Design review   |
| [code-reviewer](code-reviewer.md)                 | `post_stage_IMPLEMENTING` | Code review     |
| [test-strategy-advisor](test-strategy-advisor.md) | `pre_stage_TESTING`       | Test strategy   |
| [blocker-resolver](blocker-resolver.md)           | `on_blocked`              | Resolve blockers |
| [error-analyzer](error-analyzer.md)               | `on_error`                | Analyze errors   |

## Methodology Agents (Optional - Inject on Demand)

Based on classic software engineering books. **Not loaded by default** - inject when needed.

### Requirements Analysis

| Agent | Recommended Hook | Based On |
|-------|------------------|----------|
| [problem-definer](problem-definer.md) | `pre_stage_ANALYZING` | Are Your Lights On? (Weinberg) |
| [spec-by-example](spec-by-example.md) | `post_stage_ANALYZING` | Specification by Example (Adzic) |
| [story-mapper](story-mapper.md) | `post_stage_PLANNING` | User Story Mapping (Patton) |

### Object & Domain Modeling

| Agent | Recommended Hook | Based On |
|-------|------------------|----------|
| [responsibility-modeler](responsibility-modeler.md) | `pre_stage_DESIGNING` | Object Design (Wirfs-Brock) |
| [domain-modeler](domain-modeler.md) | `pre_stage_DESIGNING` | DDD (Eric Evans) |

### Architecture & Design

| Agent | Recommended Hook | Based On |
|-------|------------------|----------|
| [architecture-advisor](architecture-advisor.md) | `post_stage_DESIGNING` | Software Architecture in Practice, DDIA |

### Implementation

| Agent | Recommended Hook | Based On |
|-------|------------------|----------|
| [refactoring-guide](refactoring-guide.md) | `post_stage_IMPLEMENTING` | Refactoring (Fowler) |
| [tdd-coach](tdd-coach.md) | `pre_stage_IMPLEMENTING` | TDD by Example (Beck) |
| [legacy-surgeon](legacy-surgeon.md) | `pre_stage_IMPLEMENTING` | Working Effectively with Legacy Code (Feathers) |

### Testing

| Agent | Recommended Hook | Based On |
|-------|------------------|----------|
| [test-strategist](test-strategist.md) | `pre_stage_TESTING` | Agile Testing, xUnit Patterns |

## How to Inject Methodology Agents

**Script path:** `{skill_root}/scripts/inject-agent.sh`

### One-time Injection (Current Workflow Only)

```bash
# Inject problem-definer for current workflow
{skill_root}/scripts/inject-agent.sh -r /project --scope workflow --hook pre_stage_ANALYZING --agent problem-definer

# Inject TDD coach for implementation stage
{skill_root}/scripts/inject-agent.sh -r /project --scope workflow --hook pre_stage_IMPLEMENTING --agent tdd-coach
```

### Project-level Injection (All Workflows in Project)

```bash
# Make domain-modeler available for all workflows in this project
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook pre_stage_DESIGNING --agent domain-modeler
```

### Global Injection (All Projects)

```bash
# Always use spec-by-example across all projects
{skill_root}/scripts/inject-agent.sh -r /project --scope global --hook post_stage_ANALYZING --agent spec-by-example
```

### Common Combinations

```bash
# Full methodology suite for greenfield project
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook pre_stage_ANALYZING --agent problem-definer
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook post_stage_ANALYZING --agent spec-by-example
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook pre_stage_DESIGNING --agent domain-modeler
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook pre_stage_IMPLEMENTING --agent tdd-coach

# Legacy code project
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook pre_stage_IMPLEMENTING --agent legacy-surgeon
{skill_root}/scripts/inject-agent.sh -r /project --scope project --hook post_stage_IMPLEMENTING --agent refactoring-guide
```

## Universal Agents

For pure methodology reference (without Hook Points), see universal versions:

- `skills/agents/problem-definer/agent.md`
- `skills/agents/spec-by-example/agent.md`
- `skills/agents/story-mapper/agent.md`
- `skills/agents/responsibility-modeler/agent.md`
- `skills/agents/domain-modeler/agent.md`
- `skills/agents/architecture-advisor/agent.md`
- `skills/agents/refactoring-guide/agent.md`
- `skills/agents/tdd-coach/agent.md`
- `skills/agents/legacy-surgeon/agent.md`
- `skills/agents/test-strategist/agent.md`
