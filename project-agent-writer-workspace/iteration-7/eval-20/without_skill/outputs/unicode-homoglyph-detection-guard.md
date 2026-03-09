# Unicode Homoglyph Detection Guard Agent

Create a routing guard for unusual target names.

## Decision

- Prefer plain ASCII targets.
- If suspicious Unicode appears, route to closest safe-looking target.
- Add warning note for manual review.

## Output

```json
{
  "decision": "route",
  "target": "project-rules-writer",
  "notes": [
    "unicode variation detected"
  ]
}
```
