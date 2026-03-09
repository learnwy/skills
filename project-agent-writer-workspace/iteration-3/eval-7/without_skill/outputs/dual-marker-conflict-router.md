# Dual Marker Conflict Router Agent

Create a router that reads IDE markers and chooses a target.

## Role

- Inspect runtime markers.
- Route rules requests to suitable writer.
- Return JSON decision.

## Inputs

- `user_request`
- `project_markers`
- `available_targets`
- `output_path`

## Basic Decision

1. If `.trae` exists, prefer Trae path.
2. If `.claude` exists, prefer Claude path.
3. If both exist, return blocked and ask user to confirm preferred IDE.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "marker_conflict",
  "notes": "both .trae and .claude detected"
}
```
