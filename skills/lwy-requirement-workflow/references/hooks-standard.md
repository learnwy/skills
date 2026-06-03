# Hooks Standard Reference

A general hooks reference for AI coding-agent skills. Standard hooks are IDE lifecycle events that let a skill run deterministic scripts at specific points in time. Both Trae IDE (Trae) and Claude Code support the same core specification.

## Compatibility matrix

| IDE | Config path | Notes |
|-----|----------|------|
| Trae (Trae IDE) | `$PROJECT/.trae/hooks.json` | Also reads `.claude/settings.json` |
| Claude Code | `$PROJECT/.claude/settings.json` | Under the `"hooks"` key |

**Recommendation**: use `.claude/settings.json` for maximum cross-IDE portability.

## Core events

Shared by Trae and Claude Code:

| Event | Triggered when | Use cases |
|------|----------|----------|
| `SessionStart` | The session initializes | Environment setup, context injection, loading project state |
| `UserPromptSubmit` | Before the user prompt is processed | Intercept/enhance the prompt, inject context |
| `PreToolUse` | Before a tool call executes | Validate, block, or modify the tool call |
| `PostToolUse` | After a tool call completes | Auto-format, log, validate results |
| `Stop` | Before the agent stops responding | Quality gate; validate output before allowing a stop |

**PreToolUse/PostToolUse** support `matcher` — a regex pattern matching tool names.
**Stop** supports `loop_limit` — the maximum number of times the hook can reject before a stop is forced.

## Extended events (Claude Code 2.1+)

| Event | Triggered when | Use cases |
|------|----------|----------|
| `Notification` | The agent needs user input | Desktop alerts |
| `PermissionRequest` | A tool needs authorization | Auto-approve safe operations |
| `ConfigChange` | Settings are modified | Audit trail |
| `CwdChanged` | The working directory changes | Reload environment / context |
| `FileChanged` | A watched file is modified | Hot-reload config |
| `SubagentStart` | A subagent starts | Monitor the lifecycle |
| `SubagentStop` | A subagent finishes | Collect results |
| `PreCompact` | Before context compaction | Preserve critical state |
| `PostCompact` | After context compaction | Re-inject lost context |

## Configuration format

```json
{
  "version": 1,
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<regex pattern for tool names>",
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

- `matcher` — optional, only for PreToolUse/PostToolUse (regex matching tool names)
- `loop_limit` — optional, only for Stop (prevents an infinite rejection loop)
- `timeout` — seconds before the hook is killed (default: 30)

## Hook types

| Type | Availability | Description |
|------|--------|------|
| `command` | Universal | Runs a shell script; receives stdin JSON, emits stdout |
| `prompt` | Claude Code only | Sends a prompt to the model for a judgment |
| `agent` | Claude Code only | Launches a subagent for complex decisions |
| `http` | Claude Code only | Calls an HTTP endpoint |

For maximum portability, use only the `command` type.

## Input/output contract

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

| Event | Additional fields |
|------|----------|
| `UserPromptSubmit` | `prompt` (string) |
| `PreToolUse` | `tool_name`, `tool_params` (object) |
| `PostToolUse` | `tool_name`, `tool_params`, `tool_result` |
| `Stop` | `stop_reason`, `summary` |
| `SessionStart` | `env` (object) |

### Output

| Format | Use case |
|------|----------|
| JSON on stdout | Structured response (decisions, modifications) |
| Plain text on stdout | SessionStart (injected as context), UserPromptSubmit (prepended) |

### Exit codes

| Exit code | Meaning |
|--------|------|
| 0 | Success — continue normally |
| 2 | Block/reject — deny the operation |
| Other | Ignored — treated as a no-op |

## Environment variables

| Variable | IDE | Description |
|------|-----|------|
| `TRAE_PROJECT_DIR` | Trae | Project root path |
| `CLAUDE_PROJECT_DIR` | Claude Code | Project root path |
| `TRAE_ENV_FILE` | Trae | Write environment variables here to persist them across the session |
| `CLAUDE_ENV_FILE` | Claude Code | Write environment variables here to persist them across the session |

Scripts should check both variants for portability:

```bash
PROJECT_DIR="${TRAE_PROJECT_DIR:-$CLAUDE_PROJECT_DIR}"
```

## Workflow-skill integration

A workflow skill (such as `requirement-workflow`) can generate a project's `hooks.json` to enforce phase gates and quality checks.

### Internal hook trigger points → standard events

| Internal hook | Standard event | Strategy |
|----------|----------|------|
| `pre_stage_*` | `UserPromptSubmit` or `PreToolUse` | Inject stage context, validate preconditions |
| `post_stage_*` | `PostToolUse` or `Stop` | Validate deliverables, trigger the next stage |
| `on_error` | `PostToolUse` | Check for exit code 2; log and surface the error |
| `on_blocked` | `Stop` | Return `{"decision": "block"}` to prevent a premature stop |

### Generated configuration pattern

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

## Practical examples

### Auto-format after editing

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

### Block dangerous commands

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

`block-dangerous.cjs` reads stdin, checks whether `tool_params.command` matches a dangerous pattern (`rm -rf /`, `git push --force`, etc.), and exits with code 2 to block it.

### Quality gate on stop

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

The script verifies that deliverables exist, tests pass, or specification criteria are met. Exit code 2 forces the agent to keep working. After 3 rejections (`loop_limit`), the agent stops anyway.

### Session-context injection

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

Plain-text output is injected as the session's initial context. Use this to load project state, the current phase, or pending tasks.

## Best practices

1. **Keep hooks fast** — the timeout defaults to 30 seconds, but aim for < 5 seconds on interactive events
2. **Use the `command` type** — the only cross-IDE-portable option
3. **Check both sets of environment variables** — `TRAE_*` and `CLAUDE_*` for cross-IDE scripts
4. **Exit 0 by default** — exit 2 only when you explicitly want to block
5. **Log to stderr** — stdout is consumed as output; send debug info to stderr
6. **Make scripts idempotent** — hooks may fire multiple times due to retries
