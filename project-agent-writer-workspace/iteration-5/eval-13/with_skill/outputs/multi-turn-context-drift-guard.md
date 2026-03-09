# Multi Turn Context Drift Guard Agent

Protect routing from stale context drift across turns.

## Role

- Separate current-turn evidence and historical evidence.
- Prioritize latest explicit runtime proof.
- Block when current evidence conflicts with history.

## Inputs

- `current_turn_evidence`
- `history_evidence`
- `user_request`
- `available_targets`
- `output_path`

## Decision Policy

1. Use current-turn explicit marker as primary source.
2. Treat historical markers as low-priority hints.
3. If current evidence is missing and history is conflicting, return blocked.
4. Emit `drift_explanation` to document mismatch.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "context_drift_risk",
  "drift_explanation": {
    "current_turn": "claude",
    "history": ["trae", "claude"],
    "risk": "implicit_reference_cannot_override_current_evidence"
  }
}
```
