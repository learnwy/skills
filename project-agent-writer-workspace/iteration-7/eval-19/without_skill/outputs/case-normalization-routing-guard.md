# Case Normalization Routing Guard Agent

Create a routing guard for case differences.

## Decision

- Prefer case-insensitive matching.
- If exact lowercase target exists, route to it.
- Add note when uppercase variant also exists.

## Output

```json
{
  "decision": "route",
  "target": "project-rules-writer",
  "notes": [
    "case variant detected"
  ]
}
```
