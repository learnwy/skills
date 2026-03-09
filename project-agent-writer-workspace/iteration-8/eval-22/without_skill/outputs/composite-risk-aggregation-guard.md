# Composite Risk Aggregation Guard Agent

Create a guard for mixed routing risks.

## Decision

- If dangerous target appears, block.
- If case or unicode anomalies appear, warn and prefer safe target.
- Return one final decision.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "mixed_risk_detected",
  "notes": ["dangerous target found"]
}
```
