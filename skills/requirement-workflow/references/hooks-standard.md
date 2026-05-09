# Hooks Standard Reference

Universal hooks reference for AI coding agent skills. Standard hooks are IDE lifecycle events that let skills run deterministic scripts at specific points. Both Trae IDE (Trae) and Claude Code support the same core spec.

## Compatibility Matrix

| IDE | Config Path | Notes |
|-----|-------------|-------|
| Trae (Trae IDE) | `$PROJECT/.trae/hooks.json` | Also reads `.claude/settings.json` |
| Claude Code | `$PROJECT/.claude/settings.json` | Inside `"hooks"` key |

**Recommendation**: Write `.claude/settings.json` for maximum portability across both IDEs.

## Core Events

Shared between Trae and Claude Code:

| Event | Trigger | Use Case |
|-------|---------|----------|
| `SessionStart` | Session initialization | Env setup, context injection, load project state |
| `UserPromptSubmit` | Before user prompt is processed | Intercept/enrich prompts, inject context |
| `PreToolUse` | Before a tool call executes | Validate, block, or modify tool calls |
| `PostToolUse` | After a tool call completes | Auto-format, log, verify results |
| `Stop` | Before agent stops responding | Quality gate, verify output before allowing stop |

**PreToolUse/PostToolUse** support `matcher` — a regex pattern matching tool names.  
**Stop** supports `loop_limit` — max times the hook can reject before forced stop.

## Extended Events (Claude Code 2.1+)

| Event | Trigger | Use Case |
|-------|---------|----------|
| `Notification` | Agent needs user input | Desktop alerts |
| `PermissionRequest` | Tool requires approval | Auto-approve safe operations |
| `ConfigChange` | Settings modified | Audit trail |
| `CwdChanged` | Working directory changed | Reload env/context |
| `FileChanged` | Watched file modified | Hot-reload config |
| `SubagentStart` | Sub-agent spawned | Monitor lifecycle |
| `SubagentStop` | Sub-agent finished | Collect results |
| `PreCompact` | Before context compaction | Preserve critical state |
| `PostCompact` | After context compaction | Re-inject lost context |

## Config Format

```json
{
  "version": 1,
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<regex pattern for tool name>",
        "loop_limit": 5,
        "hooks": [
          {
            "type": "command",
            "command": "<shell command>",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

- `matcher` — optional, only for PreToolUse/PostToolUse (regex against tool name)
- `loop_limit` — optional, only for Stop (prevents infinite rejection loops)
- `timeout` — seconds before hook is killed (default: 30)

## Hook Types

| Type | Availability | Description |
|------|-------------|-------------|
| `command` | Universal | Runs a shell script; receives stdin JSON, outputs stdout |
| `prompt` | Claude Code only | Sends prompt to a model for judgment |
| `agent` | Claude Code only | Spawns a sub-agent for complex decisions |
| `http` | Claude Code only | Calls an HTTP endpoint |

For maximum portability, use `command` type exclusively.

## I/O Contract

### Input (JSON on stdin)

All events receive a base payload:

```json
{
  "session_id": "abc-123",
  "cwd": "/path/to/project",
  "hook_event_name": "PreToolUse",
  "workspace_roots": ["/path/to/project"]
}
```

Event-specific fields are merged into this object:

| Event | Additional Fields |
|-------|-------------------|
| `UserPromptSubmit` | `prompt` (string) |
| `PreToolUse` | `tool_name`, `tool_params` (object) |
| `PostToolUse` | `tool_name`, `tool_params`, `tool_result` |
| `Stop` | `stop_reason`, `summary` |
| `SessionStart` | `env` (object) |

### Output

| Format | When Used |
|--------|-----------|
| JSON on stdout | Structured responses (decisions, modifications) |
| Plain text on stdout | SessionStart (injected as context), UserPromptSubmit (prepended) |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — proceed normally |
| 2 | Block/Deny — reject the action |
| Other | Ignored — treated as no-op |

## Environment Variables

| Variable | IDE | Description |
|----------|-----|-------------|
| `TRAE_PROJECT_DIR` | Trae | Project root path |
| `CLAUDE_PROJECT_DIR` | Claude Code | Project root path |
| `TRAE_ENV_FILE` | Trae | Write env vars here for session persistence |
| `CLAUDE_ENV_FILE` | Claude Code | Write env vars here for session persistence |

Scripts should check both variants for portability:

```bash
PROJECT_DIR="${TRAE_PROJECT_DIR:-$CLAUDE_PROJECT_DIR}"
```

## Workflow Skills Integration

A workflow skill (like `requirement-workflow`) can generate `hooks.json` for projects to enforce stage gates and quality checks.

### Internal Hook Points → Standard Events

| Internal Hook | Standard Event | Strategy |
|---------------|---------------|----------|
| `pre_stage_*` | `UserPromptSubmit` or `PreToolUse` | Inject stage context, validate preconditions |
| `post_stage_*` | `PostToolUse` or `Stop` | Validate deliverables, trigger next stage |
| `on_error` | `PostToolUse` | Check exit code 2; log and surface errors |
| `on_blocked` | `Stop` | Return `{"decision": "block"}` to prevent premature stop |

### Generated Config Pattern

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "hooks": [{ "type": "command", "command": "node .workflow/hooks/session-init.cjs" }]
      }
    ],
    "Stop": [
      {
        "loop_limit": 3,
        "hooks": [{ "type": "command", "command": "node .workflow/hooks/quality-gate.cjs" }]
      }
    ]
  }
}
```

## Practical Examples

### Auto-format After Edit

```json
{
  "version": 1,
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CHANGED_FILE\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Block Dangerous Commands

```json
{
  "version": 1,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "RunCommand",
        "hooks": [
          {
            "type": "command",
            "command": "node .hooks/block-dangerous.cjs",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

`block-dangerous.cjs` reads stdin, checks if `tool_params.command` matches dangerous patterns (`rm -rf /`, `git push --force`, etc.), exits with code 2 to block.

### Quality Gate on Stop

```json
{
  "version": 1,
  "hooks": {
    "Stop": [
      {
        "loop_limit": 3,
        "hooks": [
          {
            "type": "command",
            "command": "node .hooks/verify-output.cjs",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

The script validates deliverables exist, tests pass, or spec criteria are met. Exit 2 forces the agent to continue working. After 3 rejections (`loop_limit`), the agent stops regardless.

### Session Context Injection

```json
{
  "version": 1,
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat .workflow/context.md",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Plain text output is injected as initial context for the session. Use this to load project state, current stage, or pending tasks.

## Best Practices

1. **Keep hooks fast** — timeout defaults to 30s but prefer < 5s for interactive events
2. **Use `command` type** — only portable option across IDEs
3. **Check both env vars** — `TRAE_*` and `CLAUDE_*` for cross-IDE scripts
4. **Exit 0 by default** — only exit 2 when you explicitly want to block
5. **Log to stderr** — stdout is consumed as output; debug info goes to stderr
6. **Idempotent scripts** — hooks may fire multiple times for retries
