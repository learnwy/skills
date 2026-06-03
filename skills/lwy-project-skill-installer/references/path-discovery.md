## Project Skill Install Path Discovery

Determine where to install a skill in the project.

### Output Contract: `.agents/skills/`

All project-level skills are installed uniformly to `<project>/.agents/skills/<skill-name>/`. This is a tool-neutral directory, decoupled from the IDE-managed `.trae/`, `.claude/`, `.cursor/`—to avoid conflicts with the IDE's auto-sync.

### Discovery Priority

1. **User explicitly specifies** — the user said where to put it → use that path (must be project-relative and not inside an IDE-managed directory)
2. **An `.agents/skills/` directory already exists** → use it
3. **Default** — create `.agents/skills/` in the project root

### Detection Logic

```
1. Check: does <project_root>/.agents/skills/ exist?
   Yes → use it
   No → create and use <project_root>/.agents/skills/
```

IDE markers (`.trae/`, `.cursor/`, `.claude/`, `.windsurf/`) are still detected, but **only for context** (e.g. choosing which skills to recommend, or a context line in the install report), no longer as the install directory.

### Validation Rules

- The path must be inside the project root
- The path must be project-relative (do not use absolute paths like `/Users/...`)
- **Never** install to global paths: `~/.trae/skills/`, `~/.trae-cn/skills/`, `~/.cursor/skills/`, `~/.claude/skills/`
- **Never** install into the project's own `.trae/`, `.claude/`, `.cursor/`, `.windsurf/`—those are IDE-owned directories
- If the user requests a global install, reject it and explain the project-scope limitation

### Path Output Format

Always report the resolved path in the install summary:

```
Install path: <project_root>/.agents/skills/<skill-name>/
Rationale: the project root uses a unified .agents/ directory (default behavior)
```
