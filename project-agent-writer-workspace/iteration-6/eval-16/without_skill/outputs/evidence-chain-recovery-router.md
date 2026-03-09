# Evidence Chain Recovery Router Agent

Create a router that handles missing evidence across steps.

## Decision

- If marker exists but targets are missing, block.
- If targets later arrive but still unclear, keep blocked and ask for full target list.
- Route only when both marker and target list are usable.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "missing_required_evidence",
  "next_step": "provide full available_targets"
}
```
