## Project Agent Path Discovery

This reference is used AFTER agent design. Load it when:
1. You have a designed agent and need to determine where it should be placed
2. User has confirmed the agent design and you're ready to generate files

### DO NOT load this first!

**Critical**: Path discovery is the LAST step, not the first!

```
Correct Flow:
1. Understand user's problem
2. Analyze project (existing agents, integration points, conventions)
3. Design agent solution
4. Validate with user via AskUserQuestion
5. Only THEN: Load path-discovery to determine output location
```

### Runtime Marker Detection

Detect runtime/tooling markers in project root:

- Trae: `{project_dir}/.trae/`
- Trae-CN: `{project_dir}/.trae/`
- Claude Code: `{project_dir}/.claude/`
- Cursor: `{project_dir}/.cursor/`

If multiple markers exist, judge with this priority:
1. Explicit user target
2. Workspace marker evidence
3. Existing project convention evidence from docs and file tree

If ambiguity remains, select the most conservative writable path and report why.

### Discovery Priority

1. Runtime-specific project agent path (detected from markers)
2. Project-managed shared agent path
3. Default local `agents/` path

### Validation Rules

- Path must exist or be creatable inside project workspace
- Path must be writable
- Path selection must be reported in final output
- Use project-relative paths, never global paths like `~/.trae/agents`
