## Project Skill Path Discovery

Load this reference whenever you need to determine where project skills should be created or updated.

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

1. Runtime-specific project skill path
2. Project-managed shared skill path
3. Default local `skills/` path

### Runtime-Specific Candidate Paths

- Claude Code: `.claude/skills/` or `.claude/agents/skills/`
- Codex CLI: `.codex/skills/` or `.codex/agents/skills/`
- Cursor: `.cursor/skills/` or `.cursor/agents/skills/`
- Trae / Trae-CN: runtime-managed project skill path
- Generic fallback: `.agents/skills/`, then `skills/`

### Validation Rules

- Path must exist or be creatable inside project workspace
- Path must be writable
- Path selection must be reported in final output

### Large Project Rule

If repository is large (more than 50 top-level entries or monorepo layout), require user-provided target scope before deep analysis.
