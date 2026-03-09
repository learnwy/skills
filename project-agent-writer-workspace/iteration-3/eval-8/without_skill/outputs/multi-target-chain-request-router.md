# Multi Target Chain Request Router Agent

Create a router for combined requests.

## Role

- Parse request text.
- Route to suitable target writers.

## Inputs

- `user_request`
- `available_targets`
- `output_path`

## Decision

If request includes rules and agent tasks, route both.
If request includes code fix, add note that another workflow should handle it.

## Output

```json
{
  "decision": "route",
  "routes": [
    {"intent": "rules", "target": "project-rules-writer"},
    {"intent": "agent", "target": "project-agent-writer"}
  ],
  "notes": [
    "code fix should be handled separately"
  ]
}
```
