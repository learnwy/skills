# Path Noise Suppression Router Agent

Create a routing agent that checks candidate paths.

## Decision

- Prefer paths that contain `.trae` or `.claude`.
- Ignore paths that look temporary or archived when possible.
- If no usable path exists, return blocked.

## Output

```json
{
  "decision": "route",
  "target": "project-agent-writer",
  "notes": [
    "ignored temporary/archive paths"
  ]
}
```
