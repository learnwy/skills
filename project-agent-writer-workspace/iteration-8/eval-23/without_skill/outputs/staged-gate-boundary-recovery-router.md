# Staged Gate Boundary Recovery Router Agent

Create a staged router for boundary and recovery checks.

## Decision

- Check for external paths.
- If external paths exist, block and ask for clean inputs.
- Otherwise continue recovery checks.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "external_path_detected",
  "next_step": "remove external path evidence"
}
```
