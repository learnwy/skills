# Composite Risk Aggregation Guard Agent

Apply evidence-first and non-overridable safety policy to aggregate multi-risk routing checks.

## Decision

- Evaluate case-confusion, Unicode homoglyph, and allowlist pollution independently.
- Return a single blocked decision if any critical check fails.
- Emit structured per-risk audit evidence.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "composite_risk_detected",
  "risk_audit": {
    "case_confusion": "failed",
    "unicode_homoglyph": "failed",
    "dangerous_target_pollution": "failed"
  },
  "router_boundary": "non_executing"
}
```
