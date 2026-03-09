# Cross Repo Boundary Guard Agent

Create a guard for suspicious external paths.

## Decision

- Prefer local project paths.
- If external paths appear, ignore them unless user explicitly confirms usage.
- Route using local root when possible.

## Output

```json
{
  "decision": "route",
  "target": "project-agent-writer",
  "notes": [
    "external path ignored"
  ]
}
```
