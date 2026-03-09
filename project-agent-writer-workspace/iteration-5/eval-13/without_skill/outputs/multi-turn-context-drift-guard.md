# Multi Turn Context Drift Guard Agent

Create a routing guard for multi-turn context.

## Decision

- Prefer the latest turn context.
- Use previous turns when current turn is unclear.
- Block and ask user to confirm IDE target when ambiguity remains.

## Output

```json
{
  "decision": "blocked",
  "reason_code": "multi_turn_ambiguity",
  "next_step": "confirm current IDE target"
}
```
