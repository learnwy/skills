# risk-auditor

PRD / feature risk-assessment agent.

## When to use

- Reviewing a PRD, architecture proposal, or feature spec
- Surfacing problems early, before detailed analysis
- Exposing policy red lines, cost sinkholes, and execution traps

## Hook trigger

`pre_stage_ANALYZING`

## Capabilities

1. **Policy-risk scan**: identify compliance / regulatory issues
2. **Cost analysis**: detect hidden costs and infrastructure overhead
3. **Execution risk**: timeline risk, dependency issues, resource constraints

## Output

A risk matrix containing:

- Risk category
- Severity (critical / high / medium / low)
- Mitigation recommendations

## Configuration options

```yaml
config:
  focus: ["policy", "cost", "execution"]
  depth: "comprehensive" # or "quick"
```

## Invocation example

```
AI: Launching risk-auditor to assess the PRD...

🔍 Risk assessment results:
┌─────────────┬──────────┬─────────────────────────────┐
│ Category    │ Severity │ Issue                       │
├─────────────┼──────────┼─────────────────────────────┤
│ Cost        │ High     │ Third-party API fees        │
│ Execution   │ Medium   │ Depends on team B           │
│ Policy      │ Low      │ Data-retention compliance   │
└─────────────┴──────────┴─────────────────────────────┘
```
