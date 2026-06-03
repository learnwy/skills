## Project Agent Path Discovery

This reference is used after the agent design is complete. Load it when:
1. You have a designed agent and need to determine where it should be placed
2. The user has confirmed the agent design and you are about to generate files

### Do Not Load This Document First!

**Critical**: Path discovery is the last step, not the first!

```
Correct flow:
1. Understand the user's problem
2. Analyze the project (existing agents, integration points, conventions)
3. Design the agent plan
4. Validate with the user via AskUserQuestion
5. Only then: load path-discovery to determine the output location
```

### Output Contract: `.agents/agents/`

Project-level agents all land at `.agents/agents/<name>.md` in the project root. This is a tool-neutral directory—decoupled from the IDE-managed `.trae/`, `.claude/`, `.cursor/`, to prevent the writer and the IDE from overwriting each other.

Sibling artifacts:
- Skills → `<project>/.agents/skills/<name>/`
- Rules → `<project>/.agents/rules/<name>.md`

### IDE Marker Detection (context only, does not change the output location)

Continue to scan the following markers to learn which AI IDE the project uses, so you can adjust the agent's integration instructions (e.g. "invoke via Trae's Task tool"):

| Marker | Tool |
|---|---|
| `{project_dir}/.trae/` | Trae / Trae-CN |
| `{project_dir}/.claude/` | Claude Code |
| `{project_dir}/.cursor/` | Cursor |
| `{project_dir}/.windsurf/` | Windsurf |

Regardless of which IDE is detected, **the output path is still `.agents/agents/`**.

### Discovery Priority

1. User explicitly specifies (`--output-dir` or stated in conversation) → must be a project-relative path
2. Project already has `.agents/agents/` → use it directly
3. Default → create `.agents/agents/` in the project root

### Validation Rules

- The path must exist or be creatable within the project workspace
- The path must be writable
- The path choice must be reported in the final output
- Use a project-relative path, never global paths like `~/.trae/agents`, `~/.claude/agents`
- Do not write into the project's own `.trae/`, `.claude/`, `.cursor/`—those are IDE-owned directories
