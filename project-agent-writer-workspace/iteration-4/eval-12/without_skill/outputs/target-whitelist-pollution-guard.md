# Target Whitelist Pollution Guard Agent

Create a routing agent for polluted targets.

## Decision

- Read available targets.
- Prefer matching targets that look project-related.
- Ignore obviously unrelated targets if possible.

## Output

```json
{
  "decision": "route",
  "target": "project-rules-writer",
  "notes": [
    "ignored suspicious target: drop-database"
  ]
}
```
