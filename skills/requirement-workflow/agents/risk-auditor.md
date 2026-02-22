# risk-auditor

PRD/feature risk assessment agent.

## When to Use

- Reviewing PRDs, architecture proposals, or feature specs
- Before detailed analysis to catch issues early
- Exposing policy red-lines, cost black-holes, execution traps

## Hook Point

`pre_stage_ANALYZING`

## Capabilities

1. **Policy Risk Scan**: Identify compliance/regulatory issues
2. **Cost Analysis**: Detect hidden costs, infrastructure overhead
3. **Execution Risk**: Timeline risks, dependency issues, resource constraints

## Output

Risk matrix with:
- Risk category
- Severity level (Critical/High/Medium/Low)
- Mitigation suggestions

## Config Options

```yaml
config:
  focus: ["policy", "cost", "execution"]
  depth: "comprehensive"  # or "quick"
```

## Example Invocation

```
AI: Launching risk-auditor agent to assess the PRD...

🔍 Risk Assessment Results:
┌─────────────┬──────────┬─────────────────────────────┐
│ Category    │ Severity │ Issue                       │
├─────────────┼──────────┼─────────────────────────────┤
│ Cost        │ High     │ Third-party API costs       │
│ Execution   │ Medium   │ Dependency on Team B        │
│ Policy      │ Low      │ Data retention compliance   │
└─────────────┴──────────┴─────────────────────────────┘
```
