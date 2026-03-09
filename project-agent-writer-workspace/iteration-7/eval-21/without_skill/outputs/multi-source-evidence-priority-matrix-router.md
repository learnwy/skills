# Multi Source Evidence Priority Matrix Router Agent

Create a router for conflicting evidence sources.

## Decision

- Prefer path marker when available.
- If env hint conflicts, keep path marker and note conflict.
- Route with warning when conflict exists.

## Output

```json
{
  "decision": "route",
  "target": "project-agent-writer",
  "notes": [
    "env hint conflicted with path marker"
  ]
}
```
