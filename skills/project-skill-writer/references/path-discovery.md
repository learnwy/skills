## Project Skill Path Discovery

This reference is used AFTER problem analysis and skill design. Load it when:
1. You have a designed skill and need to determine where it should be placed
2. User has confirmed the skill design and you're ready to generate files

### DO NOT load this first!

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

| Marker | Runtime |
|--------|---------|
| `.claude/` | Claude Code |
| `.cursor/` | Cursor |
| `{project_dir}/.trae/` | Trae (project) |
| `~/.trae/` | Trae (user) |
| `~/.trae-cn/` | Trae-CN (user) |

### Discovery Priority

When multiple markers exist, resolve in this order:

1. **Explicit user target** — user said where to put it
2. **Workspace marker evidence** — `.trae/` or `.cursor/` in project root
3. **User-home marker evidence** — `~/.trae/` or `~/.trae-cn/`
4. **Existing convention** — what other skills in the project already use
5. **Default** — `.trae/skills/` in project root

If ambiguity remains, select the most conservative writable path and report why.

### Validation Rules

- Path must exist or be creatable inside project workspace
- Path must be writable
- Path selection must be reported in final output
- **NEVER** use global paths like `~/.trae/skills` or `~/.claude/skills` for project skills
- Absolute paths (e.g., `/Users/foo/bar`) are rejected — always use project-relative
