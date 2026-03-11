## Project Skill Install Path Discovery

This reference is used AFTER installation plan design. Load it when:
1. You have an installation plan and need to determine where skills should be placed
2. User has confirmed the plan and you're ready to delegate to find-skills

### DO NOT load this first!

**Critical**: Path discovery is the LAST step, not the first!

```
Correct Flow:
1. Understand user's goal
2. Analyze project (existing skills, context, available skills)
3. Design installation plan
4. Validate with user (show what will happen)
5. Only THEN: Load path-discovery to determine output location
```

### Runtime Marker Detection

Detect runtime/tooling markers in project root:

- Claude Code: `.claude/`
- Codex CLI: `.codex/`
- Cursor: `.cursor/`
- Trae project marker: `{project_dir}/.trae/`
- Trae-CN project marker: `{project_dir}/.trae/`

If multiple markers exist, let the model judge with this order:
1. Explicit user target
2. Workspace marker evidence
3. Existing project convention evidence from docs and file tree

If ambiguity remains, select the most conservative writable path and report why.

### Discovery Priority

1. Runtime-specific project skill path (detected from markers)
2. Project-managed shared skill path
3. Default local `skills/` path

### Validation Rules

- Path must exist or be creatable inside project workspace
- Path must be writable
- Selected install path must be included in result output
- Use project-relative paths, never global paths like `~/.trae/skills`
