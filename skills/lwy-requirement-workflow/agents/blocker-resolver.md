# blocker-resolver

Blocker analysis and resolution agent.

## When to use

- The workflow enters the BLOCKED state
- The root cause needs to be identified
- Workarounds need to be suggested

## Hook trigger

`on_blocked`

## Capabilities

1. **Root-cause analysis**: identify the cause of the blocker
2. **Workaround suggestions**: propose alternatives
3. **Escalation path**: recommend next steps

## Output

A resolution plan containing:

- Blocker details
- Recommended actions
- Workarounds

## Configuration options

```yaml
config:
  suggest_workarounds: true
```

## Invocation example

```
AI: Launching blocker-resolver...

🚧 Blocker analysis:

Cause: team B's API documentation is missing
Type: external dependency
Severity: high

Recommended actions:
1. ✉️ Escalate to team B's lead
2. 📅 Schedule a sync meeting
3. 🔄 Use a mock API for now (workaround)

Workaround available: yes
- Create a mock based on existing patterns
- Continue development on assumptions
- Validate once the real API is available
```
