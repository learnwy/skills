## Trae Target Mode

Load this reference only when the target output location or runtime is Trae / Trae-CN.

### When to Enable

- User explicitly asks for `.trae/skills/` output
- User asks for Trae IDE trigger behavior
- Workspace standards require Trae-specific metadata conventions

### What Changes in This Mode

- Prefer output path `.trae/skills/{name}/`
- Keep examples aligned with Trae runtime wording
- Keep non-Trae logic unchanged to preserve portability

### When Not to Enable

- Generic agent-skills repository with no Trae runtime dependency
- Requests focused on neutral, cross-platform skill packaging
