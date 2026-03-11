## Project Skill Path Discovery

This reference is used AFTER problem analysis and skill design. Load it when:
1. You have a designed skill and need to determine where it should be placed
2. User has confirmed the skill design and you're ready to generate files

### DO NOT load this first!

**Critical**: Path discovery is the LAST step, not the first!

```
Correct Flow:
1. Understand user's problem
2. Analyze project (tech stack, conventions, patterns)
3. Design skill solution
4. Validate with user (show what will be created)
5. Only THEN: Load path-discovery to determine output location
```

### Runtime Marker Detection

Detect runtime/tooling markers in project root and user home:

- Claude Code: `.claude/`
- Codex CLI: `.codex/`
- Cursor: `.cursor/`
- Trae project marker: `{project_dir}/.trae/`
- Trae user marker: `~/.trae/`
- Trae-CN project marker: `{project_dir}/.trae/`
- Trae-CN user marker: `~/.trae-cn/`

If multiple markers exist, let the model judge with this order:
1. Explicit user target
2. Workspace marker evidence
3. User-home marker evidence
4. Existing project convention evidence from docs and file tree

If ambiguity remains, select the most conservative writable path and report why.

### Discovery Priority

1. Runtime-specific project skill path (detected from markers)
2. Project-managed shared skill path
3. Default local `skills/` path

### Validation Rules

- Path must exist or be creatable inside project workspace
- Path must be writable
- Path selection must be reported in final output
- Use project-relative paths, never global paths like `~/.trae/skills`
