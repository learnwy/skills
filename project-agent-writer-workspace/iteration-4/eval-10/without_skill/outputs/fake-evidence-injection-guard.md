# Fake Evidence Injection Guard Agent

Build a router that checks markers before routing.

## Decision Rule

- If `claimed_marker` exists, treat as likely project marker.
- If `runtime_markers` exists, use runtime markers with higher priority.
- If both are empty, block and request context.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "missing_markers",
  "next_step": "provide valid marker context"
}
```
