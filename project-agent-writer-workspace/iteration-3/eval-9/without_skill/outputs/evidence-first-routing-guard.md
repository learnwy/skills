# Evidence First Routing Guard Agent

Create a routing guard that checks context before routing.

## Role

- Read user request and runtime context.
- Route if possible.
- Block when context is unclear.

## Inputs

- `user_request`
- `runtime_evidence`
- `available_targets`
- `output_path`

## Decision

If no IDE marker exists, return blocked and ask for project context.
If target list is missing, return blocked and ask for available targets.
If both are present, allow routing to requested target.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "insufficient_context",
  "next_step": "provide IDE marker and target list"
}
```
