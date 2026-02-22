# Available Agents

Agents are autonomous sub-agents invoked during workflow stages.

## Stage-based Agents

| Agent | Hook | Purpose |
|-------|------|---------|
| [risk-auditor](risk-auditor.md) | `pre_stage_ANALYZING` | Risk assessment |
| [iron-audit-pm](iron-audit-pm.md) | `post_stage_ANALYZING` | PRD audit |
| [mvp-freeze-architect](mvp-freeze-architect.md) | `post_stage_ANALYZING` | MVP freeze |
| [tech-design-reviewer](tech-design-reviewer.md) | `post_stage_DESIGNING` | Design review |
| [code-reviewer](code-reviewer.md) | `post_stage_IMPLEMENTING` | Code review |
| [test-strategy-advisor](test-strategy-advisor.md) | `pre_stage_TESTING` | Test strategy |

## Event Agents

| Agent | Hook | Purpose |
|-------|------|---------|
| [blocker-resolver](blocker-resolver.md) | `on_blocked` | Resolve blockers |
| [error-analyzer](error-analyzer.md) | `on_error` | Analyze errors |

## Injection

**Script path:** `{skill_root}/scripts/inject-agent.sh`

```bash
# Replace {skill_root} with actual skill directory path
{skill_root}/scripts/inject-agent.sh -r /project --scope global --hook <hook> --agent <agent>
```
