## Project Skill Install Path Discovery

Determine where to install skills within a project.

### Discovery Priority

1. **Explicit user target** — user said where to put it → use that path (if project-relative)
2. **Existing skill directory** — `.trae/skills/` already exists → use it
3. **IDE marker** — `.cursor/`, `.claude/`, `.windsurf/` present → use their skills dir
4. **Default** — create `.trae/skills/` in project root

### Detection Logic

```
1. Check: does <project_root>/.trae/skills/ exist?
   YES → use it
   NO  → continue

2. Check: does <project_root>/.cursor/skills/ exist?
   YES → use it
   NO  → continue

3. Check: does <project_root>/.claude/skills/ exist?
   YES → use it
   NO  → continue

4. Default: create <project_root>/.trae/skills/
```

### Validation Rules

- Path MUST be inside the project root
- Path MUST be project-relative (no absolute paths like `/Users/...`)
- **NEVER** install to global paths: `~/.trae/skills/`, `~/.trae-cn/skills/`, `~/.cursor/skills/`
- If user requests global install, REJECT and explain project-scope boundary

### Path Output Format

Always report the resolved path in the installation summary:

```
Install path: <project_root>/.trae/skills/<skill-name>/
Evidence: existing .trae/skills/ directory found
```
