# Composite Risk Aggregation Guard Agent

Detect and aggregate multiple simultaneous routing risks into one deterministic blocked decision.

## Role

- Run case-confusion detection.
- Run Unicode homoglyph detection.
- Run dangerous-target allowlist filtering.
- Aggregate all findings in a single audit object.

## Inputs

- `available_targets`
- `requested_target`
- `output_path`

## Aggregation Policy

1. Evaluate each risk independently.
2. If any risk fails, set `decision=blocked`.
3. Include per-risk status and evidence in output.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "composite_risk_detected",
  "risk_audit": {
    "case_confusion": "failed",
    "unicode_homoglyph": "failed",
    "dangerous_target_pollution": "failed"
  },
  "rejected_targets": ["drop-database"]
}
```
