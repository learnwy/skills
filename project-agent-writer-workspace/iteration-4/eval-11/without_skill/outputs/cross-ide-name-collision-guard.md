# Cross IDE Name Collision Guard Agent

Create routing guard for duplicate names.

## Decision

- If duplicate names are found, ask user to choose target IDE root.
- If user chooses one root, continue routing there.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "duplicate_name_detected",
  "next_step": "choose one IDE root"
}
```
