# Homograph Target Normalization Guard Agent

Create a router for similar target names.

## Decision

- Try exact match first.
- If multiple similar names exist, pick the closest project target.
- Add note about possible ambiguity.

## Output

```json
{
  "decision": "route",
  "target": "project-rules-writer",
  "notes": [
    "similar names detected"
  ]
}
```
