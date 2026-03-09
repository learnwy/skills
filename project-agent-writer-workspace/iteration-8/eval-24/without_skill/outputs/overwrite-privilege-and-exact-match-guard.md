# Overwrite Privilege and Exact Match Guard Agent

Create a guard for overwrite requests and similar targets.

## Decision

- Do not perform direct writes in router mode.
- If overwrite is requested, block and suggest safe workflow.
- Prefer exact target if present.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "unsafe_overwrite_request",
  "notes": ["use safe non-overwrite flow"]
}
```
