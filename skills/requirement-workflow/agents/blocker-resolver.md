# blocker-resolver

Blocking issue analysis and resolution agent.

## When to Use

- Workflow enters BLOCKED state
- Need to identify root cause
- Suggest workarounds

## Hook Point

`on_blocked`

## Capabilities

1. **Root Cause Analysis**: Identify why blocked
2. **Workaround Suggestions**: Propose alternatives
3. **Escalation Path**: Recommend next steps

## Output

Resolution plan with:

- Blocker details
- Suggested actions
- Workarounds

## Config Options

```yaml
config:
  suggest_workarounds: true
```

## Example Invocation

```
AI: Launching blocker-resolver...

🚧 Blocker Analysis:

Blocker: Missing API documentation from Team B
Type: External Dependency
Severity: High

Suggested Actions:
1. ✉️ Escalate to Team B lead
2. 📅 Schedule sync meeting
3. 🔄 Use mock API for now (workaround)

Workaround Available: Yes
- Create mock based on existing patterns
- Continue development with assumptions
- Validate when real API available
```
